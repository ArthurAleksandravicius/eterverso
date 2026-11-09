# P0 — frozen execution contract

Status: P0 complete when this file exists. Read-only for all later packets except
the principal's integration update at the end. Do not edit it to make a worker's
implementation "fit"; raise a contract defect to the principal instead.

Starting state: branch `arthur/local-setup`, HEAD `18eb582`, uncommitted app/test
changes preserved. Baseline diff/hashes: `.local/execution-baseline/` (private).
Node 24.22.0 via `nvm use 24`. Development Compose DB exists but is stopped; the
isolated test DB listens on 127.0.0.1:55433. No app server should be assumed.
Reviewed `app.js` SHA-256 at plan time: `0df19855...f97e6d63` (recheck).

## Packet ownership (exclusive writes)

| Packet | May create/modify | Must not modify |
|---|---|---|
| F1 | `app.js`, `tests/browser/forum.spec.js`, `tests/browser/ui-drafts.spec.js`, `tests/unit/client-frontend.test.js` | every other file |
| D1 | `scripts/public-snapshot-fetch.js`, `scripts/lib/public-snapshot.js`, `tests/unit/public-snapshot-fetch.test.js` | `app.js`, server, Compose, `.env`, existing tests |
| D2 | `scripts/public-sandbox.js`, `scripts/public-sandbox-target.js`, `scripts/public-sandbox-import.js`, `compose.sandbox.yaml`, `tests/unit/public-sandbox-target.test.js`, `tests/unit/public-sandbox-import.test.js`; narrow sandbox-target addition in `scripts/db-migrate.js` only | `app.js`, client, server application code, fetch script, other parts of `db-migrate.js`, existing tests |
| I1 | `package.json` scripts, `docs/` runbook/handoff, disputed cross-file integration | captured content, other workers' live files |

All reports go only to
`docs/planning/interaction-audit/public-sandbox/<PACKET>-<slug>.md` and must not
contain captured lore, credentials, cookies, or raw production records.

## Capture manifest contract — `AetherversePublicCaptureV1`

Producer: D1. Consumer: D2. Location:
`.local/public-snapshots/<capture-id>/` (new directory, mode 700; files 600;
refuse overwrite).

```
manifest.json
{
  "schemaVersion": "AetherversePublicCaptureV1",
  "captureId": "...",
  "origin": "https://eterverso.onrender.com",
  "startedAt": "...", "finishedAt": "...",
  "requestPolicy": { "anonymous": true, "maxRequestsPerSecond": 1 },
  "counts": { "characters": 0, "scenes": 0, "sceneTurns": 0,
              "wikiPages": 0, "wikiSections": 0, "wikiCategories": 0,
              "forumThreads": 0, "forumPosts": 0 },
  "entities": {
    "characters": ["<public id>", ...],
    "scenes": ["<public id>", ...],
    "wikiPages": ["<public id>", ...],
    "forumThreads": ["<public id>", ...]
  },
  "gaps": [ { "family": "...", "endpoint": "...", "status": 0, "reason": "..." } ],
  "consistency": { "complete": true, "observedInterval": true,
                   "unresolvedChanges": [] },
  "requests": [ { "family": "...", "url": "...", "status": 200,
                  "bytes": 0, "sha256": "...", "storedAs": "raw/..." } ]
}
dataset.json
{
  "schemaVersion": "AetherversePublicCaptureV1",
  "origin": "...", "capturedAt": "...",
  "characters": [ <public GET /api/personagens `personagens[]` records> ],
  "scenes": [ <public GET /api/wiki-posts `wikiPosts[]` records, turns included> ],
  "wikiPages": [ <public GET /api/wiki/pages/:id `data` record, full body> ],
  "wikiSections": [ ... ], "wikiCategories": [ ... ],
  "forum": { "categories": [...], "threads": [...],
             "postsByThread": { "<thread id>": [ ... ] } }
}
```

