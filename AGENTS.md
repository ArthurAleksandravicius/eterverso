# Working on Eterverso

## Start here

- Read `README.md` for setup, the code map, and current limitations. Inspect
  the current code before relying on an old chat or announcement.
- For the wiki/shared-state implementation, start with
  `docs/planning/EXECUTION.md` and its linked contracts/runbook. Continue from
  `docs/planning/EXECUTION_STATE.md`; planning review is not evidence that
  implementation milestones or their tests have passed.
- The site is called **aetherverse vault**. It supports a shared fictional
  universe through a forum, character profiles, and collaborative RPG scenes.
- The user is new to this project. Explain unfamiliar concepts in plain
  language and describe how they can verify a change. Keep updates concise.
- Preserve the Portuguese interface and existing RPG terminology unless the
  task explicitly requests changes to them.
- Make focused changes that fit the existing implementation. Avoid bundling
  unrelated rewrites, framework migrations, or dependency upgrades.

## Architecture and persistence

- `index.html` is the page shell; `app.js` renders screens, manages browser
  state, and calls the API. `editor.js` implements the rich-text editor;
  `style.css` defines the appearance.
- `server.js` serves static files and implements authentication, authorization,
  API routes, and SQL using Express and the `postgres` client.
- `db/schema.ts`, `db/relations.ts`, and `drizzle/` provide Drizzle schema and
  migration tooling. Runtime server queries do not use `db/index.ts`.
- Forum topics, replies, and some administration actions still use browser
  localStorage. Accounts, server-backed characters, scenes, and scene turns
  use PostgreSQL. Do not describe local-only actions as shared persistence.
- Character and scene lists can combine local examples with database records.
  Local records use numeric IDs; database records use UUID strings. Preserve
  this distinction when changing lookup, editing, or deletion behavior.
- The server still creates some structures during startup. Drizzle schema
  definitions and snapshots are not fully aligned with these additions.
  Inspect generated SQL carefully; do not apply unrelated generated changes.
- Enforce shared-data permissions on the server. Browser role checks control
  the interface but cannot substitute for server authorization.

## Development environment

- Use Node.js 24, selected by `.nvmrc`, and the committed npm lockfile.
- Run `nvm use` before npm commands. If nvm is not loaded in a shell, load the
  user's existing nvm installation or use an available Node 24 executable.
- Install dependencies with `npm ci`.
- Check for an existing `.env` before creating one. Never overwrite working
  credentials or include secrets in output, commits, or documentation.
- The provided Compose configuration creates an isolated PostgreSQL 17
  development database on `127.0.0.1:55432` with a persistent named volume.
- Start it with `docker compose up -d --wait`, apply migrations with
  `npm run db:migrate`, and start the site with `npm run dev`.
- The default site address is `http://localhost:3000`. Check whether a server
  is already running before launching another instance on that port.
- Use a development database for setup and smoke checks. Startup executes
  schema updates, so starting the server is not a read-only database action.
- Do not remove the database volume as routine setup or cleanup.

## Verification

- There are currently no npm test or lint scripts. Do not report them as run.
- For JavaScript changes, run `node --check` on the changed JavaScript files.
  Run `git diff --check` for whitespace errors.
- Verify affected user flows. For UI changes, inspect the actual screen in a
  browser. For API or persistence changes, check request responses, permission
  failures, and that saved data survives a fresh read or page reload.
- Useful smoke checks include registration, login/logout, profile updates,
  and character, scene, and turn creation/editing/deletion as applicable.
  Use temporary records in the local development database and clean them up.
- Add meaningful automated tests when the change warrants them; do not create
  tests that merely repeat the implementation or test static documentation.
- Report what was checked and any remaining limitations or blockers.

## Git and contributions

- Inspect `git status` and the current branch before editing. Preserve changes
  made by the user or other work in progress.
- Work on a feature branch rather than `main`.
- `origin` is the user's fork, `ArthurAleksandravicius/eterverso`.
  `upstream` is the original project, `Dilligent-Yard/eterverso`.
- Publish contribution branches to `origin`. Pull requests for the original
  project should target `Dilligent-Yard/eterverso:main`.
- Keep commits focused. Describe the concrete behavior changed and the
  relevant validation in pull requests.
- Keep durable project facts in versioned documentation. Do not assume that
  another chat has read the transcript of this conversation.
