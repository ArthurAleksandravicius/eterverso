'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const postgres = require('postgres');
const {
  SANDBOX,
  assertNoInheritedDatabaseUrl,
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
} = require('./public-sandbox-target');
const {
  TESTER_SPECS,
  applyImportPlan,
  buildImportPlan,
  inspectExistingTesters,
  parseTesterCredentials,
  readCapture,
  testerCredentialsContents,
} = require('./public-sandbox-import');

const ROOT = path.resolve(__dirname, '..');
const COMMANDS = new Set(['provision', 'migrate', 'import', 'start', 'stop', 'status', 'reset']);

// postgres.js parses `timestamp without time zone` through `new Date(value)`,
// which interprets the stored wall clock in the host timezone. The site's
// timezone-less columns store UTC wall time, so compare/read them as UTC.
const SANDBOX_POSTGRES_TYPES = {
  utcTimestamp: {
    to: 1184,
    from: [1082, 1114, 1184],
    serialize: (value) => (value instanceof Date ? value : new Date(value)).toISOString(),
    parse: (value) => {
      if (typeof value !== 'string') return value;
      if (/[zZ]$|[+-]\d{2}(?::?\d{2})?$/u.test(value)) return new Date(value);
      return new Date(`${value.replace(' ', 'T')}Z`);
    },
  },
};

function sandboxPostgres(sqlFactory, databaseUrl, options) {
  return sqlFactory(databaseUrl, Object.assign({
    prepare: false,
    connection: { timezone: 'UTC' },
    types: SANDBOX_POSTGRES_TYPES,
  }, options));
}

const USAGE = [
  'Usage: node scripts/public-sandbox.js <provision|migrate|import|start|stop|status> [options]',
  '  --capture DIR     private AetherversePublicCaptureV1 directory (import only)',
  '  --dry-run         validate and report without service, DDL, account, or content writes',
  '  --confirm NAME    explicit destructive reset confirmation (reset is not implemented)',
].join('\n');

function statePaths(root = ROOT) {
  const directory = path.join(root, '.local', 'public-sandbox');
  return {
    directory,
    credentials: path.join(directory, SANDBOX.CREDENTIALS_FILE),
    record: path.join(directory, SANDBOX.SERVICE_FILE),
    testers: path.join(directory, SANDBOX.TESTERS_FILE),
    reports: path.join(directory, SANDBOX.REPORTS_DIR),
  };
}

function parseCliArgs(argv) {
  if (!Array.isArray(argv)) throw new TypeError('argv must be an array.');
  if (argv.length === 1 && (argv[0] === '--help' || argv[0] === '-h')) return { help: true };
  const command = argv[0];
  if (!COMMANDS.has(command)) {
    throw publicError(`Unknown sandbox command. ${USAGE}`);
  }
  const options = { command, capture: null, dryRun: false, confirm: null, help: false };
  for (let index = 1; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--dry-run') {
      if (options.dryRun) throw publicError('--dry-run was supplied more than once.');
      if (!['provision', 'migrate', 'import'].includes(command)) {
        throw publicError(`--dry-run is not meaningful for ${command}.`);
      }
      options.dryRun = true;
      continue;
    }
    if (argument === '--capture' || argument === '--confirm') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw publicError(`${argument} requires an explicit value.`);
      index += 1;
      if (argument === '--capture') {
        if (command !== 'import') throw publicError('--capture is valid only for import.');
        if (options.capture !== null) throw publicError('--capture was supplied more than once.');
        options.capture = value;
      } else {
        if (command !== 'reset') throw publicError('--confirm is valid only for the explicit destructive reset command.');
        if (options.confirm !== null) throw publicError('--confirm was supplied more than once.');
        options.confirm = value;
      }
      continue;
    }
    throw publicError(`Unknown sandbox option ${argument}. ${USAGE}`);
  }
  if (command === 'import' && !options.capture) throw publicError('import requires --capture <directory>.');
  if (command === 'reset') {
    if (options.confirm !== SANDBOX.DATABASE) {
      throw publicError(`Reset requires --confirm ${SANDBOX.DATABASE}; no sandbox was changed.`);
    }
    throw publicError('Reset is not implemented. The sandbox is never dropped or reset implicitly.');
  }
  return options;
}

