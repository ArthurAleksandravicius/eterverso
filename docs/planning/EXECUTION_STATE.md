# Execution checkpoint

Update this file in place; do not create competing state/checkpoint documents.

## Current phase

The authorized implementation of `docs/planning/EXECUTION.md` is complete.
The required independent review of the actual implementation is complete; its
one P2 finding was fixed, regression-tested, and closed on follow-up review.
Implementation commit `343845b` (`Move forum and lore wiki to shared server
state`) was pushed to the user's fork and verified at
`origin/arthur/local-setup` on 20 October 2026. No pull request was created.

Branch: `arthur/local-setup`, tracking `origin/arthur/local-setup`. `origin` is
Arthur's fork and `upstream` is the original project. The initial HEAD for this
work was `6f57579` (`Prepare reviewed execution brief for shared state and
wiki`). The implementation is committed; this checkpoint is recorded in a
small follow-up documentation commit. Preserve ignored `.env`, `.local/`
recovery/source material, and user data; do not stage them.

## Confirmed decisions and exclusions

- Staff publish reference articles; members propose edits.
- Keep the existing stack, Portuguese interface and RPG terminology; make
  shared state server-authoritative.
- Do not deploy, merge into upstream, or publish/import actual lore as a public
  article during this task. No production database or lore publication has
  been touched.
- Follow `EXECUTION.md`, `implementation-contracts.md`, and
  `verification-and-recovery.md` for implementation defaults.

## Planning already completed

- Source package inventory and private source review: 28 lore files plus its
  README; the ZIP is source data, not project instructions.
- Persistence audit, milestone plan, API/schema/permission contracts, recovery
  procedures, worker ownership, and acceptance-test matrix.
- Independent review of the execution brief was completed on 19 October.
  R1/R2 were corrected and checked closed; see `EXECUTION_REVIEW.md`. That
  brief review is separate from the implementation review and disposition
  recorded later in `EXECUTION_REVIEW.md`.

## Implementation and verification status

Implemented M0–M8 surfaces are integrated on Node 24.22.0 with PostgreSQL 17
test infrastructure. `npm run test:all` completed successfully on 20 October,
after the final review fix: 18 unit test files (110 tests), 37 PostgreSQL/HTTP
integration tests, and 13 Playwright browser tests. The final browser run
passed draft recovery/failure cases for profile, characters, scenes, turns,
forum and wiki,
as well as shared forum use, wiki reader/proposal/staff flows, hostile HTML,
and mobile layout. The guarded runner confirmed the development database
sentinel was unchanged.

Additional gates completed:

- `npm run test:migration:populated` passed MIG-02. It upgraded a restored,
  verified 0006 baseline through 0013 and exactly preserved selected row
  counts/hashes, credentials, relationships, and raw scene turns. The
  restricted report is under ignored `.local/test/reports/`.
- BACK-01 passed with synthetic rows and credentials: a restricted backup was
  restored into a unique isolated database and checked; temporary database
  and dump were removed.
- The latest saved read-only development preflight report
  (`.local/test/reports/db-preflight-development-2026-10-20T14-39-15.074Z.json`)
  classifies the database as `verified-0013-legacy-import`, with all 14
  migrations applied, no pending migrations, and zero rows in application
  tables. This supersedes the earlier checkpoint's 0006 status. No development
  migration was run as part of the final test suite.
- The actual source ZIP remains staged only under ignored `.local/`: 29 files
  matched the private manifest's hashes, and five pilot outlines/editorial
  notes remain private. Synthetic source staging/import tests pass. No actual
  source was published or imported as canonical public lore.
- `git diff --check` and `node --check` for changed application, client,
  server, script and test JavaScript files pass.

| Milestone | Status and evidence |
| --- | --- |
| M0 | Recovery tooling and isolated test guards implemented; ENV-01/REC-01 unit/integration evidence passes; development sentinel unchanged. |
| M1 | App factory, server identity, CSRF/session revocation, readiness, validation, sanitization, and migration controls implemented; unit/HTTP and migration tests pass. |
| M2 | Server-backed forum, stable routes, idempotency, ordering, locking, ownership and recoverable moderation implemented; API and two-context browser tests pass. |
| M3 | Admin/category/account controls, audited moderation, bootstrap and concurrent final-admin protection implemented; ADM-01/02/03 integration coverage passes. |
| M4 | Character/scene persistence, normalized scene turns and restricted legacy content import implemented; SCN/IMP integration coverage passes. Real browser exports and author decisions remain pending. |
| M5 | Published wiki snapshots, staff drafts/history, aliases/redirects, categories/search/backlinks and restore-to-draft implemented; WIK and browser coverage passes. |
| M6 | Private member proposals, staff review, stale-base conflicts, attribution and discussion links implemented; PRO/WIK and browser coverage passes. |
| M7 | Restricted source staging/import and private pilot material implemented; SRC tests and private manifest checks pass. Actual lore publication remains pending. |
| M8 | Full suite, populated migration, BACK-01, documentation and final syntax/whitespace checks pass. Sol 6.1 / High review found one P2 importer sequence defect; the fix and regression pass, targeted follow-up confirmed closure, and implementation commit `343845b` is pushed. |

These are local implementation results, not production migration or deployment
evidence. The browser tests exercise synthetic accounts and content against the
isolated test service.

## Workers and ownership

Prior bounded implementation, security, persistence, UI and browser-test work
has been integrated; no implementation worker remains active. The principal
owns Git, database/test execution, final integration and checkpoint. The final
reviewer completed a read-only review of the original brief/contracts, full
implementation diff and test evidence, including a targeted follow-up on the
fixed importer finding. The reviewer did not access production or private
source text.

## Evidence and protected material

- Plans, contracts, runbook and checkpoint: `docs/planning/`.
- Original ZIP: `/home/arthur/Downloads/Aetherverse_Package_For_Argon.zip`.
- Test scripts, migration/import tools: `scripts/`; isolated test service:
  `compose.test.yaml`; synthetic tests: `tests/`.
- Restricted test credentials, reports, migration baseline and private wiki
  pilots live in ignored `.local/`; never commit or expose them.
- Private actual browser exports and a deployed-data inventory were not
  obtained. Real author mapping and canon/editorial decisions are not made.

## Next action

The local implementation is complete and its branch is pushed. The review and
closed finding are recorded in `EXECUTION_REVIEW.md`. Production deployment,
merging into upstream, actual lore import/publication, and real author/canon
decisions remain pending for a later explicit project step.
