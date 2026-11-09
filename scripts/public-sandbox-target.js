'use strict';

const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const { execFileSync } = require('node:child_process');
const dotenv = require('dotenv');

const ROOT = path.resolve(__dirname, '..');

const SANDBOX = Object.freeze({
  PROJECT: 'eterverso-public-sandbox',
  SERVICE: 'db',
  CONTAINER: '/eterverso-public-sandbox-db-1',
  VOLUME: 'eterverso-public-sandbox-data',
  DATABASE: 'eterverso_public_sandbox',
  ROLE: 'eterverso_sandbox',
  HOST: '127.0.0.1',
  DB_PORT: 55434,
  CONTAINER_DB_PORT: 5432,
  APP_PORT: 3001,
  PURPOSE: 'public-sandbox',
  PURPOSE_LABEL: 'io.eterverso.purpose',
  IMAGE: 'postgres:17-alpine',
  STATE_DIR: path.join(ROOT, '.local', 'public-sandbox'),
  COMPOSE_FILE: path.join(ROOT, 'compose.sandbox.yaml'),
  CREDENTIALS_FILE: 'credentials.env',
  SERVICE_FILE: 'service.json',
  TESTERS_FILE: 'testers.env',
  REPORTS_DIR: 'reports',
});

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u;
const HASH_RE = /^[a-f0-9]{64}$/u;
const MAX_PRIVATE_FILE_BYTES = 64 * 1024;

function publicError(message) {
  const error = new Error(message);
  error.safeToPrint = true;
  return error;
}

function assertPrivateDirectory(directory, fsImpl = fs, label = 'private sandbox state directory') {
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
    throw publicError(`The ${label} must be readable and writable only by its owner.`);
  }
  return stat;
}

function readPrivateFile(filePath, fsImpl = fs, label = 'private sandbox file', maxBytes = MAX_PRIVATE_FILE_BYTES) {
  assertPrivateDirectory(path.dirname(filePath), fsImpl, `${label} parent directory`);
  let pathStat;
  try {
    pathStat = fsImpl.lstatSync(filePath);
  } catch {
    throw publicError(`The ${label} is missing.`);
  }
  if (pathStat.isSymbolicLink() || !pathStat.isFile()) {
    throw publicError(`The ${label} must be a regular file.`);
  }
  if ((pathStat.mode & 0o777) !== 0o600 || pathStat.size < 1 || pathStat.size > maxBytes) {
    throw publicError(`The ${label} must be a non-empty private file (mode 600).`);
  }

  const constants = fsImpl.constants || fs.constants;
  if (!Number.isInteger(constants.O_NOFOLLOW)) {
    throw publicError('This runtime cannot safely read private sandbox state.');
  }
  let descriptor;
  try {
    descriptor = fsImpl.openSync(filePath, constants.O_RDONLY | constants.O_NOFOLLOW);
  } catch {
    throw publicError(`The ${label} could not be opened safely.`);
  }
  try {
    let openedStat;
    let bytes;
    try {
      openedStat = fsImpl.fstatSync(descriptor);
      if (!openedStat.isFile() || (openedStat.mode & 0o777) !== 0o600
          || openedStat.size !== pathStat.size || openedStat.size > maxBytes
          || (pathStat.dev !== undefined && openedStat.dev !== pathStat.dev)
          || (pathStat.ino !== undefined && openedStat.ino !== pathStat.ino)) {
        throw publicError(`The ${label} changed while it was being read.`);
      }
      bytes = fsImpl.readFileSync(descriptor);
    } catch (error) {
      if (error && error.safeToPrint) throw error;
      throw publicError(`The ${label} could not be read safely.`);
    }
    if (bytes.length !== openedStat.size) {
      throw publicError(`The ${label} changed while it was being read.`);
    }
    return bytes;
  } finally {
    try { fsImpl.closeSync(descriptor); } catch { /* Preserve the read result. */ }
  }
}

function parseJsonFile(filePath, fsImpl, label, maxBytes) {
  const bytes = readPrivateFile(filePath, fsImpl, label, maxBytes);
  let value;
  try {
    value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    throw publicError(`The ${label} is not valid UTF-8 JSON.`);
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw publicError(`The ${label} has an invalid shape.`);
  }
  return value;
}

function parseEnvFile(filePath, fsImpl, label) {
  const bytes = readPrivateFile(filePath, fsImpl, label, MAX_PRIVATE_FILE_BYTES);
  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw publicError(`The ${label} is not valid UTF-8.`);
  }
  try {
    return dotenv.parse(text);
  } catch {
    throw publicError(`The ${label} is invalid.`);
  }
}