function stateExists(paths, fsImpl = fs) {
  const credentials = fsImpl.existsSync(paths.credentials);
  const record = fsImpl.existsSync(paths.record);
  if (credentials !== record) {
    throw publicError('Private sandbox state is incomplete; inspect .local/public-sandbox without replacing it.');
  }
  return credentials;
}

function composeArgs(root, paths, args) {
  return [
    'compose',
    '--project-name', SANDBOX.PROJECT,
    '-f', path.join(root, 'compose.sandbox.yaml'),
    '--env-file', paths.credentials,
    ...args,
  ];
}

function defaultComposeRunner(root, paths, args, execFileSyncImpl = execFileSync) {
  return execFileSyncImpl('docker', composeArgs(root, paths, args), {
    cwd: root,
    encoding: 'utf8',
    stdio: 'inherit',
  });
}

function generateCredentials(randomBytes = crypto.randomBytes, now = () => new Date()) {
  const password = randomBytes(32).toString('hex');
  const sessionSecret = randomBytes(32).toString('base64url');
  return {
    password,
    sessionSecret,
    instanceId: crypto.randomUUID(),
    createdAt: now().toISOString(),
  };
}

function credentialsFileContents(generated) {
  return [
    `ETERVERSO_SANDBOX_DB_PASSWORD=${generated.password}`,
    `ETERVERSO_SANDBOX_DATABASE_URL=postgres://${SANDBOX.ROLE}:${generated.password}@${SANDBOX.HOST}:${SANDBOX.DB_PORT}/${SANDBOX.DATABASE}`,
    `ETERVERSO_SANDBOX_SESSION_SECRET=${generated.sessionSecret}`,
    '',
  ].join('\n');
}

function serviceRecord(generated) {
  return {
    project: SANDBOX.PROJECT,
    service: SANDBOX.SERVICE,
    container: SANDBOX.CONTAINER,
    volume: SANDBOX.VOLUME,
    database: SANDBOX.DATABASE,
    role: SANDBOX.ROLE,
    host: SANDBOX.HOST,
    port: SANDBOX.DB_PORT,
    appPort: SANDBOX.APP_PORT,
    purpose: SANDBOX.PURPOSE,
    instanceId: generated.instanceId,
    createdAt: generated.createdAt,
  };
}

function ensurePrivateStateDirectory(root, fsImpl = fs) {
  const paths = statePaths(root);
  fsImpl.mkdirSync(paths.directory, { recursive: true, mode: 0o700 });
  fsImpl.chmodSync(paths.directory, 0o700);
  assertPrivateDirectory(paths.directory, fsImpl);
  return paths;
}

function writeInitialState(root, generated, fsImpl = fs) {
  const paths = ensurePrivateStateDirectory(root, fsImpl);
  writePrivateFile(paths.credentials, credentialsFileContents(generated), fsImpl);
  writePrivateJson(paths.record, serviceRecord(generated), fsImpl);
  return paths;
}

function existingTesterPasswords(paths, fsImpl = fs) {
  if (!fsImpl.existsSync(paths.testers)) return null;
  const bytes = readPrivateFile(paths.testers, fsImpl, 'private tester credential file', 16 * 1024);
  let contents;
  try {
    contents = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw publicError('The private tester credential file is not valid UTF-8.');
  }
  return parseTesterCredentials(contents);
}

function generateTesterPasswords(randomBytes = crypto.randomBytes) {
  return Object.fromEntries(TESTER_SPECS.map((spec) => [
    spec.key,
    randomBytes(24).toString('base64url'),
  ]));
}

async function resolveTargetForOperation({ root, fsImpl, execFileSyncImpl, environment, requireRunning = true }) {
  return resolveSandboxTarget({
    root,
    fsImpl,
    execFileSyncImpl,
    environment,
    requireRunning,
  });
}

