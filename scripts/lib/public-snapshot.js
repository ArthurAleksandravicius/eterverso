'use strict';

/**
 * Anonymous, read-only capture for the public Aetherverse API.
 *
 * Contract: docs/planning/interaction-audit/public-sandbox/P0-contract.md
 * (AetherversePublicCaptureV1). This module deliberately uses node:http/https
 * instead of fetch so redirects, byte limits, timeouts, and headers are under
 * our control. Received content is data only: the only place a server-provided
 * identifier is used operationally is a URL path after UUID validation.
 *
 * dataset.json selection rules (also recorded in D1-capture-tool.md):
 * - characters: every record in GET /api/personagens `personagens[]`.
 * - scenes: every record in GET /api/wiki-posts `wikiPosts[]` (turns included).
 *   GET /api/wiki-posts/:id is used only when a list record lacks a usable
 *   `turns` array, because the deployed list endpoint could omit turns.
 * - wikiPages: every full `data` record from GET /api/wiki/pages/:id, selected
 *   from every page of GET /api/wiki/pages. Listing records are not used as
 *   page bodies.
 * - wikiSections: GET /api/wiki/sections `data[]`.
 * - wikiCategories: every page of GET /api/wiki/categories `data[]`.
 * - forum: only threads named by `discussionThreadId` on captured wiki pages.
 *   Each thread gets GET /api/forum/threads/:id and every page of
 *   GET /api/forum/threads/:id/posts. The full GET /api/forum/categories list
 *   is traversed only to select the categories referenced by those threads;
 *   unrelated categories and unrelated threads are never fetched.
 * - Duplicate/conflicting IDs are reported as gaps and the first observation
 *   is retained so that every entity appears exactly once.
 *
 * Output is confined to .local/public-snapshots unless the explicit,
 * loopback-only test override is used. manifest.datasetSha256 covers the exact
 * bytes of dataset.json, and completeness is derived from gaps plus unresolved
 * changes rather than trusted as an independent claim.
 */

const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const https = require('node:https');
const crypto = require('node:crypto');
const { URL } = require('node:url');

const SCHEMA_VERSION = 'AetherversePublicCaptureV1';
const DEFAULT_ORIGIN = 'https://eterverso.onrender.com';
const DEFAULT_MAX_REQUESTS = 500;
const DEFAULT_REQUEST_INTERVAL_MS = 1000;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_CONNECT_TIMEOUT_MS = 10_000;
const DEFAULT_READ_TIMEOUT_MS = 20_000;
const DEFAULT_MAX_BODY_BYTES = 16 * 1024 * 1024;
const DEFAULT_RETRY_BASE_DELAY_MS = 500;
const DEFAULT_RETRY_MAX_DELAY_MS = 30_000;
const DEFAULT_RECHECK_ATTEMPTS = 2;
const MAX_REDIRECTS = 3;
const MAX_PAGES = 1000;
const PAGE_SIZE = 100;
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const PRIVATE_CAPTURE_ROOT = path.join(REPO_ROOT, '.local', 'public-snapshots');

const UUID_PATTERN = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const UUID_RE = new RegExp(`^${UUID_PATTERN}$`, 'i');
const UUID_PATH_RE = new RegExp(`^/api/(?:wiki-posts|wiki/pages)/${UUID_PATTERN}$`, 'i');
const FORUM_THREAD_PATH_RE = new RegExp(`^/api/forum/threads/${UUID_PATTERN}$`, 'i');
const FORUM_POSTS_PATH_RE = new RegExp(`^/api/forum/threads/${UUID_PATTERN}/posts$`, 'i');
const SAFE_FAMILY_RE = /[^a-z0-9-]+/g;

const PUBLIC_HEADERS = Object.freeze({
  accept: 'application/json',
  'user-agent': 'AetherversePublicCapture/1 (anonymous read-only; +https://eterverso.onrender.com)',
});

const SENSITIVE_KEY_RE = /(email|password|passwd|session|token|secret|cookie|authorization)/;

class CaptureUsageError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CaptureUsageError';
  }
}

class CaptureFatalError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'CaptureFatalError';
    this.code = code;
    this.family = details.family || 'capture';
    this.endpoint = details.endpoint || '';
    this.status = Number.isInteger(details.status) ? details.status : null;
  }
}

class CaptureHttpError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'CaptureHttpError';
    this.code = code;
    this.status = Number.isInteger(details.status) ? details.status : null;
    this.retryable = details.retryable === true;
    this.family = details.family || 'capture';
    this.endpoint = details.endpoint || '';
  }
}

class ShapeError extends CaptureHttpError {
  constructor(code, message) {
    super(code, message, { retryable: false });
    this.name = 'ShapeError';
  }
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function fingerprint(value) {
  return sha256(Buffer.from(JSON.stringify(value), 'utf8'));
}

function defaultSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isLoopbackHostname(hostname) {
  const value = String(hostname || '').toLowerCase();
  return value === 'localhost' || value === '::1' || value === '[::1]'
    || /^127(?:\.\d{1,3}){3}$/.test(value);
}

/**
 * Validate an origin. HTTPS is mandatory except for an explicit loopback test
 * origin, which must be a bare loopback host (no path, query, credentials).
 */
function normalizeOrigin(raw, options = {}) {
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new CaptureUsageError('An origin is required.');
  }
  let url;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new CaptureUsageError(`Invalid origin: ${raw}`);
  }
  if (url.username || url.password) throw new CaptureUsageError('Origins must not contain credentials.');
  if (url.pathname !== '/' || url.search || url.hash) {
    throw new CaptureUsageError('The origin must not include a path, query, or fragment.');
  }
  if (url.protocol === 'https:') return url.origin;
  if (url.protocol === 'http:' && options.allowLoopbackHttp === true && isLoopbackHostname(url.hostname)) {
    return url.origin;
  }
  if (url.protocol === 'http:') {
    throw new CaptureUsageError('Only HTTPS origins are allowed (loopback HTTP requires explicit test mode).');
  }
  throw new CaptureUsageError(`Unsupported origin protocol: ${url.protocol}`);
}

function classifyEndpoint(url) {
  if (url.hash) return null;
  const pathname = url.pathname;
  const keys = [...new Set(url.searchParams.keys())];
  const onlyPagination = keys.every((key) => key === 'limit' || key === 'offset');
  if (keys.length !== [...url.searchParams.keys()].length) return null;
  if (keys.length && !onlyPagination) return null;
  for (const key of keys) {
    const values = url.searchParams.getAll(key);
    if (values.length !== 1 || values[0] === '') return null;
    const number = Number(values[0]);
    if (!Number.isInteger(number) || number < 0) return null;
    if (key === 'limit' && (number < 1 || number > PAGE_SIZE)) return null;
  }

  if (pathname === '/api/personagens') return keys.length ? null : 'characters';
  if (pathname === '/api/wiki-posts') return keys.length ? null : 'scenes';
  if (UUID_PATH_RE.test(pathname)) {
    return keys.length ? null : (pathname.startsWith('/api/wiki-posts/') ? 'sceneDetail' : 'wikiPageDetail');
  }
  if (pathname === '/api/wiki/pages') return onlyPagination ? 'wikiPages' : null;
  if (pathname === '/api/wiki/sections') return keys.length ? null : 'wikiSections';
  if (pathname === '/api/wiki/categories') return onlyPagination ? 'wikiCategories' : null;
  if (pathname === '/api/forum/categories') return onlyPagination ? 'forumCategories' : null;
  if (FORUM_THREAD_PATH_RE.test(pathname)) return keys.length ? null : 'forumThreadDetail';
  if (FORUM_POSTS_PATH_RE.test(pathname)) return onlyPagination ? 'forumPosts' : null;
  return null;
}

function assertAllowedEndpoint(origin, target, details = {}) {
  if (target.origin !== origin || target.username || target.password) {
    throw new CaptureHttpError('UNSAFE_REDIRECT', 'Refused a redirect or request outside the capture origin.', {
      retryable: false,
      family: details.family,
      endpoint: details.endpoint,
    });
  }
  if (!classifyEndpoint(target)) {
    throw new CaptureHttpError('UNSAFE_REDIRECT', 'Refused an unknown endpoint family.', {
      retryable: false,
      family: details.family,
      endpoint: details.endpoint,
    });
  }
}

function safeFamilyName(family) {
  const value = String(family || 'response').toLowerCase().replace(SAFE_FAMILY_RE, '-').replace(/^-+|-+$/g, '');
  return value || 'response';
}

function findSensitiveKey(value, location = '$') {
  if (!value || typeof value !== 'object') return null;
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const found = findSensitiveKey(value[index], `${location}[${index}]`);
      if (found) return found;
    }
    return null;
  }
  for (const [key, child] of Object.entries(value)) {
    const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (SENSITIVE_KEY_RE.test(normalized)) return `${location}.${key}`;
    const found = findSensitiveKey(child, `${location}.${key}`);
    if (found) return found;
  }
  return null;
}

