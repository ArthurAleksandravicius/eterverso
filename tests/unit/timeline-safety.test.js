'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');
const {
  createTimelineRouter,
  ensureTimelineSchema,
  seedTimelineIfEmpty,
} = require('../../server/timeline');

const EVENT_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const ACTOR_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const ORIGINAL_UPDATED_AT = '2026-11-09T12:00:00.000Z';

function sameMilliseconds(actual, expected) {
  const actualMs = new Date(actual).getTime();
  const expectedMs = Date.parse(expected);
  return Number.isFinite(actualMs) && Number.isFinite(expectedMs) && actualMs === expectedMs;
}

function timelineRow(overrides = {}) {
  return {
    id: EVENT_ID,
    internal_id: 'EV1',
    title: 'Evento original',
    short_title: 'Original',
    summary: 'Resumo original',
    color: 'Green',
    era: 'Before Daare',
    start_date: 'Before Daare 10',
    end_date: '',
    order_index: 1,
    tags: '',
    story_arc: '',
    characters: '',
    character_group: '',
    location: '',
    created_at: new Date('2026-11-01T00:00:00.000Z'),
    updated_at: new Date(ORIGINAL_UPDATED_AT),
    ...overrides,
  };
}

function createTimelineDb(initialRows = []) {
  const rows = initialRows.map((row) => ({ ...row }));
  const audits = [];
  const queries = [];
  let transactionCount = 0;
  let sequence = 0;

  async function db(strings, ...values) {
    const query = strings.join(' ');
    queries.push({ query, values });

    if (query.includes('INSERT INTO audit_events')) {
      const [actorId, actorLabel, action, targetType, targetId, reason, before, after] = values;
      audits.push({
        actorId,
        actorLabel,
        action,
        targetType,
        targetId,
        reason,
        before: JSON.parse(before),
        after: JSON.parse(after),
      });
      return [];
    }

    if (query.includes('INSERT INTO timeline_events')) {
      const row = {
        id: `cccccccc-cccc-4ccc-8ccc-${String(++sequence).padStart(12, '0')}`,
        internal_id: values[0],
        title: values[1],
        short_title: values[2],
        summary: values[3],
        color: values[4],
        era: values[5],
        start_date: values[6],
        end_date: values[7],
        order_index: values[8],
        tags: values[9],
        story_arc: values[10],
        characters: values[11],
        character_group: values[12],
        location: values[13],
        created_at: new Date(),
        updated_at: new Date(),
      };
      rows.push(row);
      return [{ ...row }];
    }

    if (query.includes('UPDATE timeline_events')) {
      const rowId = values.find((value) => typeof value === 'string'
        && rows.some((row) => row.id === value));
      const index = rows.findIndex((row) => row.id === rowId);
      if (index === -1) return [];
      if (query.includes("date_trunc('milliseconds'") && query.includes('UPDATE timeline_events')) {
        const expected = values[values.length - 1];
        if (!sameMilliseconds(rows[index].updated_at, expected)) return [];
      }
      const updated = {
        ...rows[index],
        title: values[0],
        short_title: values[1],
        summary: values[2],
        color: values[3],
        era: values[4],
        start_date: values[5],
        end_date: values[6],
        order_index: values[7],
        tags: values[8],
        story_arc: values[9],
        characters: values[10],
        character_group: values[11],
        location: values[12],
        updated_at: new Date(new Date(rows[index].updated_at).getTime() + 1000),
      };
      rows[index] = updated;
      return [{ ...updated }];
    }

    if (query.includes('DELETE FROM timeline_events')) {
      const rowId = values.find((value) => typeof value === 'string'
        && rows.some((row) => row.id === value));
      const index = rows.findIndex((row) => row.id === rowId);
      if (index === -1) return [];
      if (query.includes("date_trunc('milliseconds'")) {
        const expected = values[values.length - 1];
        if (!sameMilliseconds(rows[index].updated_at, expected)) return [];
      }
      const [deleted] = rows.splice(index, 1);
      return [{ id: deleted.id, title: deleted.title }];
    }

    if (query.includes('FROM timeline_events WHERE id =')) {
      return rows.filter((row) => row.id === values[0]).map((row) => ({ ...row }));
    }

    if (query.includes('SELECT internal_id FROM timeline_events')) return [];
    if (query.includes('COALESCE(MAX(order_index)')) return [{ max_o: 0 }];
    if (query.includes('FROM timeline_events')) return rows.map((row) => ({ ...row }));

    return [];
  }

  db.begin = async (callback) => {
    transactionCount += 1;
    return callback(db);
  };
  db.json = (value) => JSON.stringify(value);
  db.rows = rows;
  db.audits = audits;
  db.queries = queries;
  db.transactionCount = () => transactionCount;
  return db;
}

