/**
 * Aetherverse Vault — Servidor backend principal (TypeScript)
 *
 * Express + PostgreSQL (via `postgres` com prepare: false) + Drizzle schema
 * Reutiliza o contrato de inicialização canônico de `server.js`:
 *  - Verificação de migrações e colunas antes de criar o app
 *  - Nenhum DDL ou seed em tempo de execução
 *  - Encerramento gracioso (SIGINT/SIGTERM)
 */

import 'dotenv/config';
import path from 'path';
import postgres, { Sql } from 'postgres';
import { createApp } from '../server/app';
import { verifySchemaReadiness } from '../server.js';
import type { ServerConfig } from './types';

export * from './types';

const ROOT = path.resolve(__dirname, '..');

/**
 * Lê e valida as configurações de ambiente de forma segura e amigável.
 */
export function readServerConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL não definida. Configure o arquivo .env com a string de conexão PostgreSQL.');
  }
  if (!env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET não definida. Configure o arquivo .env com uma chave de sessão segura.');
  }

  let databaseUrl: URL;
  try {
    databaseUrl = new URL(env.DATABASE_URL);
  } catch {
    throw new Error('DATABASE_URL inválida. Configure uma URL PostgreSQL válida antes de iniciar.');
  }

  if (!['postgres:', 'postgresql:'].includes(databaseUrl.protocol)) {
    throw new Error('DATABASE_URL deve usar o protocolo postgres: ou postgresql:.');
  }

  const port = env.PORT === undefined || env.PORT === '' ? 3000 : Number(env.PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT deve ser um número inteiro entre 1 e 65535.');
  }

  const production = env.NODE_ENV === 'production' || !!env.RENDER;
  const configuredOrigin = env.APP_ORIGIN || '';
  let publicOrigin = configuredOrigin || `http://localhost:${port}`;
  try {
    const parsedOrigin = new URL(publicOrigin);
    publicOrigin = parsedOrigin.origin;
  } catch {
    throw new Error('APP_ORIGIN deve ser uma origem HTTP(S) válida sem credenciais ou caminho.');
  }

  return {
    databaseUrl: env.DATABASE_URL,
    sessionSecret: env.SESSION_SECRET,
    secureCookies: production,
    production,
    publicOrigin,
    port,
  };
}

export interface ServerInstance {
  app: any;
  server: any;
  sql: Sql;
  config: ServerConfig;
}

/**
 * Inicializa o backend TypeScript do Eterverso.
 */
export async function startServer(options: { rootDirectory?: string; env?: NodeJS.ProcessEnv } = {}): Promise<ServerInstance> {
  const rootDirectory = options.rootDirectory || ROOT;
  const config = readServerConfig(options.env || process.env);

  // prepare: false é obrigatório para compatibilidade com o Transaction Pooler do Supabase
  const sql: Sql = postgres(config.databaseUrl, {
    prepare: false,
    connection: { timezone: 'UTC' },
  });

  try {
    await verifySchemaReadiness(sql, { rootDirectory });
  } catch (error) {
    await sql.end({ timeout: 5 }).catch(() => {});
    throw error;
  }

  const app = createApp({
    sql,
    config: {
      sessionSecret: config.sessionSecret,
      secureCookies: config.secureCookies,
      production: config.production,
      publicOrigin: config.publicOrigin,
      staticRoot: rootDirectory,
    },
  });

  const server = app.listen(config.port);
  await new Promise<void>((resolve, reject) => {
    server.once('listening', () => resolve());
    server.once('error', (err: Error) => reject(err));
  });

  console.log(`Eterverso Vault online na porta ${config.port} (TypeScript / Node.js)`);

  const shutdown = async (signal: string) => {
    console.log(`Encerrando Eterverso (${signal})...`);
    await new Promise((res) => server.close(res));
    await sql.end({ timeout: 5 }).catch(() => {});
    process.exit(0);
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));

  return { app, server, sql, config };
}

// Se executado diretamente como script
if (require.main === module) {
  startServer().catch((err: Error) => {
    console.error('Falha ao iniciar o servidor:', err.message);
    process.exit(1);
  });
}
