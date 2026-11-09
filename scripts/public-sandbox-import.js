'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const bcrypt = require('bcryptjs');
const {
  extractInternalLinks,
  plainTextFromHtml,
  sanitizeBlocks,
  sanitizeHtml,
  sanitizeUrl,
} = require('../server/content');
const {
  extractWikiLinks,
  normalizeSlug,
  validateWikiSnapshot,
} = require('../server/wiki');
const {
  validateDataset: validateCapturedDataset,
} = require('./lib/public-snapshot');

const CAPTURE_SCHEMA = 'AetherversePublicCaptureV1';
const MANIFEST_FILE = 'manifest.json';
const DATASET_FILE = 'dataset.json';
const MAX_MANIFEST_BYTES = 10 * 1024 * 1024;
const MAX_DATASET_BYTES = 250 * 1024 * 1024;
const MAX_RAW_FILE_BYTES = 64 * 1024 * 1024;
const MAX_CHARACTERS = 10_000;
const MAX_SCENES = 10_000;
const MAX_WIKI_PAGES = 10_000;
const MAX_FORUM_THREADS = 20_000;
const MAX_FORUM_POSTS = 200_000;
const MAX_TURNS = 500_000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u;
const HASH_RE = /^[a-f0-9]{64}$/u;
const CAPTURE_ID_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/u;
const NAME_KEY_RE = /^[a-z0-9][a-z0-9-]{0,99}$/u;
const STAT_KEYS = ['ataque', 'destreza', 'defesa', 'reserva', 'controle', 'refino', 'emissao', 'alma', 'inteligencia', 'habilidade'];
const THEME_KEYS = ['accentColor', 'bannerStyle', 'layout', 'fontFamily', 'bgEffect', 'bgm'];
const THEME_VALUES = {
  bannerStyle: ['cinematic', 'standard', 'compact', 'none'],
  layout: ['sidebar-left', 'sidebar-right', 'full', 'book'],
  fontFamily: ['serif', 'sans', 'mono'],
  bgEffect: ['none', 'aura', 'grid', 'dots'],
};
const TURN_PRESENTATION_KEYS = [
  'characterName', 'characterTitle', 'characterAvatar', 'turnTitle', 'location',
  'banner', 'bannerStyle', 'images', 'oocNotes', 'accentColor', 'fontFamily', 'date', 'edited',
];
const TURN_KEYS = new Set([
  'id', 'authorId', 'authorName', 'authorRole', 'authorAvatar', 'characterName', 'characterTitle',
  'characterAvatar', 'turnTitle', 'location', 'banner', 'bannerStyle', 'images',
  'content', 'oocNotes', 'accentColor', 'fontFamily', 'date', 'edited', 'version',
  'legacyReadOnly',
]);
const SENSITIVE_KEY_RE = /^(password|passwordhash|passwd|email|session|cookie|authorization|token|secret)$/iu;
const RECONSTRUCTION_ID = 'b3c9a1f0-9d42-4a13-9a8e-1f6b8d2c7e54';
const RECONSTRUCTION_USERNAME = 'reconstrucao-local';
const TESTER_SPECS = Object.freeze([
  { key: 'admin', username: 'sandbox-admin', role: 'admin', isStaff: true },
  { key: 'moderador', username: 'sandbox-moderador', role: 'moderador', isStaff: true },
  { key: 'member', username: 'sandbox-member', role: 'member', isStaff: false },
]);
const USER_COMPARE = [
  'username', 'email', 'avatar', 'title', 'bio', 'posts_count', 'adm_tentativa_usada',
  'role', 'is_staff', 'disabled_at', 'auth_version', 'version', 'join_date',
];
const CHARACTER_COMPARE = [
  'author_id', 'hidden_at', 'version', 'nome', 'categoria', 'titulo', 'raca', 'faccao',
  'status', 'imagem', 'descricao', 'stats', 'skills', 'mascara_tier', 'blocks', 'theme',
  'created_at', 'updated_at',
];
const SCENE_COMPARE = [
  'author_id', 'hidden_at', 'version', 'titulo', 'subtitulo', 'categoria', 'status',
  'resumo', 'banner', 'descricao', 'theme', 'infobox', 'blocks', 'turns',
  'created_at', 'updated_at',
];
const TURN_COMPARE = [
  'scene_id', 'author_id', 'legacy_author_label', 'legacy_id', 'ordinal', 'content',
  'presentation', 'version', 'deleted_at',
];
const SECTION_COMPARE = ['name', 'description', 'parent_key', 'sort_order'];
const PAGE_COMPARE = [
  'head_revision_id', 'published_revision_id', 'work_version', 'public_version',
  'access_level', 'archived_at', 'discussion_thread_id', 'created_by', 'published_at',
  'created_at', 'updated_at',
];
const REVISION_COMPARE = [
  'page_id', 'sequence', 'parent_revision_id', 'base_published_revision_id', 'actor_id',
  'edit_summary', 'snapshot', 'restores_id', 'accepted_proposal_id', 'created_at',
];
const NAME_COMPARE = ['page_id', 'kind'];
const REVISION_CATEGORY_COMPARE = ['revision_id', 'category', 'category_key'];
const REVISION_LINK_COMPARE = ['revision_id', 'target_name_key', 'target_anchor'];
const FORUM_CATEGORY_COMPARE = ['name', 'description', 'archived_at', 'version', 'created_at', 'updated_at'];
const THREAD_COMPARE = [
  'category_id', 'author_id', 'author_label', 'title', 'tag', 'pinned', 'views',
  'locked', 'archived_at', 'version', 'last_activity_at', 'next_post_no',
  'created_at', 'updated_at',
];
const POST_COMPARE = [
  'thread_id', 'author_id', 'author_label', 'content', 'edited', 'post_no',
  'deleted_at', 'version', 'created_at', 'updated_at',
];

function publicError(message) {
  const error = new Error(message);
  error.safeToPrint = true;
  return error;
}

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function deterministicUuid(namespace, value) {
  const digest = crypto.createHash('sha256').update(`${namespace}\0${value}`, 'utf8').digest();
  const bytes = Buffer.from(digest.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function canonicalJson(value) {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('JSON number is not finite.');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (!value || typeof value !== 'object') throw new TypeError('Value is not a plain JSON object.');
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
}

function legacyDigest(turns) {
  return sha256(Buffer.from(canonicalJson(turns), 'utf8'));
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function assertPlainObject(value, label) {
  if (!isPlainObject(value)) throw publicError(`The capture ${label} is invalid.`);
  return value;
}

function assertExactKeys(value, keys, label) {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    throw publicError(`The capture ${label} has unsupported or missing fields.`);
  }
  return value;
}

function assertAllowedKeys(value, allowed, label) {
  if (Object.keys(value).some((key) => !allowed.includes(key))) {
    throw publicError(`The capture ${label} has unsupported fields.`);
  }
  return value;
}

function text(value, label, { min = 0, max = Number.MAX_SAFE_INTEGER, trim = true } = {}) {
  if (typeof value !== 'string') throw publicError(`The capture ${label} must be text.`);
  const normalized = trim ? value.trim() : value;
  const length = Array.from(normalized).length;
  if (length < min || length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(normalized)) {
    throw publicError(`The capture ${label} has an invalid length or characters.`);
  }
  return normalized;
}

function optionalText(value, label, options) {
  if (value === undefined || value === null) return '';
  return text(value, label, options);
}

function integer(value, label, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw publicError(`The capture ${label} is not a valid integer.`);
  }
  return value;
}

function boolean(value, label) {
  if (typeof value !== 'boolean') throw publicError(`The capture ${label} is not a valid boolean.`);
  return value;
}

function uuid(value, label) {
  if (typeof value !== 'string' || !UUID_RE.test(value)) {
    throw publicError(`The capture ${label} is not a valid UUID.`);
  }
  return value.toLowerCase();
}

function nullableUuid(value, label) {
  if (value === null || value === undefined || value === '') return null;
  return uuid(value, label);
}

function timestamp(value, label, { nullable = false } = {}) {
  if (value === null || value === undefined || value === '') {
    if (nullable) return null;
    throw publicError(`The capture ${label} is missing.`);
  }
  if (typeof value !== 'string' || Number.isNaN(new Date(value).getTime())) {
    throw publicError(`The capture ${label} is not a valid timestamp.`);
  }
  return value;
}

function nullableTimestamp(value, label) {
  return timestamp(value, label, { nullable: true });
}

function hash(value, label) {
  if (typeof value !== 'string' || !HASH_RE.test(value)) {
    throw publicError(`The capture ${label} is not a valid SHA-256 hash.`);
  }
  return value;
}

function assertNoSensitiveKeys(value, location = 'dataset') {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoSensitiveKeys(item, `${location}[${index}]`));
    return;
  }
  if (!isPlainObject(value)) return;
  for (const [key, item] of Object.entries(value)) {
    if (SENSITIVE_KEY_RE.test(key)) {
      throw publicError(`The capture contains an unexpected sensitive account field at ${location}.`);
    }
    assertNoSensitiveKeys(item, `${location}.${key}`);
  }
}

function assertPrivateDirectory(directory, fsImpl, label) {
  let stat;
  try {
    stat = fsImpl.lstatSync(directory);
  } catch {
    throw publicError(`The ${label} is missing.`);
  }
  if (stat.isSymbolicLink() || !stat.isDirectory()) {
    throw publicError(`The ${label} must be a real directory.`);
  }
  if ((stat.mode & 0o077) !== 0) {
    throw publicError(`The ${label} must be private (mode 700).`);
  }
}

function readPrivateFile(filePath, fsImpl, label, maxBytes) {
  assertPrivateDirectory(path.dirname(filePath), fsImpl, `${label} parent directory`);
  let pathStat;
  try {
    pathStat = fsImpl.lstatSync(filePath);
  } catch {
    throw publicError(`The ${label} is missing.`);
  }
  if (pathStat.isSymbolicLink() || !pathStat.isFile() || (pathStat.mode & 0o777) !== 0o600
      || pathStat.size < 1 || pathStat.size > maxBytes) {
    throw publicError(`The ${label} must be a non-empty private file (mode 600) within its size limit.`);
  }
  const constants = fsImpl.constants || fs.constants;
  if (!Number.isInteger(constants.O_NOFOLLOW)) {
    throw publicError('This runtime cannot safely read a private capture.');
  }
  let descriptor;
  try {
    descriptor = fsImpl.openSync(filePath, constants.O_RDONLY | constants.O_NOFOLLOW);
  } catch {
    throw publicError(`The ${label} could not be opened safely.`);
  }
  try {
    const openedStat = fsImpl.fstatSync(descriptor);
    if (!openedStat.isFile() || (openedStat.mode & 0o777) !== 0o600
        || openedStat.size !== pathStat.size || openedStat.size > maxBytes
        || (pathStat.dev !== undefined && openedStat.dev !== pathStat.dev)
        || (pathStat.ino !== undefined && openedStat.ino !== pathStat.ino)) {
      throw publicError(`The ${label} changed while it was being read.`);
    }
    const bytes = fsImpl.readFileSync(descriptor);
    if (bytes.length !== openedStat.size) throw publicError(`The ${label} changed while it was being read.`);
    return bytes;
  } finally {
    try { fsImpl.closeSync(descriptor); } catch { /* Preserve the read result. */ }
  }
}