function createAuth(userId) {
  return {
    requireIdentity(req, _res, next) {
      if (userId) {
        req.session = { userId };
        req.authUser = { id: userId, role: 'admin', username: 'Staff' };
      } else {
        req.authUser = { role: 'admin' };
      }
      next();
    },
    requireRole() {
      return (_req, _res, next) => next();
    },
  };
}

async function withTimelineApp(db, auth, callback) {
  const app = express();
  app.use(express.json());
  app.use('/api/timeline', createTimelineRouter({ sql: db, auth }));

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  try {
    return await callback(baseUrl);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const body = await response.json();
  return { response, body };
}

test('ensureTimelineSchema não executa seed automático e mantém o seed exportado', async () => {
  const statements = [];
  const sql = async (strings) => {
    statements.push(strings.join(' '));
    return [];
  };

  await ensureTimelineSchema(sql);

  assert.ok(statements.some((query) => query.includes('CREATE TABLE IF NOT EXISTS "timeline_events"')));
  assert.equal(
    statements.some((query) => query.includes('SELECT count(*)::int AS total')),
    false,
    'ensureTimelineSchema não deve consultar a contagem para popular a timeline'
  );
  assert.equal(
    statements.some((query) => query.includes('INSERT INTO timeline_events')),
    false,
    'ensureTimelineSchema não deve inserir eventos de seed'
  );
  assert.equal(typeof seedTimelineIfEmpty, 'function');
});

test('POST da timeline grava auditoria na mesma transação', async () => {
  const db = createTimelineDb();
  const auth = createAuth(ACTOR_ID);

  await withTimelineApp(db, auth, async (baseUrl) => {
    const { response, body } = await requestJson(`${baseUrl}/api/timeline`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        internalId: 'EV9',
        orderIndex: 9,
        title: 'Evento novo',
        startDate: 'Depois de Daare 1',
        summary: 'Criado pelo teste.',
      }),
    });

    assert.equal(response.status, 201);
    assert.equal(body.event.title, 'Evento novo');
    assert.equal(db.transactionCount(), 1);
    assert.equal(db.audits.length, 1);

    const audit = db.audits[0];
    assert.equal(audit.actorId, ACTOR_ID);
    assert.equal(audit.actorLabel, null);
    assert.equal(audit.action, 'timeline.create');
    assert.equal(audit.targetType, 'timeline_event');
    assert.equal(audit.targetId, body.event.id);
    assert.deepEqual(audit.before, {});
    assert.equal(audit.after.title, 'Evento novo');
    assert.equal(audit.after.internal_id, 'EV9');
  });
});

test('POST usa rótulo neutro quando não há userId autenticado disponível', async () => {
  const db = createTimelineDb();
  const auth = createAuth(null);

  await withTimelineApp(db, auth, async (baseUrl) => {
    const { response } = await requestJson(`${baseUrl}/api/timeline`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        internalId: 'EV10',
        orderIndex: 10,
        title: 'Sem sessão',
        startDate: 'Indefinido',
      }),
    });

    assert.equal(response.status, 201);
    assert.equal(db.audits.length, 1);
    assert.equal(db.audits[0].actorId, null);
    assert.equal(db.audits[0].actorLabel, 'timeline');
  });
});

test('PUT com expectedUpdatedAt correspondente aceita e audita antes/depois', async () => {
  const db = createTimelineDb([timelineRow()]);
  const auth = createAuth(ACTOR_ID);

  await withTimelineApp(db, auth, async (baseUrl) => {
    const { response, body } = await requestJson(`${baseUrl}/api/timeline/${EVENT_ID}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title: 'Evento editado',
        expectedUpdatedAt: ORIGINAL_UPDATED_AT,
      }),
    });

    assert.equal(response.status, 200);
    assert.equal(body.event.title, 'Evento editado');
    assert.equal(db.transactionCount(), 1);
    assert.equal(db.audits.length, 1);

    const audit = db.audits[0];
    assert.equal(audit.action, 'timeline.update');
    assert.equal(audit.targetType, 'timeline_event');
    assert.equal(audit.targetId, EVENT_ID);
    assert.equal(audit.before.title, 'Evento original');
    assert.equal(audit.after.title, 'Evento editado');
  });
});

test('PUT com expectedUpdatedAt obsoleto retorna conflito e não grava auditoria', async () => {
  const db = createTimelineDb([timelineRow()]);
  const auth = createAuth(ACTOR_ID);

  await withTimelineApp(db, auth, async (baseUrl) => {
    const { response, body } = await requestJson(`${baseUrl}/api/timeline/${EVENT_ID}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title: 'Não deve salvar',
        expectedUpdatedAt: '2026-11-09T11:59:59.000Z',
      }),
    });

    assert.equal(response.status, 409);
    assert.equal(body.code, 'STALE_UPDATE');
    assert.equal(db.rows[0].title, 'Evento original');
    assert.equal(db.audits.length, 0);
  });
});