async function verifyTargetConnection(sqlFactory, target) {
  const sql = sqlFactory(target.databaseUrl, {
    prepare: false,
    max: 1,
    connect_timeout: 5,
    idle_timeout: 5,
    connection: { timezone: 'UTC' },
  });
  try {
    await verifyConnectedIdentity(sql, target);
  } finally {
    await sql.end({ timeout: 5 }).catch(() => {});
  }
}

function assertExistingVolumeOwnership(execFileSyncImpl) {
  const volume = inspectVolume({ execFileSyncImpl, allowMissing: true });
  if (volume) assertOwnedVolume(volume, SANDBOX);
  return volume;
}

async function provision(options, dependencies) {
  const {
    root,
    fsImpl,
    execFileSyncImpl,
    environment,
    portChecker,
  } = dependencies;
  assertNoInheritedDatabaseUrl(environment);
  const paths = statePaths(root);
  const hasState = fsImpl.existsSync(paths.directory) ? stateExists(paths, fsImpl) : false;
  if (hasState) {
    readServiceRecord({ root, fsImpl });
    readCredentials({ root, fsImpl, record: readServiceRecord({ root, fsImpl }) });
  }
  const container = inspectContainer({ execFileSyncImpl });
  if (container) {
    const target = await resolveTargetForOperation({
      root, fsImpl, execFileSyncImpl, environment, requireRunning: false,
    });
    if (target.running) {
      // The permissive pass above distinguishes stopped from running. A
      // running container must still prove its runtime port binding before it
      // is reused or reported ready.
      const runningTarget = await resolveTargetForOperation({
        root, fsImpl, execFileSyncImpl, environment, requireRunning: true,
      });
      if (options.dryRun) {
        process.stdout.write(`Would reuse the owned ${runningTarget.project} sandbox at ${runningTarget.host}:${runningTarget.port}/${runningTarget.database}.\n`);
        return { dryRun: true, reused: true, target: runningTarget };
      }
      await verifyTargetConnection(dependencies.sqlFactory, runningTarget);
      process.stdout.write(`Owned sandbox already exists at ${runningTarget.host}:${runningTarget.port}/${runningTarget.database}; no credentials were regenerated.\n`);
      return { dryRun: false, reused: true, target: runningTarget };
    }
    if (options.dryRun) {
      if (!(await portChecker(SANDBOX.DB_PORT, SANDBOX.HOST))) {
        throw publicError(`The sandbox database port ${SANDBOX.DB_PORT} is already in use; refusing to occupy an unknown service.`);
      }
      process.stdout.write(`Would start the existing owned ${target.project} sandbox at ${target.host}:${target.port}/${target.database} without regenerating credentials.\n`);
      return { dryRun: true, reused: true, restarted: true, target };
    }
    if (!(await portChecker(SANDBOX.DB_PORT, SANDBOX.HOST))) {
      throw publicError(`The sandbox database port ${SANDBOX.DB_PORT} is already in use; refusing to occupy an unknown service.`);
    }
    process.stdout.write(`Starting the existing owned ${target.project} sandbox; credentials and volume are preserved.\n`);
    dependencies.composeRunner(root, paths, ['up', '-d', '--wait'], execFileSyncImpl);
    const started = await resolveTargetForOperation({ root, fsImpl, execFileSyncImpl, environment });
    await verifyTargetConnection(dependencies.sqlFactory, started);
    process.stdout.write(`Public sandbox database ready: ${started.database} at ${started.host}:${started.port} (project ${started.project}, instance ${started.instanceId}, volume ${started.volume}).\n`);
    return { dryRun: false, reused: true, restarted: true, target: started };
  }

  // A first provision has no volume yet; Docker will create it with the Compose
  // purpose label. If the named volume already exists, prove its label before
  // writing private state or starting a container on it.
  assertExistingVolumeOwnership(execFileSyncImpl);

  if (options.dryRun) {
    if (!(await portChecker(SANDBOX.DB_PORT, SANDBOX.HOST))) {
      throw publicError(`The sandbox database port ${SANDBOX.DB_PORT} is already in use; refusing to occupy an unknown service.`);
    }
    process.stdout.write(`Would provision ${SANDBOX.PROJECT} on ${SANDBOX.HOST}:${SANDBOX.DB_PORT}/${SANDBOX.DATABASE} with volume ${SANDBOX.VOLUME}.\n`);
    process.stdout.write('No service, credentials, instance record, DDL, accounts, or content would be written.\n');
    return { dryRun: true, reused: false };
  }

  if (!(await portChecker(SANDBOX.DB_PORT, SANDBOX.HOST))) {
    throw publicError(`The sandbox database port ${SANDBOX.DB_PORT} is already in use; refusing to occupy an unknown service.`);
  }
  let generated;
  if (hasState) {
    readServiceRecord({ root, fsImpl });
    readCredentials({ root, fsImpl, record: readServiceRecord({ root, fsImpl }) });
  } else {
    generated = generateCredentials(dependencies.randomBytes, dependencies.now);
    writeInitialState(root, generated, fsImpl);
  }
  process.stdout.write(`Provisioning ${SANDBOX.PROJECT} on ${SANDBOX.HOST}:${SANDBOX.DB_PORT}/${SANDBOX.DATABASE}.\n`);
  dependencies.composeRunner(root, paths, ['up', '-d', '--wait'], execFileSyncImpl);
  const target = await resolveTargetForOperation({ root, fsImpl, execFileSyncImpl, environment });
  await verifyTargetConnection(dependencies.sqlFactory, target);
  process.stdout.write(`Public sandbox database ready: ${target.database} at ${target.host}:${target.port} (project ${target.project}, instance ${target.instanceId}, volume ${target.volume}).\n`);
  return { dryRun: false, reused: false, target };
}