function readJsonFile(filePath, fsImpl, label, maxBytes) {
  const bytes = readPrivateFile(filePath, fsImpl, label, maxBytes);
  let value;
  try {
    value = JSON.parse(new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes));
  } catch {
    throw publicError(`The ${label} is not valid UTF-8 JSON.`);
  }
  return { value, bytes };
}

function assertSafeRelativePath(value, label) {
  if (typeof value !== 'string' || !value || value.length > 1000
      || value.startsWith('/') || value.includes('\\') || value.includes('\0')
      || value.split('/').some((segment) => segment === '' || segment === '.' || segment === '..')
      || !/^raw\/[A-Za-z0-9._/-]+$/u.test(value)) {
    throw publicError(`The capture ${label} path is invalid.`);
  }
  return value;
}

const MANIFEST_KEYS = [
  'schemaVersion', 'captureId', 'origin', 'startedAt', 'finishedAt', 'datasetSha256',
  'requestPolicy', 'counts', 'entities', 'gaps', 'consistency', 'requests',
];
const COUNT_KEYS = [
  'characters', 'scenes', 'sceneTurns', 'wikiPages', 'wikiSections', 'wikiCategories',
  'forumThreads', 'forumPosts',
];
const ENTITY_KEYS = ['characters', 'scenes', 'wikiPages', 'forumThreads'];
const GAP_KEYS = ['family', 'endpoint', 'status', 'reason'];
const REQUEST_KEYS = ['family', 'url', 'status', 'bytes', 'sha256', 'storedAs'];
const DATASET_KEYS = [
  'schemaVersion', 'origin', 'capturedAt', 'characters', 'scenes', 'wikiPages',
  'wikiSections', 'wikiCategories', 'forum',
];
const FORUM_KEYS = ['categories', 'threads', 'postsByThread'];

function validateManifest(manifest) {
  assertPlainObject(manifest, 'manifest');
  assertExactKeys(manifest, MANIFEST_KEYS, 'manifest');
  if (manifest.schemaVersion !== CAPTURE_SCHEMA) throw publicError('The capture manifest schema version is unsupported.');
  if (typeof manifest.captureId !== 'string' || !CAPTURE_ID_RE.test(manifest.captureId)) {
    throw publicError('The capture identifier is invalid.');
  }
  let origin;
  try {
    origin = new URL(manifest.origin);
  } catch {
    throw publicError('The capture origin is invalid.');
  }
  if (origin.protocol !== 'https:' || origin.username || origin.password || origin.pathname !== '/'
      || origin.search || origin.hash) {
    throw publicError('The capture origin must be a plain HTTPS origin.');
  }
  const startedAt = timestamp(manifest.startedAt, 'manifest.start startedAt');
  const finishedAt = timestamp(manifest.finishedAt, 'manifest.finishedAt');
  if (new Date(finishedAt).getTime() < new Date(startedAt).getTime()) {
    throw publicError('The capture interval is reversed.');
  }
  hash(manifest.datasetSha256, 'manifest.datasetSha256');
  assertPlainObject(manifest.requestPolicy, 'request policy');
  assertExactKeys(manifest.requestPolicy, ['anonymous', 'maxRequestsPerSecond'], 'request policy');
  if (manifest.requestPolicy.anonymous !== true || manifest.requestPolicy.maxRequestsPerSecond !== 1) {
    throw publicError('The capture did not use the required anonymous serial request policy.');
  }
  assertPlainObject(manifest.counts, 'counts');
  assertExactKeys(manifest.counts, COUNT_KEYS, 'counts');
  for (const key of COUNT_KEYS) integer(manifest.counts[key], `counts.${key}`);
  assertPlainObject(manifest.entities, 'entities');
  assertExactKeys(manifest.entities, ENTITY_KEYS, 'entities');
  for (const key of ENTITY_KEYS) {
    if (!Array.isArray(manifest.entities[key])) throw publicError(`The capture entity list ${key} is invalid.`);
    const seen = new Set();
    for (const value of manifest.entities[key]) {
      const id = uuid(value, `entities.${key}`);
      if (seen.has(id)) throw publicError(`The capture entity list ${key} contains duplicates.`);
      seen.add(id);
    }
  }
  if (!Array.isArray(manifest.gaps)) throw publicError('The capture gaps list is invalid.');
  for (const gap of manifest.gaps) {
    assertPlainObject(gap, 'gap');
    assertExactKeys(gap, GAP_KEYS, 'gap');
    text(gap.family, 'gap family', { min: 1, max: 80 });
    text(gap.endpoint, 'gap endpoint', { min: 1, max: 500 });
    integer(gap.status, 'gap status', { min: 0, max: 599 });
    text(gap.reason, 'gap reason', { min: 1, max: 500 });
  }
  assertPlainObject(manifest.consistency, 'consistency');
  assertExactKeys(manifest.consistency, ['complete', 'observedInterval', 'unresolvedChanges'], 'consistency');
  boolean(manifest.consistency.complete, 'consistency.complete');
  boolean(manifest.consistency.observedInterval, 'consistency.observedInterval');
  if (manifest.consistency.observedInterval !== true) {
    throw publicError('The capture does not record an observed interval.');
  }
  if (!Array.isArray(manifest.consistency.unresolvedChanges)) {
    throw publicError('The capture unresolvedChanges list is invalid.');
  }
  const derivedComplete = manifest.gaps.length === 0
    && manifest.consistency.unresolvedChanges.length === 0;
  if (manifest.consistency.complete !== derivedComplete) {
    throw publicError('The capture completeness claim does not match its gaps and unresolved changes.');
  }
  if (!Array.isArray(manifest.requests) || manifest.requests.length === 0) {
    throw publicError('The capture must contain at least one observed response.');
  }
  for (const request of manifest.requests) {
    assertPlainObject(request, 'request');
    assertExactKeys(request, REQUEST_KEYS, 'request');
    text(request.family, 'request family', { min: 1, max: 80 });
    let requestUrl;
    try { requestUrl = new URL(request.url); } catch { throw publicError('A capture request URL is invalid.'); }
    if (requestUrl.origin !== origin.origin) throw publicError('A capture request points outside the recorded origin.');
    integer(request.status, 'request status', { min: 100, max: 599 });
    integer(request.bytes, 'request byte length', { min: 0, max: MAX_RAW_FILE_BYTES });
    hash(request.sha256, 'request hash');
    if (request.storedAs !== null) assertSafeRelativePath(request.storedAs, 'request storage');
  }
  return { origin: origin.origin, startedAt, finishedAt };
}

function assertCaptureContract(dataset, manifest) {
  try {
    validateCapturedDataset(dataset, manifest);
  } catch (error) {
    if (error && typeof error.message === 'string' && error.message) {
      throw publicError(`The capture violates the capture contract: ${error.message}`);
    }
    throw error;
  }
}

function readCapture({ captureDirectory, fsImpl = fs } = {}) {
  if (typeof captureDirectory !== 'string' || !captureDirectory) {
    throw publicError('A private capture directory is required.');
  }
  const directory = path.resolve(captureDirectory);
  assertPrivateDirectory(directory, fsImpl, 'capture directory');
  const manifestResult = readJsonFile(path.join(directory, MANIFEST_FILE), fsImpl, 'capture manifest', MAX_MANIFEST_BYTES);
  const manifest = manifestResult.value;
  const manifestIdentity = validateManifest(manifest);

  const datasetResult = readJsonFile(path.join(directory, DATASET_FILE), fsImpl, 'capture dataset', MAX_DATASET_BYTES);
  const dataset = datasetResult.value;
  assertNoSensitiveKeys(dataset);
  assertPlainObject(dataset, 'dataset');
  assertExactKeys(dataset, DATASET_KEYS, 'dataset');
  if (dataset.schemaVersion !== CAPTURE_SCHEMA) throw publicError('The capture dataset schema version is unsupported.');
  if (dataset.origin !== manifest.origin) throw publicError('The capture dataset origin does not match its manifest.');
  const capturedAt = timestamp(dataset.capturedAt, 'dataset.capturedAt');
  assertPlainObject(dataset.forum, 'forum');
  assertExactKeys(dataset.forum, FORUM_KEYS, 'forum');
  for (const key of ['characters', 'scenes', 'wikiPages', 'wikiSections', 'wikiCategories']) {
    if (!Array.isArray(dataset[key])) throw publicError(`The capture dataset list ${key} is invalid.`);
  }
  for (const key of ['categories', 'threads']) {
    if (!Array.isArray(dataset.forum[key])) throw publicError(`The capture forum list ${key} is invalid.`);
  }
  assertPlainObject(dataset.forum.postsByThread, 'forum postsByThread');
  const datasetSha256 = sha256(datasetResult.bytes);
  if (datasetSha256 !== manifest.datasetSha256) {
    throw publicError('dataset.json does not match manifest.datasetSha256.');
  }
  assertCaptureContract(dataset, manifest);

  const requestFiles = manifest.requests.map((request) => {
    if (request.storedAs === null) {
      const emptyDigest = sha256(Buffer.alloc(0));
      if (request.bytes !== 0 || request.sha256 !== emptyDigest) {
        throw publicError(`A captured empty response is inconsistent in the manifest (${request.family}).`);
      }
      return null;
    }
    const filePath = path.join(directory, ...request.storedAs.split('/'));
    const bytes = readPrivateFile(filePath, fsImpl, `capture response ${request.family}`, MAX_RAW_FILE_BYTES);
    if (bytes.length !== request.bytes || sha256(bytes) !== request.sha256) {
      throw publicError(`A captured response hash or byte length does not match the manifest (${request.family}).`);
    }
    return request.storedAs;
  });

  const sceneTurnCount = dataset.scenes.reduce((total, scene) => {
    if (!isPlainObject(scene) || !Array.isArray(scene.turns)) {
      throw publicError('A captured scene has an invalid turns collection.');
    }
    return total + scene.turns.length;
  }, 0);
  const forumPostCount = Object.values(dataset.forum.postsByThread).reduce((total, posts) => {
    if (!Array.isArray(posts)) throw publicError('A captured forum post collection is invalid.');
    return total + posts.length;
  }, 0);

  const actualCounts = {
    characters: dataset.characters.length,
    scenes: dataset.scenes.length,
    sceneTurns: sceneTurnCount,
    wikiPages: dataset.wikiPages.length,
    wikiSections: dataset.wikiSections.length,
    wikiCategories: dataset.wikiCategories.length,
    forumThreads: dataset.forum.threads.length,
    forumPosts: forumPostCount,
  };
  for (const key of COUNT_KEYS) {
    if (actualCounts[key] !== manifest.counts[key]) {
      throw publicError(`The capture ${key} count does not match the dataset.`);
    }
  }
  if (actualCounts.characters > MAX_CHARACTERS || actualCounts.scenes > MAX_SCENES
      || actualCounts.wikiPages > MAX_WIKI_PAGES || actualCounts.forumThreads > MAX_FORUM_THREADS
      || actualCounts.forumPosts > MAX_FORUM_POSTS || actualCounts.sceneTurns > MAX_TURNS) {
    throw publicError('The capture exceeds the sandbox import limits.');
  }

  const datasetIds = {
    characters: dataset.characters.map((record, index) => uuid(record?.id, `characters[${index}].id`)),
    scenes: dataset.scenes.map((record, index) => uuid(record?.id, `scenes[${index}].id`)),
    wikiPages: dataset.wikiPages.map((record, index) => uuid(record?.id, `wikiPages[${index}].id`)),
    forumThreads: dataset.forum.threads.map((record, index) => uuid(record?.id, `forum.threads[${index}].id`)),
  };
  for (const key of ENTITY_KEYS) {
    const expected = [...manifest.entities[key]].sort();
    const actual = [...datasetIds[key]].sort();
    if (new Set(actual).size !== actual.length || JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw publicError(`The capture ${key} entity inventory does not match the dataset exactly.`);
    }
  }

  return {
    directory,
    manifest,
    dataset,
    origin: manifestIdentity.origin,
    capturedAt,
    startedAt: manifestIdentity.startedAt,
    finishedAt: manifestIdentity.finishedAt,
    datasetSha256,
    requestFiles,
    actualCounts,
  };
}