test('PUT sem expectedUpdatedAt preserva o comportamento anterior', async () => {
  const db = createTimelineDb([timelineRow()]);
  const auth = createAuth(ACTOR_ID);

  await withTimelineApp(db, auth, async (baseUrl) => {
    const { response } = await requestJson(`${baseUrl}/api/timeline/${EVENT_ID}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Sem precondição' }),
    });

    assert.equal(response.status, 200);
    assert.equal(db.rows[0].title, 'Sem precondição');
    assert.equal(db.audits.length, 1);
    assert.equal(db.audits[0].action, 'timeline.update');
  });
});

test('PUT com expectedUpdatedAt inválido retorna 400 antes de tocar o evento', async () => {
  const db = createTimelineDb([timelineRow()]);
  const auth = createAuth(ACTOR_ID);

  await withTimelineApp(db, auth, async (baseUrl) => {
    const { response, body } = await requestJson(`${baseUrl}/api/timeline/${EVENT_ID}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title: 'Não deve salvar',
        expectedUpdatedAt: 'ontem à tarde',
      }),
    });

    assert.equal(response.status, 400);
    assert.equal(body.code, 'INVALID_TIMESTAMP');
    assert.equal(db.rows[0].title, 'Evento original');
    assert.equal(db.audits.length, 0);
    assert.equal(db.transactionCount(), 0);
  });
});

test('DELETE com expectedUpdatedAt correspondente exclui e audita a linha completa', async () => {
  const db = createTimelineDb([timelineRow()]);
  const auth = createAuth(ACTOR_ID);

  await withTimelineApp(db, auth, async (baseUrl) => {
    const { response, body } = await requestJson(`${baseUrl}/api/timeline/${EVENT_ID}`, {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ expectedUpdatedAt: ORIGINAL_UPDATED_AT }),
    });

    assert.equal(response.status, 200);
    assert.deepEqual(body, { success: true, deletedId: EVENT_ID });
    assert.equal(db.rows.length, 0);
    assert.equal(db.transactionCount(), 1);
    assert.equal(db.audits.length, 1);

    const audit = db.audits[0];
    assert.equal(audit.action, 'timeline.delete');
    assert.equal(audit.targetId, EVENT_ID);
    assert.equal(audit.before.internal_id, 'EV1');
    assert.equal(audit.before.title, 'Evento original');
    assert.equal(audit.before.summary, 'Resumo original');
    assert.deepEqual(audit.after, {});

    const auditIndex = db.queries.findIndex((item) => item.query.includes('INSERT INTO audit_events'));
    const deleteIndex = db.queries.findIndex((item) => item.query.includes('DELETE FROM timeline_events'));
    assert.ok(auditIndex >= 0 && deleteIndex >= 0);
    assert.ok(auditIndex < deleteIndex, 'a auditoria deve ser gravada antes do DELETE');
  });
});

test('DELETE com expectedUpdatedAt obsoleto retorna conflito e mantém a linha', async () => {
  const db = createTimelineDb([timelineRow()]);
  const auth = createAuth(ACTOR_ID);

  await withTimelineApp(db, auth, async (baseUrl) => {
    const { response, body } = await requestJson(`${baseUrl}/api/timeline/${EVENT_ID}`, {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ expectedUpdatedAt: '2026-11-09T11:59:59.000Z' }),
    });

    assert.equal(response.status, 409);
    assert.equal(body.code, 'STALE_UPDATE');
    assert.equal(db.rows.length, 1);
    assert.equal(db.audits.length, 0);
  });
});

test('DELETE sem expectedUpdatedAt preserva a exclusão direta e registra a linha removida', async () => {
  const db = createTimelineDb([timelineRow()]);
  const auth = createAuth(ACTOR_ID);

  await withTimelineApp(db, auth, async (baseUrl) => {
    const { response } = await requestJson(`${baseUrl}/api/timeline/${EVENT_ID}`, {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });

    assert.equal(response.status, 200);
    assert.equal(db.rows.length, 0);
    assert.equal(db.audits.length, 1);
    assert.equal(db.audits[0].action, 'timeline.delete');
    assert.equal(db.audits[0].before.title, 'Evento original');
  });
});
