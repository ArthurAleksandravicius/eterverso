'use strict';

const path = require('node:path');
const fs = require('node:fs');
const express = require('express');
const { ApiError, sendError } = require('./errors');
const { validateUuid } = require('./validation');

const SEED_FILE = path.join(__dirname, 'timeline-seed.json');
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO_TIMESTAMP_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/;
const TIMELINE_TARGET_TYPE = 'timeline_event';
const AUDIT_FALLBACK_LABEL = 'timeline';

function validateExpectedUpdatedAt(value) {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string'
      || !ISO_TIMESTAMP_RE.test(value)
      || Number.isNaN(Date.parse(value))) {
    throw new ApiError(400, 'INVALID_TIMESTAMP', 'O campo expectedUpdatedAt deve ser um timestamp ISO válido.');
  }
  return value;
}

function expectedUpdatedAtFrom(req) {
  const bodyValue = req.body && req.body.expectedUpdatedAt;
  if (bodyValue !== undefined) return validateExpectedUpdatedAt(bodyValue);
  const queryValue = req.query && req.query.expectedUpdatedAt;
  if (queryValue !== undefined) return validateExpectedUpdatedAt(queryValue);
  return undefined;
}

function updatedAtMatches(rowValue, expected) {
  const actual = new Date(rowValue).getTime();
  const wanted = Date.parse(expected);
  return Number.isFinite(actual) && Number.isFinite(wanted) && actual === wanted;
}

function staleUpdateError() {
  return new ApiError(409, 'STALE_UPDATE', 'O evento foi alterado por outra pessoa. Recarregue e tente novamente.');
}

function auditActor(req) {
  const sessionUserId = req.session && req.session.userId;
  if (typeof sessionUserId === 'string' && UUID_RE.test(sessionUserId)) {
    return { actorId: sessionUserId.toLowerCase(), actorLabel: null };
  }
  return { actorId: null, actorLabel: AUDIT_FALLBACK_LABEL };
}

function jsonParameter(executor, value) {
  const payload = value === undefined || value === null ? {} : value;
  if (executor && typeof executor.json === 'function') return executor.json(payload);
  return JSON.stringify(payload);
}

async function writeTimelineAudit(executor, req, { action, targetId, reason, before, after }) {
  const actor = auditActor(req);
  await executor`
    INSERT INTO audit_events (
      actor_id, actor_label, action, target_type, target_id, reason, before_state, after_state
    ) VALUES (
      ${actor.actorId}, ${actor.actorLabel}, ${action}, ${TIMELINE_TARGET_TYPE}, ${targetId},
      ${reason}, ${jsonParameter(executor, before)}, ${jsonParameter(executor, after)}
    )`;
}

async function withTimelineTransaction(sql, callback) {
  if (typeof sql.begin === 'function') return sql.begin(callback);
  return callback(sql);
}

function publicTimelineEvent(row) {
  return {
    id: row.id,
    internalId: row.internal_id,
    title: row.title,
    shortTitle: row.short_title || row.title,
    summary: row.summary || '',
    color: row.color || 'Green',
    era: row.era || 'Before Daare',
    startDate: row.start_date,
    endDate: row.end_date || '',
    orderIndex: row.order_index || 0,
    tags: row.tags || '',
    storyArc: row.story_arc || '',
    characters: row.characters || '',
    characterGroup: row.character_group || '',
    location: row.location || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function ensureTimelineSchema(sql) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "timeline_events" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "internal_id" varchar(50) NOT NULL,
        "title" varchar(250) NOT NULL,
        "short_title" varchar(150),
        "summary" text DEFAULT '',
        "color" varchar(50) DEFAULT 'Green',
        "era" varchar(50) DEFAULT 'Before Daare' NOT NULL,
        "start_date" varchar(100) NOT NULL,
        "end_date" varchar(100),
        "order_index" integer DEFAULT 0 NOT NULL,
        "tags" varchar(250) DEFAULT '',
        "story_arc" varchar(150) DEFAULT '',
        "characters" text DEFAULT '',
        "character_group" varchar(150) DEFAULT '',
        "location" varchar(150) DEFAULT '',
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      )`;

    await sql`CREATE INDEX IF NOT EXISTS "idx_timeline_events_era" ON "timeline_events" ("era")`;
    await sql`CREATE INDEX IF NOT EXISTS "idx_timeline_events_order" ON "timeline_events" ("order_index")`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS "idx_timeline_events_internal_id" ON "timeline_events" ("internal_id")`;
  } catch (err) {
    console.warn('Aviso ao verificar schema da timeline:', err.message);
  }
}

