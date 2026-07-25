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

`check-coverage` prints `MISSING` (new upstream rules with no decision), `STALE` (rules we configure that no longer exist), and `DUPLICATE` (a rule active in both files). If it prints `OK`, only the dep bump needs committing.

## 2. Classify each MISSING rule

For each new rule, in order:

1. **Which plugin + category?** The script prints the category. Find the matching banner section in `src/base.ts`.
2. **Type-aware?** Check the tsgolint implemented-rules list (https://github.com/oxc-project/tsgolint — or `bunx oxlint --help` / oxc.rs type-aware docs). Type-aware rules go in `src/type-aware.ts` ONLY. Also check the NOTE comment in `type-aware.ts` — `naming-convention` and `prefer-destructuring` are expected to land eventually.
3. **Decide severity** by this package's policy:
   - correctness / suspicious / perf → almost always `"error"`
   - pedantic / style → `"error"` unless it polices formatting (off — oxfmt's job), length/count caps (off — see max-lines stance), or alphabetical sorting (off — see sort-keys stance)
   - restriction → judgment call; default `"off"` unless it catches real bugs (see no-console, no-param-reassign for the bar)
   - nursery → `"off"` with a "Nursery: revisit when stabilized" comment
   - `"error"` or `"off"` ONLY — never `"warn"`
4. **Check for twins.** If the new rule duplicates an existing one (eslint vs unicorn vs import versions), keep exactly one active and comment the handoff on the off one (see `eslint/no-duplicate-imports` → `import/no-duplicates` for the pattern). A new TS type-aware version of an active base rule: enable in `type-aware.ts`, add the base rule to its handoff-offs block.
5. **Write the comment.** One line, the *why*, not the what. Read neighboring comments for voice.

## 3. Handle STALE rules

Renamed upstream → move the decision + comment to the new name. Deleted → remove the entry. Check release notes (https://github.com/oxc-project/oxc/releases) when unsure which.

## 4. Verify

```bash
bun run check-coverage   # must print OK
bun run lint             # self-lint must pass
```

Then smoke-test as a consumer: `npm pack`, install the tarball in a scratch project with a file violating one new rule, confirm it fires.

## 5. Ship

- README: update the "~540" rule count if it moved meaningfully.
- Version: new rules or dep-range bump = **minor**; any existing rule flipped error↔off = **major** (breaks consumer CI).
- Commit style: emoji + short subject, why in body (e.g. `⬆️ oxlint 1.80: decide 12 new rules`). List notable new errors in the body.