function qualifyMediaUrl(value, origin, label, report) {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value !== 'string') throw publicError(`The capture ${label} is not a media URL.`);
  let candidate = value;
  if (candidate.startsWith('/') && !candidate.startsWith('//')) {
    candidate = `${origin}${candidate}`;
    report.normalizations.push({ kind: 'origin_relative_media_qualified', field: label });
  }
  const safe = sanitizeUrl(candidate, { image: true });
  if (!safe) throw publicError(`The capture ${label} is not a safe HTTPS image URL.`);
  return safe;
}

function safeHtmlContent(raw, label, report, { required = true, maxBytes = 500_000 } = {}) {
  if (typeof raw !== 'string') throw publicError(`The capture ${label} is not HTML text.`);
  let sanitized;
  try {
    sanitized = sanitizeHtml(raw, { maxBytes });
  } catch {
    throw publicError(`The capture ${label} contains unsupported HTML.`);
  }
  if (sanitized !== raw) {
    report.normalizations.push({ kind: 'html_sanitized', field: label });
  }
  if (required && !sanitized.replace(/<[^>]*>/gu, '').trim() && !/<img\b/iu.test(sanitized)) {
    throw publicError(`The capture ${label} has no meaningful content.`);
  }
  return sanitized;
}

function safeBlocksContent(raw, label, report) {
  if (!Array.isArray(raw)) throw publicError(`The capture ${label} is not a block list.`);
  let sanitized;
  try {
    sanitized = sanitizeBlocks(raw, { maxBytes: 500_000 });
  } catch {
    throw publicError(`The capture ${label} contains unsupported blocks.`);
  }
  if (canonicalJson(sanitized) !== canonicalJson(raw)) {
    report.normalizations.push({ kind: 'blocks_sanitized', field: label });
  }
  return sanitized;
}

function importStats(raw, label, report) {
  if (raw === undefined || raw === null) return {};
  assertPlainObject(raw, label);
  const output = {};
  for (const key of Object.keys(raw)) {
    if (!STAT_KEYS.includes(key)) throw publicError(`The capture ${label} has an unsupported statistic.`);
    const value = integer(raw[key], `${label}.${key}`, { min: 0, max: 100 });
    output[key] = value;
  }
  if (canonicalJson(output) !== canonicalJson(raw)) {
    report.normalizations.push({ kind: 'stats_normalized', field: label });
  }
  return output;
}

function importSkills(raw, label) {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw) || raw.length > 60) throw publicError(`The capture ${label} is not a valid skill list.`);
  return raw.map((item, index) => {
    assertPlainObject(item, `${label}[${index}]`);
    assertExactKeys(item, ['nome', 'descricao', 'tipo'], `${label}[${index}]`);
    const tipo = item.tipo === 'equipamento' ? 'equipamento' : 'skill';
    return {
      nome: optionalText(item.nome, `${label}[${index}].nome`, { min: 0, max: 100 }),
      descricao: optionalText(item.descricao, `${label}[${index}].descricao`, { min: 0, max: 2_000 }),
      tipo,
    };
  });
}

function importTheme(raw, label, report) {
  if (raw === undefined || raw === null) raw = {};
  assertPlainObject(raw, label);
  assertAllowedKeys(raw, THEME_KEYS, label);
  const output = {
    accentColor: '',
    bannerStyle: 'cinematic',
    layout: 'sidebar-left',
    fontFamily: 'sans',
    bgEffect: 'none',
    bgm: '',
  };
  if (raw.accentColor !== undefined && raw.accentColor !== '') {
    if (typeof raw.accentColor !== 'string' || !/^#(?:[\da-f]{3}|[\da-f]{6})$/iu.test(raw.accentColor)) {
      throw publicError(`The capture ${label}.accentColor is invalid.`);
    }
    output.accentColor = raw.accentColor.toLowerCase();
  }
  for (const [key, choices] of Object.entries(THEME_VALUES)) {
    if (raw[key] === undefined || raw[key] === '') continue;
    if (!choices.includes(raw[key])) throw publicError(`The capture ${label}.${key} is invalid.`);
    output[key] = raw[key];
  }
  if (raw.bgm !== undefined) output.bgm = optionalText(raw.bgm, `${label}.bgm`, { min: 0, max: 300 });
  if (canonicalJson(output) !== canonicalJson({ ...raw, ...output })) {
    report.normalizations.push({ kind: 'theme_defaults_applied', field: label });
  }
  return output;
}

function importInfoboxEntryList(raw, label, report) {
  if (raw === undefined || raw === null) raw = {};
  assertPlainObject(raw, label);
  assertAllowedKeys(raw, ['show', 'title', 'image', 'caption', 'location', 'timeline', 'participants', 'fields'], label);
  const fields = raw.fields === undefined ? [] : raw.fields;
  if (!Array.isArray(fields) || fields.length > 30) throw publicError(`The capture ${label}.fields is invalid.`);
  const safeFields = fields.map((field, index) => {
    assertPlainObject(field, `${label}.fields[${index}]`);
    assertExactKeys(field, ['label', 'value'], `${label}.fields[${index}]`);
    return {
      label: optionalText(field.label, `${label}.fields[${index}].label`, { min: 0, max: 80 }),
      value: optionalText(field.value, `${label}.fields[${index}].value`, { min: 0, max: 300 }),
    };
  });
  const participants = raw.participants === undefined ? [] : raw.participants;
  if (!Array.isArray(participants) || participants.length > 30) {
    throw publicError(`The capture ${label}.participants is invalid.`);
  }
  const safeParticipants = participants.map((participant, index) => (
    text(participant, `${label}.participants[${index}]`, { min: 1, max: 100 })
  ));
  const output = {
    show: raw.show !== false,
    title: optionalText(raw.title, `${label}.title`, { min: 0, max: 120 }),
    image: qualifyMediaUrl(raw.image, report.origin, `${label}.image`, report),
    caption: optionalText(raw.caption, `${label}.caption`, { min: 0, max: 200 }),
    location: optionalText(raw.location, `${label}.location`, { min: 0, max: 160 }),
    timeline: optionalText(raw.timeline, `${label}.timeline`, { min: 0, max: 160 }),
    participants: safeParticipants,
    fields: safeFields,
  };
  if (canonicalJson(output) !== canonicalJson({ ...raw, ...output })) {
    report.normalizations.push({ kind: 'infobox_normalized', field: label });
  }
  return output;
}

function authorRecord(raw, label) {
  if (raw === undefined || raw === null) return null;
  assertPlainObject(raw, label);
  assertExactKeys(raw, ['id', 'username', 'avatar', 'title', 'role'], label);
  return {
    id: uuid(raw.id, `${label}.id`),
    username: text(raw.username, `${label}.username`, { min: 1, max: 50 }),
    avatar: typeof raw.avatar === 'string' ? raw.avatar : '',
    title: optionalText(raw.title, `${label}.title`, { min: 0, max: 100 }),
    role: ['member', 'moderador', 'admin'].includes(raw.role) ? raw.role : 'member',
  };
}

function buildAuthorIndex(capture, report) {
  const authors = new Map();
  const names = new Map();
  function add(raw, fallbackId, label) {
    const parsed = authorRecord(raw, label);
    const id = parsed ? parsed.id : (fallbackId ? uuid(fallbackId, `${label}.authorId`) : null);
    if (!id) return null;
    let record = authors.get(id);
    if (!record) {
      record = {
        id,
        username: parsed ? parsed.username : `autor-publico-${id.slice(0, 8)}`,
        avatar: parsed ? parsed.avatar : '',
        title: parsed ? parsed.title : '',
        publicRole: parsed ? parsed.role : 'member',
        fallback: !parsed,
      };
      authors.set(id, record);
    } else {
      if (parsed && !record.fallback && parsed.username !== record.username) {
        throw publicError(`The capture maps one public author to conflicting usernames at ${label}.`);
      }
      if (parsed && record.fallback) {
        record.username = parsed.username;
        record.avatar = parsed.avatar;
        record.title = parsed.title;
        record.publicRole = parsed.role;
        record.fallback = false;
      }
    }
    const key = record.username.toLowerCase();
    if (names.has(key) && names.get(key) !== id) {
      throw publicError('The capture contains two public authors with the same case-insensitive username.');
    }
    names.set(key, id);
    return { id, username: record.username, fallback: record.fallback };
  }
  for (let index = 0; index < capture.dataset.characters.length; index += 1) {
    const record = capture.dataset.characters[index];
    add(record.author, record.authorId, `characters[${index}].author`);
  }
  for (let index = 0; index < capture.dataset.scenes.length; index += 1) {
    const scene = capture.dataset.scenes[index];
    add(scene.author, scene.authorId, `scenes[${index}].author`);
    for (let turnIndex = 0; turnIndex < scene.turns.length; turnIndex += 1) {
      const turn = scene.turns[turnIndex];
      add(null, turn.authorId, `scenes[${index}].turns[${turnIndex}].author`);
    }
  }
  for (let index = 0; index < capture.dataset.wikiPages.length; index += 1) {
    add(capture.dataset.wikiPages[index].author, null, `wikiPages[${index}].author`);
  }
  for (let index = 0; index < capture.dataset.forum.threads.length; index += 1) {
    const thread = capture.dataset.forum.threads[index];
    add(thread.author, thread.authorId, `forum.threads[${index}].author`);
  }
  for (const [threadId, posts] of Object.entries(capture.dataset.forum.postsByThread)) {
    for (let index = 0; index < posts.length; index += 1) {
      add(posts[index].author, posts[index].authorId, `forum.postsByThread.${threadId}[${index}].author`);
    }
  }
  for (const author of authors.values()) {
    if (author.fallback) {
      report.normalizations.push({ kind: 'missing_author_fallback', authorId: author.id });
    }
    if (author.publicRole !== 'member') {
      report.normalizations.push({ kind: 'public_author_role_not_imported', authorId: author.id });
    }
  }
  return authors;
}