function parseRetryAfter(value, now = Date.now()) {
  if (value === undefined || value === null) return null;
  const text = String(Array.isArray(value) ? value[0] : value).trim();
  if (!text) return null;
  if (/^\d+$/.test(text)) return Math.min(60_000, Number(text) * 1000);
  const timestamp = Date.parse(text);
  if (Number.isNaN(timestamp)) return null;
  return Math.max(0, Math.min(60_000, timestamp - now));
}

function integerOption(value, fallback, name, minimum, maximum) {
  if (value === undefined || value === null) return fallback;
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(number) || number < minimum || number > maximum) {
    throw new CaptureUsageError(`${name} must be an integer between ${minimum} and ${maximum}.`);
  }
  return number;
}

function isPrivateCapturePath(outputDir) {
  return outputDir.startsWith(`${PRIVATE_CAPTURE_ROOT}${path.sep}`);
}

function assertOutputLocation(outputDir, { origin, allowTestOutput }) {
  if (allowTestOutput) {
    if (!isLoopbackHostname(new URL(origin).hostname)) {
      throw new CaptureUsageError(
        'The test-only output override requires a loopback capture origin.',
      );
    }
    return;
  }
  if (!isPrivateCapturePath(outputDir)) {
    throw new CaptureUsageError(
      `Capture output must be a new directory under ${PRIVATE_CAPTURE_ROOT}. `
      + 'Use --allow-test-output only for loopback fake-server tests.',
    );
  }
}

function normalizeCaptureOptions(raw = {}) {
  const origin = normalizeOrigin(
    raw.origin === undefined ? DEFAULT_ORIGIN : raw.origin,
    { allowLoopbackHttp: raw.allowLoopbackHttp === true },
  );
  if (typeof raw.outputDir !== 'string' || !raw.outputDir.trim()) {
    throw new CaptureUsageError('--output is required.');
  }
  const outputDir = path.resolve(raw.outputDir.trim());
  const allowTestOutput = raw.allowTestOutput === true;
  assertOutputLocation(outputDir, { origin, allowTestOutput });
  const requestIntervalMs = integerOption(
    raw.requestIntervalMs,
    DEFAULT_REQUEST_INTERVAL_MS,
    'requestIntervalMs',
    1000,
    60_000,
  );
  const retryBaseDelayMs = integerOption(
    raw.retryBaseDelayMs,
    DEFAULT_RETRY_BASE_DELAY_MS,
    'retryBaseDelayMs',
    1,
    DEFAULT_RETRY_MAX_DELAY_MS,
  );
  const retryMaxDelayMs = integerOption(
    raw.retryMaxDelayMs,
    DEFAULT_RETRY_MAX_DELAY_MS,
    'retryMaxDelayMs',
    1,
    300_000,
  );
  if (retryMaxDelayMs < retryBaseDelayMs) {
    throw new CaptureUsageError('retryMaxDelayMs must be at least retryBaseDelayMs.');
  }
  return {
    origin,
    outputDir,
    allowTestOutput,
    maxRequests: integerOption(raw.maxRequests, DEFAULT_MAX_REQUESTS, 'maxRequests', 1, 100_000),
    requestIntervalMs,
    maxRetries: integerOption(raw.maxRetries, DEFAULT_MAX_RETRIES, 'maxRetries', 0, 10),
    connectTimeoutMs: integerOption(raw.connectTimeoutMs, DEFAULT_CONNECT_TIMEOUT_MS, 'connectTimeoutMs', 1, 120_000),
    readTimeoutMs: integerOption(raw.readTimeoutMs, DEFAULT_READ_TIMEOUT_MS, 'readTimeoutMs', 1, 120_000),
    maxBodyBytes: integerOption(raw.maxBodyBytes, DEFAULT_MAX_BODY_BYTES, 'maxBodyBytes', 1, 128 * 1024 * 1024),
    retryBaseDelayMs,
    retryMaxDelayMs,
    recheckAttempts: integerOption(raw.recheckAttempts, DEFAULT_RECHECK_ATTEMPTS, 'recheckAttempts', 1, 5),
    sleep: typeof raw.sleep === 'function' ? raw.sleep : defaultSleep,
    skipRecheck: raw.skipRecheck === true,
  };
}

function capturePlan(options) {
  return {
    schemaVersion: SCHEMA_VERSION,
    origin: options.origin,
    outputDir: options.outputDir,
    outputPolicy: {
      privateRoot: PRIVATE_CAPTURE_ROOT,
      testOnlyOverride: options.allowTestOutput === true,
    },
    requestPolicy: {
      anonymous: true,
      methods: ['GET'],
      maxRequestsPerSecond: 1,
      requestIntervalMs: options.requestIntervalMs,
      maxRequests: options.maxRequests,
      timeoutsMs: {
        connect: options.connectTimeoutMs,
        read: options.readTimeoutMs,
      },
    },
    families: [
      'GET /api/personagens',
      'GET /api/wiki-posts',
      'GET /api/wiki/pages?limit=100&offset=... then GET /api/wiki/pages/:id',
      'GET /api/wiki/sections',
      'GET /api/wiki/categories?limit=100&offset=...',
      'GET /api/forum/threads/:id and GET /api/forum/threads/:id/posts?limit=100&offset=... for each discussionThreadId',
      'GET /api/forum/categories?limit=100&offset=... only to select referenced categories',
    ],
    notes: [
      'Anonymous GET only; no cookies, credentials, or authentication fallback.',
      'The capture is an observation interval, not a transactional database dump.',
      'Forum thread and post discovery is limited to discussionThreadId values found in captured wiki pages.',
    ],
  };
}