Rules: preserve server field names/values exactly at this boundary; do not
"clean" content for display. `dataset.json` must be derivable byte-for-byte from
the raw responses plus documented pagination/selection. Every entity listed in
`entities` must appear exactly once in `dataset.json`. `gaps` is mandatory and
explicit; unsupported/error families cannot silently become empty arrays.
Forum content is captured only for `discussionThreadId` references found in
captured wiki pages, plus that thread's category and paginated visible posts.
Do not crawl unrelated forum content.

## Sandbox target contract

- Compose file `compose.sandbox.yaml`, project `eterverso-public-sandbox`,
  service `db`, image `postgres:17-alpine`, named volume
  `eterverso-public-sandbox-data`, port `127.0.0.1:55434:5432`, database
  `eterverso_public_sandbox`, role `eterverso_sandbox`, label
  `io.eterverso.purpose=public-sandbox`.
- Private state: `.local/public-sandbox/` (mode 700): `credentials.env` (600)
  with generated password and DSN; `service.json` (600) with project, container
  name, volume, database, role, port and an instance marker.
- Commands: `node scripts/public-sandbox.js provision|migrate|import|start|stop|status`
  with `--capture <dir>` for import, `--dry-run` for import/provision/migrate
  where meaningful, and explicit `--confirm <database>` for destructive reset
  (reset is out of initial scope; do not implement implicit reset).
- Every provisioning/migration/import/start operation validates: loopback host,
  expected port/database/role, project-owned container labels, private instance
  record, and no generic inherited `DATABASE_URL`. Recheck after connecting and
  before writes. Dry-run performs zero service/DDL/content writes.
- Migrations reuse the committed `drizzle/` history via a narrow sandbox target
  in `scripts/db-migrate.js`; do not duplicate DDL, spoof test metadata, or use
  runtime startup to create schema. If the existing wrapper cannot be extended
  safely, implement a guarded migration invocation in `scripts/public-sandbox.js`
  that uses the same journaled SQL files and readiness verification.
- Import is transactional for related entities, idempotent for an exact repeat,
  and refuses conflicting input or overwriting locally edited content. Generated
  tester accounts are local-only; public authors map to non-login placeholders.
  Never import production roles as authority, credentials, sessions or private
  records.

## F1 behavior contract

Implement exactly section 4 F-A/F-B/F-C of the plan, including its controlled
ordering tests and the "at least 40 posts / reply 41 / no skipped post 21"
pagination case. Preserve all earlier character/navigation fixes. No arbitrary
sleeps; no test that merely waits for a URL that is unchanged. If a browser test
cannot deterministically control ordering, add a focused unit/DOM harness rather
than weakening the acceptance claim.

## Stop conditions (all packets)

Stop and report instead of widening scope for: a needed schema change, a private
production record, credentials/configuration collision, an existing test that
must be weakened rather than fixed, a target guard that cannot be made provable,
or an overlap with another worker's owned files. Routine coding/test failures are
inside the packet; debug them.

## Required evidence in every report

Requested/actual model+effort, files touched, commands run with outcomes,
baseline failure reproduced, new regression added, remaining uncertainty, and
whether acceptance criteria are met. Do not claim observed model routing beyond
what the runtime exposes.

## Integration amendment — 9 November 2026

This section records post-freeze implementation decisions. It does not rewrite
the original contract above.

- `manifest.datasetSha256` is a required producer field and a required consumer
  check. It is the SHA-256 of the exact `dataset.json` bytes. The original
  manifest example above predates that field.
- The implemented verifier checks manifest shape, referential counts, forum
  closure, gaps/completeness consistency, request presence, private output
  location, and the dataset digest. It does **not** replay the raw-to-dataset
  selection or authenticate a maliciously rewritten manifest. A digest detects
  accidental dataset changes and inconsistency; it is not provenance proof.
  Import trust is therefore limited to a capture produced by this task's own
  fresh capture run, not an arbitrary supplied directory.
- Capture output is confined to `.local/public-snapshots/`; the
  `--allow-test-output` override is loopback-only. Normal production capture
  stays anonymous GET with the documented request budget.
- The live fix during E1 (tester username array `text[]` and UTC parsing of
  timezone-less timestamps) changed importer/runtime code, not this boundary
  contract. The review record and E1 report hold the evidence.