function userRowFromAuthor(author, capture) {
  return {
    id: author.id,
    username: author.username,
    email: `autor-${author.id}@public-sandbox.invalid`,
    password_hash: '',
    avatar: author.avatar,
    title: author.title,
    bio: 'Autor público reconstruído localmente; conta sem login e sem privilégios.',
    posts_count: 0,
    adm_tentativa_usada: false,
    role: 'member',
    is_staff: false,
    disabled_at: null,
    auth_version: 1,
    version: 1,
    join_date: new Date(capture.capturedAt).toISOString().slice(0, 10),
    created_at: capture.capturedAt,
    updated_at: capture.capturedAt,
    kind: 'public-author-placeholder',
  };
}

function reconstructionUserRow(capture) {
  return {
    id: RECONSTRUCTION_ID,
    username: RECONSTRUCTION_USERNAME,
    email: 'reconstrucao@public-sandbox.invalid',
    password_hash: '',
    avatar: '',
    title: 'Ator de reconstrução local',
    bio: 'Conta local sem login usada para reconstruir conteúdo público capturado. Não representa autoria editorial original.',
    posts_count: 0,
    adm_tentativa_usada: false,
    role: 'member',
    is_staff: false,
    disabled_at: null,
    auth_version: 1,
    version: 1,
    join_date: new Date(capture.capturedAt).toISOString().slice(0, 10),
    created_at: capture.capturedAt,
    updated_at: capture.capturedAt,
    kind: 'reconstruction-actor',
  };
}

function testerUserRow(spec, capture, passwordHash) {
  return {
    id: deterministicUuid('eterverso-public-sandbox-testers', spec.key),
    username: spec.username,
    email: `${spec.username}@public-sandbox.invalid`,
    password_hash: passwordHash || null,
    avatar: '',
    title: spec.role === 'admin' ? 'Administrador local de teste' : (spec.role === 'moderador' ? 'Moderador local de teste' : 'Membro local de teste'),
    bio: 'Conta sintética do sandbox público local. Não representa uma pessoa real.',
    posts_count: 0,
    adm_tentativa_usada: false,
    role: spec.role,
    is_staff: spec.isStaff,
    disabled_at: null,
    auth_version: 1,
    version: 1,
    join_date: new Date(capture.capturedAt).toISOString().slice(0, 10),
    created_at: capture.capturedAt,
    updated_at: capture.capturedAt,
    kind: 'synthetic-tester',
  };
}

function characterPlan(raw, index, authors, capture, report) {
  assertPlainObject(raw, `characters[${index}]`);
  assertExactKeys(raw, [
    'id', 'version', 'authorId', 'author', 'createdAt', 'updatedAt', 'nome', 'categoria',
    'titulo', 'raca', 'faccao', 'status', 'imagem', 'descricao', 'stats', 'skills',
    'mascaraTier', 'blocks', 'theme',
  ], `characters[${index}]`);
  const id = uuid(raw.id, `characters[${index}].id`);
  const authorId = uuid(raw.authorId, `characters[${index}].authorId`);
  const author = authors.get(authorId);
  if (!author) throw publicError(`The capture character ${index} has no resolvable author.`);
  return {
    id,
    author_id: authorId,
    hidden_at: null,
    version: integer(raw.version, `characters[${index}].version`, { min: 1, max: 2_147_483_647 }),
    nome: text(raw.nome, `characters[${index}].nome`, { min: 1, max: 100 }),
    categoria: optionalText(raw.categoria, `characters[${index}].categoria`, { min: 0, max: 50 }),
    titulo: optionalText(raw.titulo, `characters[${index}].titulo`, { min: 0, max: 100 }),
    raca: optionalText(raw.raca, `characters[${index}].raca`, { min: 0, max: 80 }),
    faccao: optionalText(raw.faccao, `characters[${index}].faccao`, { min: 0, max: 120 }),
    status: optionalText(raw.status, `characters[${index}].status`, { min: 0, max: 80 }),
    imagem: qualifyMediaUrl(raw.imagem, capture.origin, `characters[${index}].imagem`, report),
    descricao: safeHtmlContent(raw.descricao, `characters[${index}].descricao`, report),
    stats: importStats(raw.stats, `characters[${index}].stats`, report),
    skills: importSkills(raw.skills, `characters[${index}].skills`),
    mascara_tier: optionalText(raw.mascaraTier, `characters[${index}].mascaraTier`, { min: 0, max: 60 }),
    blocks: safeBlocksContent(raw.blocks, `characters[${index}].blocks`, report),
    theme: importTheme(raw.theme, `characters[${index}].theme`, report),
    created_at: timestamp(raw.createdAt, `characters[${index}].createdAt`),
    updated_at: timestamp(raw.updatedAt, `characters[${index}].updatedAt`),
  };
}

