# Lessons

- 2026-10-31: An agent edited the main checkout on `main` instead of its worktree; always use a T3 worktree branch, and the pre-commit hook now blocks `main`.
- 2026-10-31: A free model failed silently or hit quota without notice; run agent work via `~/ai-tools/t3-run.sh` so its watchdog switches models and reports failures.
- 2026-10-31: A large task skipped its plan/spec step; write a plan, and add a spec in `docs/specs/` for big tasks, before coding.
- 2026-11-10: A backend outline passed structural checks but did not teach the theory; review each core chapter for explanations, source evidence, worked examples and correct auth-before-validation tests.