function findExistingAncestor(target) {
  let current = target;
  while (!fs.existsSync(current)) {
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return current;
}

function assertOutputPathAvailable(outputDir) {
  if (fs.existsSync(outputDir)) {
    throw new CaptureUsageError(`Output directory already exists: ${outputDir}`);
  }
  const ancestor = findExistingAncestor(path.dirname(outputDir));
  try {
    fs.accessSync(ancestor, fs.constants.W_OK);
  } catch {
    throw new CaptureUsageError(`Output parent is not writable: ${ancestor}`);
  }
}

async function createOutputDirectory(outputDir) {
  assertOutputPathAvailable(outputDir);
  if (isPrivateCapturePath(outputDir)) {
    await fsp.mkdir(PRIVATE_CAPTURE_ROOT, { recursive: true, mode: 0o700 });
    await fsp.chmod(PRIVATE_CAPTURE_ROOT, 0o700);
  }
  await fsp.mkdir(path.dirname(outputDir), { recursive: true });
  try {
    await fsp.mkdir(outputDir, { mode: 0o700 });
  } catch (error) {
    if (error && error.code === 'EEXIST') {
      throw new CaptureUsageError(`Output directory already exists: ${outputDir}`);
    }
    throw error;
  }
  await fsp.chmod(outputDir, 0o700);
  const rawDir = path.join(outputDir, 'raw');
  await fsp.mkdir(rawDir, { mode: 0o700 });
  await fsp.chmod(rawDir, 0o700);
}

async function writePrivateFile(target, bytes) {
  await fsp.writeFile(target, bytes, { mode: 0o600, flag: 'wx' });
  await fsp.chmod(target, 0o600);
}

function httpExchange({ url, connectTimeoutMs, readTimeoutMs, maxBodyBytes }) {
  return new Promise((resolve, reject) => {
    const transport = url.protocol === 'https:' ? https : http;
    let settled = false;
    let responseStarted = false;
    let connectTimer = null;
    let readTimer = null;

    const finish = (error, value) => {
      if (settled) return;
      settled = true;
      if (connectTimer) clearTimeout(connectTimer);
      if (readTimer) clearTimeout(readTimer);
      if (error) reject(error);
      else resolve(value);
    };

    const request = transport.request(url, {
      method: 'GET',
      headers: PUBLIC_HEADERS,
      agent: false,
      timeout: Math.min(connectTimeoutMs, readTimeoutMs),
    }, (response) => {
      responseStarted = true;
      if (connectTimer) {
        clearTimeout(connectTimer);
        connectTimer = null;
      }
      const chunks = [];
      let bytes = 0;
      readTimer = setTimeout(() => {
        finish(new CaptureHttpError('READ_TIMEOUT', 'Response body read timed out.', { retryable: true }));
        response.destroy();
        request.destroy();
      }, readTimeoutMs);
      response.on('data', (chunk) => {
        bytes += chunk.length;
        if (bytes > maxBodyBytes) {
          finish(new CaptureHttpError('BODY_TOO_LARGE', 'Response body exceeded the configured limit.', { retryable: false }));
          response.destroy();
          request.destroy();
          return;
        }
        chunks.push(chunk);
      });
      response.on('end', () => {
        if (response.complete === false) {
          finish(new CaptureHttpError('PARTIAL_RESPONSE', 'Response was interrupted.', { retryable: true }));
          return;
        }
        finish(null, {
          url: url.toString(),
          status: response.statusCode || 0,
          headers: response.headers,
          body: Buffer.concat(chunks),
        });
      });
      response.on('aborted', () => {
        finish(new CaptureHttpError('PARTIAL_RESPONSE', 'Response was interrupted.', { retryable: true }));
      });
      response.on('error', () => {
        finish(new CaptureHttpError('READ_ERROR', 'Response stream failed.', { retryable: true }));
      });
    });

    connectTimer = setTimeout(() => {
      finish(new CaptureHttpError('CONNECT_TIMEOUT', 'Connection timed out.', { retryable: true }));
      request.destroy();
    }, connectTimeoutMs);
    request.on('timeout', () => {
      finish(new CaptureHttpError('TIMEOUT', 'Socket timed out.', { retryable: true }));
      request.destroy();
    });
    request.on('error', () => {
      finish(new CaptureHttpError(
        responseStarted ? 'PARTIAL_RESPONSE' : 'NETWORK_ERROR',
        responseStarted ? 'Response was interrupted.' : 'Network request failed.',
        { retryable: true },
      ));
    });
    request.end();
  });
}

class CaptureSession {
  constructor(options) {
    this.options = options;
    this.origin = options.origin;
    this.startedAt = new Date().toISOString();
    this.finishedAt = null;
    this.captureId = makeCaptureId();
    this.attempts = 0;
    this.requests = [];
    this.gaps = [];
    this.gapKeys = new Set();
    this.unresolvedChanges = [];
    this.unresolvedKeys = new Set();
    this.clock = 0;
    this.nextSlotAt = 0;
    this.outputDir = options.outputDir;
    this.dataset = {
      schemaVersion: SCHEMA_VERSION,
      origin: this.origin,
      capturedAt: null,
      characters: [],
      scenes: [],
      wikiPages: [],
      wikiSections: [],
      wikiCategories: [],
      forum: { categories: [], threads: [], postsByThread: {} },
    };
  }

  async sleepFor(ms) {
    if (ms <= 0) return;
    await this.options.sleep(ms);
    this.clock += ms;
  }

  async waitForSlot() {
    const start = Math.max(this.clock, this.nextSlotAt);
    if (start > this.clock) await this.sleepFor(start - this.clock);
    this.clock = start;
    this.nextSlotAt = start + this.options.requestIntervalMs;
  }

  async reserveRequest() {
    if (this.attempts >= this.options.maxRequests) {
      throw new CaptureFatalError('REQUEST_BUDGET_EXHAUSTED', 'The configured request budget was exhausted.');
    }
    this.attempts += 1;
    await this.waitForSlot();
  }

  recordGap(family, endpoint, error) {
    const status = Number.isInteger(error && error.status) ? error.status : 0;
    let reason = (error && error.code) || 'ERROR';
    if (status === 401 || status === 403) reason = 'VISIBILITY_BOUNDARY';
    else if (status === 404) reason = 'NOT_FOUND';
    else if (status === 429) reason = 'RATE_LIMITED';
    else if (status >= 500 && status <= 599) reason = 'SERVER_ERROR';
    const key = `${family}\0${endpoint}\0${status}\0${reason}`;
    if (this.gapKeys.has(key)) return;
    this.gapKeys.add(key);
    this.gaps.push({ family, endpoint, status, reason });
  }

  recordUnresolved(family, reason, ids = []) {
    const cleanIds = [...new Set(ids.filter((id) => typeof id === 'string' && id))];
    const key = `${family}\0${reason}\0${cleanIds.join(',')}`;
    if (this.unresolvedKeys.has(key)) return;
    this.unresolvedKeys.add(key);
    this.unresolvedChanges.push({ family, reason, ids: cleanIds });
  }

  recordFatal(error) {
    this.recordGap(error.family || 'capture', error.endpoint || '', error);
  }

  hasGap(family) {
    return this.gaps.some((gap) => gap.family === family);
  }

  async storeResponse(family, response) {
    const body = response.body;
    let json = null;
    if (body.length) {
      try {
        json = JSON.parse(body.toString('utf8'));
      } catch {
        json = null;
      }
    }
    const digest = sha256(body);
    if (json !== null) {
      const sensitivePath = findSensitiveKey(json);
      if (sensitivePath) {
        this.requests.push({
          family,
          url: response.url,
          status: response.status,
          bytes: body.length,
          sha256: digest,
          storedAs: null,
        });
        throw new CaptureFatalError(
          'SENSITIVE_FIELD_REJECTED',
          'A public response contained an unexpected sensitive field.',
          { family },
        );
      }
    } else if (body.length && /"(?:email|password|passwd|session|token|secret|cookie|authorization)"\s*:/i.test(body.toString('utf8'))) {
      this.requests.push({
        family,
        url: response.url,
        status: response.status,
        bytes: body.length,
        sha256: digest,
        storedAs: null,
      });
      throw new CaptureFatalError(
        'SENSITIVE_FIELD_REJECTED',
        'A public response contained an unexpected sensitive field.',
        { family },
      );
    }

    const sequence = this.requests.length + 1;
    let storedAs = null;
    if (body.length) {
      const extension = json !== null ? 'json' : 'body';
      storedAs = `raw/${String(sequence).padStart(4, '0')}-${safeFamilyName(family)}.${extension}`;
      await writePrivateFile(path.join(this.outputDir, storedAs), body);
    }
    this.requests.push({
      family,
      url: response.url,
      status: response.status,
      bytes: body.length,
      sha256: digest,
      storedAs,
    });
    return { json, digest, storedAs };
  }

  async backoff(attempt, retryAfterMs) {
    const exponential = Math.min(
      this.options.retryMaxDelayMs,
      this.options.retryBaseDelayMs * (2 ** attempt),
    );
    await this.sleepFor(Math.max(exponential, retryAfterMs || 0));
  }

  async request(family, pathAndQuery) {
    let current = new URL(pathAndQuery, `${this.origin}/`);
    try {
      assertAllowedEndpoint(this.origin, current, { family, endpoint: pathAndQuery });
    } catch (error) {
      error.endpoint = pathAndQuery;
      error.family = family;
      throw error;
    }

    let attempt = 0;
    let redirects = 0;
    for (;;) {
      try {
        await this.reserveRequest();
      } catch (error) {
        error.family = family;
        error.endpoint = pathAndQuery;
        throw error;
      }

      let response;
      try {
        response = await httpExchange({
          url: current,
          connectTimeoutMs: this.options.connectTimeoutMs,
          readTimeoutMs: this.options.readTimeoutMs,
          maxBodyBytes: this.options.maxBodyBytes,
        });
      } catch (error) {
        if (error instanceof CaptureHttpError && error.retryable && attempt < this.options.maxRetries) {
          await this.backoff(attempt, null);
          attempt += 1;
          continue;
        }
        if (error instanceof CaptureHttpError) {
          error.family = family;
          error.endpoint = pathAndQuery;
        }
        throw error;
      }

      const stored = await this.storeResponse(family, response);
      response.json = stored.json;

      if (response.status === 304) return response;

      if (response.status >= 300 && response.status < 400) {
        redirects += 1;
        if (redirects > MAX_REDIRECTS) {
          throw new CaptureHttpError('TOO_MANY_REDIRECTS', 'Redirect limit exceeded.', {
            status: response.status,
            family,
            endpoint: pathAndQuery,
          });
        }
        const location = response.headers.location;
        if (typeof location !== 'string' || !location) {
          throw new CaptureHttpError('INVALID_REDIRECT', 'Redirect response had no Location header.', {
            status: response.status,
            family,
            endpoint: pathAndQuery,
          });
        }
        let target;
        try {
          target = new URL(location, current);
        } catch {
          throw new CaptureHttpError('INVALID_REDIRECT', 'Redirect target was invalid.', {
            status: response.status,
            family,
            endpoint: pathAndQuery,
          });
        }
        assertAllowedEndpoint(this.origin, target, { family, endpoint: pathAndQuery });
        current = target;
        continue;
      }

      if (response.status === 429 || (response.status >= 500 && response.status <= 599)) {
        if (attempt < this.options.maxRetries) {
          const retryAfterMs = parseRetryAfter(response.headers['retry-after']);
          await this.backoff(attempt, retryAfterMs);
          attempt += 1;
          continue;
        }
        throw new CaptureHttpError(`HTTP_${response.status}`, `Server returned HTTP ${response.status}.`, {
          status: response.status,
          family,
          endpoint: pathAndQuery,
        });
      }

      if (response.status < 200 || response.status >= 300) {
        throw new CaptureHttpError(`HTTP_${response.status}`, `Server returned HTTP ${response.status}.`, {
          status: response.status,
          family,
          endpoint: pathAndQuery,
        });
      }
      return response;
    }
  }

  async getJson(family, pathAndQuery) {
    const response = await this.request(family, pathAndQuery);
    if (response.status === 304) {
      throw new CaptureHttpError('UNEXPECTED_NOT_MODIFIED', 'Conditional response without a request condition.', {
        status: 304,
        family,
        endpoint: pathAndQuery,
      });
    }
    if (response.json === null) {
      throw new CaptureHttpError('INVALID_JSON', 'Response was not valid JSON.', {
        status: response.status,
        family,
        endpoint: pathAndQuery,
      });
    }
    return response.json;
  }

  buildDataset() {
    this.finishedAt = this.finishedAt || new Date().toISOString();
    return {
      schemaVersion: SCHEMA_VERSION,
      origin: this.origin,
      capturedAt: this.finishedAt,
      characters: this.dataset.characters,
      scenes: this.dataset.scenes,
      wikiPages: this.dataset.wikiPages,
      wikiSections: this.dataset.wikiSections,
      wikiCategories: this.dataset.wikiCategories,
      forum: {
        categories: this.dataset.forum.categories,
        threads: this.dataset.forum.threads,
        postsByThread: this.dataset.forum.postsByThread,
      },
    };
  }

  buildManifest(datasetSha256) {
    if (typeof datasetSha256 !== 'string' || !/^[0-9a-f]{64}$/.test(datasetSha256)) {
      throw new TypeError('buildManifest requires the SHA-256 of the exact dataset bytes.');
    }
    this.finishedAt = this.finishedAt || new Date().toISOString();
    const dataset = this.dataset;
    const sceneTurns = dataset.scenes.reduce((total, scene) => (
      total + (Array.isArray(scene.turns) ? scene.turns.length : 0)
    ), 0);
    const forumPosts = dataset.forum.threads.reduce((total, thread) => {
      const posts = dataset.forum.postsByThread[thread.id];
      return total + (Array.isArray(posts) ? posts.length : 0);
    }, 0);
    const complete = this.gaps.length === 0 && this.unresolvedChanges.length === 0;
    return {
      schemaVersion: SCHEMA_VERSION,
      captureId: this.captureId,
      origin: this.origin,
      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
      datasetSha256,
      requestPolicy: { anonymous: true, maxRequestsPerSecond: 1 },
      counts: {
        characters: dataset.characters.length,
        scenes: dataset.scenes.length,
        sceneTurns,
        wikiPages: dataset.wikiPages.length,
        wikiSections: dataset.wikiSections.length,
        wikiCategories: dataset.wikiCategories.length,
        forumThreads: dataset.forum.threads.length,
        forumPosts,
      },
      entities: {
        characters: dataset.characters.map((record) => record.id),
        scenes: dataset.scenes.map((record) => record.id),
        wikiPages: dataset.wikiPages.map((record) => record.id),
        forumThreads: dataset.forum.threads.map((record) => record.id),
      },
      gaps: this.gaps,
      consistency: {
        complete,
        observedInterval: true,
        unresolvedChanges: this.unresolvedChanges,
      },
      requests: this.requests,
    };
  }

  async writeCapture() {
    const dataset = this.buildDataset();
    const datasetBytes = Buffer.from(`${JSON.stringify(dataset, null, 2)}\n`, 'utf8');
    const manifest = this.buildManifest(sha256(datasetBytes));
    await writePrivateFile(
      path.join(this.outputDir, 'manifest.json'),
      Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`, 'utf8'),
    );
    await writePrivateFile(path.join(this.outputDir, 'dataset.json'), datasetBytes);
    return { manifest, dataset };
  }
}

function makeCaptureId(now = new Date()) {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  return `capture-${stamp}-${crypto.randomBytes(4).toString('hex')}`;
}

function requireArray(body, key, family) {
  if (!body || typeof body !== 'object' || Array.isArray(body) || !Array.isArray(body[key])) {
    throw new ShapeError('INVALID_RESPONSE_SHAPE', `${family} response did not contain an array named ${key}.`);
  }
  return body[key];
}

function rejectUnhandledPagination(session, family, endpoint, body) {
  if (body && body.page && body.page.hasMore === true) {
    session.recordGap(family, endpoint, new ShapeError(
      'UNEXPECTED_PAGINATION',
      'A single-page endpoint reported page.hasMore; refusing to treat it as complete.',
    ));
  }
}

function uniqueRecords(session, family, records, idOf, endpoint, options = {}) {
  const unique = [];
  const seen = new Map();
  for (const record of records) {
    const id = idOf(record);
    if (typeof id !== 'string' || !id || (options.requireUuid && !UUID_RE.test(id))) {
      session.recordGap(family, endpoint, new ShapeError('INVALID_ENTITY_ID', `${family} contained an invalid entity id.`));
      continue;
    }
    if (seen.has(id)) {
      const same = JSON.stringify(seen.get(id)) === JSON.stringify(record);
      session.recordGap(
        family,
        endpoint,
        new ShapeError(same ? 'DUPLICATE_ID' : 'CONFLICTING_ID', `${family} contained a duplicate entity id.`),
      );
      continue;
    }
    seen.set(id, record);
    unique.push(record);
  }
  return unique;
}

async function fetchPaginated(session, family, endpoint, options) {
  const idOf = options.idOf;
  const requireUuid = options.requireUuid === true;
  const items = [];
  const seen = new Map();
  const signatures = new Set();
  let offset = 0;

  for (let pageIndex = 0; pageIndex < MAX_PAGES; pageIndex += 1) {
    const requestPath = `${endpoint}?limit=${PAGE_SIZE}&offset=${offset}`;
    let body;
    try {
      body = await session.getJson(family, requestPath);
    } catch (error) {
      if (error instanceof CaptureFatalError) throw error;
      session.recordGap(family, requestPath, error);
      return { items, complete: false };
    }

    const data = body && body.data;
    const page = body && body.page;
    if (!Array.isArray(data) || !page || typeof page.hasMore !== 'boolean') {
      session.recordGap(family, requestPath, new ShapeError(
        'INVALID_PAGE_SHAPE',
        `${family} did not return data[] plus page.hasMore.`,
      ));
      return { items, complete: false };
    }

    const signature = fingerprint(data.map((item) => idOf(item) ?? null));
    if (signatures.has(signature)) {
      session.recordGap(family, requestPath, new ShapeError(
        'REPEATED_PAGE',
        `${family} returned the same page more than once.`,
      ));
      return { items, complete: false };
    }
    signatures.add(signature);

    if (data.length === 0) {
      if (page.hasMore) {
        session.recordGap(family, requestPath, new ShapeError(
          'EMPTY_PAGE_WITH_HAS_MORE',
          `${family} returned an empty page while reporting hasMore.`,
        ));
        return { items, complete: false };
      }
      return { items, complete: true };
    }

    for (const item of data) {
      const id = idOf(item);
      if (typeof id !== 'string' || !id || (requireUuid && !UUID_RE.test(id))) {
        session.recordGap(family, requestPath, new ShapeError(
          'INVALID_ENTITY_ID',
          `${family} contained an invalid entity id.`,
        ));
        continue;
      }
      if (seen.has(id)) {
        const same = JSON.stringify(seen.get(id)) === JSON.stringify(item);
        session.recordGap(family, requestPath, new ShapeError(
          same ? 'DUPLICATE_ID' : 'CONFLICTING_ID',
          `${family} contained a duplicate entity id.`,
        ));
        continue;
      }
      seen.set(id, item);
      items.push(item);
    }

    if (!page.hasMore) return { items, complete: true };
    offset += data.length;
  }

  session.recordGap(family, endpoint, new ShapeError('PAGE_LIMIT_EXCEEDED', `${family} exceeded the page traversal limit.`));
  return { items, complete: false };
}

function characterId(record) {
  return record && record.id;
}

function sceneId(record) {
  return record && record.id;
}

function pageId(record) {
  return record && record.id;
}

function sectionId(record) {
  return record && record.key;
}

function categoryKey(record) {
  return record && record.key;
}

function forumCategoryId(record) {
  return record && record.id;
}

function forumThreadId(record) {
  return record && record.id;
}

function forumPostId(record) {
  return record && record.id;
}

async function captureCharacters(session) {
  const endpoint = '/api/personagens';
  try {
    const body = await session.getJson('characters', endpoint);
    const records = requireArray(body, 'personagens', 'characters');
    rejectUnhandledPagination(session, 'characters', endpoint, body);
    session.dataset.characters = uniqueRecords(session, 'characters', records, characterId, endpoint, { requireUuid: true });
  } catch (error) {
    if (error instanceof CaptureFatalError) throw error;
    session.recordGap('characters', endpoint, error);
  }
}

async function normalizeSceneRecords(session, records) {
  const unique = uniqueRecords(session, 'scenes', records, sceneId, '/api/wiki-posts', { requireUuid: true });
  const normalized = [];
  for (const record of unique) {
    let scene = record;
    if (!Array.isArray(scene.turns)) {
      const endpoint = `/api/wiki-posts/${scene.id}`;
      try {
        const body = await session.getJson('sceneDetail', endpoint);
        const detail = body && body.wikiPost;
        if (!detail || typeof detail !== 'object' || detail.id !== scene.id) {
          throw new ShapeError('INVALID_SCENE_DETAIL', 'Scene detail did not match the listed scene.');
        }
        scene = detail;
      } catch (error) {
        if (error instanceof CaptureFatalError) throw error;
        session.recordGap('scenes', endpoint, error);
      }
    }
    if (!Array.isArray(scene.turns)) {
      session.recordGap('scenes', '/api/wiki-posts', new ShapeError(
        'SCENE_TURNS_MISSING',
        'Scene record did not contain a turns array.',
      ));
    }
    if (Array.isArray(scene.turns)) {
      const seenTurns = new Map();
      for (const turn of scene.turns) {
        const id = turn && turn.id;
        if (typeof id !== 'string' || !id) {
          session.recordGap('scenes', '/api/wiki-posts', new ShapeError(
            'INVALID_TURN_ID',
            'Scene turn did not contain a usable id.',
          ));
          continue;
        }
        if (seenTurns.has(id)) {
          const same = JSON.stringify(seenTurns.get(id)) === JSON.stringify(turn);
          session.recordGap('scenes', '/api/wiki-posts', new ShapeError(
            same ? 'DUPLICATE_TURN_ID' : 'CONFLICTING_TURN_ID',
            'Scene contained a duplicate turn id.',
          ));
          continue;
        }
        seenTurns.set(id, turn);
      }
    }
    normalized.push(scene);
  }
  return normalized;
}

async function captureScenes(session) {
  const endpoint = '/api/wiki-posts';
  try {
    const body = await session.getJson('scenes', endpoint);
    const records = requireArray(body, 'wikiPosts', 'scenes');
    rejectUnhandledPagination(session, 'scenes', endpoint, body);
    session.dataset.scenes = await normalizeSceneRecords(session, records);
  } catch (error) {
    if (error instanceof CaptureFatalError) throw error;
    session.recordGap('scenes', endpoint, error);
  }
}

async function captureWikiSections(session) {
  const endpoint = '/api/wiki/sections';
  try {
    const body = await session.getJson('wikiSections', endpoint);
    const records = requireArray(body, 'data', 'wikiSections');
    rejectUnhandledPagination(session, 'wikiSections', endpoint, body);
    session.dataset.wikiSections = uniqueRecords(session, 'wikiSections', records, sectionId, endpoint);
  } catch (error) {
    if (error instanceof CaptureFatalError) throw error;
    session.recordGap('wikiSections', endpoint, error);
  }
}

async function captureWikiCategories(session) {
  const endpoint = '/api/wiki/categories';
  const result = await fetchPaginated(session, 'wikiCategories', endpoint, {
    idOf: categoryKey,
    requireUuid: false,
  });
  session.dataset.wikiCategories = result.items;
  return result;
}

async function captureWikiPageList(session) {
  return fetchPaginated(session, 'wikiPages', '/api/wiki/pages', {
    idOf: pageId,
    requireUuid: true,
  });
}

async function captureWikiPageDetails(session, listing) {
  const records = [];
  const seen = new Set();
  for (const meta of listing) {
    if (seen.has(meta.id)) continue;
    seen.add(meta.id);
    const endpoint = `/api/wiki/pages/${meta.id}`;
    try {
      const body = await session.getJson('wikiPageDetail', endpoint);
      const record = body && body.data;
      if (!record || typeof record !== 'object' || record.id !== meta.id) {
        throw new ShapeError('INVALID_PAGE_DETAIL', 'Wiki page detail did not match the listing record.');
      }
      records.push(record);
    } catch (error) {
      if (error instanceof CaptureFatalError) throw error;
      session.recordGap('wikiPages', endpoint, error);
    }
  }
  session.dataset.wikiPages = records;
}

function filterThreadPosts(session, threadId, postsPath, posts) {
  const threadKey = threadId.toLowerCase();
  return posts.filter((post) => {
    if (post && typeof post.threadId === 'string' && post.threadId.toLowerCase() === threadKey) {
      return true;
    }
    session.recordGap('forumPosts', postsPath, new ShapeError(
      'WRONG_THREAD_POST',
      'A forum post did not belong to the requested thread.',
    ));
    return false;
  });
}

async function captureForumThread(session, threadId) {
  const detailPath = `/api/forum/threads/${threadId}`;
  let thread;
  try {
    const body = await session.getJson('forumThreadDetail', detailPath);
    thread = body && body.data;
    if (!thread || typeof thread !== 'object' || String(thread.id).toLowerCase() !== threadId.toLowerCase()) {
      throw new ShapeError('INVALID_THREAD_DETAIL', 'Forum thread detail did not match the requested thread.');
    }
  } catch (error) {
    if (error instanceof CaptureFatalError) throw error;
    session.recordGap('forumThreads', detailPath, error);
    return null;
  }

  const postsPath = `/api/forum/threads/${threadId}/posts`;
  const posts = await fetchPaginated(session, 'forumPosts', postsPath, {
    idOf: forumPostId,
    requireUuid: true,
  });
  const threadPosts = filterThreadPosts(session, threadId, postsPath, posts.items);
  session.dataset.forum.threads.push(thread);
  session.dataset.forum.postsByThread[thread.id] = threadPosts;
  return { thread, posts: threadPosts };
}

async function captureForumCategories(session, threads) {
  if (!threads.length) return;
  const wanted = new Set(threads.map((thread) => String(thread.categoryId).toLowerCase()));
  const endpoint = '/api/forum/categories';
  const result = await fetchPaginated(session, 'forumCategories', endpoint, {
    idOf: forumCategoryId,
    requireUuid: true,
  });
  const selected = result.items.filter((category) => wanted.has(String(category.id).toLowerCase()));
  session.dataset.forum.categories = selected;
  const found = new Set(selected.map((category) => String(category.id).toLowerCase()));
  for (const categoryId of wanted) {
    if (!found.has(categoryId)) {
      session.recordGap('forumCategories', endpoint, new ShapeError(
        'REFERENCED_CATEGORY_NOT_FOUND',
        'A category referenced by a captured thread was not present in the public category list.',
      ));
    }
  }
}

async function captureReferencedForum(session) {
  const refs = [];
  const seen = new Set();
  for (const page of session.dataset.wikiPages) {
    const reference = page && page.discussionThreadId;
    if (reference === null || reference === undefined || reference === '') continue;
    if (typeof reference !== 'string' || !UUID_RE.test(reference)) {
      session.recordGap('forumThreads', '/api/wiki/pages', new ShapeError(
        'INVALID_DISCUSSION_REFERENCE',
        'A wiki page contained an invalid discussionThreadId.',
      ));
      continue;
    }
    if (seen.has(reference)) continue;
    seen.add(reference);
    refs.push(reference);
  }
  for (const threadId of refs) {
    await captureForumThread(session, threadId);
  }
  await captureForumCategories(session, session.dataset.forum.threads);
}

async function captureAll(session) {
  await captureCharacters(session);
  await captureScenes(session);
  await captureWikiSections(session);
  await captureWikiCategories(session);
  const listing = await captureWikiPageList(session);
  await captureWikiPageDetails(session, listing.items);
  await captureReferencedForum(session);
}

function idsOf(records, idOf) {
  return records.map((record) => idOf(record)).filter((id) => typeof id === 'string' && id);
}

async function recheckSingleList(session, family, endpoint, extract, idOf, requireUuid) {
  if (session.hasGap(family)) return;
  const targetKey = family;
  const current = session.dataset[targetKey];
  let previous = current;
  for (let attempt = 0; attempt < session.options.recheckAttempts; attempt += 1) {
    let next;
    try {
      const body = await session.getJson(family, endpoint);
      rejectUnhandledPagination(session, family, endpoint, body);
      next = uniqueRecords(session, family, extract(body), idOf, endpoint, { requireUuid });
    } catch (error) {
      if (error instanceof CaptureFatalError) throw error;
      session.recordGap(family, endpoint, error);
      return;
    }
    if (fingerprint(next) === fingerprint(previous)) {
      if (fingerprint(next) !== fingerprint(current)) {
        session.dataset[targetKey] = next;
      }
      return;
    }
    previous = next;
  }
  session.recordUnresolved(family, 'Records kept changing during the final recheck.', idsOf(previous, idOf));
}

async function recheckScenes(session) {
  if (session.hasGap('scenes')) return;
  const endpoint = '/api/wiki-posts';
  const current = session.dataset.scenes;
  let previous = current;
  for (let attempt = 0; attempt < session.options.recheckAttempts; attempt += 1) {
    let next;
    try {
      const body = await session.getJson('scenes', endpoint);
      rejectUnhandledPagination(session, 'scenes', endpoint, body);
      next = await normalizeSceneRecords(session, requireArray(body, 'wikiPosts', 'scenes'));
    } catch (error) {
      if (error instanceof CaptureFatalError) throw error;
      session.recordGap('scenes', endpoint, error);
      return;
    }
    if (fingerprint(next) === fingerprint(previous)) {
      if (fingerprint(next) !== fingerprint(current)) session.dataset.scenes = next;
      return;
    }
    previous = next;
  }
  session.recordUnresolved('scenes', 'Scenes kept changing during the final recheck.', idsOf(previous, sceneId));
}

async function recheckWikiSections(session) {
  if (session.hasGap('wikiSections')) return;
  const endpoint = '/api/wiki/sections';
  const current = session.dataset.wikiSections;
  let previous = current;
  for (let attempt = 0; attempt < session.options.recheckAttempts; attempt += 1) {
    let next;
    try {
      const body = await session.getJson('wikiSections', endpoint);
      rejectUnhandledPagination(session, 'wikiSections', endpoint, body);
      next = uniqueRecords(session, 'wikiSections', requireArray(body, 'data', 'wikiSections'), sectionId, endpoint);
    } catch (error) {
      if (error instanceof CaptureFatalError) throw error;
      session.recordGap('wikiSections', endpoint, error);
      return;
    }
    if (fingerprint(next) === fingerprint(previous)) {
      if (fingerprint(next) !== fingerprint(current)) session.dataset.wikiSections = next;
      return;
    }
    previous = next;
  }
  session.recordUnresolved('wikiSections', 'Wiki sections kept changing during the final recheck.', idsOf(previous, sectionId));
}

async function recheckWikiCategories(session) {
  if (session.hasGap('wikiCategories')) return;
  const endpoint = '/api/wiki/categories';
  const current = session.dataset.wikiCategories;
  let previous = current;
  for (let attempt = 0; attempt < session.options.recheckAttempts; attempt += 1) {
    const result = await fetchPaginated(session, 'wikiCategories', endpoint, {
      idOf: categoryKey,
      requireUuid: false,
    });
    if (!result.complete) return;
    const next = result.items;
    if (fingerprint(next) === fingerprint(previous)) {
      if (fingerprint(next) !== fingerprint(current)) session.dataset.wikiCategories = next;
      return;
    }
    previous = next;
  }
  session.recordUnresolved('wikiCategories', 'Wiki categories kept changing during the final recheck.', idsOf(previous, categoryKey));
}

async function readStablePage(session, id, current) {
  const endpoint = `/api/wiki/pages/${id}`;
  let previous = current;
  for (let attempt = 0; attempt <= session.options.recheckAttempts; attempt += 1) {
    let next;
    try {
      const body = await session.getJson('wikiPageDetail', endpoint);
      next = body && body.data;
      if (!next || typeof next !== 'object' || next.id !== id) {
        throw new ShapeError('INVALID_PAGE_DETAIL', 'Wiki page detail did not match the requested page.');
      }
    } catch (error) {
      if (error instanceof CaptureFatalError) throw error;
      session.recordGap('wikiPages', endpoint, error);
      return null;
    }
    if (fingerprint(next) === fingerprint(previous)) return next;
    previous = next;
  }
  return null;
}

async function recheckWikiPages(session) {
  if (session.hasGap('wikiPages')) return;
  const listing = await captureWikiPageList(session);
  if (!listing.complete) return;

  const currentById = new Map(session.dataset.wikiPages.map((page) => [page.id, page]));
  const listingById = new Map(listing.items.map((page) => [page.id, page]));
  const records = new Map(currentById);
  const missing = [];

  for (const id of currentById.keys()) {
    if (!listingById.has(id)) missing.push(id);
  }
  if (missing.length) {
    session.recordUnresolved('wikiPages', 'Pages disappeared during the final recheck.', missing);
  }

  for (const id of listingById.keys()) {
    if (currentById.has(id)) continue;
    const endpoint = `/api/wiki/pages/${id}`;
    try {
      const body = await session.getJson('wikiPageDetail', endpoint);
      const record = body && body.data;
      if (!record || typeof record !== 'object' || record.id !== id) {
        throw new ShapeError('INVALID_PAGE_DETAIL', 'New wiki page detail did not match the listing record.');
      }
      records.set(id, record);
    } catch (error) {
      if (error instanceof CaptureFatalError) throw error;
      session.recordGap('wikiPages', endpoint, error);
    }
  }

  for (const [id, meta] of listingById.entries()) {
    const current = currentById.get(id);
    if (!current) continue;
    if (meta.publicVersion === current.publicVersion) continue;
    const stable = await readStablePage(session, id, current);
    if (stable) records.set(id, stable);
    else session.recordUnresolved('wikiPages', 'Page version changed during the final recheck.', [id]);
  }

  const ordered = [];
  for (const meta of listing.items) {
    const record = records.get(meta.id);
    if (record) ordered.push(record);
  }
  for (const id of missing) {
    const record = records.get(id);
    if (record) ordered.push(record);
  }
  session.dataset.wikiPages = ordered;
}

async function recheckForum(session) {
  const refs = [];
  const seen = new Set();
  for (const page of session.dataset.wikiPages) {
    const reference = page && page.discussionThreadId;
    if (typeof reference === 'string' && UUID_RE.test(reference) && !seen.has(reference)) {
      seen.add(reference);
      refs.push(reference);
    }
  }

  const captured = new Set(session.dataset.forum.threads.map((thread) => thread.id));
  for (const threadId of refs) {
    if (!captured.has(threadId)) {
      const added = await captureForumThread(session, threadId);
      if (added) captured.add(added.thread.id);
    }
  }

  if (!session.dataset.forum.threads.length) return;

  for (const thread of session.dataset.forum.threads) {
    const endpoint = `/api/forum/threads/${thread.id}`;
    let nextThread;
    try {
      const body = await session.getJson('forumThreadDetail', endpoint);
      nextThread = body && body.data;
      if (!nextThread || typeof nextThread !== 'object' || nextThread.id !== thread.id) {
        throw new ShapeError('INVALID_THREAD_DETAIL', 'Forum thread detail did not match the requested thread.');
      }
    } catch (error) {
      if (error instanceof CaptureFatalError) throw error;
      session.recordGap('forumThreads', endpoint, error);
      session.recordUnresolved('forumThreads', 'Thread detail could not be re-read.', [thread.id]);
      continue;
    }

    const currentPosts = session.dataset.forum.postsByThread[thread.id] || [];
    const currentVisible = visibleForumPostCount(currentPosts);
    const changed = fingerprint(nextThread) !== fingerprint(thread)
      || (Number.isInteger(nextThread.postsCount) && nextThread.postsCount !== currentVisible);
    if (!changed) continue;

    let previous = currentPosts;
    let stable = null;
    const postsPath = `/api/forum/threads/${thread.id}/posts`;
    for (let attempt = 0; attempt < session.options.recheckAttempts; attempt += 1) {
      const result = await fetchPaginated(session, 'forumPosts', postsPath, {
        idOf: forumPostId,
        requireUuid: true,
      });
      if (!result.complete) break;
      const nextPosts = filterThreadPosts(session, thread.id, postsPath, result.items);
      if (fingerprint(nextPosts) === fingerprint(previous)) {
        stable = nextPosts;
        break;
      }
      previous = nextPosts;
    }
    if (stable) {
      const index = session.dataset.forum.threads.findIndex((item) => item.id === thread.id);
      if (index !== -1) session.dataset.forum.threads[index] = nextThread;
      session.dataset.forum.postsByThread[thread.id] = stable;
      const visibleCount = visibleForumPostCount(stable);
      if (Number.isInteger(nextThread.postsCount) && nextThread.postsCount !== visibleCount) {
        session.recordUnresolved(
          'forumPosts',
          'Thread postsCount did not match the captured visible posts.',
          [thread.id],
        );
      }
    } else {
      session.recordUnresolved('forumPosts', 'Thread posts kept changing during the final recheck.', [thread.id]);
    }
  }

  if (!session.hasGap('forumCategories')) {
    await recheckForumCategories(session);
  }
}

async function recheckForumCategories(session) {
  if (!session.dataset.forum.threads.length) return;
  const endpoint = '/api/forum/categories';
  const wanted = new Set(session.dataset.forum.threads.map((thread) => String(thread.categoryId).toLowerCase()));
  const current = session.dataset.forum.categories;
  let previous = current;
  for (let attempt = 0; attempt < session.options.recheckAttempts; attempt += 1) {
    const result = await fetchPaginated(session, 'forumCategories', endpoint, {
      idOf: forumCategoryId,
      requireUuid: true,
    });
    if (!result.complete) return;
    const selected = result.items.filter((category) => wanted.has(String(category.id).toLowerCase()));
    if (fingerprint(selected) === fingerprint(previous)) {
      if (fingerprint(selected) !== fingerprint(current)) session.dataset.forum.categories = selected;
      return;
    }
    previous = selected;
  }
  session.recordUnresolved('forumCategories', 'Forum categories kept changing during the final recheck.', idsOf(previous, forumCategoryId));
}

async function recheckAll(session) {
  await recheckSingleList(
    session,
    'characters',
    '/api/personagens',
    (body) => requireArray(body, 'personagens', 'characters'),
    characterId,
    true,
  );
  await recheckScenes(session);
  await recheckWikiSections(session);
  await recheckWikiCategories(session);
  await recheckWikiPages(session);
  await recheckForum(session);
}

function assertUniqueEntityList(label, records, idOf) {
  const ids = new Set();
  for (const record of records) {
    const id = idOf(record);
    if (typeof id !== 'string' || !id) {
      throw new CaptureUsageError(`${label} contains a record without a usable id.`);
    }
    if (ids.has(id)) throw new CaptureUsageError(`${label} contains duplicate entity id ${id}.`);
    ids.add(id);
  }
  return ids;
}

function isDeletedForumPost(post) {
  return Boolean(post && (post.deleted === true
    || (post.deletedAt !== null && post.deletedAt !== undefined)));
}

function visibleForumPostCount(posts) {
  return posts.filter((post) => !isDeletedForumPost(post)).length;
}

function validateManifest(manifest) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new CaptureUsageError('manifest.json must be an object.');
  }
  if (manifest.schemaVersion !== SCHEMA_VERSION) {
    throw new CaptureUsageError(`manifest.schemaVersion must be ${SCHEMA_VERSION}.`);
  }
  if (typeof manifest.captureId !== 'string' || !manifest.captureId) {
    throw new CaptureUsageError('manifest.captureId is required.');
  }
  if (typeof manifest.origin !== 'string' || !manifest.origin) {
    throw new CaptureUsageError('manifest.origin is required.');
  }
  for (const field of ['startedAt', 'finishedAt']) {
    if (typeof manifest[field] !== 'string' || Number.isNaN(Date.parse(manifest[field]))) {
      throw new CaptureUsageError(`manifest.${field} must be an ISO timestamp.`);
    }
  }
  if (typeof manifest.datasetSha256 !== 'string' || !/^[0-9a-f]{64}$/.test(manifest.datasetSha256)) {
    throw new CaptureUsageError('manifest.datasetSha256 must be the SHA-256 of dataset.json.');
  }
  const policy = manifest.requestPolicy;
  if (!policy || policy.anonymous !== true || !Number.isInteger(policy.maxRequestsPerSecond)
      || policy.maxRequestsPerSecond < 1) {
    throw new CaptureUsageError('manifest.requestPolicy must describe anonymous GET capture.');
  }
  const countKeys = [
    'characters', 'scenes', 'sceneTurns', 'wikiPages', 'wikiSections',
    'wikiCategories', 'forumThreads', 'forumPosts',
  ];
  if (!manifest.counts || typeof manifest.counts !== 'object') {
    throw new CaptureUsageError('manifest.counts is required.');
  }
  for (const key of countKeys) {
    const value = manifest.counts[key];
    if (!Number.isInteger(value) || value < 0) {
      throw new CaptureUsageError(`manifest.counts.${key} must be a non-negative integer.`);
    }
  }
  const entityKeys = ['characters', 'scenes', 'wikiPages', 'forumThreads'];
  if (!manifest.entities || typeof manifest.entities !== 'object') {
    throw new CaptureUsageError('manifest.entities is required.');
  }
  for (const key of entityKeys) {
    if (!Array.isArray(manifest.entities[key])) {
      throw new CaptureUsageError(`manifest.entities.${key} must be an array.`);
    }
    if (manifest.entities[key].some((id) => typeof id !== 'string' || !id)) {
      throw new CaptureUsageError(`manifest.entities.${key} must contain string ids.`);
    }
    if (new Set(manifest.entities[key]).size !== manifest.entities[key].length) {
      throw new CaptureUsageError(`manifest.entities.${key} contains duplicate ids.`);
    }
  }
  if (!Array.isArray(manifest.gaps)) throw new CaptureUsageError('manifest.gaps must be an array.');
  for (const gap of manifest.gaps) {
    if (!gap || typeof gap !== 'object' || typeof gap.family !== 'string'
        || typeof gap.endpoint !== 'string' || typeof gap.reason !== 'string') {
      throw new CaptureUsageError('Every manifest gap must contain family, endpoint, and reason.');
    }
    if (!Number.isInteger(gap.status) || gap.status < 0) {
      throw new CaptureUsageError('Gap status must be a non-negative integer.');
    }
  }
  const consistency = manifest.consistency;
  if (!consistency || typeof consistency.complete !== 'boolean'
      || consistency.observedInterval !== true || !Array.isArray(consistency.unresolvedChanges)) {
    throw new CaptureUsageError('manifest.consistency must include complete, observedInterval, and unresolvedChanges.');
  }
  const derivedComplete = manifest.gaps.length === 0 && consistency.unresolvedChanges.length === 0;
  if (consistency.complete !== derivedComplete) {
    throw new CaptureUsageError(
      'manifest.consistency.complete must match the observed gaps and unresolved changes.',
    );
  }
  if (!Array.isArray(manifest.requests) || manifest.requests.length === 0) {
    throw new CaptureUsageError('manifest.requests must contain at least one observed response.');
  }
  for (const request of manifest.requests) {
    if (!request || typeof request !== 'object' || typeof request.family !== 'string'
        || typeof request.url !== 'string' || !Number.isInteger(request.status)
        || !Number.isInteger(request.bytes) || request.bytes < 0
        || typeof request.sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(request.sha256)
        || (request.storedAs !== null && typeof request.storedAs !== 'string')) {
      throw new CaptureUsageError('Every manifest request must contain family, url, status, bytes, sha256, and storedAs.');
    }
  }
  return true;
}

function validateDataset(dataset, manifest) {
  validateManifest(manifest);
  if (!dataset || typeof dataset !== 'object' || Array.isArray(dataset)) {
    throw new CaptureUsageError('dataset.json must be an object.');
  }
  if (dataset.schemaVersion !== SCHEMA_VERSION) {
    throw new CaptureUsageError(`dataset.schemaVersion must be ${SCHEMA_VERSION}.`);
  }
  if (dataset.origin !== manifest.origin) throw new CaptureUsageError('dataset.origin must match manifest.origin.');
  if (typeof dataset.capturedAt !== 'string' || Number.isNaN(Date.parse(dataset.capturedAt))) {
    throw new CaptureUsageError('dataset.capturedAt must be an ISO timestamp.');
  }
  const arrays = ['characters', 'scenes', 'wikiPages', 'wikiSections', 'wikiCategories'];
  for (const key of arrays) {
    if (!Array.isArray(dataset[key])) throw new CaptureUsageError(`dataset.${key} must be an array.`);
  }
  if (!dataset.forum || typeof dataset.forum !== 'object') {
    throw new CaptureUsageError('dataset.forum is required.');
  }
  for (const key of ['categories', 'threads']) {
    if (!Array.isArray(dataset.forum[key])) throw new CaptureUsageError(`dataset.forum.${key} must be an array.`);
  }
  if (!dataset.forum.postsByThread || typeof dataset.forum.postsByThread !== 'object'
      || Array.isArray(dataset.forum.postsByThread)) {
    throw new CaptureUsageError('dataset.forum.postsByThread must be an object.');
  }

  const characterIds = assertUniqueEntityList('dataset.characters', dataset.characters, characterId);
  const sceneIds = assertUniqueEntityList('dataset.scenes', dataset.scenes, sceneId);
  const pageIds = assertUniqueEntityList('dataset.wikiPages', dataset.wikiPages, pageId);
  const threadIds = assertUniqueEntityList('dataset.forum.threads', dataset.forum.threads, forumThreadId);
  assertUniqueEntityList('dataset.wikiSections', dataset.wikiSections, sectionId);
  assertUniqueEntityList('dataset.wikiCategories', dataset.wikiCategories, categoryKey);
  assertUniqueEntityList('dataset.forum.categories', dataset.forum.categories, forumCategoryId);

  const counts = {
    characters: dataset.characters.length,
    scenes: dataset.scenes.length,
    sceneTurns: dataset.scenes.reduce((total, scene) => total + (Array.isArray(scene.turns) ? scene.turns.length : 0), 0),
    wikiPages: dataset.wikiPages.length,
    wikiSections: dataset.wikiSections.length,
    wikiCategories: dataset.wikiCategories.length,
    forumThreads: dataset.forum.threads.length,
    forumPosts: Object.values(dataset.forum.postsByThread)
      .reduce((total, posts) => total + (Array.isArray(posts) ? posts.length : 0), 0),
  };
  for (const [key, value] of Object.entries(counts)) {
    if (manifest.counts[key] !== value) {
      throw new CaptureUsageError(`manifest.counts.${key} does not match dataset.json.`);
    }
  }

  const entityChecks = [
    ['characters', characterIds],
    ['scenes', sceneIds],
    ['wikiPages', pageIds],
    ['forumThreads', threadIds],
  ];
  for (const [key, ids] of entityChecks) {
    const listed = manifest.entities[key];
    if (listed.length !== ids.size) {
      throw new CaptureUsageError(`manifest.entities.${key} does not match dataset.json.`);
    }
    for (const id of listed) {
      if (!ids.has(id)) throw new CaptureUsageError(`manifest.entities.${key} lists an entity missing from dataset.json.`);
    }
  }

  const postKeys = Object.keys(dataset.forum.postsByThread);
  if (postKeys.length !== threadIds.size) {
    throw new CaptureUsageError('dataset.forum.postsByThread must have exactly one entry per captured thread.');
  }
  for (const [key, posts] of Object.entries(dataset.forum.postsByThread)) {
    if (!threadIds.has(key)) throw new CaptureUsageError(`postsByThread contains an uncaptured thread ${key}.`);
    if (!Array.isArray(posts)) throw new CaptureUsageError(`postsByThread.${key} must be an array.`);
    const thread = dataset.forum.threads.find((record) => forumThreadId(record) === key);
    if (!thread) throw new CaptureUsageError(`postsByThread.${key} has no matching captured thread.`);
    if (!Number.isInteger(thread.postsCount) || thread.postsCount < 0) {
      throw new CaptureUsageError(
        `Captured thread ${key} must include a non-negative integer postsCount.`,
      );
    }
    const ids = new Set();
    for (const post of posts) {
      const id = forumPostId(post);
      if (typeof id !== 'string' || !id || ids.has(id)) {
        throw new CaptureUsageError(`postsByThread.${key} contains missing or duplicate post ids.`);
      }
      if (typeof post.threadId !== 'string' || post.threadId.toLowerCase() !== key.toLowerCase()) {
        throw new CaptureUsageError(`postsByThread.${key} contains a post from a different thread.`);
      }
      ids.add(id);
    }
    const visiblePosts = visibleForumPostCount(posts);
    if (visiblePosts !== thread.postsCount) {
      throw new CaptureUsageError(
        `Captured thread ${key} has postsCount ${thread.postsCount} but ${visiblePosts} visible captured posts.`,
      );
    }
  }
  return true;
}

async function validateCaptureDirectory(directory) {
  const base = path.resolve(directory);
  const manifest = JSON.parse(await fsp.readFile(path.join(base, 'manifest.json'), 'utf8'));
  const datasetBytes = await fsp.readFile(path.join(base, 'dataset.json'));
  const dataset = JSON.parse(datasetBytes.toString('utf8'));
  validateDataset(dataset, manifest);
  if (sha256(datasetBytes) !== manifest.datasetSha256) {
    throw new CaptureUsageError('dataset.json does not match manifest.datasetSha256.');
  }
  for (const request of manifest.requests) {
    if (!request.storedAs) continue;
    const target = path.resolve(base, request.storedAs);
    if (!target.startsWith(`${base}${path.sep}`)) {
      throw new CaptureUsageError('A stored response path escaped the capture directory.');
    }
    const bytes = await fsp.readFile(target);
    if (bytes.length !== request.bytes || sha256(bytes) !== request.sha256) {
      throw new CaptureUsageError(`Stored response ${request.storedAs} does not match its manifest hash.`);
    }
  }
  return { manifest, dataset };
}

async function runCapture(rawOptions = {}) {
  const options = normalizeCaptureOptions(rawOptions);
  const plan = capturePlan(options);
  assertOutputPathAvailable(options.outputDir);
  if (rawOptions.dryRun === true) {
    return { dryRun: true, ok: true, exitCode: 0, plan, origin: options.origin, outputDir: options.outputDir };
  }

  await createOutputDirectory(options.outputDir);
  const session = new CaptureSession(options);
  let fatal = null;

  try {
    await captureAll(session);
  } catch (error) {
    fatal = error;
    session.recordFatal(error);
  }

  if (!fatal && options.skipRecheck !== true) {
    try {
      await recheckAll(session);
    } catch (error) {
      fatal = error;
      session.recordFatal(error);
    }
  }

  const { manifest, dataset } = await session.writeCapture();
  const complete = manifest.consistency.complete && !fatal;
  return {
    dryRun: false,
    ok: complete,
    exitCode: complete ? 0 : 1,
    manifest,
    dataset,
    outputDir: options.outputDir,
    plan,
  };
}

const USAGE = `Usage: node scripts/public-snapshot-fetch.js --output <new-directory> [options]

Anonymous, read-only capture of the Aetherverse public API.

Options:
  --origin <url>              Capture origin (default: ${DEFAULT_ORIGIN})
  --output <directory>        New capture directory under ${PRIVATE_CAPTURE_ROOT} (required)
  --max-requests <count>      Total HTTP attempt budget (default: ${DEFAULT_MAX_REQUESTS})
  --dry-run                   Validate arguments and print the plan; no network, no files
  --allow-loopback-http       Test-only: allow http:// on a loopback host
  --allow-test-output         Test-only: allow an output path outside the private root;
                              refuses non-loopback origins
  --help                      Show this help

A normal capture must be created inside the private, Git-ignored
.local/public-snapshots directory. The test-only output override exists for
loopback fake-server tests and must not be used for a real capture.

The capture uses serial anonymous GET requests at least one second apart. It
never sends cookies or credentials, never follows off-origin redirects, and
records visibility gaps instead of treating them as empty success.
`;

function parseArgs(argv) {
  const options = {
    origin: undefined,
    output: undefined,
    maxRequests: undefined,
    dryRun: false,
    help: false,
    allowLoopbackHttp: false,
    allowTestOutput: false,
  };
  const seen = new Set();
  for (let index = 0; index < argv.length; index += 1) {
    let token = argv[index];
    if (!token.startsWith('--')) {
      throw new CaptureUsageError(`Unexpected argument: ${token}`);
    }
    let value;
    const equals = token.indexOf('=');
    if (equals !== -1) {
      value = token.slice(equals + 1);
      token = token.slice(0, equals);
    }
    if (seen.has(token)) throw new CaptureUsageError(`Duplicate option: ${token}`);
    seen.add(token);

    if (token === '--help') {
      options.help = true;
      if (value !== undefined) throw new CaptureUsageError('--help does not take a value.');
      continue;
    }
    if (token === '--dry-run') {
      options.dryRun = true;
      if (value !== undefined) throw new CaptureUsageError('--dry-run does not take a value.');
      continue;
    }
    if (token === '--allow-loopback-http') {
      options.allowLoopbackHttp = true;
      if (value !== undefined) throw new CaptureUsageError('--allow-loopback-http does not take a value.');
      continue;
    }
    if (token === '--allow-test-output') {
      options.allowTestOutput = true;
      if (value !== undefined) throw new CaptureUsageError('--allow-test-output does not take a value.');
      continue;
    }
    if (!['--origin', '--output', '--max-requests'].includes(token)) {
      throw new CaptureUsageError(`Unknown option: ${token}`);
    }
    if (value === undefined) {
      index += 1;
      value = argv[index];
    }
    if (value === undefined || value === '') {
      throw new CaptureUsageError(`${token} requires a value.`);
    }
    if (value.startsWith('--')) {
      throw new CaptureUsageError(`${token} requires a value.`);
    }
    if (token === '--origin') options.origin = value;
    else if (token === '--output') options.output = value;
    else options.maxRequests = value;
  }
  return options;
}

function printPlan(plan, stream) {
  stream.write('AetherversePublicCaptureV1 plan\n');
  stream.write(`origin: ${plan.origin}\n`);
  stream.write(`output: ${plan.outputDir}\n`);
  stream.write(`maxRequests: ${plan.requestPolicy.maxRequests}\n`);
  stream.write('requests: anonymous GET only, serial, at least 1000 ms apart\n');
  stream.write('families:\n');
  for (const family of plan.families) stream.write(`  - ${family}\n`);
  stream.write('No network request was made and no output directory was created.\n');
}

async function main(argv, io = process) {
  let parsed;
  try {
    parsed = parseArgs(argv);
    if (parsed.help) {
      io.stdout.write(USAGE);
      return 0;
    }
    if (!parsed.output) throw new CaptureUsageError('--output is required.');
    const result = await runCapture({
      origin: parsed.origin,
      outputDir: parsed.output,
      maxRequests: parsed.maxRequests,
      dryRun: parsed.dryRun,
      allowLoopbackHttp: parsed.allowLoopbackHttp,
      allowTestOutput: parsed.allowTestOutput,
    });
    if (result.dryRun) {
      printPlan(result.plan, io.stdout);
      return 0;
    }
    const counts = result.manifest.counts;
    io.stdout.write(`capture: ${result.manifest.captureId}\n`);
    io.stdout.write(`output: ${result.outputDir}\n`);
    io.stdout.write(`counts: characters=${counts.characters} scenes=${counts.scenes} sceneTurns=${counts.sceneTurns} wikiPages=${counts.wikiPages} wikiSections=${counts.wikiSections} wikiCategories=${counts.wikiCategories} forumThreads=${counts.forumThreads} forumPosts=${counts.forumPosts}\n`);
    io.stdout.write(`gaps: ${result.manifest.gaps.length}; unresolvedChanges: ${result.manifest.consistency.unresolvedChanges.length}; complete: ${result.manifest.consistency.complete}\n`);
    if (!result.ok) io.stderr.write('capture is incomplete; inspect manifest.json gaps and consistency.unresolvedChanges.\n');
    return result.exitCode;
  } catch (error) {
    const code = error instanceof CaptureUsageError ? 2 : 1;
    io.stderr.write(`public-snapshot-fetch: ${error.message}\n`);
    return code;
  }
}

module.exports = {
  DEFAULT_ORIGIN,
  DEFAULT_MAX_REQUESTS,
  PRIVATE_CAPTURE_ROOT,
  SCHEMA_VERSION,
  CaptureFatalError,
  CaptureHttpError,
  CaptureUsageError,
  capturePlan,
  classifyEndpoint,
  findSensitiveKey,
  main,
  makeCaptureId,
  normalizeCaptureOptions,
  normalizeOrigin,
  parseArgs,
  parseRetryAfter,
  runCapture,
  validateCaptureDirectory,
  validateDataset,
  validateManifest,
};