async function seedTimelineIfEmpty(sql) {
  try {
    const existing = await sql`SELECT count(*)::int AS total FROM timeline_events`;
    if (existing[0] && existing[0].total > 0) return;

    if (!fs.existsSync(SEED_FILE)) return;
    const items = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
    if (!Array.isArray(items) || items.length === 0) return;

    for (const item of items) {
      await sql`
        INSERT INTO timeline_events (
          internal_id, title, short_title, summary, color, era,
          start_date, end_date, order_index, tags, story_arc,
          characters, character_group, location
        ) VALUES (
          ${item.internalId}, ${item.title}, ${item.shortTitle || item.title},
          ${item.summary || ''}, ${item.color || 'Green'}, ${item.era || 'Before Daare'},
          ${item.startDate}, ${item.endDate || ''}, ${item.orderIndex || 0},
          ${item.tags || ''}, ${item.storyArc || ''}, ${item.characters || ''},
          ${item.characterGroup || ''}, ${item.location || ''}
        ) ON CONFLICT (internal_id) DO NOTHING`;
    }
    console.log(`[Timeline] Seed de ${items.length} eventos executado com sucesso.`);
  } catch (err) {
    console.warn('[Timeline] Falha ao popular seed inicial da timeline:', err.message);
  }
}

function createTimelineRouter(dependencies = {}) {
  const sql = dependencies.sql;
  const auth = dependencies.auth;
  if (!sql) throw new TypeError('createTimelineRouter requires an injected postgres sql client.');

  const router = express.Router();

  // Listar todos os eventos da timeline com suporte a filtros
  router.get('/', async (req, res) => {
    try {
      const eraFilter = typeof req.query.era === 'string' ? req.query.era.trim() : '';
      const characterFilter = typeof req.query.character === 'string' ? req.query.character.trim().toLowerCase() : '';
      const search = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';

      let rows;
      if (eraFilter && eraFilter !== 'all') {
        rows = await sql`
          SELECT * FROM timeline_events
          WHERE era = ${eraFilter}
          ORDER BY order_index ASC, created_at ASC`;
      } else {
        rows = await sql`
          SELECT * FROM timeline_events
          ORDER BY order_index ASC, created_at ASC`;
      }

      let events = rows.map(publicTimelineEvent);

      if (characterFilter) {
        events = events.filter((e) => e.characters.toLowerCase().includes(characterFilter));
      }

      if (search) {
        events = events.filter((e) =>
          e.title.toLowerCase().includes(search)
          || e.summary.toLowerCase().includes(search)
          || e.storyArc.toLowerCase().includes(search)
          || e.characters.toLowerCase().includes(search)
          || e.startDate.toLowerCase().includes(search)
          || e.tags.toLowerCase().includes(search)
        );
      }

      return res.json({ events });
    } catch (err) {
      return sendError(res, err);
    }
  });

  // Obter um evento específico por ID ou internalId
  router.get('/:id', async (req, res) => {
    try {
      const idOrInternal = req.params.id;
      let rows;
      try {
        validateUuid(idOrInternal);
        rows = await sql`SELECT * FROM timeline_events WHERE id = ${idOrInternal} LIMIT 1`;
      } catch {
        rows = await sql`SELECT * FROM timeline_events WHERE internal_id = ${idOrInternal} LIMIT 1`;
      }

      if (!rows.length) {
        throw new ApiError(404, 'NOT_FOUND', 'Evento da timeline não encontrado.');
      }

      return res.json({ event: publicTimelineEvent(rows[0]) });
    } catch (err) {
      return sendError(res, err);
    }
  });

  // Middleware de autorização para Moderadores e Administradores
  const requireStaff = [
    auth.requireIdentity,
    auth.requireRole('moderador', 'admin'),
  ];

  // Criar um novo evento na timeline
  router.post('/', requireStaff, async (req, res) => {
    try {
      const {
        title, shortTitle, summary, color, era,
        startDate, endDate, orderIndex, tags,
        storyArc, characters, characterGroup, location,
      } = req.body;

      if (!title || typeof title !== 'string' || !title.trim()) {
        throw new ApiError(400, 'INVALID_INPUT', 'O título do evento é obrigatório.');
      }
      if (!startDate || typeof startDate !== 'string' || !startDate.trim()) {
        throw new ApiError(400, 'INVALID_INPUT', 'A data de início do evento é obrigatória.');
      }

      // Gera internal_id automático se não fornecido
      let internalId = typeof req.body.internalId === 'string' && req.body.internalId.trim()
        ? req.body.internalId.trim()
        : null;

      const cleanTitle = title.trim().slice(0, 250);
      const cleanShortTitle = (shortTitle ? String(shortTitle).trim() : cleanTitle).slice(0, 150);
      const cleanSummary = String(summary || '').trim();
      const cleanColor = String(color || 'Green').trim().slice(0, 50);
      const cleanEra = String(era || 'Before Daare').trim().slice(0, 50);
      const cleanStartDate = startDate.trim().slice(0, 100);
      const cleanEndDate = String(endDate || '').trim().slice(0, 100);
      const cleanTags = String(tags || '').trim().slice(0, 250);
      const cleanStoryArc = String(storyArc || '').trim().slice(0, 150);
      const cleanCharacters = String(characters || '').trim();
      const cleanCharGroup = String(characterGroup || '').trim().slice(0, 150);
      const cleanLocation = String(location || '').trim().slice(0, 150);

      const created = await withTimelineTransaction(sql, async (tx) => {
        if (!internalId) {
          const lastRow = await tx`
            SELECT internal_id FROM timeline_events
            WHERE internal_id ~ '^EV[0-9]+$'
            ORDER BY (SUBSTRING(internal_id FROM 3)::int) DESC
            LIMIT 1`;
          let nextNum = 1;
          if (lastRow.length && lastRow[0].internal_id) {
            const match = lastRow[0].internal_id.match(/^EV([0-9]+)$/);
            if (match) nextNum = parseInt(match[1], 10) + 1;
          }
          internalId = `EV${nextNum}`;
        }

        let parsedOrder = parseInt(orderIndex, 10);
        if (isNaN(parsedOrder)) {
          const maxOrder = await tx`SELECT COALESCE(MAX(order_index), 0) AS max_o FROM timeline_events`;
          parsedOrder = (maxOrder[0]?.max_o || 0) + 1;
        }

        const rows = await tx`
          INSERT INTO timeline_events (
            internal_id, title, short_title, summary, color, era,
            start_date, end_date, order_index, tags, story_arc,
            characters, character_group, location
          ) VALUES (
            ${internalId}, ${cleanTitle}, ${cleanShortTitle}, ${cleanSummary},
            ${cleanColor}, ${cleanEra}, ${cleanStartDate}, ${cleanEndDate},
            ${parsedOrder}, ${cleanTags}, ${cleanStoryArc}, ${cleanCharacters},
            ${cleanCharGroup}, ${cleanLocation}
          ) RETURNING *`;
        const event = rows[0];

        await writeTimelineAudit(tx, req, {
          action: 'timeline.create',
          targetId: event.id,
          reason: 'Criação de evento da timeline.',
          before: {},
          after: event,
        });
        return event;
      });

      return res.status(201).json({ event: publicTimelineEvent(created) });
    } catch (err) {
      return sendError(res, err);
    }
  });

  // Atualizar evento existente
  router.put('/:id', requireStaff, async (req, res) => {
    try {
      const id = validateUuid(req.params.id);
      const expectedUpdatedAt = expectedUpdatedAtFrom(req);

      const updated = await withTimelineTransaction(sql, async (tx) => {
        const existing = await tx`SELECT * FROM timeline_events WHERE id = ${id} LIMIT 1`;
        if (!existing.length) {
          throw new ApiError(404, 'NOT_FOUND', 'Evento não encontrado para edição.');
        }

        const row = existing[0];
        if (expectedUpdatedAt !== undefined && !updatedAtMatches(row.updated_at, expectedUpdatedAt)) {
          throw staleUpdateError();
        }

        const title = req.body.title !== undefined ? String(req.body.title).trim().slice(0, 250) : row.title;
        const shortTitle = req.body.shortTitle !== undefined ? String(req.body.shortTitle).trim().slice(0, 150) : row.short_title;
        const summary = req.body.summary !== undefined ? String(req.body.summary).trim() : row.summary;
        const color = req.body.color !== undefined ? String(req.body.color).trim().slice(0, 50) : row.color;
        const era = req.body.era !== undefined ? String(req.body.era).trim().slice(0, 50) : row.era;
        const startDate = req.body.startDate !== undefined ? String(req.body.startDate).trim().slice(0, 100) : row.start_date;
        const endDate = req.body.endDate !== undefined ? String(req.body.endDate).trim().slice(0, 100) : row.end_date;
        const tags = req.body.tags !== undefined ? String(req.body.tags).trim().slice(0, 250) : row.tags;
        const storyArc = req.body.storyArc !== undefined ? String(req.body.storyArc).trim().slice(0, 150) : row.story_arc;
        const characters = req.body.characters !== undefined ? String(req.body.characters).trim() : row.characters;
        const characterGroup = req.body.characterGroup !== undefined ? String(req.body.characterGroup).trim().slice(0, 150) : row.character_group;
        const location = req.body.location !== undefined ? String(req.body.location).trim().slice(0, 150) : row.location;

        let orderIndex = row.order_index;
        if (req.body.orderIndex !== undefined && !isNaN(parseInt(req.body.orderIndex, 10))) {
          orderIndex = parseInt(req.body.orderIndex, 10);
        }

        const rows = expectedUpdatedAt === undefined
          ? await tx`
              UPDATE timeline_events
              SET title = ${title},
                  short_title = ${shortTitle},
                  summary = ${summary},
                  color = ${color},
                  era = ${era},
                  start_date = ${startDate},
                  end_date = ${endDate},
                  order_index = ${orderIndex},
                  tags = ${tags},
                  story_arc = ${storyArc},
                  characters = ${characters},
                  character_group = ${characterGroup},
                  location = ${location},
                  updated_at = now()
              WHERE id = ${id}
              RETURNING *`
          : await tx`
              UPDATE timeline_events
              SET title = ${title},
                  short_title = ${shortTitle},
                  summary = ${summary},
                  color = ${color},
                  era = ${era},
                  start_date = ${startDate},
                  end_date = ${endDate},
                  order_index = ${orderIndex},
                  tags = ${tags},
                  story_arc = ${storyArc},
                  characters = ${characters},
                  character_group = ${characterGroup},
                  location = ${location},
                  updated_at = now()
              WHERE id = ${id}
                AND date_trunc('milliseconds', updated_at) = date_trunc('milliseconds', ${expectedUpdatedAt}::timestamptz)
              RETURNING *`;

        if (!rows.length) {
          if (expectedUpdatedAt !== undefined) throw staleUpdateError();
          throw new ApiError(404, 'NOT_FOUND', 'Evento não encontrado para edição.');
        }

        await writeTimelineAudit(tx, req, {
          action: 'timeline.update',
          targetId: id,
          reason: 'Atualização de evento da timeline.',
          before: row,
          after: rows[0],
        });
        return rows[0];
      });

      return res.json({ event: publicTimelineEvent(updated) });
    } catch (err) {
      return sendError(res, err);
    }
  });

  // Excluir evento
  router.delete('/:id', requireStaff, async (req, res) => {
    try {
      const id = validateUuid(req.params.id);
      const expectedUpdatedAt = expectedUpdatedAtFrom(req);

      const result = await withTimelineTransaction(sql, async (tx) => {
        const existing = await tx`SELECT * FROM timeline_events WHERE id = ${id} LIMIT 1`;
        if (!existing.length) {
          throw new ApiError(404, 'NOT_FOUND', 'Evento não encontrado para exclusão.');
        }

        const row = existing[0];
        if (expectedUpdatedAt !== undefined && !updatedAtMatches(row.updated_at, expectedUpdatedAt)) {
          throw staleUpdateError();
        }

        // Registra a linha completa antes da exclusão. A mesma transação garante
        // que auditoria e exclusão sejam confirmadas ou revertidas juntas.
        await writeTimelineAudit(tx, req, {
          action: 'timeline.delete',
          targetId: id,
          reason: 'Exclusão de evento da timeline.',
          before: row,
          after: {},
        });

        const deleted = expectedUpdatedAt === undefined
          ? await tx`DELETE FROM timeline_events WHERE id = ${id} RETURNING id, title`
          : await tx`
              DELETE FROM timeline_events
              WHERE id = ${id}
                AND date_trunc('milliseconds', updated_at) = date_trunc('milliseconds', ${expectedUpdatedAt}::timestamptz)
              RETURNING id, title`;

        if (!deleted.length) {
          if (expectedUpdatedAt !== undefined) throw staleUpdateError();
          throw new ApiError(404, 'NOT_FOUND', 'Evento não encontrado para exclusão.');
        }

        return { success: true, deletedId: id };
      });

      return res.json(result);
    } catch (err) {
      return sendError(res, err);
    }
  });

  return router;
}

module.exports = {
  createTimelineRouter,
  ensureTimelineSchema,
  seedTimelineIfEmpty,
  publicTimelineEvent,
};
