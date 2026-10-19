# Eterverso / aetherverse vault

A Portuguese-language forum, character wiki, and collaborative text RPG site.
The browser uses plain JavaScript, HTML, and CSS; Express serves the site and
API; PostgreSQL stores accounts, characters, scenes, and scene turns.

## Local development

Requirements: Node.js 24 (use `nvm install` and `nvm use` if you have nvm),
npm, and Docker with Docker Compose.

```sh
nvm use
npm ci
cp .env-example .env
```

Edit `.env`: replace the password in both `POSTGRES_PASSWORD` and
`DATABASE_URL`, and set a separate random `SESSION_SECRET`. You can generate
each value with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
The `.env` file is ignored by Git. Use a development database, since startup
also executes schema updates.

```sh
docker compose up -d --wait
npm run db:migrate
npm run dev
```

Open <http://localhost:3000>. The PostgreSQL port is `55432`, bound to localhost.
To stop the app, press Ctrl+C. To stop the database, run `docker compose down`;
the named volume retains your data. On subsequent starts, run `nvm use`,
`docker compose up -d --wait`, and `npm run dev`.

Register an account through the site. New accounts are members. To test wiki
editing, promote only your own local development account, replacing the
username below:

```sh
docker compose exec db psql -U eterverso -d eterverso \
  -c "UPDATE users SET role = 'admin' WHERE username = 'your-local-username';"
```

Sign out and back in to refresh the role shown by the browser. The sample
Admin and moderator profiles embedded in `app.js` are local display data,
not usable database login accounts.

## Code map

| Path | Responsibility |
| --- | --- |
| `index.html` | Page shell and navigation |
| `app.js` | Screens, browser state, API calls, example content |
| `editor.js` | Rich-text editor |
| `style.css` | Layout and styling |
| `server.js` | Static files, authentication, permissions, API and SQL |
| `db/schema.ts`, `db/relations.ts` | Drizzle table and relation definitions |
| `drizzle/` | Versioned database migrations |

Runtime queries use the `postgres` client directly in `server.js`.
Drizzle provides schema and migration tooling; the server does not use
`db/index.ts` for its queries.

## Current limitations

- Forum topics, replies, and some administration actions still save only to
  the browser's localStorage. They are not shared between devices.
- Character and scene lists can merge database records with local examples.
  Local records have numeric IDs; database records use UUID strings.
- `server.js` still creates the scene table and extra character columns at
  startup. The Drizzle schema and snapshots do not yet describe all of those
  structures consistently. Review generated SQL before applying any future
  `db:generate` output. Migration `0006` is registered so a fresh database
  receives the existing scene and character additions through `db:migrate`.
- Images use external URLs. There is no bundled media upload service.
- There is no automated test suite in this repository yet.

## Contribution workflow

Work on a branch rather than `main`:

```sh
git switch -c your-name/short-change-description
# Make and check a small change.
git add path/to/changed-file
git commit -m "Describe the change"
git push -u origin HEAD
```

Then open a pull request from your branch to the original repository's `main`.
Pushing to the original repository requires write access. If you do not have
it, fork the repository on GitHub and push your branch to that fork, then open
a pull request from your fork to `Dilligent-Yard/eterverso:main`.

For a basic local check, confirm the home page loads, register and sign in,
and verify `/api/personagens` and `/api/wiki-posts` return JSON. If testing
as an administrator, create, edit, reload, and delete a test character or
scene to verify persistence.