function runNodeScript(root, script, args, dependencies) {
  const environment = { ...dependencies.environment };
  delete environment.DATABASE_URL;
  return dependencies.runNode(
    process.execPath,
    [path.join(root, script), ...args],
    { cwd: root, env: environment, stdio: 'inherit' },
  );
}

async function migrate(options, dependencies) {
  const target = await resolveTargetForOperation(dependencies);
  if (options.dryRun) {
    process.stdout.write(`Would migrate the owned public sandbox ${target.database} (instance ${target.instanceId}) at ${target.host}:${target.port} using the committed drizzle journal.\n`);
    process.stdout.write('No service, DDL, accounts, or content would be written.\n');
    return { dryRun: true, target };
  }
  await verifyTargetConnection(dependencies.sqlFactory, target);
  process.stdout.write(`Migrating the owned public sandbox ${target.database} (instance ${target.instanceId}) at ${target.host}:${target.port}; development and test targets are not used.\n`);
  runNodeScript(dependencies.root, 'scripts/db-migrate.js', ['migrate', '--target=sandbox'], dependencies);
  runNodeScript(dependencies.root, 'scripts/db-migrate.js', ['preflight', '--target=sandbox'], dependencies);
  await verifyTargetConnection(dependencies.sqlFactory, target);
  process.stdout.write('Sandbox migration completed and readiness preflight passed.\n');
  return { dryRun: false, target };
}

function summarizePlan(plan) {
  const lines = [
    `Capture ${plan.capture.captureId} from ${plan.capture.origin} (${plan.capture.complete ? 'complete' : 'partial'}; ${plan.gaps.length} gap(s)).`,
    `Plan: ${plan.counts.characters} character(s), ${plan.counts.scenes} scene(s), ${plan.counts.sceneTurns} scene turn(s), ${plan.counts.wikiPages} wiki page(s), ${plan.counts.wikiSections} section(s), ${plan.counts.forumThreads} forum thread(s), ${plan.counts.forumPosts} post(s).`,
    `Local identities: ${plan.counts.publicAuthorPlaceholders} public author placeholder(s), ${plan.counts.missingAuthorFallbacks} missing-author fallback(s), ${TESTER_SPECS.length} synthetic tester(s), 1 reconstruction actor. Citations available from public DTOs: ${plan.counts.citations}.`,
  ];
  if (plan.gaps.length) {
    for (const gap of plan.gaps) {
      lines.push(`Gap: ${gap.family} ${gap.endpoint} returned ${gap.status}: ${gap.reason}.`);
    }
  }
  if (plan.normalizations.length) {
    lines.push('Normalizations:');
    for (const item of plan.normalizations) {
      const field = item.field ? ` field=${item.field}` : '';
      const authorId = item.authorId ? ` authorId=${item.authorId}` : '';
      const pageId = item.pageId ? ` pageId=${item.pageId}` : '';
      lines.push(`  - ${item.kind}${field}${authorId}${pageId}`);
    }
  }
  return `${lines.join('\n')}\n`;
}

