# Module index plan

The private content tree needs a discoverable list of study modules without moving the existing FDE pack. A future deletion should remove exactly one module file and its index row.

1. Preserve `fde/fde-prep.json` as the version 1 source.
2. Define a version 2 document and index JSON Schema.
3. Add one clearly fictional module for contract testing.
4. Generate summaries deterministically from module files.
5. Validate references, translations, archive metadata, and file/index parity.
6. Wire validation and sync checks into local and CI gates.

## Contract

The index uses `version: 2` and `modules[]` rows. Each row has a slug, a relative `source` path, bilingual title and summary, organization alias, role, level, date, tags, optional test score, status, and optional archive dates. The FDE row points directly to `fde/fde-prep.json`; other rows point to `modules/<slug>.json`. Version 2 files retain the FDE version 1 requirement/entry fields and may add `kbRefs` and `embellishmentRefs` to entries. A pending KB reference is an identifier, never a published URL. Both index and module file validation require complete bilingual strings.

Only module files outside `fde/` are generated into rows. Archive status is stored on the module file and mirrored in the index. To remove a module later, delete its file and regenerate the index. The check detects orphan files, missing files and stale rows. There is no delete operation in this change.

The upstream design calls for Zod plus generated JSON Schema in the separate JDCV contracts package. This Node 22 content repository has no package manager, so its gate uses JSON Schema and a dependency-free structural validator rather than introducing a second Zod dependency.
