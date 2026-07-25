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
- `src/type-aware.ts` — tsgolint rules + `options.typeAware` + handoff-offs for base rules the TS versions supersede
- `src/index.ts` — re-exports + kitchen-sink default
- `scripts/check-coverage.mjs` — exhaustiveness gate (see iron rule 1)
- `oxlint.config.ts` — self-lint config; imports from `dist/`, so build first

## Commands

- `bun install` — bun is the package manager here
- `bun run build` — tsc (TypeScript 7) → `dist/` with declarations
- `bun run lint` — build + self-lint with our own config (type-aware on)
- `bun run check-coverage` — build + verify every registered rule is decided

## Conventions

- Commits: emoji + short subject, why-explanation in the body (`✨ Add base config`).
- Tabs for indentation; `.js` extensions on relative imports (NodeNext).
- When oxlint ships new rules upstream, use the `update-oxlint-rules` skill (`.claude/skills/update-oxlint-rules/`).
- Version bumps: new rules added = minor; a rule flipped error↔off = major (it can break consumer CI).
