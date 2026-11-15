# Archived modules in the private data tree

Archiving hides a study module without deleting its document. A separate reviewed removal can then remove a fictional application from the current Git tree while leaving reusable knowledge-base (KB) topics untouched. This data-repository contract implements the Phase 1 file step described in `jdcv/docs/specs/module-delete-and-archive.md`; it does not authorize a purge of jobs, storage, or other repositories.

## Shape and validation

The existing `modules/index.json` row mirrors each `modules/<slug>.json` file. Both use `status: "active" | "archived"`. Archived records require `archivedAt` and `purgeAfter` as valid ISO-8601 date-time strings with explicit timezone; the latter must be exactly 604800000 milliseconds (seven days) after the former. Active records must not contain either archive date. Optional `autoArchive` is a boolean and optional `lastOpenedAt` is an ISO-8601 date-time with explicit timezone. The index mirrors both optional fields when present. For example, archiving a fictional module at `2026-11-15T00:00:00.000Z` sets its purge date to `2026-11-22T00:00:00.000Z`; the default-list helper omits it but a full index read still finds it for restore.

The validator checks both rows and documents, reports the slug and failing field, checks exact row/file parity, and rejects missing files and orphan files. `sync-modules-index.mjs --check` rejects a stale generated row. The FDE row still points to `fde/fde-prep.json` and is always active and visible. The local index shape predates the narrower jdcv contract (`slug`, `path`, `version`); jdcv has no archive metadata or optional inactivity fields yet. A later jdcv contract follow-up must reconcile the shapes rather than silently replacing this repository's established index.

## Reviewed removal

`node scripts/remove-module.mjs <slug> [--dry-run]` removes only an archived `modules/<slug>.json` and its index row, like jdcv's `planPhase1Removal`. It refuses FDE, invalid or path-escaping slugs, non-archived files, malformed or stale indexes, and missing index rows for existing files. A missing file and missing row are an idempotent no-op; a dry run changes nothing. Exit 0 means removed, dry-run success, or already absent; exit 2 means refused input or invalid content; exit 1 means an I/O failure. It never commits, pushes, opens a pull request (PR), or touches `knowledge-base/`. A review of a diff is required before committing the removal. Deleting a file from today's tree does **not** erase it from Git history.

## Acceptance and named checks

Each local test uses temporary trees with fictional documents. The real FDE file is only copied for validation, never edited.

1. **AC1:** `accepts archived document and synchronized index` checks both validators and the index check.
2. **AC2:** `rejects missing archivedAt`, `rejects missing purgeAfter`, `rejects purgeAfter outside seven days`, and `rejects malformed archivedAt` check field-specific errors.
3. **AC3:** `rejects archive dates on active module`, `rejects index status mismatch`, and `rejects index archive-field mismatch` check row/file parity.
4. **AC4:** `accepts optional inactivity fields` and `rejects invalid autoArchive and lastOpenedAt` check types and mirroring.
5. **AC5:** `default list hides archived and keeps active FDE` checks visibility without dropping archived content.
6. **AC6:** `removal changes only archived file and index row` checks byte-identical surviving files, including a KB fixture.
7. **AC7:** `removal refuses active, FDE and unsafe slug`, `dry run changes no bytes`, and `second removal is a no-op` check exit codes and safety.
8. **AC8:** The exact commands in the task's local gate check all existing content, plan, practice, FDE and module validators; `git diff --name-only` checks that `fde/` and `knowledge-base/` are unchanged.
9. **AC9:** `README.md`, `PROJECT_CONTEXT.md` §§8–9, and this spec describe archive fields, checks, removal, and Git-history limits; `git diff --check` checks whitespace.
10. **AC10:** The PR's GitHub Actions validation, context and secret-scan checks, plus local gitleaks, check the committed result without real personal data.
