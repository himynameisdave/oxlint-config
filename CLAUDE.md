# @himynameisdave/oxlint-config

Shareable oxlint config package. The product IS the rule decisions — treat `src/base.ts` and `src/type-aware.ts` as the source of truth consumers read.

## Iron rules

1. **Every registered rule gets an explicit decision.** `bun run check-coverage` must print `OK` — it diffs our configs against every rule the installed oxlint registers for our plugins. Never merge with missing/stale rules.
2. **Severity is `"error"` or `"off"`, never `"warn"`.**
3. **Every rule entry has a one-line `//` comment saying WHY** — the reason, not a restatement of the rule name. Off rules need reasons too.
4. **Categories stay all-`"off"`.** Nothing activates implicitly.
5. **No formatting rules** — anything purely about whitespace/layout is off (oxfmt's job).
6. Rules live in the section for their plugin + category (banner comments in `base.ts`). Type-aware rules (tsgolint) live ONLY in `src/type-aware.ts`.

## Layout

- `src/base.ts` — all non-type-aware rules (framework-agnostic) + test-file override + ignorePatterns
- `src/svelte.ts` — `.svelte`/`.svelte.ts` overrides only
- `src/vitest.ts` — vitest plugin rules (opt-in add-on; inert on non-test syntax)
- `src/type-aware.ts` — tsgolint rules + `options.typeAware` + handoff-offs for base rules the TS versions supersede
- `src/index.ts` — re-exports + kitchen-sink default
- `scripts/check-coverage.ts` — exhaustiveness gate (see iron rule 1)
- `oxlint.config.ts` — self-lint config; imports from `dist/`, so build first

## Commands

- `bun install` — bun is the package manager here
- `bun run build` — tsc (TypeScript 7) → `dist/` with declarations
- `bun run lint` — build + self-lint with our own config (type-aware on)
- `bun run check-coverage` — build + verify every registered rule is decided
- `bun run format` / `format:check` — oxfmt (tabs, single quotes, width 100)
- `bun run test` — all three gates (what CI and np's preflight run)
- `bun run release` — np: version, publish (scoped → publishConfig already public), tag, GitHub release. Full walkthrough: PUBLISHING.md

## Bun, not Node

**Always prefer Bun over Node.** Bun is the package manager, the test runner, the script runtime, and the CI runtime here — reach for a Node equivalent only when Bun genuinely can't do the job.

- Scripts: `Bun.file()` / `Bun.write()` over `node:fs`, `Bun.spawnSync()` / `Bun.$` over `node:child_process`, `import.meta.dir` over `__dirname`/`new URL(..., import.meta.url)`, `Bun.env` over `process.env`.
- Our own commands: `bun install`, `bun run <script>`, `bun x` — not `npm`/`npx`/`yarn`/`pnpm`, and not `node script.ts`.
- CI uses `oven-sh/setup-bun`; keep it that way.

Two kinds of exception, and it matters which one you're invoking:

1. **Bun has no equivalent.** Use the `node:` module and say so in a comment. Live cases: `tmpdir()` from `node:os` (no Bun temp-directory API — reconstructing one from `$TMPDIR` would be less correct than what it replaces), plus `node:fs/promises`, `node:path` and `node:url` in `scripts/consumer-smoke.ts`.
2. **Node/npm _is_ the thing under test.** `scripts/consumer-smoke.ts` runs `npm pack`, `npm install` and `node resolve-check.mjs` on purpose: it proves the published tarball works for a real consumer, and real consumers run npm and Node. Don't "fix" these to Bun — doing so would delete the coverage. Same logic for anything else asserting consumer-side behaviour.

Two gotchas when writing Bun scripts here:

- `Bun.spawnSync` returns a failed result where `execFileSync` would have thrown, so check `.success` explicitly rather than letting a failure pass silently.
- Use the global `Bun.$`, never `import { $ } from 'bun'` — that import pulls bun's global type augmentation into the shared type-aware program and trips `typescript/no-unnecessary-condition` in unrelated files (see the note atop `consumer-smoke.ts`).

## Conventions

- Commits: emoji + short subject, why-explanation in the body (`✨ Add base config`).
- Tabs for indentation; `.js` extensions on relative imports (NodeNext).
- When oxlint ships new rules upstream, use the `update-oxlint-rules` skill (`.claude/skills/update-oxlint-rules/`).
- Version bumps: any rule churn (new rules, a rule flipped error↔off, options tightened) = minor. Major is reserved for structural changes: an oxlint major, a new plugin, an entry point renamed/removed.