async function importCapture(options, dependencies) {
  const capture = readCapture({ captureDirectory: options.capture, fsImpl: dependencies.fsImpl });
  const paths = statePaths(dependencies.root);
  const existingPasswords = existingTesterPasswords(paths, dependencies.fsImpl);
  let plan = buildImportPlan({
    capture,
    testerPasswords: existingPasswords,
    passwordHasher: dependencies.passwordHasher,
  });
  if (options.dryRun) {
    process.stdout.write(summarizePlan(plan));
    process.stdout.write('Dry-run validated the complete capture and manifest hashes; no database connection or content write was performed.\n');
    return { dryRun: true, plan };
  }

  const target = await resolveTargetForOperation({
    root: dependencies.root,
    fsImpl: dependencies.fsImpl,
    execFileSyncImpl: dependencies.execFileSyncImpl,
    environment: dependencies.environment,
  });
  const sql = sandboxPostgres(dependencies.sqlFactory, target.databaseUrl, {
    max: 1,
    connect_timeout: 5,
    idle_timeout: 5,
  });
  let generatedPasswords = null;
  try {
    await verifyConnectedIdentity(sql, target);
    const existingTesters = await inspectExistingTesters(sql, plan);
    if (existingTesters.length && !existingPasswords) {
      throw publicError('Synthetic tester accounts already exist but their private credential file is missing; refusing to generate replacement passwords.');
    }
    if (!existingPasswords) {
      generatedPasswords = generateTesterPasswords(dependencies.randomBytes);
      plan = buildImportPlan({
        capture,
        testerPasswords: generatedPasswords,
        passwordHasher: dependencies.passwordHasher,
      });
    }
    process.stdout.write(summarizePlan(plan));
    let wroteTesterFile = false;
    if (generatedPasswords) {
      if (dependencies.fsImpl.existsSync(paths.testers)) {
        existingTesterPasswords(paths, dependencies.fsImpl);
        process.stdout.write('An existing private tester credential file appeared during import; it was preserved and not overwritten.\n');
      } else {
        writePrivateFile(paths.testers, testerCredentialsContents(generatedPasswords), dependencies.fsImpl);
        wroteTesterFile = true;
      }
    }
    const result = await applyImportPlan({
      plan,
      sql,
      verifyIdentity: (transaction) => verifyConnectedIdentity(transaction, target),
    });
    await verifyConnectedIdentity(sql, target);
    process.stdout.write(
      `Sandbox import complete: ${result.inserted} record(s) inserted, ${result.unchanged} unchanged, noop=${result.noop}. `
      + 'The local reconstruction actor is labelled; public roles were not imported as authority.\n',
    );
    if (wroteTesterFile) {
      process.stdout.write(`Synthetic tester credentials were written privately to ${path.relative(dependencies.root, paths.testers)} (mode 600).\n`);
    }
    return { dryRun: false, plan, result, target };
  } finally {
    await sql.end({ timeout: 5 }).catch(() => {});
  }
}

function waitForListening(server) {
  return new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
}

function defaultHttpGet(url, timeoutMs = 5_000) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, { timeout: timeoutMs }, (response) => {
      response.resume();
      resolve(response.statusCode);
    });
    request.once('timeout', () => request.destroy(new Error('Sandbox readiness request timed out.')));
    request.once('error', reject);
  });
}