function turnPlan(raw, sceneIndex, turnIndex, authors, capture, report, sceneTimestamp) {
  assertPlainObject(raw, `scenes[${sceneIndex}].turns[${turnIndex}]`);
  for (const key of Object.keys(raw)) {
    if (!TURN_KEYS.has(key)) throw publicError(`The capture scene turn has an unsupported field at scene ${sceneIndex}.`);
  }
  const label = `scenes[${sceneIndex}].turns[${turnIndex}]`;
  const authorId = nullableUuid(raw.authorId, `${label}.authorId`);
  const author = authorId ? authors.get(authorId) : null;
  const authorName = optionalText(raw.authorName, `${label}.authorName`, { min: 0, max: 60 });
  if (raw.authorRole && raw.authorRole !== 'member') {
    report.normalizations.push({ kind: 'turn_author_role_not_imported' });
  }
  const images = raw.images === undefined ? [] : raw.images;
  if (!Array.isArray(images) || images.length > 20) throw publicError(`The capture ${label}.images is invalid.`);
  const safeImages = images.map((image, imageIndex) => {
    assertPlainObject(image, `${label}.images[${imageIndex}]`);
    assertExactKeys(image, ['url', 'caption'], `${label}.images[${imageIndex}]`);
    return {
      url: qualifyMediaUrl(image.url, capture.origin, `${label}.images[${imageIndex}].url`, report),
      caption: optionalText(image.caption, `${label}.images[${imageIndex}].caption`, { min: 0, max: 240 }),
    };
  });
  const bannerStyle = raw.bannerStyle === undefined ? 'panoramic' : raw.bannerStyle;
  if (!['panoramic', 'full', 'side'].includes(bannerStyle)) throw publicError(`The capture ${label}.bannerStyle is invalid.`);
  const fontFamily = raw.fontFamily === undefined ? 'serif' : raw.fontFamily;
  if (!['serif', 'sans', 'mono'].includes(fontFamily)) throw publicError(`The capture ${label}.fontFamily is invalid.`);
  const accentColor = raw.accentColor === undefined ? '' : raw.accentColor;
  if (accentColor && (typeof accentColor !== 'string' || !/^#(?:[\da-f]{3}|[\da-f]{6})$/iu.test(accentColor))) {
    throw publicError(`The capture ${label}.accentColor is invalid.`);
  }
  const content = safeHtmlContent(raw.content, `${label}.content`, report, { maxBytes: 500_000 });
  const legacyId = typeof raw.id === 'string' && raw.id && Array.from(raw.id).length <= 80
    ? raw.id
    : null;
  if (raw.id !== undefined && raw.id !== null && typeof raw.id !== 'string') {
    throw publicError(`The capture ${label}.id is invalid.`);
  }
  const rowId = legacyId && UUID_RE.test(legacyId)
    ? legacyId.toLowerCase()
    : deterministicUuid('eterverso-public-sandbox-turn', `${sceneIndex}\0${turnIndex}\0${legacyId || ''}`);
  return {
    rowId,
    row: {
      id: rowId,
      scene_id: null,
      author_id: authorId || null,
      legacy_author_label: authorName || null,
      legacy_id: legacyId,
      ordinal: turnIndex,
      content,
      presentation: {
        characterName: optionalText(raw.characterName, `${label}.characterName`, { min: 0, max: 100 }),
        characterTitle: optionalText(raw.characterTitle, `${label}.characterTitle`, { min: 0, max: 120 }),
        characterAvatar: qualifyMediaUrl(raw.characterAvatar, capture.origin, `${label}.characterAvatar`, report),
        turnTitle: optionalText(raw.turnTitle, `${label}.turnTitle`, { min: 0, max: 160 }),
        location: optionalText(raw.location, `${label}.location`, { min: 0, max: 120 }),
        banner: qualifyMediaUrl(raw.banner, capture.origin, `${label}.banner`, report),
        bannerStyle,
        images: safeImages,
        oocNotes: optionalText(raw.oocNotes, `${label}.oocNotes`, { min: 0, max: 4_000 }),
        accentColor: accentColor.toLowerCase(),
        fontFamily,
        date: optionalText(raw.date, `${label}.date`, { min: 0, max: 80 }),
        edited: raw.edited === true,
      },
      version: integer(raw.version === undefined ? 1 : raw.version, `${label}.version`, { min: 1, max: 2_147_483_647 }),
      deleted_at: null,
      created_at: sceneTimestamp,
      updated_at: sceneTimestamp,
    },
    authorLabel: authorName,
    resolvedAuthorId: author ? author.id : null,
  };
}

function scenePlan(raw, index, authors, capture, report) {
  assertPlainObject(raw, `scenes[${index}]`);
  assertExactKeys(raw, [
    'id', 'version', 'turnsReadOnly', 'authorId', 'author', 'titulo', 'subtitulo',
    'categoria', 'status', 'resumo', 'banner', 'descricao', 'theme', 'infobox',
    'blocks', 'turns', 'createdAt', 'updatedAt',
  ], `scenes[${index}]`);
  const id = uuid(raw.id, `scenes[${index}].id`);
  const authorId = nullableUuid(raw.authorId, `scenes[${index}].authorId`);
  if (authorId && !authors.has(authorId)) {
    throw publicError(`The capture scene ${index} references an author that cannot be resolved.`);
  }
  if (!Array.isArray(raw.turns)) throw publicError(`The capture scene ${index} turns collection is invalid.`);
  const createdAt = timestamp(raw.createdAt, `scenes[${index}].createdAt`);
  const updatedAt = timestamp(raw.updatedAt, `scenes[${index}].updatedAt`);
  const legacyMode = raw.turnsReadOnly === true;
  if (typeof raw.turnsReadOnly !== 'boolean') throw publicError(`The capture scene ${index} turnsReadOnly flag is invalid.`);
  const seenTurnIds = new Set();
  const turns = raw.turns.map((turn, turnIndex) => {
    const planned = turnPlan(turn, index, turnIndex, authors, capture, report, updatedAt);
    if (planned.row.legacy_id) {
      if (seenTurnIds.has(planned.row.legacy_id)) {
        throw publicError(`The capture scene ${index} contains duplicate turn identifiers.`);
      }
      seenTurnIds.add(planned.row.legacy_id);
    }
    planned.row.scene_id = id;
    if (planned.row.author_id && !authors.has(planned.row.author_id)) {
      throw publicError(`The capture scene ${index} has a turn author that cannot be resolved.`);
    }
    return planned.row;
  });
  const legacyTurns = legacyMode ? raw.turns : [];
  return {
    row: {
      id,
      author_id: authorId,
      hidden_at: null,
      version: integer(raw.version, `scenes[${index}].version`, { min: 1, max: 2_147_483_647 }),
      titulo: text(raw.titulo, `scenes[${index}].titulo`, { min: 1, max: 200 }),
      subtitulo: optionalText(raw.subtitulo, `scenes[${index}].subtitulo`, { min: 0, max: 200 }),
      categoria: optionalText(raw.categoria, `scenes[${index}].categoria`, { min: 0, max: 80 }) || 'Cena de RPG',
      status: optionalText(raw.status, `scenes[${index}].status`, { min: 0, max: 80 }) || 'Em Andamento',
      resumo: optionalText(raw.resumo, `scenes[${index}].resumo`, { min: 0, max: 1_000 }),
      banner: qualifyMediaUrl(raw.banner, capture.origin, `scenes[${index}].banner`, report),
      descricao: safeHtmlContent(raw.descricao, `scenes[${index}].descricao`, report),
      theme: importTheme(raw.theme, `scenes[${index}].theme`, report),
      infobox: importInfoboxEntryList(raw.infobox, `scenes[${index}].infobox`, report),
      blocks: safeBlocksContent(raw.blocks, `scenes[${index}].blocks`, report),
      turns: legacyTurns,
      created_at: createdAt,
      updated_at: updatedAt,
    },
    turns,
    legacyTurns,
    sourceMode: legacyMode ? 'legacy' : 'normalized',
    legacySha256: legacyDigest(legacyTurns),
    turnCount: turns.length,
  };
}

function snapshotSearchText(snapshot) {
  const values = [snapshot.title, snapshot.summary, ...snapshot.aliases, ...snapshot.categories];
  const visit = (value, key = '') => {
    if (typeof value === 'string') {
      if (key === 'html' || key === 'content') {
        try { values.push(plainTextFromHtml(value)); } catch { /* already validated */ }
      } else values.push(value);
    } else if (Array.isArray(value)) value.forEach((item) => visit(item));
    else if (value && typeof value === 'object') Object.entries(value).forEach(([name, item]) => {
      if (!['id', 'authority', 'knowledgeLayer', 'format', 'type'].includes(name)) visit(item, name);
    });
  };
  visit(snapshot.body);
  return values.join('\n');
}

function wikiPagePlan(raw, index, capture, report, reconstructionActorId) {
  assertPlainObject(raw, `wikiPages[${index}]`);
  assertExactKeys(raw, [
    'id', 'publishedRevisionId', 'title', 'slug', 'aliases', 'type', 'summary',
    'categories', 'accessLevel', 'discussionThreadId', 'audience', 'author', 'body',
    'publicVersion', 'createdAt', 'publishedAt', 'updatedAt',
  ], `wikiPages[${index}]`);
  const id = uuid(raw.id, `wikiPages[${index}].id`);
  const publishedRevisionId = uuid(raw.publishedRevisionId, `wikiPages[${index}].publishedRevisionId`);
  const inputSnapshot = {
    schemaVersion: 1,
    title: raw.title,
    slug: raw.slug,
    aliases: raw.aliases,
    type: raw.type,
    summary: raw.summary,
    categories: raw.categories,
    accessLevel: raw.accessLevel,
    audience: raw.audience,
    body: raw.body,
  };
  let snapshot;
  try {
    snapshot = validateWikiSnapshot(inputSnapshot);
  } catch {
    throw publicError(`The capture wiki page ${index} does not satisfy the current wiki snapshot contract.`);
  }
  if (canonicalJson(snapshot) !== canonicalJson(inputSnapshot)) {
    report.normalizations.push({ kind: 'wiki_snapshot_normalized', pageId: id });
  }
  if (raw.accessLevel !== 'public' || snapshot.accessLevel !== 'public') {
    throw publicError('The capture contains a non-public wiki page; only public captures may be imported.');
  }
  const publicVersion = integer(raw.publicVersion, `wikiPages[${index}].publicVersion`, { min: 1, max: 2_147_483_647 });
  const createdAt = timestamp(raw.createdAt, `wikiPages[${index}].createdAt`);
  const publishedAt = timestamp(raw.publishedAt, `wikiPages[${index}].publishedAt`);
  const updatedAt = timestamp(raw.updatedAt, `wikiPages[${index}].updatedAt`);
  let categories;
  let links;
  try {
    categories = snapshot.categories.map((category) => ({
      revision_id: publishedRevisionId,
      category,
      category_key: normalizeSlug(category, 'category'),
    }));
    links = extractWikiLinks(snapshot).map((link) => ({
      revision_id: publishedRevisionId,
      target_name_key: link.targetNameKey,
      target_anchor: link.targetAnchor,
    }));
  } catch {
    throw publicError(`The capture wiki page ${index} has invalid category or link metadata.`);
  }
  const publicAuthor = authorRecord(raw.author, `wikiPages[${index}].author`);
  const authorNote = publicAuthor ? ` Atribuição pública original: ${publicAuthor.username}.` : '';
  const editSummary = `Reconstrução local a partir de captura pública ${capture.manifest.captureId}; sem citações ou histórico originais.${authorNote}`.slice(0, 1000);
  return {
    page: {
      id,
      head_revision_id: publishedRevisionId,
      published_revision_id: publishedRevisionId,
      work_version: 1,
      public_version: publicVersion,
      access_level: 'public',
      archived_at: null,
      discussion_thread_id: nullableUuid(raw.discussionThreadId, `wikiPages[${index}].discussionThreadId`),
      created_by: reconstructionActorId,
      published_at: publishedAt,
      created_at: createdAt,
      updated_at: updatedAt,
    },
    revision: {
      id: publishedRevisionId,
      page_id: id,
      sequence: 1,
      parent_revision_id: null,
      base_published_revision_id: null,
      actor_id: reconstructionActorId,
      edit_summary: editSummary,
      snapshot,
      restores_id: null,
      accepted_proposal_id: null,
      created_at: publishedAt || updatedAt,
    },
    names: [snapshot.slug, ...snapshot.aliases].map((nameKey) => ({
      name_key: nameKey,
      page_id: id,
      kind: nameKey === snapshot.slug ? 'canonical' : 'alias',
      created_at: createdAt,
    })),
    categories,
    links,
    searchText: snapshotSearchText(snapshot),
    publicAuthor,
  };
}

function validateWikiSection(raw, index) {
  assertPlainObject(raw, `wikiSections[${index}]`);
  assertExactKeys(raw, ['key', 'name', 'description', 'parentKey', 'order', 'pagesCount'], `wikiSections[${index}]`);
  const key = text(raw.key, `wikiSections[${index}].key`, { min: 1, max: 100 });
  if (!NAME_KEY_RE.test(key)) throw publicError(`The capture wiki section ${index} key is invalid.`);
  return {
    key,
    name: text(raw.name, `wikiSections[${index}].name`, { min: 1, max: 1_000 }),
    description: optionalText(raw.description, `wikiSections[${index}].description`, { min: 0, max: 10_000 }),
    parent_key: raw.parentKey === null || raw.parentKey === undefined
      ? null
      : text(raw.parentKey, `wikiSections[${index}].parentKey`, { min: 1, max: 100 }),
    sort_order: integer(raw.order, `wikiSections[${index}].order`, { min: 0, max: 2_147_483_647 }),
  };
}

function validateWikiCategory(raw, index) {
  assertPlainObject(raw, `wikiCategories[${index}]`);
  assertExactKeys(raw, ['name', 'key', 'pagesCount'], `wikiCategories[${index}]`);
  return {
    name: text(raw.name, `wikiCategories[${index}].name`, { min: 1, max: 100 }),
    key: text(raw.key, `wikiCategories[${index}].key`, { min: 1, max: 100 }),
    pagesCount: integer(raw.pagesCount, `wikiCategories[${index}].pagesCount`, { min: 0 }),
  };
}

function validateForumCategory(raw, index) {
  assertPlainObject(raw, `forum.categories[${index}]`);
  assertAllowedKeys(raw, [
    'id', 'name', 'description', 'archivedAt', 'version', 'createdAt', 'updatedAt',
    'topicsCount', 'postsCount',
  ], `forum.categories[${index}]`);
  return {
    id: uuid(raw.id, `forum.categories[${index}].id`),
    name: text(raw.name, `forum.categories[${index}].name`, { min: 1, max: 100 }),
    description: optionalText(raw.description, `forum.categories[${index}].description`, { min: 0, max: 1_000 }),
    archived_at: nullableTimestamp(raw.archivedAt, `forum.categories[${index}].archivedAt`),
    version: integer(raw.version === undefined ? 1 : raw.version, `forum.categories[${index}].version`, { min: 1, max: 2_147_483_647 }),
    created_at: timestamp(raw.createdAt, `forum.categories[${index}].createdAt`),
    updated_at: timestamp(raw.updatedAt, `forum.categories[${index}].updatedAt`),
  };
}

function validateThread(raw, index) {
  assertPlainObject(raw, `forum.threads[${index}]`);
  assertAllowedKeys(raw, [
    'id', 'categoryId', 'categoryName', 'title', 'tag', 'pinned', 'locked', 'archivedAt',
    'version', 'lastActivityAt', 'createdAt', 'updatedAt', 'postsCount', 'author',
    'authorId', 'authorLabel',
  ], `forum.threads[${index}]`);
  return {
    id: uuid(raw.id, `forum.threads[${index}].id`),
    category_id: uuid(raw.categoryId, `forum.threads[${index}].categoryId`),
    author_id: nullableUuid(raw.authorId || raw.author?.id, `forum.threads[${index}].authorId`),
    author_label: optionalText(raw.authorLabel, `forum.threads[${index}].authorLabel`, { min: 0, max: 500 }) || null,
    title: text(raw.title, `forum.threads[${index}].title`, { min: 1, max: 200 }),
    tag: optionalText(raw.tag, `forum.threads[${index}].tag`, { min: 0, max: 20 }),
    pinned: raw.pinned === true,
    locked: raw.locked === true,
    archived_at: nullableTimestamp(raw.archivedAt, `forum.threads[${index}].archivedAt`),
    version: integer(raw.version === undefined ? 1 : raw.version, `forum.threads[${index}].version`, { min: 1, max: 2_147_483_647 }),
    last_activity_at: timestamp(raw.lastActivityAt, `forum.threads[${index}].lastActivityAt`),
    created_at: timestamp(raw.createdAt, `forum.threads[${index}].createdAt`),
    updated_at: timestamp(raw.updatedAt, `forum.threads[${index}].updatedAt`),
  };
}

function validatePost(raw, threadId, index, report) {
  assertPlainObject(raw, `forum posts[${index}]`);
  assertAllowedKeys(raw, [
    'id', 'threadId', 'postNo', 'version', 'edited', 'deleted', 'deletedAt', 'createdAt',
    'updatedAt', 'content', 'author', 'authorId', 'authorLabel',
  ], `forum posts[${index}]`);
  let deletedAt = nullableTimestamp(raw.deletedAt, `forum posts[${index}].deletedAt`);
  const deleted = raw.deleted === true || deletedAt !== null;
  if (deleted && !deletedAt) {
    deletedAt = timestamp(raw.updatedAt, `forum posts[${index}].updatedAt`);
    report.normalizations.push({ kind: 'deleted_post_tombstone_time_inferred' });
  }
  let content = '';
  if (!deleted) content = safeHtmlContent(raw.content, `forum posts[${index}].content`, { normalizations: [] });
  else if (raw.content !== undefined && raw.content !== '') {
    content = safeHtmlContent(raw.content, `forum posts[${index}].content`, { normalizations: [] });
  }
  return {
    id: uuid(raw.id, `forum posts[${index}].id`),
    thread_id: uuid(raw.threadId || threadId, `forum posts[${index}].threadId`),
    author_id: nullableUuid(raw.authorId || raw.author?.id, `forum posts[${index}].authorId`),
    author_label: optionalText(raw.authorLabel, `forum posts[${index}].authorLabel`, { min: 0, max: 500 }) || null,
    content,
    edited: raw.edited === true,
    post_no: integer(raw.postNo, `forum posts[${index}].postNo`, { min: 1, max: 2_147_483_646 }),
    deleted_at: deletedAt,
    version: integer(raw.version === undefined ? 1 : raw.version, `forum posts[${index}].version`, { min: 1, max: 2_147_483_647 }),
    created_at: timestamp(raw.createdAt, `forum posts[${index}].createdAt`),
    updated_at: timestamp(raw.updatedAt, `forum posts[${index}].updatedAt`),
  };
}

function buildForumPlan(capture, authors, report) {
  const categories = capture.dataset.forum.categories.map(validateForumCategory);
  const categoryIds = new Set(categories.map((category) => category.id));
  if (categoryIds.size !== categories.length) {
    throw publicError('The capture contains duplicate forum categories.');
  }
  const threads = capture.dataset.forum.threads.map(validateThread);
  const threadIds = new Set(threads.map((thread) => thread.id));
  if (threadIds.size !== threads.length) {
    throw publicError('The capture contains duplicate forum threads.');
  }
  for (const thread of threads) {
    if (!categoryIds.has(thread.category_id)) {
      throw publicError('A captured forum thread references a category missing from the dataset.');
    }
    if (thread.author_id && !authors.has(thread.author_id)) {
      throw publicError('A captured forum thread references an author that cannot be resolved.');
    }
    if (!thread.author_id && !thread.author_label) {
      throw publicError('A captured forum thread has no author attribution or label.');
    }
  }
  const posts = [];
  const postIds = new Set();
  for (const thread of threads) {
    const threadPosts = capture.dataset.forum.postsByThread[thread.id] || [];
    if (!Array.isArray(threadPosts)) throw publicError('A captured forum post collection is invalid.');
    const seenPostNumbers = new Set();
    for (let index = 0; index < threadPosts.length; index += 1) {
      const post = validatePost(threadPosts[index], thread.id, index, report);
      if (post.thread_id !== thread.id) throw publicError('A captured forum post references a different thread.');
      if (post.author_id && !authors.has(post.author_id)) {
        throw publicError('A captured forum post references an author that cannot be resolved.');
      }
      if (!post.author_id && !post.author_label) {
        throw publicError('A captured forum post has no author attribution or label.');
      }
      if (seenPostNumbers.has(post.post_no)) throw publicError('A captured forum thread has duplicate post numbers.');
      seenPostNumbers.add(post.post_no);
      if (postIds.has(post.id)) throw publicError('The capture contains duplicate forum posts.');
      postIds.add(post.id);
      posts.push(post);
    }
  }
  for (const key of Object.keys(capture.dataset.forum.postsByThread)) {
    if (!threadIds.has(key)) throw publicError('The capture contains posts for a thread missing from its inventory.');
  }
  const nextPostByThread = new Map();
  for (const thread of threads) {
    const threadPosts = posts.filter((post) => post.thread_id === thread.id);
    const maximum = threadPosts.reduce((value, post) => Math.max(value, post.post_no), 1);
    nextPostByThread.set(thread.id, maximum + 1);
  }
  return {
    categories,
    threads: threads.map((thread) => ({
      ...thread,
      views: 0,
      next_post_no: nextPostByThread.get(thread.id),
      quarantined_at: null,
      quarantine_reason: null,
      legacy_reference: null,
    })),
    posts: posts.map((post) => ({ ...post, legacy_reference: null })),
  };
}

function buildImportPlan({ capture, testerPasswords = null, passwordHasher = (value) => bcrypt.hashSync(value, 10) } = {}) {
  if (!capture || !capture.dataset || !capture.manifest) throw new TypeError('buildImportPlan requires a verified capture.');
  const report = { origin: capture.origin, normalizations: [] };
  const authors = buildAuthorIndex(capture, report);
  const users = [];
  for (const author of authors.values()) users.push(userRowFromAuthor(author, capture));
  if (users.some((user) => user.username.toLowerCase() === RECONSTRUCTION_USERNAME)) {
    throw publicError('A public author username conflicts with the local reconstruction actor.');
  }
  users.push(reconstructionUserRow(capture));
  for (const spec of TESTER_SPECS) {
    if (users.some((user) => user.username.toLowerCase() === spec.username)) {
      throw publicError('A public author username conflicts with a synthetic sandbox tester account.');
    }
    const password = testerPasswords ? testerPasswords[spec.key] : null;
    if (password !== null && password !== undefined
        && (typeof password !== 'string' || password.length < 20 || password.length > 200)) {
      throw publicError('A generated synthetic tester password is invalid.');
    }
    let passwordHash = null;
    if (password) {
      try {
        passwordHash = passwordHasher(password);
      } catch {
        throw publicError('The synthetic tester password could not be hashed.');
      }
      if (typeof passwordHash !== 'string' || !passwordHash) {
        throw publicError('The synthetic tester password hash is invalid.');
      }
    }
    users.push(testerUserRow(spec, capture, passwordHash));
  }

  const characters = capture.dataset.characters.map((record, index) => (
    characterPlan(record, index, authors, capture, report)
  ));
  const scenes = capture.dataset.scenes.map((record, index) => (
    scenePlan(record, index, authors, capture, report)
  ));
  const turnRowIds = new Set();
  for (const scene of scenes) {
    for (const turn of scene.turns) {
      if (turnRowIds.has(turn.id)) {
        throw publicError('The capture contains scene turns with colliding local identifiers.');
      }
      turnRowIds.add(turn.id);
    }
  }
  const validatedSections = capture.dataset.wikiSections.map(validateWikiSection);
  const sectionKeys = new Set(validatedSections.map((section) => section.key));
  if (sectionKeys.size !== validatedSections.length) {
    throw publicError('The capture contains duplicate wiki sections.');
  }
  for (const section of validatedSections) {
    if (section.parent_key && !sectionKeys.has(section.parent_key)) {
      throw publicError('A captured wiki section references a parent missing from the dataset.');
    }
  }
  const pendingSections = validatedSections.slice();
  const sections = [];
  while (pendingSections.length) {
    const index = pendingSections.findIndex((section) => (
      !section.parent_key || sections.some((inserted) => inserted.key === section.parent_key)
    ));
    if (index < 0) throw publicError('The captured wiki sections contain a parent cycle.');
    sections.push(pendingSections.splice(index, 1)[0]);
  }
  const categories = capture.dataset.wikiCategories.map(validateWikiCategory);
  const categoryKeys = new Set(categories.map((category) => category.key));
  if (categoryKeys.size !== categories.length) {
    throw publicError('The capture contains duplicate wiki categories.');
  }
  const wikiPages = capture.dataset.wikiPages.map((record, index) => (
    wikiPagePlan(record, index, capture, report, RECONSTRUCTION_ID)
  ));
  if (!categories.length && wikiPages.some((page) => page.categories.length)) {
    throw publicError('The capture includes wiki categories on pages but no wiki category inventory.');
  }
  const threadIds = new Set(capture.dataset.forum.threads.map((thread) => thread.id));
  for (const page of wikiPages) {
    if (page.page.discussion_thread_id && !threadIds.has(page.page.discussion_thread_id)) {
      throw publicError('A captured wiki page references a discussion thread missing from the dataset.');
    }
    for (const category of page.categories) {
      if (categories.length && !categoryKeys.has(category.category_key)) {
        throw publicError('A captured wiki page uses a category missing from the wiki category inventory.');
      }
    }
  }
  const forum = buildForumPlan(capture, authors, report);

  const nameOwners = new Map();
  for (const page of wikiPages) {
    for (const name of page.names) {
      if (nameOwners.has(name.name_key) && nameOwners.get(name.name_key) !== page.page.id) {
        throw publicError('The capture assigns one wiki name to multiple pages.');
      }
      nameOwners.set(name.name_key, page.page.id);
    }
  }
  const localGaps = [];
  for (const page of wikiPages) {
    for (const link of page.links) {
      if (!nameOwners.has(link.target_name_key)) {
        localGaps.push({
          family: 'wiki-links',
          endpoint: link.target_name_key,
          status: 0,
          reason: 'target wiki name is not present in the capture',
        });
      }
    }
  }

  const localStateOnly = report.normalizations.filter((item) => (
    item.kind === 'missing_author_fallback'
      || item.kind === 'public_author_role_not_imported'
      || item.kind === 'turn_author_role_not_imported'
  )).length;
  if (localStateOnly) {
    report.normalizations.push({ kind: 'local_identity_substitutions', count: localStateOnly });
  }

  return {
    capture: {
      captureId: capture.manifest.captureId,
      origin: capture.origin,
      capturedAt: capture.capturedAt,
      datasetSha256: capture.datasetSha256,
      complete: capture.manifest.consistency.complete && localGaps.length === 0,
      gaps: [...capture.manifest.gaps, ...localGaps],
      requestFiles: capture.requestFiles,
    },
    users,
    characters,
    scenes,
    sections,
    categories,
    wikiPages,
    forum,
    testers: TESTER_SPECS.map((spec) => ({
      key: spec.key,
      username: spec.username,
      role: spec.role,
      isStaff: spec.isStaff,
      id: deterministicUuid('eterverso-public-sandbox-testers', spec.key),
    })),
    reconstructionActorId: RECONSTRUCTION_ID,
    normalizations: report.normalizations,
    counts: {
      users: users.length,
      publicAuthorPlaceholders: [...authors.values()].filter((author) => !author.fallback).length,
      missingAuthorFallbacks: [...authors.values()].filter((author) => author.fallback).length,
      characters: characters.length,
      scenes: scenes.length,
      sceneTurns: scenes.reduce((total, scene) => total + scene.turnCount, 0),
      wikiPages: wikiPages.length,
      wikiSections: sections.length,
      wikiCategories: categories.length,
      forumCategories: forum.categories.length,
      forumThreads: forum.threads.length,
      forumPosts: forum.posts.length,
      citations: 0,
    },
    gaps: [...capture.manifest.gaps, ...localGaps].map((gap) => ({
      family: gap.family,
      endpoint: gap.endpoint,
      status: gap.status,
      reason: gap.reason,
    })),
  };
}

function sameTimestamp(left, right) {
  const leftTime = new Date(left).getTime();
  const rightTime = new Date(right).getTime();
  if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) return String(left) === String(right);
  return leftTime === rightTime;
}

