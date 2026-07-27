---
name: update-oxlint-rules
description: Update this package after an upstream oxlint release adds, removes, or recategorizes lint rules. Use when bumping the oxlint dependency, when check-coverage fails, or when asked to "handle new oxlint rules".
---

# Update oxlint rules

Workflow for absorbing an upstream oxlint release into this config package. The invariant to restore: **every rule oxlint registers for our plugins has an explicit, commented decision** in `src/base.ts` or `src/type-aware.ts`.

## 1. Bump and detect

```bash
bun add -d oxlint@latest oxlint-tsgolint@latest
bun run check-coverage
```

`check-coverage` prints:

- `MISSING` — new upstream rules with no decision. → step 2.
- `STALE` — rules we configure at top level that no longer exist. → step 3.
- `STALE (override)` — same, but the dead name is inside an `overrides` block (base's test-file override, or `src/svelte.ts`). Fix it in place: rename to the new rule, or delete the entry if the rule is gone. No top-level decision is needed — overrides only adjust decisions already made.
- `DUPLICATE` — a rule active in both files.
- `PROMOTED` — a rule we turned off _purely because_ it was nursery has graduated to a real category. The name didn't change, so nothing else catches this. Make a real severity decision per the step-2 policy, rewrite its comment (it currently says "revisit when stabilized"), move it out of the nursery banner into its new category's section, and delete it from `NURSERY_WATCH` in `scripts/check-coverage.ts`.

If it prints `OK`, only the dep bump needs committing.

## 2. Classify each MISSING rule

For each new rule, in order:

1. **Which plugin + category?** The script prints the category. Find the matching banner section in `src/base.ts`.
2. **Type-aware?** Check the tsgolint implemented-rules list (https://github.com/oxc-project/tsgolint — or `bunx oxlint --help` / oxc.rs type-aware docs). Type-aware rules go in `src/type-aware.ts` ONLY. Also check the NOTE comment in `type-aware.ts` — `naming-convention` and `prefer-destructuring` are expected to land eventually.

> **Watched-for rule:** if oxlint ships `jsdoc/require-jsdoc`, enable it with `publicOnly: true` (package stance: exported symbols get docs, internal doesn't) and update the jsdoc banner in `base.ts` + the README stance paragraph — both promise this.

3. **Decide severity** by this package's policy:
   - correctness / suspicious / perf → almost always `"error"`
   - pedantic / style → `"error"` unless it polices formatting (off — oxfmt's job), length/count caps (off — see max-lines stance), or alphabetical sorting (off — see sort-keys stance)
   - restriction → judgment call; default `"off"` unless it catches real bugs (see no-console, no-param-reassign for the bar)
   - nursery → `"off"` with a "Nursery: revisit when stabilized" comment, **and** add the rule to `NURSERY_WATCH` in `scripts/check-coverage.ts` so promotion trips the gate. Skip the watchlist if the rule would stay off even once stabilized (see `eslint/no-undef`) — then say that in the comment instead of "revisit when stabilized".
   - `"error"` or `"off"` ONLY — never `"warn"`
4. **Check for twins.** If the new rule duplicates an existing one (eslint vs unicorn vs import versions), keep exactly one active and comment the handoff on the off one (see `eslint/no-duplicate-imports` → `import/no-duplicates` for the pattern). A new TS type-aware version of an active base rule: enable in `type-aware.ts`, add the base rule to its handoff-offs block.
5. **Write the comment.** One line, the _why_, not the what. Read neighboring comments for voice.

## 3. Handle STALE rules

Renamed upstream → move the decision + comment to the new name. Deleted → remove the entry. Check release notes (https://github.com/oxc-project/oxc/releases) when unsure which. Same call for `STALE (override)`, except the entry lives in an `overrides` block and needs no top-level decision.

## 4. Verify

```bash
bun run check-coverage   # must print OK
bun run lint             # self-lint must pass
bun run test:consumer    # packs the tarball, installs it in a scratch project, lints
```

`test:consumer` (`scripts/consumer-smoke.ts`) proves the `exports` map, the svelte overrides, the base test-file override, and the type-aware handoff all still work from a real install. It needs network access. If a newly-decided rule deserves permanent coverage, add a fixture to `FIXTURES` in that script.

## 5. Ship

- README: update the "~540" rule count if it moved meaningfully.
- Bump `peerDependencies.oxlint` to the version you just certified against (floor = the installed version `check-coverage` passed on). Update the README's floor line to match.
- Version: new rules or dep-range bump = **minor**; any existing rule flipped error↔off = **major** (breaks consumer CI).
- Commit style: emoji + short subject, why in body (e.g. `⬆️ oxlint 1.80: decide 12 new rules`). List notable new errors in the body.