function assertExactKeys(value, keys, label) {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    throw publicError(`The ${label} has an unsupported format.`);
  }
}

function assertTimestamp(value, label) {
  if (typeof value !== 'string' || !value || Number.isNaN(new Date(value).getTime())) {
    throw publicError(`The ${label} is invalid.`);
  }
  return value;
}

function assertServiceRecord(record) {
  assertExactKeys(record, [
    'project', 'service', 'container', 'volume', 'database', 'role', 'host',
    'port', 'appPort', 'purpose', 'instanceId', 'createdAt',
  ], 'sandbox service record');
  if (record.project !== SANDBOX.PROJECT
      || record.service !== SANDBOX.SERVICE
      || record.container !== SANDBOX.CONTAINER
      || record.volume !== SANDBOX.VOLUME
      || record.database !== SANDBOX.DATABASE
      || record.role !== SANDBOX.ROLE
      || record.host !== SANDBOX.HOST
      || record.port !== SANDBOX.DB_PORT
      || record.appPort !== SANDBOX.APP_PORT
      || record.purpose !== SANDBOX.PURPOSE) {
    throw publicError('The private sandbox service record does not describe the owned public sandbox.');
  }
  if (typeof record.instanceId !== 'string' || !UUID_RE.test(record.instanceId)) {
    throw publicError('The private sandbox instance marker is invalid.');
  }
  assertTimestamp(record.createdAt, 'private sandbox instance creation time');
  return record;
}

function readServiceRecord({ root = ROOT, fsImpl = fs } = {}) {
  const stateDirectory = path.join(root, '.local', 'public-sandbox');
  assertPrivateDirectory(stateDirectory, fsImpl);
  return assertServiceRecord(parseJsonFile(
    path.join(stateDirectory, SANDBOX.SERVICE_FILE), fsImpl, 'sandbox service record', MAX_PRIVATE_FILE_BYTES,
  ));
}