function sameValue(left, right) {
  if (right === null || right === undefined) return left === null || left === undefined;
  if (typeof right === 'boolean') return Boolean(left) === right;
  if (typeof right === 'number') return Number(left) === right;
  if (right instanceof Date) return sameTimestamp(left, right);
  if (typeof right === 'string') {
    if (/^\d{4}-\d{2}-\d{2}(?:[T ].*)?$/u.test(right) && !Number.isNaN(new Date(right).getTime())) {
      return sameTimestamp(left, right);
    }
    return String(left) === right;
  }
  if (typeof right === 'object') return canonicalJson(left) === canonicalJson(right);
  return left === right;
}

function assertRowMatches(label, actual, expected, fields) {
  for (const field of fields) {
    if (!sameValue(actual[field], expected[field])) {
      throw publicError(`The sandbox already contains different local content for ${label} (${field}); refusing to overwrite it.`);
    }
  }
}

function createStats() {
  return { inserted: 0, unchanged: 0, byType: {} };
}

function record(stats, type, outcome) {
  stats.byType[type] ||= { inserted: 0, unchanged: 0 };
  stats.byType[type][outcome] += 1;
  stats[outcome] += 1;
}

async function ensureRow(repository, stats, type, { get, insert, expected, compare }) {
  const existing = await get();
  if (!existing) {
    await insert(expected);
    record(stats, type, 'inserted');
    return 'inserted';
  }
  assertRowMatches(type, existing, expected, compare);
  record(stats, type, 'unchanged');
  return 'unchanged';
}

