# Execution checkpoint

Update this file in place; do not create competing state/checkpoint documents.

## Current phase

The user-authorized local wiki-transfer milestone is implemented on branch
`arthur/local-setup`. Consult Git history and the fork's branch for its commit
and synchronization status; preserve any subsequent working-tree changes.
The local database was preflighted as supported `verified-0013`, backed up to
ignored `.local/development-before-wiki-transfer.dump` (mode 600), and migrated
through additive migration 0014. Postflight is
`verified-0014-wiki-portable-transfers`, with no pending migrations. The
backup predates the admin account, the user's test character, and the private
wiki transfer; preserve it as a pre-change recovery point and do not restore it
during routine testing. The local server is running from this checkout on
port 3000.

The local `Mand` account is an active admin and a fresh admin login was
verified. The user-created test character remains in the development database.
The restricted source store contains the package's 28 lore files. A private
`AetherverseWikiBundleV1` import created five staff-only, unpublished pilot
pages with 29 revision citations and exact mappings to the ten cited source
records. Keep credentials, source text, and user IDs out of this checkpoint.
Preserve ignored `.env`, `.local/` recovery/source material, transfer jobs, and
user data; do not stage them.

## Confirmed decisions and exclusions

- Staff publish reference articles; members propose edits.
- Keep the existing stack, Portuguese interface and RPG terminology; make
  shared state server-authoritative.
- Do not deploy, merge into upstream, or publish/import actual lore as a public
  article during this task. No production database or lore publication has
  been touched.
- The portable transfer format is `AetherverseWikiBundleV1`; first use is
  local-to-Render, but no Render export/import or deployment is authorized in
  this milestone. Imported pages must remain unpublished staff drafts.
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
test infrastructure. For the portable transfer changes, the full relevant
gates passed on 21 October: 19 unit test files, 44 PostgreSQL/HTTP integration
tests, and 16 Playwright browser tests. The guarded runners confirmed the
development database sentinel was unchanged during integration and browser
runs. The new transfer coverage includes admin-only export, source closure,
unpublished imports, citation-bound replay identity, repeatable-read export,
preview refresh, collision handling, and transactional audit rollback.

Additional gates completed:

- `npm run test:migration:populated` passed MIG-02 against the current chain.
  It upgraded a restored, verified 0006 baseline through 0014 and preserved selected row
  counts/hashes, credentials, relationships, and raw scene turns. The
  restricted report is under ignored `.local/test/reports/`.
- BACK-01 passed with synthetic rows and credentials: a restricted backup was
  restored into a unique isolated database and checked; temporary database
  and dump were removed.
- The latest saved read-only development preflight report
  (`.local/test/reports/db-preflight-development-2026-10-20T14-39-15.074Z.json`)
  classifies the database as `verified-0013-legacy-import`, with all 14
  migrations applied, no pending migrations, and zero rows in application
  tables before the authorized local setup. After applying 0014, the database
  postflight is `verified-0014-wiki-portable-transfers`, with all 15 migrations
  applied and none pending.
- The private ZIP inventory contains 28 lore files plus a README; the archive
  and pilot working files remain under ignored `.local/`. The 28 source records
  are now in the local restricted source store. The five pilot outlines remain
  private, and their five page snapshots were imported as unpublished staff
  drafts. Read-only database verification confirmed five staff-only unpublished
  pages, 29 citations, ten source mappings, one active local admin, one
  retained user-created character, and one transfer audit event. No public lore
  was published.
- Sol 6.1 / High's required bounded follow-up review closed three P2 findings:
  replay identity now includes source revision/snapshot/citations, export reads
  a consistent repeatable-read snapshot, and preview refresh recalculates and
  persists plan changes. New synthetic regressions pass; no blocker remains in
  the reviewed areas.
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
| M7 | Restricted source staging/import and private pilot material are complete locally: 28 source records, five unpublished staff drafts, 29 citations, and ten exact source mappings. Actual lore publication remains pending. |
| M8 | Unit (19 files), integration (44), browser (16), populated migration through 0014, syntax, and whitespace checks pass. Required Sol 6.1 / High follow-up closed all three transfer findings. Local account, source import, and draft counts were verified. Implementation and handoff documents are maintained on `arthur/local-setup`; private data travels separately. |

These are local implementation results, not production migration or deployment
evidence. The browser tests exercise synthetic accounts and content against the
isolated test service.

## Workers and ownership

Prior bounded implementation, security, persistence, UI and browser-test work
has been integrated. The transfer backend and client workers completed; the
principal owns Git, database/test execution, local account setup, private
source import, and checkpoint. Sol 6.1 / High completed the required targeted
review of transfer replay, export snapshot, and preview-refresh changes. No
reviewer accessed production or private source text.

## Evidence and protected material

- Plans, contracts, runbook and checkpoint: `docs/planning/`.
- Original ZIP: `/home/arthur/Downloads/Aetherverse_Package_For_Argon.zip`.
- Test scripts, migration/import tools: `scripts/`; isolated test service:
  `compose.test.yaml`; synthetic tests: `tests/`.
- Restricted test credentials, reports, migration baseline, source files,
  transfer bundle/job and private wiki pilots live in ignored `.local/` or the
  local development database; never commit or expose them.
- Private actual browser exports and a deployed-data inventory were not
  obtained. Real author mapping and canon/editorial decisions are not made.

## Next action

No local setup step remains for this milestone. The user can review the five
drafts through the local admin wiki screens. Any Render import, deployment,
upstream merge, public lore publication, and unresolved canon/author decisions
remain pending a separate explicit task.

For the next source-to-wiki editorial planning chat, start with
`WIKI_EDITORIAL_BRIEF.md` and use `WIKI_EDITORIAL_START_PROMPT.md`. These describe
the new planning task; this file remains the technical execution checkpoint.
On another computer, follow `OTHER_COMPUTER.md`: a Git clone does not contain
the original device's ignored source materials or local database.