function assertDsnTarget(databaseUrl, expected = SANDBOX) {
  if (typeof databaseUrl !== 'string' || !databaseUrl.trim()) {
    throw publicError('The sandbox database URL is missing.');
  }
  let parsed;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    throw publicError('The sandbox database URL is invalid.');
  }
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
    throw publicError('The sandbox database must use PostgreSQL.');
  }
  if (parsed.hostname !== expected.HOST) {
    throw publicError('The sandbox database must be bound to the loopback host 127.0.0.1.');
  }
  if (Number(parsed.port || 5432) !== expected.DB_PORT) {
    throw publicError(`The sandbox database port must be ${expected.DB_PORT}.`);
  }
  if (parsed.search || parsed.hash) {
    throw publicError('The sandbox database URL must not carry query parameters or fragments.');
  }
  let database;
  let role;
  try {
    database = decodeURIComponent(parsed.pathname.replace(/^\//u, ''));
    role = decodeURIComponent(parsed.username);
  } catch {
    throw publicError('The sandbox database URL identity is invalid.');
  }
  if (database !== expected.DATABASE) {
    throw publicError(`The sandbox database name must be ${expected.DATABASE}.`);
  }
  if (role !== expected.ROLE) {
    throw publicError(`The sandbox database role must be ${expected.ROLE}.`);
  }
  if (!parsed.password) throw publicError('The sandbox database URL must contain its generated password.');
  if (database === 'eterverso' || database === 'eterverso_test'
      || role === 'eterverso' || role === 'eterverso_test'
      || [55432, 55433].includes(Number(parsed.port || 5432))) {
    throw publicError('The sandbox database URL matches a development or test target.');
  }
  return {
    database,
    role,
    host: parsed.hostname,
    port: Number(parsed.port || 5432),
    password: decodeURIComponent(parsed.password),
  };
}

function assertCredentials(credentials, record, expected = SANDBOX) {
  assertExactKeys(credentials, [
    'ETERVERSO_SANDBOX_DB_PASSWORD',
    'ETERVERSO_SANDBOX_DATABASE_URL',
    'ETERVERSO_SANDBOX_SESSION_SECRET',
  ], 'sandbox credentials file');
  const password = credentials.ETERVERSO_SANDBOX_DB_PASSWORD;
  if (typeof password !== 'string' || !/^[a-f0-9]{64}$/u.test(password)) {
    throw publicError('The generated sandbox database password is invalid; refusing to use it.');
  }
  const identity = assertDsnTarget(credentials.ETERVERSO_SANDBOX_DATABASE_URL, expected);
  if (identity.password !== password) {
    throw publicError('The sandbox database URL does not match its generated password.');
  }
  const sessionSecret = credentials.ETERVERSO_SANDBOX_SESSION_SECRET;
  if (typeof sessionSecret !== 'string' || sessionSecret.length < 32
      || sessionSecret.length > 256 || !/^[A-Za-z0-9_-]+$/u.test(sessionSecret)) {
    throw publicError('The independent sandbox session secret is invalid.');
  }
  if (record && (record.database !== identity.database || record.role !== identity.role
      || record.port !== identity.port || record.host !== identity.host)) {
    throw publicError('The sandbox credentials do not match the private instance record.');
  }
  return {
    databaseUrl: credentials.ETERVERSO_SANDBOX_DATABASE_URL,
    password,
    sessionSecret,
  };
}

function readCredentials({ root = ROOT, fsImpl = fs, record } = {}) {
  const stateDirectory = path.join(root, '.local', 'public-sandbox');
  assertPrivateDirectory(stateDirectory, fsImpl);
  return assertCredentials(parseEnvFile(
    path.join(stateDirectory, SANDBOX.CREDENTIALS_FILE), fsImpl, 'sandbox credentials file',
  ), record);
}

function assertNoInheritedDatabaseUrl(environment = process.env) {
  if (environment && Object.hasOwn(environment, 'DATABASE_URL')) {
    throw publicError('DATABASE_URL is inherited in the environment; the public sandbox refuses an ambient database target.');
  }
}

function inspectContainer({ execFileSyncImpl = execFileSync } = {}) {
  try {
    const output = execFileSyncImpl('docker', ['inspect', SANDBOX.CONTAINER], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const parsed = JSON.parse(output);
    return Array.isArray(parsed) && parsed.length === 1 ? parsed[0] : null;
  } catch {
    return null;
  }
}

function inspectVolume({
  execFileSyncImpl = execFileSync,
  volume = SANDBOX.VOLUME,
  allowMissing = false,
} = {}) {
  try {
    const output = execFileSyncImpl('docker', ['volume', 'inspect', volume], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const parsed = JSON.parse(output);
    return Array.isArray(parsed) && parsed.length === 1 ? parsed[0] : null;
  } catch (error) {
    if (allowMissing) {
      const stderr = error && error.stderr ? String(error.stderr) : '';
      const stdout = error && typeof error.stdout === 'string' ? error.stdout.trim() : '';
      if (stdout === '[]' || /no such volume/iu.test(stderr)) return null;
      throw publicError('The public sandbox volume could not be inspected; refusing to assume it is absent.');
    }
    return null;
  }
}

// Docker publishes 127.0.0.1:55434 -> container:5432. For a running container
// the runtime table reports the published mapping; for a stopped container
// Docker clears NetworkSettings.Ports and only HostConfig.PortBindings remains.
// The host binding proves the owned published address in both states, while the
// runtime table is an additional running-state check.
function assertOwnedPortBindings(bindings, expected, source) {
  const label = source === 'runtime' ? 'running container' : 'container host';
  if (!Array.isArray(bindings) || bindings.length === 0) {
    throw publicError(`The ${label} does not publish the owned loopback sandbox port.`);
  }
  const ownsPort = bindings.every((binding) => (
    binding && binding.HostIp === expected.HOST && Number(binding.HostPort) === expected.DB_PORT
  ));
  if (!ownsPort) {
    throw publicError(`The ${label} port binding does not match the owned loopback sandbox port ${expected.HOST}:${expected.DB_PORT}.`);
  }
}

function assertOwnedContainer(container, expected = SANDBOX, { requireRunning = true } = {}) {
  if (!container) {
    throw publicError('The owned public sandbox container is not present; run provision first.');
  }
  if (container.Name !== expected.CONTAINER) {
    throw publicError('The public sandbox container name does not match the owned project.');
  }
  if (requireRunning && (!container.State || container.State.Running !== true)) {
    throw publicError('The owned public sandbox container is not running.');
  }
  const labels = container.Config?.Labels || {};
  if (labels['com.docker.compose.project'] !== expected.PROJECT
      || labels['com.docker.compose.service'] !== expected.SERVICE
      || labels[expected.PURPOSE_LABEL] !== expected.PURPOSE) {
    throw publicError('The PostgreSQL container ownership labels do not match the public sandbox project.');
  }
  const image = container.Config?.Image;
  if (image !== expected.IMAGE && !String(image || '').startsWith(`${expected.IMAGE}@`)) {
    throw publicError('The owned container does not use the expected PostgreSQL 17 image.');
  }
  const mounts = Array.isArray(container.Mounts) ? container.Mounts : [];
  const dataMount = mounts.find((mount) => mount.Destination === '/var/lib/postgresql/data');
  if (!dataMount || dataMount.Type !== 'volume' || dataMount.Name !== expected.VOLUME) {
    throw publicError('The container does not mount the owned public sandbox volume; refusing an unrelated volume.');
  }
  const publishKey = `${expected.CONTAINER_DB_PORT}/tcp`;
  const hostBindings = container.HostConfig?.PortBindings || {};
  const hostKeys = Object.keys(hostBindings);
  if (hostKeys.length !== 1 || hostKeys[0] !== publishKey) {
    throw publicError('The container host port bindings do not match the owned loopback sandbox port.');
  }
  assertOwnedPortBindings(hostBindings[publishKey], expected, 'host');
  if (requireRunning) {
    assertOwnedPortBindings(container.NetworkSettings?.Ports?.[publishKey], expected, 'runtime');
  }
  return {
    container: expected.CONTAINER,
    volume: expected.VOLUME,
    project: expected.PROJECT,
    service: expected.SERVICE,
  };
}

// The volume mount name alone can be reused by an unrelated volume. Compose
// labels the owned volume with io.eterverso.purpose=public-sandbox; verify that
// read-only label when the runtime exposes it and refuse rather than assuming.
function assertOwnedVolume(volume, expected = SANDBOX) {
  if (!volume) {
    throw publicError('The owned public sandbox volume could not be inspected; refusing to assume volume ownership.');
  }
  if (volume.Name !== expected.VOLUME) {
    throw publicError('The inspected volume is not the owned public sandbox volume; refusing an unrelated volume.');
  }
  const labels = volume.Labels && typeof volume.Labels === 'object' ? volume.Labels : {};
  if (labels[expected.PURPOSE_LABEL] !== expected.PURPOSE) {
    throw publicError('The owned public sandbox volume is missing its ownership purpose label; refusing an unrelated volume.');
  }
  return { volume: expected.VOLUME };
}

function normalizeServerAddress(value) {
  if (typeof value !== 'string') return null;
  const address = value.trim().split('/')[0].split('%')[0];
  return net.isIP(address) ? address : null;
}

// PostgreSQL reports the address of the socket that accepted the connection:
// for a published Compose port this is the container-network address, not the
// host's 127.0.0.1. Accept only loopback, RFC1918, link-local, and IPv6 ULA or
// link-local address space when inspecting the connected server.
function isPrivateServerAddress(address) {
  const family = net.isIP(address);
  if (family === 4) {
    const octets = address.split('.').map(Number);
    return octets[0] === 10
      || octets[0] === 127
      || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31)
      || (octets[0] === 192 && octets[1] === 168)
      || (octets[0] === 169 && octets[1] === 254);
  }
  if (family === 6) {
    const lower = address.toLowerCase();
    if (lower === '::1') return true;
    if (lower.startsWith('::ffff:')) {
      const mapped = lower.slice('::ffff:'.length);
      return net.isIP(mapped) === 4 && isPrivateServerAddress(mapped);
    }
    const first = lower.split(':')[0];
    if (!first) return false;
    const hextet = Number.parseInt(first.padEnd(4, '0'), 16);
    return (hextet & 0xfe00) === 0xfc00 || (hextet & 0xffc0) === 0xfe80;
  }
  return false;
}

function containerNetworkAddresses(container) {
  const addresses = new Set();
  const add = (value) => {
    const address = normalizeServerAddress(value);
    if (address) addresses.add(address);
  };
  add(container?.NetworkSettings?.IPAddress);
  add(container?.NetworkSettings?.GlobalIPv6Address);
  const networks = container?.NetworkSettings?.Networks;
  if (networks && typeof networks === 'object') {
    for (const network of Object.values(networks)) {
      add(network?.IPAddress);
      add(network?.GlobalIPv6Address);
    }
  }
  return [...addresses];
}

function assertConnectedIdentityRow(row, target = SANDBOX) {
  if (!row || typeof row !== 'object') {
    throw publicError('The sandbox database identity could not be read.');
  }
  if (row.database !== target.database) {
    throw publicError('The connected database does not match the owned public sandbox.');
  }
  if (row.role !== target.role) {
    throw publicError('The connected database role does not match the owned public sandbox.');
  }
  const address = normalizeServerAddress(row.address);
  if (!address) {
    throw publicError('The sandbox database server address could not be verified.');
  }
  if (!isPrivateServerAddress(address)) {
    throw publicError('The connected database server address is not a private or container-network address; refusing a remote target.');
  }
  const expectedAddresses = Array.isArray(target.containerAddresses)
    ? target.containerAddresses.map(normalizeServerAddress).filter(Boolean)
    : [];
  if (expectedAddresses.length && !expectedAddresses.includes(address)) {
    throw publicError('The connected database server address does not match the owned sandbox container network.');
  }
  const expectedPort = SANDBOX.CONTAINER_DB_PORT;
  if (Number(row.port) !== expectedPort) {
    throw publicError(`The connected database server port must be the sandbox container port ${expectedPort}, not the published host port.`);
  }
  const version = Number(row.version);
  if (!Number.isInteger(version) || version < 170000 || version >= 180000) {
    throw publicError('The owned sandbox must run PostgreSQL 17.');
  }
  return { database: row.database, role: row.role, address, port: Number(row.port), version };
}

async function verifyConnectedIdentity(sql, target) {
  if (typeof sql !== 'function') {
    throw new TypeError('verifyConnectedIdentity requires an injected postgres client.');
  }
  const rows = await sql`
    SELECT current_database() AS database,
           current_user AS role,
           inet_server_addr()::text AS address,
           inet_server_port() AS port,
           current_setting('server_version_num') AS version`;
  return assertConnectedIdentityRow(rows[0], target);
}

function resolveSandboxTarget({
  root = ROOT,
  fsImpl = fs,
  execFileSyncImpl = execFileSync,
  environment = process.env,
  requireRunning = true,
} = {}) {
  assertNoInheritedDatabaseUrl(environment);
  const record = readServiceRecord({ root, fsImpl });
  const credentials = readCredentials({ root, fsImpl, record });
  const container = inspectContainer({ execFileSyncImpl });
  const containerOwnership = assertOwnedContainer(container, SANDBOX, { requireRunning });
  const volumeOwnership = assertOwnedVolume(inspectVolume({ execFileSyncImpl }), SANDBOX);
  const identity = assertDsnTarget(credentials.databaseUrl);
  return {
    project: record.project,
    service: record.service,
    container: record.container,
    volume: record.volume,
    database: identity.database,
    role: identity.role,
    host: identity.host,
    port: identity.port,
    containerPort: SANDBOX.CONTAINER_DB_PORT,
    appPort: record.appPort,
    instanceId: record.instanceId,
    databaseUrl: credentials.databaseUrl,
    sessionSecret: credentials.sessionSecret,
    ownership: { ...containerOwnership, ...volumeOwnership },
    containerAddresses: containerNetworkAddresses(container),
    running: container.State?.Running === true,
  };
}

function canListen({ port, host = SANDBOX.HOST, netImpl = net } = {}) {
  return new Promise((resolve) => {
    const server = netImpl.createServer();
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      try { server.close(); } catch { /* already closed */ }
      resolve(value);
    };
    server.once('error', () => finish(false));
    server.listen(port, host, () => finish(true));
  });
}

async function assertPortAvailable({ port, host = SANDBOX.HOST, netImpl = net, label = 'sandbox port' } = {}) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw publicError(`The ${label} is invalid.`);
  }
  if (!(await canListen({ port, host, netImpl }))) {
    throw publicError(`The ${label} ${port} is already in use; refusing to occupy an unknown service.`);
  }
  return port;
}