async function applyPlanWithRepository(plan, repository) {
  if (!plan || !repository) throw new TypeError('applyPlanWithRepository requires a plan and repository.');
  const stats = createStats();
  for (const user of plan.users) {
    const existing = await repository.getUser(user.id);
    if (existing) {
      const byName = await repository.getUserByUsername(user.username);
      if (byName && byName.id !== user.id) {
        throw publicError('A synthetic or placeholder username is already used by another account.');
      }
      assertRowMatches('user', existing, user, USER_COMPARE);
      if (user.kind === 'synthetic-tester') {
        if (typeof existing.password_hash !== 'string' || !existing.password_hash) {
          throw publicError('An existing synthetic tester has no usable password hash; refusing to replace it.');
        }
      } else if (existing.password_hash !== '') {
        throw publicError('A public author placeholder unexpectedly has login credentials; refusing to modify it.');
      }
      record(stats, 'user', 'unchanged');
    } else {
      if (user.kind === 'synthetic-tester' && !user.password_hash) {
        throw publicError('Synthetic tester credentials are required before creating the local testers.');
      }
      const byName = await repository.getUserByUsername(user.username);
      if (byName) throw publicError('A synthetic or placeholder username is already used by another account.');
      await repository.insertUser(user);
      record(stats, 'user', 'inserted');
    }
  }

  for (const character of plan.characters) {
    await ensureRow(repository, stats, 'character', {
      get: () => repository.getCharacter(character.id),
      insert: (row) => repository.insertCharacter(row),
      expected: character,
      compare: CHARACTER_COMPARE,
    });
  }

  for (const category of plan.forum.categories) {
    await ensureRow(repository, stats, 'forum-category', {
      get: () => repository.getForumCategory(category.id),
      insert: (row) => repository.insertForumCategory(row),
      expected: category,
      compare: FORUM_CATEGORY_COMPARE,
    });
  }
  for (const thread of plan.forum.threads) {
    await ensureRow(repository, stats, 'forum-thread', {
      get: () => repository.getThread(thread.id),
      insert: (row) => repository.insertThread(row),
      expected: thread,
      compare: THREAD_COMPARE,
    });
  }
  for (const post of plan.forum.posts) {
    await ensureRow(repository, stats, 'forum-post', {
      get: () => repository.getPost(post.id),
      insert: (row) => repository.insertPost(row),
      expected: post,
      compare: POST_COMPARE,
    });
  }

  for (const section of plan.sections) {
    await ensureRow(repository, stats, 'wiki-section', {
      get: () => repository.getWikiSection(section.key),
      insert: (row) => repository.insertWikiSection(row),
      expected: section,
      compare: SECTION_COMPARE,
    });
  }

  for (const wikiPage of plan.wikiPages) {
    const existing = await repository.getWikiPage(wikiPage.page.id);
    if (existing) {
      assertRowMatches('wiki page', existing, wikiPage.page, PAGE_COMPARE);
      record(stats, 'wiki-page', 'unchanged');
    } else {
      await repository.insertWikiPage({ ...wikiPage.page, head_revision_id: null, published_revision_id: null });
      record(stats, 'wiki-page', 'inserted');
    }
    await ensureRow(repository, stats, 'wiki-revision', {
      get: () => repository.getWikiRevision(wikiPage.revision.id),
      insert: (row) => repository.insertWikiRevision(row),
      expected: wikiPage.revision,
      compare: REVISION_COMPARE,
    });
    if (!existing) await repository.updateWikiPageRevisionPointers(wikiPage.page.id, wikiPage.revision.id);
    for (const name of wikiPage.names) {
      await ensureRow(repository, stats, 'wiki-name', {
        get: () => repository.getWikiName(name.name_key),
        insert: (row) => repository.insertWikiName(row),
        expected: name,
        compare: NAME_COMPARE,
      });
    }
    for (const category of wikiPage.categories) {
      await ensureRow(repository, stats, 'wiki-revision-category', {
        get: () => repository.getWikiRevisionCategory(category.revision_id, category.category_key),
        insert: (row) => repository.insertWikiRevisionCategory(row),
        expected: category,
        compare: REVISION_CATEGORY_COMPARE,
      });
    }
    for (const link of wikiPage.links) {
      await ensureRow(repository, stats, 'wiki-revision-link', {
        get: () => repository.getWikiRevisionLink(link.revision_id, link.target_name_key, link.target_anchor),
        insert: (row) => repository.insertWikiRevisionLink(row),
        expected: link,
        compare: REVISION_LINK_COMPARE,
      });
    }
  }

  for (const scene of plan.scenes) {
    const sceneExisted = !!(await repository.getScene(scene.row.id));
    await ensureRow(repository, stats, 'scene', {
      get: () => repository.getScene(scene.row.id),
      insert: (row) => repository.insertScene(row),
      expected: scene.row,
      compare: SCENE_COMPARE,
    });
    const existingTurns = await repository.getSceneTurns(scene.row.id);
    if (sceneExisted && existingTurns.length !== scene.turns.length) {
      throw publicError('The sandbox scene has a different local turn count; refusing to overwrite it.');
    }
    const turnsByOrdinal = new Map(existingTurns.map((turn) => [Number(turn.ordinal), turn]));
    for (const turn of scene.turns) {
      const existing = turnsByOrdinal.get(turn.ordinal);
      if (!existing) {
        await repository.insertSceneTurn(turn);
        record(stats, 'scene-turn', 'inserted');
        continue;
      }
      assertRowMatches('scene turn', existing, turn, TURN_COMPARE);
      record(stats, 'scene-turn', 'unchanged');
    }
    await ensureRow(repository, stats, 'scene-turn-backup', {
      get: () => repository.getSceneTurnBackup(scene.row.id),
      insert: (row) => repository.insertSceneTurnBackup(row),
      expected: {
        scene_id: scene.row.id,
        turns: scene.legacyTurns,
        legacy_sha256: scene.legacySha256,
        created_at: scene.row.updated_at,
      },
      compare: ['turns', 'legacy_sha256'],
    });
    await ensureRow(repository, stats, 'scene-turn-marker', {
      get: () => repository.getSceneTurnMarker(scene.row.id),
      insert: (row) => repository.insertSceneTurnMarker(row),
      expected: {
        scene_id: scene.row.id,
        turn_count: scene.turnCount,
        legacy_sha256: scene.legacySha256,
        completed_at: scene.row.updated_at,
      },
      compare: ['turn_count', 'legacy_sha256'],
    });
  }

  return {
    ...stats,
    noop: stats.inserted === 0,
    plan: {
      captureId: plan.capture.captureId,
      counts: plan.counts,
    },
  };
}

async function applyImportPlan({ plan, sql, verifyIdentity } = {}) {
  if (!plan || !sql || typeof sql.begin !== 'function') {
    throw new TypeError('applyImportPlan requires a plan and a postgres client with transaction support.');
  }
  return sql.begin(async (tx) => {
    if (verifyIdentity) await verifyIdentity(tx);
    const repository = createPostgresRepository(tx);
    return applyPlanWithRepository(plan, repository);
  });
}