async function startSandbox(options, dependencies) {
  const target = await resolveTargetForOperation(dependencies);
  if (!(await dependencies.portChecker(target.appPort, SANDBOX.HOST))) {
    throw publicError(`The sandbox app port ${target.appPort} is already in use; refusing to occupy an unknown service.`);
  }
  const config = dependencies.readConfig({
    DATABASE_URL: target.databaseUrl,
    SESSION_SECRET: target.sessionSecret,
    PORT: String(target.appPort),
    APP_ORIGIN: `http://${SANDBOX.HOST}:${target.appPort}`,
  });
  const sql = sandboxPostgres(dependencies.sqlFactory, config.databaseUrl);
  let server;
  try {
    try {
      await verifyConnectedIdentity(sql, target);
    } catch (error) {
      await sql.end({ timeout: 5 }).catch(() => {});
      throw publicError(`Sandbox identity check failed: ${error.message}`);
    }
    try {
      await dependencies.verifySchemaReadiness(sql, { rootDirectory: dependencies.root });
    } catch (error) {
      await sql.end({ timeout: 5 }).catch(() => {});
      throw publicError(`Sandbox schema readiness failed: ${error.message}`);
    }
    const app = dependencies.createAppFactory({
      sql,
      config: {
        sessionSecret: config.sessionSecret,
        secureCookies: config.secureCookies,
        production: config.production,
        publicOrigin: config.publicOrigin,
        staticRoot: dependencies.root,
      },
    });
    server = app.listen(target.appPort, SANDBOX.HOST);
    await waitForListening(server);
    const status = await dependencies.httpGet(`http://${SANDBOX.HOST}:${target.appPort}/api/wiki-posts`);
    if (status !== 200) throw publicError(`The sandbox readiness check returned HTTP ${status}.`);
  } catch (error) {
    if (server) {
      await new Promise((resolve) => server.close(resolve)).catch(() => {});
    }
    await sql.end({ timeout: 5 }).catch(() => {});
    throw error;
  }

  process.stdout.write(`aetherverse vault public sandbox listening on http://${SANDBOX.HOST}:${target.appPort}.\n`);
  process.stdout.write(`Database ${target.database} (${target.project}, instance ${target.instanceId}, volume ${target.volume}); independent local session secret; writes stay on this loopback origin.\n`);
  if (dependencies.installSignalHandlers !== false) {
    const shutdown = (signal) => {
      process.stdout.write(`Stopping the owned public sandbox app (${signal}).\n`);
      server.close(() => {
        sql.end({ timeout: 10 }).catch(() => {});
      });
    };
    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));
  }
  return { target, server, sql };
}

async function stopSandbox(options, dependencies) {
  const paths = statePaths(dependencies.root);
  readServiceRecord({ root: dependencies.root, fsImpl: dependencies.fsImpl });
  const container = inspectContainer({ execFileSyncImpl: dependencies.execFileSyncImpl });
  if (!container) {
    process.stdout.write('No owned public sandbox container is present; the named volume was not touched.\n');
    return { stopped: false };
  }
  const target = await resolveTargetForOperation({
    root: dependencies.root,
    fsImpl: dependencies.fsImpl,
    execFileSyncImpl: dependencies.execFileSyncImpl,
    environment: {},
    requireRunning: false,
  });
  process.stdout.write(`Stopping only ${target.project} (${target.container}); the named volume ${target.volume} is preserved.\n`);
  dependencies.composeRunner(dependencies.root, paths, ['down'], dependencies.execFileSyncImpl);
  return { stopped: true, target };
}