function writePrivateFile(filePath, contents, fsImpl = fs) {
  if (fsImpl.existsSync(filePath)) {
    throw publicError('Refusing to overwrite an existing private sandbox file.');
  }
  const directory = path.dirname(filePath);
  fsImpl.mkdirSync(directory, { recursive: true, mode: 0o700 });
  fsImpl.chmodSync(directory, 0o700);
  const temporary = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  fsImpl.writeFileSync(temporary, contents, { mode: 0o600, flag: 'wx' });
  fsImpl.chmodSync(temporary, 0o600);
  fsImpl.renameSync(temporary, filePath);
  fsImpl.chmodSync(filePath, 0o600);
  return filePath;
}

function writePrivateJson(filePath, value, fsImpl = fs) {
  return writePrivateFile(filePath, `${JSON.stringify(value, null, 2)}\n`, fsImpl);
}

module.exports = {
  SANDBOX,
  HASH_RE,
  UUID_RE,
  assertConnectedIdentityRow,
  assertCredentials,
  assertDsnTarget,
  assertNoInheritedDatabaseUrl,
  assertOwnedContainer,
  assertOwnedVolume,
  assertPortAvailable,
  assertPrivateDirectory,
  canListen,
  inspectContainer,
  inspectVolume,
  publicError,
  readCredentials,
  readPrivateFile,
  readServiceRecord,
  resolveSandboxTarget,
  verifyConnectedIdentity,
  writePrivateFile,
  writePrivateJson,
};