function createPostgresRepository(tx) {
  if (typeof tx !== 'function') throw new TypeError('A transaction SQL client is required.');
  return {
    getUser: async (id) => (await tx`SELECT * FROM users WHERE id = ${id}`)[0] || null,
    getUserByUsername: async (username) => (await tx`SELECT * FROM users WHERE lower(username) = lower(${username})`)[0] || null,
    insertUser: async (row) => {
      await tx`
        INSERT INTO users (
          id, email, username, password_hash, avatar, title, bio, posts_count,
          adm_tentativa_usada, role, is_staff, disabled_at, auth_version, version,
          join_date, created_at, updated_at
        ) VALUES (
          ${row.id}, ${row.email}, ${row.username}, ${row.password_hash}, ${row.avatar},
          ${row.title}, ${row.bio}, ${row.posts_count}, ${row.adm_tentativa_usada},
          ${row.role}, ${row.is_staff}, ${row.disabled_at}, ${row.auth_version},
          ${row.version}, ${row.join_date}, ${row.created_at}, ${row.updated_at}
        )`;
    },
    getCharacter: async (id) => (await tx`SELECT * FROM personagens WHERE id = ${id}`)[0] || null,
    insertCharacter: async (row) => {
      await tx`
        INSERT INTO personagens (
          id, author_id, hidden_at, version, nome, categoria, titulo, raca, faccao,
          status, imagem, descricao, stats, skills, mascara_tier, blocks, theme,
          created_at, updated_at
        ) VALUES (
          ${row.id}, ${row.author_id}, ${row.hidden_at}, ${row.version}, ${row.nome},
          ${row.categoria}, ${row.titulo}, ${row.raca}, ${row.faccao}, ${row.status},
          ${row.imagem}, ${row.descricao}, ${tx.json(row.stats)}, ${tx.json(row.skills)},
          ${row.mascara_tier}, ${tx.json(row.blocks)}, ${tx.json(row.theme)},
          ${row.created_at}, ${row.updated_at}
        )`;
    },
    getScene: async (id) => (await tx`SELECT * FROM wiki_posts WHERE id = ${id}`)[0] || null,
    insertScene: async (row) => {
      await tx`
        INSERT INTO wiki_posts (
          id, author_id, hidden_at, version, titulo, subtitulo, categoria, status,
          resumo, banner, descricao, theme, infobox, blocks, turns, created_at, updated_at
        ) VALUES (
          ${row.id}, ${row.author_id}, ${row.hidden_at}, ${row.version}, ${row.titulo},
          ${row.subtitulo}, ${row.categoria}, ${row.status}, ${row.resumo}, ${row.banner},
          ${row.descricao}, ${tx.json(row.theme)}, ${tx.json(row.infobox)},
          ${tx.json(row.blocks)}, ${tx.json(row.turns)}, ${row.created_at}, ${row.updated_at}
        )`;
    },
    getSceneTurns: async (sceneId) => tx`SELECT * FROM scene_turns WHERE scene_id = ${sceneId} ORDER BY ordinal`,
    insertSceneTurn: async (row) => {
      await tx`
        INSERT INTO scene_turns (
          id, scene_id, author_id, legacy_author_label, legacy_id, ordinal, content,
          presentation, version, deleted_at, created_at, updated_at
        ) VALUES (
          ${row.id}, ${row.scene_id}, ${row.author_id}, ${row.legacy_author_label},
          ${row.legacy_id}, ${row.ordinal}, ${row.content}, ${tx.json(row.presentation)},
          ${row.version}, ${row.deleted_at}, ${row.created_at}, ${row.updated_at}
        )`;
    },
    getSceneTurnBackup: async (sceneId) => (await tx`SELECT * FROM scene_turn_legacy_backups WHERE scene_id = ${sceneId}`)[0] || null,
    insertSceneTurnBackup: async (row) => {
      await tx`
        INSERT INTO scene_turn_legacy_backups (scene_id, turns, legacy_sha256, created_at)
        VALUES (${row.scene_id}, ${tx.json(row.turns)}, ${row.legacy_sha256}, ${row.created_at})`;
    },
    getSceneTurnMarker: async (sceneId) => (await tx`SELECT * FROM scene_turn_migrations WHERE scene_id = ${sceneId}`)[0] || null,
    insertSceneTurnMarker: async (row) => {
      await tx`
        INSERT INTO scene_turn_migrations (scene_id, turn_count, legacy_sha256, completed_at)
        VALUES (${row.scene_id}, ${row.turn_count}, ${row.legacy_sha256}, ${row.completed_at})`;
    },
    getWikiSection: async (key) => (await tx`SELECT * FROM wiki_sections WHERE key = ${key}`)[0] || null,
    insertWikiSection: async (row) => {
      await tx`
        INSERT INTO wiki_sections (key, name, description, parent_key, sort_order)
        VALUES (${row.key}, ${row.name}, ${row.description}, ${row.parent_key}, ${row.sort_order})`;
    },
    getWikiPage: async (id) => (await tx`SELECT * FROM wiki_pages WHERE id = ${id}`)[0] || null,
    insertWikiPage: async (row) => {
      await tx`
        INSERT INTO wiki_pages (
          id, head_revision_id, published_revision_id, work_version, public_version,
          access_level, archived_at, discussion_thread_id, created_by, published_at,
          created_at, updated_at
        ) VALUES (
          ${row.id}, ${row.head_revision_id}, ${row.published_revision_id}, ${row.work_version},
          ${row.public_version}, ${row.access_level}, ${row.archived_at},
          ${row.discussion_thread_id}, ${row.created_by}, ${row.published_at},
          ${row.created_at}, ${row.updated_at}
        )`;
    },
    updateWikiPageRevisionPointers: async (pageId, revisionId) => {
      await tx`UPDATE wiki_pages
        SET head_revision_id = ${revisionId}, published_revision_id = ${revisionId}
        WHERE id = ${pageId}`;
    },
    getWikiRevision: async (id) => (await tx`SELECT * FROM wiki_revisions WHERE id = ${id}`)[0] || null,
    insertWikiRevision: async (row) => {
      await tx`
        INSERT INTO wiki_revisions (
          id, page_id, sequence, parent_revision_id, base_published_revision_id,
          actor_id, edit_summary, snapshot, restores_id, accepted_proposal_id, created_at
        ) VALUES (
          ${row.id}, ${row.page_id}, ${row.sequence}, ${row.parent_revision_id},
          ${row.base_published_revision_id}, ${row.actor_id}, ${row.edit_summary},
          ${tx.json(row.snapshot)}, ${row.restores_id}, ${row.accepted_proposal_id},
          ${row.created_at}
        )`;
    },
    getWikiName: async (nameKey) => (await tx`SELECT * FROM wiki_names WHERE name_key = ${nameKey}`)[0] || null,
    insertWikiName: async (row) => {
      await tx`
        INSERT INTO wiki_names (name_key, page_id, kind, created_at)
        VALUES (${row.name_key}, ${row.page_id}, ${row.kind}, ${row.created_at})`;
    },
    getWikiRevisionCategory: async (revisionId, categoryKey) => (
      await tx`SELECT * FROM wiki_revision_categories
        WHERE revision_id = ${revisionId} AND category_key = ${categoryKey}`)[0] || null,
    insertWikiRevisionCategory: async (row) => {
      await tx`
        INSERT INTO wiki_revision_categories (revision_id, category, category_key)
        VALUES (${row.revision_id}, ${row.category}, ${row.category_key})`;
    },
    getWikiRevisionLink: async (revisionId, targetNameKey, targetAnchor) => (
      await tx`SELECT * FROM wiki_revision_links
        WHERE revision_id = ${revisionId} AND target_name_key = ${targetNameKey}
          AND target_anchor = ${targetAnchor}`)[0] || null,
    insertWikiRevisionLink: async (row) => {
      await tx`
        INSERT INTO wiki_revision_links (revision_id, target_name_key, target_anchor)
        VALUES (${row.revision_id}, ${row.target_name_key}, ${row.target_anchor})`;
    },
    getForumCategory: async (id) => (await tx`SELECT * FROM categories WHERE id = ${id}`)[0] || null,
    insertForumCategory: async (row) => {
      await tx`
        INSERT INTO categories (id, name, description, archived_at, version, created_at, updated_at)
        VALUES (${row.id}, ${row.name}, ${row.description}, ${row.archived_at}, ${row.version},
          ${row.created_at}, ${row.updated_at})`;
    },
    getThread: async (id) => (await tx`SELECT * FROM threads WHERE id = ${id}`)[0] || null,
    insertThread: async (row) => {
      await tx`
        INSERT INTO threads (
          id, category_id, author_id, author_label, legacy_reference, title, tag, pinned,
          views, locked, archived_at, quarantined_at, quarantine_reason, version,
          last_activity_at, next_post_no, created_at, updated_at
        ) VALUES (
          ${row.id}, ${row.category_id}, ${row.author_id}, ${row.author_label},
          ${row.legacy_reference}, ${row.title}, ${row.tag}, ${row.pinned}, ${row.views},
          ${row.locked}, ${row.archived_at}, ${row.quarantined_at},
          ${row.quarantine_reason}, ${row.version}, ${row.last_activity_at},
          ${row.next_post_no}, ${row.created_at}, ${row.updated_at}
        )`;
    },
    getPost: async (id) => (await tx`SELECT * FROM posts WHERE id = ${id}`)[0] || null,
    insertPost: async (row) => {
      await tx`
        INSERT INTO posts (
          id, thread_id, author_id, author_label, legacy_reference, content, edited,
          post_no, deleted_at, version, created_at, updated_at
        ) VALUES (
          ${row.id}, ${row.thread_id}, ${row.author_id}, ${row.author_label},
          ${row.legacy_reference}, ${row.content}, ${row.edited}, ${row.post_no},
          ${row.deleted_at}, ${row.version}, ${row.created_at}, ${row.updated_at}
        )`;
    },
  };
}

function inspectExistingTesters(sql, plan) {
  if (!sql || typeof sql !== 'function') throw new TypeError('A postgres client is required.');
  const ids = plan.testers.map((tester) => tester.id);
  const usernames = plan.testers.map((tester) => tester.username);
  return sql`
    SELECT id, username FROM users
    WHERE id = ANY(${sql.array(ids, 2950)})
       OR lower(username) = ANY(${sql.array(usernames, 25)})`;
}

function parseTesterCredentials(contents) {
  const parsed = {};
  for (const line of String(contents).split(/\r?\n/u)) {
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) throw publicError('The private tester credential file is invalid.');
    const key = line.slice(0, separator);
    const value = line.slice(separator + 1);
    if (Object.hasOwn(parsed, key)) throw publicError('The private tester credential file contains duplicate keys.');
    parsed[key] = value;
  }
  const passwords = {};
  for (const spec of TESTER_SPECS) {
    const prefix = `SANDBOX_${spec.key.toUpperCase()}`;
    if (parsed[`${prefix}_USERNAME`] !== spec.username
        || typeof parsed[`${prefix}_PASSWORD`] !== 'string'
        || parsed[`${prefix}_PASSWORD`].length < 20
        || parsed[`${prefix}_PASSWORD`].length > 200) {
      throw publicError('The private tester credential file does not describe the expected synthetic accounts.');
    }
    passwords[spec.key] = parsed[`${prefix}_PASSWORD`];
  }
  const expectedKeys = TESTER_SPECS.flatMap((spec) => [
    `SANDBOX_${spec.key.toUpperCase()}_USERNAME`,
    `SANDBOX_${spec.key.toUpperCase()}_PASSWORD`,
  ]).sort();
  if (JSON.stringify(Object.keys(parsed).sort()) !== JSON.stringify(expectedKeys)) {
    throw publicError('The private tester credential file has an unsupported format.');
  }
  return passwords;
}

function testerCredentialsContents(passwords) {
  return `${TESTER_SPECS.map((spec) => {
    const prefix = `SANDBOX_${spec.key.toUpperCase()}`;
    return `${prefix}_USERNAME=${spec.username}\n${prefix}_PASSWORD=${passwords[spec.key]}`;
  }).join('\n')}\n`;
}

module.exports = {
  CAPTURE_SCHEMA,
  RECONSTRUCTION_ID,
  RECONSTRUCTION_USERNAME,
  TESTER_SPECS,
  applyImportPlan,
  applyPlanWithRepository,
  buildImportPlan,
  buildAuthorIndex,
  canonicalJson,
  createPostgresRepository,
  deterministicUuid,
  inspectExistingTesters,
  legacyDigest,
  parseTesterCredentials,
  publicError,
  readCapture,
  testerCredentialsContents,
};