async function statusSandbox(options, dependencies) {
  const paths = statePaths(dependencies.root);
  const hasState = dependencies.fsImpl.existsSync(paths.directory)
    ? stateExists(paths, dependencies.fsImpl)
    : false;
  if (!hasState) {
    process.stdout.write('Public sandbox is not provisioned.\n');
    return { provisioned: false };
  }
  const record = readServiceRecord({ root: dependencies.root, fsImpl: dependencies.fsImpl });
  readCredentials({ root: dependencies.root, fsImpl: dependencies.fsImpl, record });
  const container = inspectContainer({ execFileSyncImpl: dependencies.execFileSyncImpl });
  if (!container) {
    process.stdout.write(`Public sandbox ${record.project} is provisioned but its owned container is not running; volume ${record.volume} remains.\n`);
    return { provisioned: true, running: false, record };
  }
  const target = await resolveTargetForOperation({
    root: dependencies.root,
    fsImpl: dependencies.fsImpl,
    execFileSyncImpl: dependencies.execFileSyncImpl,
    environment: {},
    requireRunning: false,
  });
  if (!target.running) {
    process.stdout.write(`Public sandbox ${target.project} is provisioned but its owned container is stopped; volume ${target.volume} remains.\n`);
    return { provisioned: true, running: false, target };
  }
  // A running container must pass the strict runtime-port guard before status
  // reports it as running; requireRunning:false is only for stopped targets.
  const runningTarget = await resolveTargetForOperation({
    root: dependencies.root,
    fsImpl: dependencies.fsImpl,
    execFileSyncImpl: dependencies.execFileSyncImpl,
    environment: {},
    requireRunning: true,
  });
  const appPortFree = await dependencies.portChecker(runningTarget.appPort, SANDBOX.HOST);
  process.stdout.write(`Public sandbox ${runningTarget.project} is running: database ${runningTarget.database} at ${runningTarget.host}:${runningTarget.port}, instance ${runningTarget.instanceId}, volume ${runningTarget.volume}, app port ${runningTarget.appPort} (${appPortFree ? 'free' : 'in use'}).\n`);
  return { provisioned: true, running: true, target: runningTarget, appPortFree };
}

function defaultDependencies(overrides = {}) {
  const environment = overrides.environment || process.env;
  return {
    root: overrides.root || ROOT,
    fsImpl: overrides.fsImpl || fs,
    execFileSyncImpl: overrides.execFileSyncImpl || execFileSync,
    sqlFactory: overrides.sqlFactory || postgres,
    portChecker: overrides.portChecker || ((port, host) => canListen({ port, host })),
    composeRunner: overrides.composeRunner || defaultComposeRunner,
    runNode: overrides.runNode || execFileSync,
    randomBytes: overrides.randomBytes || crypto.randomBytes,
    now: overrides.now || (() => new Date()),
    passwordHasher: overrides.passwordHasher,
    environment,
    verifySchemaReadiness: overrides.verifySchemaReadiness || require('../server').verifySchemaReadiness,
    readConfig: overrides.readConfig || require('../server').readConfig,
    createAppFactory: overrides.createAppFactory || require('../server/app').createApp,
    httpGet: overrides.httpGet || defaultHttpGet,
    installSignalHandlers: overrides.installSignalHandlers !== false,
  };
}

async function main(argv = process.argv.slice(2), overrides = {}) {
  const options = parseCliArgs(argv);
  if (options.help) {
    process.stdout.write(`${USAGE}\n`);
    return null;
  }
  if (Number(process.versions.node.split('.')[0]) !== 24) {
    throw publicError('The public sandbox lifecycle requires Node.js 24.');
  }
  const dependencies = defaultDependencies(overrides);
  if (options.command === 'provision') return provision(options, dependencies);
  if (options.command === 'migrate') return migrate(options, dependencies);
  if (options.command === 'import') return importCapture(options, dependencies);
  if (options.command === 'start') return startSandbox(options, dependencies);
  if (options.command === 'stop') return stopSandbox(options, dependencies);
  if (options.command === 'status') return statusSandbox(options, dependencies);
  throw publicError('Unsupported sandbox command.');
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`${error && error.safeToPrint
      ? error.message
      : 'Public sandbox lifecycle failed; database details, credentials and content are withheld.'}\n`);
    process.exitCode = 1;
  });
}

module.exports = {
  USAGE,
  SANDBOX_POSTGRES_TYPES,
  composeArgs,
  credentialsFileContents,
  defaultDependencies,
  existingTesterPasswords,
  generateCredentials,
  generateTesterPasswords,
  importCapture,
  main,
  migrate,
  parseCliArgs,
  provision,
  sandboxPostgres,
  serviceRecord,
  startSandbox,
  statePaths,
  statusSandbox,
  stopSandbox,
};
