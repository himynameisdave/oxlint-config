# Pre-publish review

> Reviewed at `3c5a2b9` (2026-07-26), against the pinned toolchain: oxlint 1.75.0, oxlint-tsgolint 7.0.2001, TypeScript 7.0.2, oxfmt 0.60.0, np 12.0.0.
>
> **How this was verified:** the review sandbox's network policy blocks `registry.npmjs.org`, so the three gates could not be re-run locally. Gate status was verified via CI instead: run #7 on `main` at `3c5a2b9` is green (lint, format:check, check-coverage all pass). Everything below is static review of the sources plus that CI signal. Findings that need a live oxlint run to confirm are marked **verify** and carry the verification step in their acceptance criteria.

## Verdict

**Is it strict enough?** Yes — this is a genuinely strict config, and more importantly it's strict in the right places: every correctness/suspicious surface is on, the type-aware rules (floating promises, misused promises, exhaustiveness) are on by default in the kitchen sink, and the error-or-off + `--deny-warnings` stance removes the "warnings rot forever" failure mode entirely. The real gaps are not "more rules" but *undecided territory*: the test-runner plugins (jest/vitest) have no decisions at all (T-06), three type-aware/base twin pairs likely double-report (T-07), and two off-decisions deserve a second look (T-12, T-13). There's also a strictness-*quality* risk in the other direction: a handful of on-rules look hot enough against real SvelteKit code that they'd generate disable-comment noise — and under your own versioning policy, flipping a rule off after 1.0 is a **major**, so that validation belongs before the first publish (T-04, T-05).

**Is it publish ready?** Mechanically close: the exports map is correct and types-first, `files` whitelists `dist`, LICENSE/README/PUBLISHING are in order, and the np flow is documented. Two metadata problems should be fixed before the first tarball ships, because bad registry metadata is annoying to walk back: `oxlint-tsgolint` is required by the default export but declared nowhere (T-01), and the `oxlint >=1.46.0` peer floor almost certainly understates what the config needs (T-02). The bigger structural gap: nothing anywhere exercises the package *as a consumer* — no test installs the packed tarball, imports by package name, or lints a `.svelte` file (T-03). `svelte.ts` in particular is executed by zero gates today.

**How is the evolvability?** The bones are excellent — arguably the best part of the package. The coverage gate + the `update-oxlint-rules` skill + the iron rules make upstream absorption mechanical, and "the config is the product" discipline (comments, sections, no categories) means diffs stay reviewable. The blind spots are all at the edges of the gate: it never looks inside `overrides` (T-08), never notices a nursery rule stabilizing (T-08), never notices a brand-new upstream plugin (T-09), and the whole loop only starts if a human remembers to bump the dep (T-10).

## Ticket index

| ID | Title | Area | When |
| --- | --- | --- | --- |
| T-01 | Declare `oxlint-tsgolint` as an optional peer dependency | publish | before publish |
| T-02 | Fix the `oxlint` peer floor (1.46 is too low for the rules referenced) | publish | before publish |
| T-03 | Add a packed-tarball consumer smoke test to CI | publish / evolvability | before publish |
| T-04 | Dogfood the config on a real DaveStack app before 1.0 | strictness | before publish |
| T-05 | Pin down the Svelte contract (legacy `$:` syntax, SvelteKit `+` filenames) | strictness | before publish |
| T-06 | Decide the test-runner plugin rules (jest or vitest) | strictness | fast follow |
| T-07 | Add type-aware handoffs for three twin rule pairs | strictness | fast follow |
| T-08 | check-coverage: close the staleness blind spots (overrides, nursery promotions) | evolvability | fast follow |
| T-09 | check-coverage: detect new upstream plugins; harden parsing and severity policy | evolvability | fast follow |
| T-10 | Automate dependency bumps for the oxc toolchain (Renovate/Dependabot) | evolvability | fast follow |
| T-11 | README: document the consumer contract (semver meaning, pinning, tsconfig baseline) | publish / docs | fast follow |
| T-12 | Reconsider `typescript/return-await` (the off-rationale misses its correctness half) | strictness | when convenient |
| T-13 | `no-unsafe-type-assertion`: decide it on its own merits, not as part of the `any` family | strictness / docs | when convenient |
| T-14 | package.json hygiene (packageManager, `./package.json` export, git-install story, np dry-run) | publish | when convenient |

---

## Before publish

### T-01 — Declare `oxlint-tsgolint` as an optional peer dependency

**Problem.** The default export (kitchen sink) sets `options.typeAware: true`, and `type-aware.ts` is useless without `oxlint-tsgolint` installed — the README says so — but package.json declares no relationship to it at all. A consumer who installs `oxlint` + this package and extends the default export gets a broken lint run, and their package manager had no way to warn them. There is also a silent version coupling: `type-aware.ts` references rules that only newer tsgolint implements (`typescript/strict-void-return`, `typescript/no-useless-default-assignment`, `typescript/no-misused-spread`, …), and nothing records which tsgolint floor is required.

**Proposed change.** In package.json:

```jsonc
"peerDependencies": {
	"oxlint": ">=1.75.0",
	"oxlint-tsgolint": ">=7.0.2001"
},
"peerDependenciesMeta": {
	"oxlint-tsgolint": { "optional": true }
}
```

`optional: true` keeps `base`-only consumers install-clean while letting bun/pnpm/npm warn when a consumer has an incompatible tsgolint. Set the floor to the version the coverage gate actually certified (the pinned dev version) rather than guessing lower.

**Acceptance criteria.** A scratch project installing only `oxlint` + the package gets no missing-peer error; installing an old `oxlint-tsgolint` produces a peer warning; PUBLISHING.md's tarball-verification step still passes.

---

### T-02 — Fix the `oxlint` peer floor

**Problem.** `peerDependencies` says `oxlint >=1.46.0`, and the README repeats "Requires oxlint >= 1.46.0 (config extends support)". But the rule inventory was built against 1.75.0, and oxlint adds rules nearly every release — the config references rules that postdate 1.46 (e.g. `eslint/preserve-caught-error`, `unicorn/no-immediate-mutation`, `typescript/strict-void-return` are all recent additions). **Verify:** on oxlint 1.46, unknown rule names in a config produce warnings — and the README tells consumers to run `--deny-warnings`, which would turn that into a hard failure. Either way, the floor as published promises compatibility the config doesn't have. The coverage gate certifies exactly one version: the installed one.

**Proposed change.**

1. Raise the floor to the certified version: `"oxlint": ">=1.75.0"`. Keep the floor in lockstep with the devDependency from now on (a one-line note in the `update-oxlint-rules` skill, step 5, makes this part of the routine — bump the peer floor whenever new-in-that-release rules get decided).
2. Update the README requirements line to match.
3. Decide the upper-bound question deliberately: `<2` protects consumers from a config-format break but forces a release the day oxlint 2.0 lands; an open ceiling risks confusing failures on a major. Given the coverage gate means you'll cut a release for oxlint 2.0 anyway, `>=1.75.0 <2` is the honest range — but either choice is fine if documented (see T-11).

**Acceptance criteria.** `npm pack` metadata carries the new range; README matches; the skill documents the lockstep rule. Stretch (pairs with T-03): a CI job installs the floor version and lints a fixture, proving the floor is real rather than aspirational.

---

### T-03 — Add a packed-tarball consumer smoke test to CI

**Problem.** No gate exercises the package the way a consumer uses it. Self-lint imports `./dist/*.js` by relative path, so the exports map, the package-name resolution, the `files` whitelist, and the svelte config's behavior are all untested — `svelte.ts` is extended by nothing at all (self-lint deliberately skips it), so a malformed glob or a broken override there would ship silently. The `update-oxlint-rules` skill lists a consumer smoke test as a *manual* step; manual steps get skipped.

**Proposed change.** Add a CI job (and a `bun run test:consumer` script) that:

1. `npm pack` → install the tarball into a scratch project along with `oxlint` + `oxlint-tsgolint`.
2. Lint a small fixture tree by package-name import (`import config from '@himynameisdave/oxlint-config'`), asserting:
   - a known base violation fires (e.g. a `var` declaration → `eslint/no-var`);
   - a known type-aware violation fires (e.g. an unawaited promise → `typescript/no-floating-promises`), proving the tsgolint handoff works;
   - a `.svelte` fixture using runes (`let count = $state(0)`) produces **no** `eslint/prefer-const` error, proving the svelte override actually applies;
   - a test-file fixture using `console.log` produces no error, proving the base override applies.
3. Assert each of the four subpath imports (`.`, `/base`, `/svelte`, `/type-aware`) resolves.

This one job retroactively covers the exports map, the peer floors (run it against the floor version, per T-02), and every override block the coverage gate can't see.

**Acceptance criteria.** CI fails if any fixture assertion breaks; the skill's step 4 points at the script instead of describing a manual procedure.

---

### T-04 — Dogfood the config on a real DaveStack app before 1.0

**Problem.** The config has only ever linted itself — a small, headless TypeScript package. Its target is Bun/SvelteKit apps, which exercise a completely different rule surface (DOM, routes, load functions, stores). A few on-rules look likely to run hot against idiomatic app code, and the versioning policy makes this urgent: after 1.0, every `error → off` flip is a **major**. An afternoon of dogfooding converts several potential majors into pre-1.0 tweaks.

**Watch-list to check specifically** (all **verify** — these are informed suspicions, not confirmed failures):

- `oxc/no-map-spread` — errors on `items.map(x => ({ ...x, flag }))`, which is *the* idiomatic immutable transform in load functions and API mappers. If real code trips it constantly, the perf win doesn't pay for the noise.
- `typescript/prefer-readonly-parameter-types` — heavy even with `ignoreInferredTypes` + the lib allow-list; SvelteKit's `RequestEvent`/`Load` types will need consumer overrides immediately (the README predicts this — confirm the predicted escape hatch is actually sufficient).
- `unicorn/no-array-callback-reference` vs `unicorn/prefer-native-coercion-functions` — the first bans `.map(fn)` references, the second demands `.map(Number)` over `.map(x => Number(x))`. Upstream unicorn exempts the native coercion functions from the first rule to avoid ping-ponging; confirm oxlint's port has the same exemption, or one of the pair needs to move.
- `eslint/prefer-named-capture-group` + `eslint/require-unicode-regexp` — every ad-hoc regex now needs `(?<name>…)` and `/u`. Deliberate ceremony; just confirm you still like it after a week against real code.

**Proposed change.** Point one real DaveStack app at the packed tarball, run the full config, and triage every diagnostic into: real catch (great), consumer-specific (README "common overrides" candidate), or config defect (fix here, pre-1.0). Fold the findings into base.ts/svelte.ts with the usual comments.

**Acceptance criteria.** A short write-up (issue or PR description) listing diagnostics-per-rule from the dogfood run, and an explicit keep/flip decision for each watch-list rule above.

---

### T-05 — Pin down the Svelte contract

**Problem.** `svelte.ts` currently half-commits to two Svelte generations. The `import/no-mutable-exports` off-comment explicitly accommodates Svelte 4 (`export let` props) — but if Svelte 4/legacy-mode components are in scope, the config breaks on day one: reactive statements (`$: doubled = count * 2`) are *labeled statements*, so `eslint/no-labels` (error), `eslint/no-unused-labels` (error), and — for bare `$: expr` forms — `eslint/no-unused-expressions` (error) fire on every one of them, and none of them are relaxed in the svelte override. Separately, SvelteKit route files are named `+page.svelte`, `+layout.server.ts`, etc. — **verify** whether `unicorn/filename-case` (error, kebab/camel/pascal) accepts basenames starting with `+`; if not, every route file in every SvelteKit app errors.

**Proposed change.** Pick one:

- **Runes-only (recommended for a new 1.0):** state it in `svelte.ts`'s JSDoc and the README table ("Svelte 5 runes mode"), and reword the `no-mutable-exports` comment so it justifies itself with writable `$state` exports alone rather than `export let`.
- **Legacy supported:** add `eslint/no-labels`, `eslint/no-unused-labels`, and `eslint/no-unused-expressions` offs (with comments) to the `.svelte` override block.

Either way, resolve the filename question: if `+page.svelte` fails `unicorn/filename-case`, add a scoped override (e.g. `files: ['**/+*.svelte', '**/+*.ts', '**/+*.js']` → `unicorn/filename-case: off`) to `svelte.ts` with a comment naming SvelteKit's routing convention.

**Acceptance criteria.** The T-03 fixture tree includes a SvelteKit-shaped `src/routes/+page.svelte` (and, if legacy is supported, a `$:` component) and lints clean; the JSDoc and README state which Svelte generations the config supports.

---

## Fast follow

### T-06 — Decide the test-runner plugin rules

**Problem.** The largest genuinely-missing strictness surface. oxlint ships `jest` and `vitest` plugins; neither is enabled, so an entire class of high-value, test-only bugs goes uncaught — most importantly `.only` left on a suite (`jest/no-focused-tests`), which makes CI silently green while skipping everything else. The config clearly considers tests in scope (base.ts has a test-file override), so "no decision" is a gap, not a stance — and iron rule 1's "every registered rule gets a decision" currently only applies to the seven plugins the gate knows about.

**Proposed change.**

1. Pick the plugin that matches how DaveStack actually runs tests: `jest` rules match the `bun:test` API surface (describe/it/expect); pick `vitest` instead if Vitest is the runner. (oxlint's vitest plugin is largely the jest rules re-badged, plus a few vitest-specific ones.)
2. Add it to the `plugins` array and to `PLUGINS` in `scripts/check-coverage.ts`, then run the `update-oxlint-rules` classification flow over the newly-registered rules — every one gets the usual explicit decision + comment in its section. The must-haves: `no-focused-tests`, `no-disabled-tests` (or a deliberate off with a reason — skipped tests are sometimes a legitimate workflow), `no-identical-title`, `valid-expect`, `expect-expect`, `no-conditional-expect`, `no-standalone-expect`.
3. Most test-plugin rules only fire on test-shaped syntax, so they can live in base.ts like everything else; if you'd rather keep base framework-pure, a `src/tests.ts` entry point (exported as `./tests`) works too — but then the coverage gate needs to read it (see T-08's generalization).

**Acceptance criteria.** `check-coverage` prints OK with the new plugin included; a fixture with `it.only` fails lint in the T-03 smoke test; README's plugin list and rule count are updated. Per the house policy this is a **minor** (new rules added).

---

### T-07 — Add type-aware handoffs for three twin rule pairs

**Problem.** The config already has a clean pattern for "the type-aware rule supersedes the syntax-only base rule" — `type-aware.ts` turns off `eslint/no-implied-eval`, `eslint/no-throw-literal`, and `eslint/prefer-promise-reject-errors` precisely to avoid double reports. Three more pairs look like they need the same treatment but didn't get it (**verify** each — oxlint's implementations may already dedupe, but upstream semantics say they overlap):

| base (on) | type-aware (on) | overlapping shape |
| --- | --- | --- |
| `unicorn/prefer-includes` | `typescript/prefer-includes` | `x.indexOf(y) !== -1` |
| `unicorn/prefer-string-starts-ends-with` | `typescript/prefer-string-starts-ends-with` | `/^foo/.test(s)` |
| `unicorn/prefer-array-find` | `typescript/prefer-find` | `arr.filter(fn)[0]` |

On the overlapping shapes, both rules should fire → two diagnostics for one defect, which the config elsewhere explicitly treats as a bug (it's the stated reason `eslint/no-duplicate-imports` is off in favor of `import/no-duplicates`).

**Proposed change.** Write a fixture hitting each overlapping shape and run with the kitchen sink. For each pair that double-reports, add the unicorn rule to type-aware.ts's handoff-offs block with the standard "Superseded by …" comment. The unicorn versions stay on in base for consumers who don't run type-aware — exactly like the existing eslint handoffs.

**Acceptance criteria.** Each fixture shape produces exactly one diagnostic under the kitchen sink, and still produces one (the unicorn one) under base alone. Handoff comments follow the existing pattern. Any pair that turns out not to double-report gets a comment on the type-aware entry noting the two were checked for overlap.

---

### T-08 — check-coverage: close the staleness blind spots

**Problem.** Two classes of decision currently sit outside the gate:

1. **Override rules are invisible.** The script only reads top-level `config.rules` from base and type-aware. Rule names inside `overrides` — base's test-file block, everything in `svelte.ts` (which the script doesn't load at all), the handoff-offs are fine but the svelte file isn't — are never checked against the registered set. If upstream renames a rule that only appears in an override, `check-coverage` stays green and the override silently stops doing anything.
2. **Nursery promotions are invisible.** Seven rules are off with some variant of "Nursery: revisit when stabilized" (`eslint/no-unreachable-loop`, `eslint/no-useless-assignment`, `eslint/no-restricted-exports`, `unicorn/no-useless-iterator-to-array`, `import/export`, `import/named`, `promise/no-return-in-finally`). When oxlint promotes one out of nursery, its *name* doesn't change — so the gate stays green and the "revisit" never happens. The script already computes every rule's category (`categoryOf`); it just never uses it for this.

**Proposed change.**

1. Import `svelte` from dist alongside the other two; collect rule names from every config's `overrides[].rules` and assert they're all ⊆ registered (staleness only — overrides don't need *coverage*). Report violations as `STALE (override)`.
2. Add a `NURSERY_WATCH` list to the script naming the rules whose off-decision is *purely* "it's nursery" (the seven above, minus any — like `eslint/no-undef` — whose reason would survive promotion). Fail with a `PROMOTED` diff when `categoryOf.get(rule) !== 'nursery'`, which is the signal to make a real decision and remove the entry from the watchlist.

**Acceptance criteria.** Deliberately misspelling a rule in svelte.ts makes the gate fail; the watchlist matches the set of nursery-commented rules in the sources; the `update-oxlint-rules` skill's step 2 mentions the `PROMOTED` output alongside MISSING/STALE/DUPLICATE.

---

### T-09 — check-coverage: detect new upstream plugins; harden parsing and severity policy

**Problem.** Three smaller gate gaps, all cheap to close while you're in the file:

1. **New plugins are invisible.** `PLUGINS` is a hardcoded seven-item list, and rules for any other prefix are filtered out before the diff. When oxlint ships a brand-new plugin (it has done so repeatedly — vitest, vue, …), the gate stays green and iron rule 1 quietly stops being true. The exclusions are also undocumented: react/jsx-a11y/nextjs are *deliberately* out of scope, but nothing says so.
2. **The d.ts anchor is unasserted.** The script slices from `dts.indexOf('interface DummyRuleMap {')`. If upstream renames that interface, `indexOf` returns -1 and the script degenerates (it would fail loudly via a giant stale list, but with a maximally confusing message).
3. **Severity policy is unenforced.** Iron rule 2 says error-or-off, never warn — but nothing checks it. A `'warn'` merged by accident would ship.

**Proposed change.** In `scripts/check-coverage.ts`:

1. Extract *all* plugin prefixes from the rule map. Add an `EXCLUDED_PLUGINS` map with a one-line reason each (`react: 'JSX — not a target stack'`, …). Fail with `NEW PLUGIN (no stance)` for any prefix in neither list — extending the explicit-decision philosophy from rules to plugins.
2. `if (mapStart === -1) throw new Error('oxlint d.ts anchor "DummyRuleMap" not found — upstream types changed; update check-coverage.ts')`.
3. While iterating configured entries (including overrides, per T-08), assert severity is `'error'` or `'off'`; report anything else as `BAD SEVERITY`.

**Acceptance criteria.** Adding a fake rule under an unknown prefix to a test fixture of the script (or temporarily editing PLUGINS) demonstrates the new failure modes; the skill documents the `NEW PLUGIN` output (its remedy: add to `PLUGINS` and decide every rule, or add to `EXCLUDED_PLUGINS` with a reason).

---

### T-10 — Automate dependency bumps for the oxc toolchain

**Problem.** The whole maintenance model — coverage gate fails → run the skill → decide new rules → minor release — only *starts* when something bumps `oxlint`/`oxlint-tsgolint`/`oxfmt`. Today that's "Dave remembers". oxlint releases roughly weekly with new rules; the config's core promise (an explicit decision for every rule) ages precisely as fast as the bumps lag.

**Proposed change.** Add Renovate (or Dependabot) scoped to the four oxc-adjacent devDependencies (`oxlint`, `oxlint-tsgolint`, `oxfmt`, and optionally `typescript`), weekly cadence, single grouped PR. CI on that PR runs `check-coverage`; a red check *is* the "new rules need decisions" signal, and the PR is the natural place to run the `update-oxlint-rules` skill. Renovate is the better fit here (grouping, `matchPackageNames`), but either tool works. Note the interaction with T-02: the bump PR is also where the peer floor moves if new rules get decided.

**Acceptance criteria.** A bot PR appears on the next oxlint release; its CI runs all three gates against the bumped version; the skill's step 1 mentions that bumps normally arrive via bot PR rather than manual `bun add`.

---

### T-11 — README: document the consumer contract

**Problem.** Several things a consumer needs to know live only in maintainer-facing docs (CLAUDE.md, PUBLISHING.md) or nowhere:

1. **What semver means for a lint config.** House policy: new rules = minor, flips = major. That's a common and defensible convention, but it means `bun update` on a `^` range can introduce new errors into a consumer's CI. Consumers should be told — and told how to depend accordingly (pin exact, or use `~`, if they want zero surprise).
2. **The tsconfig baseline for type-aware.** Rules like `typescript/no-unnecessary-condition` and `typescript/unbound-method` assume `strict: true` (and behave best with `noUncheckedIndexedAccess`); on a loose tsconfig they misfire in both directions. One sentence saves the first confused issue.
3. **Plugins you add start all-off.** Because every category is `"off"`, a consumer who adds `plugins: ['react']` in their own config gets no react rules until they enable them explicitly. That's philosophically consistent but surprising; say it in the "Common overrides" section.
4. The oxlint floor line updates with T-02, and the upper-bound policy (whatever T-02 decides) belongs here too.

**Proposed change.** A short "Versioning & compatibility" section in the README covering the four points; move/copy the bump policy out of PUBLISHING.md so consumers see it.

**Acceptance criteria.** README states: the semver policy in consumer terms, a pinning recommendation, the supported oxlint range and how it moves, the tsconfig assumptions for `type-aware`, and the all-categories-off implication for consumer-added plugins.

---

## When convenient

### T-12 — Reconsider `typescript/return-await`

**Problem.** It's off with the comment "return-vs-return-await has real try/catch stack differences, but enforcing a direction flip-flops with runtime optimizations". That rationale addresses the *style* half of the rule and misses its *correctness* half: with the default `in-try-catch` semantics, the rule requires `return await` specifically inside `try` blocks — where a bare `return promise` means rejections skip the surrounding `catch`/`finally` entirely. That's the same swallowed-rejection family as `typescript/no-floating-promises`, which this config calls "the #1 async bug this stack catches". Outside try/catch the rule imposes nothing (in its default mode), so the optimization flip-flop concern mostly doesn't apply.

**Proposed change.** **Verify** oxlint/tsgolint's implementation supports the default `in-try-catch` behavior (and check what option shape 1.75 accepts). If yes: flip to `'error'` with a comment about rejections bypassing `catch`. If its only mode is `always`/`never`, keeping it off is reasonable — but update the comment to say *that* (option not yet supported), so the decision self-expires when upstream catches up. Flipping it on post-1.0 would be a minor-feeling change but is technically a flip: one more reason to decide during T-04's dogfood window.

**Acceptance criteria.** Either the rule is on with a correctness-focused comment and a `try { return promise }` fixture fails in the T-03 smoke test, or the off-comment accurately names the blocking limitation.

---

### T-13 — `no-unsafe-type-assertion`: decide it on its own merits

**Problem.** `typescript/no-unsafe-type-assertion` sits inside the "unsafe-* family: all off" block, whose header rationale is "they exist to quarantine `any`, but no-explicit-any already bans introducing it". That's true for the other five (`no-unsafe-argument`/`assignment`/`call`/`member-access`/`return`) — it is not what this rule does. It bans *unsound `as` casts* on any type. With `no-explicit-any` and `no-non-null-assertion` both on, plain `as` is the last big unchecked escape hatch in the config — this rule is the lever for it, and right now it's off for a reason that doesn't apply to it. (base.ts's test override even pre-disables it for test files, which suggests it was considered for real at some point.)

**Proposed change.** Pull it out of the family block and give it its own entry + comment. Honest options:

- **Keep off** (likely right): every `JSON.parse(...) as Config` and DOM `as HTMLInputElement` boundary errors under it; the noise probably outweighs the soundness win in app code. But say *that* in the comment.
- **Turn on** if the T-04 dogfood shows the hit count is low — it's the single biggest remaining strictness lever in the whole config, and the test-file exemption is already wired.

**Acceptance criteria.** The rule has its own comment that accurately describes what it bans and why the decision went the way it did; the family block's header once again describes every rule under it. (Comment-only change → patch; flipping on → the dogfood decides, pre-1.0.)

---

### T-14 — package.json hygiene

**Problem.** Four small pre-publish niceties, none blocking:

1. **No `packageManager` field.** The repo is bun-first (bun.lock, scripts call bun), but nothing declares it. np and other tooling use lockfile sniffing/this field to pick the package manager; declaring `"packageManager": "bun@1.3.11"` removes the guesswork (and documents the toolchain for contributors).
2. **No `"./package.json"` export.** Tooling that introspects installed packages (publint, Renovate, some bundlers) probes `require.resolve('pkg/package.json')`, which the current exports map blocks. Add `"./package.json": "./package.json"`.
3. **Git installs are broken by design.** `dist/` is gitignored and only `prepublishOnly` builds, so `bun add github:himynameisdave/oxlint-config` yields a package whose `main` doesn't exist. Either add `"prepare": "tsc"` (runs on git installs; costs one tsc run on local installs) or decide git installs are unsupported — but decide, don't default.
4. **First-release rehearsal.** Before the real 1.0.0 publish, run `bun run release -- --preview` (np's dry-run) end-to-end once — it exercises np's preflight against this bun-flavored repo (np's checks are npm-centric; better to find friction in preview than mid-release) — and `npm publish --dry-run` to eyeball the exact tarball file list against PUBLISHING.md's promised 11 files.

**Acceptance criteria.** Fields added; a documented stance on git installs; a successful `np --preview` run noted in the first release's notes.

---

## Considered and endorsed (no ticket)

For completeness on the "should anything else be on?" question — these off-decisions were weighed against their upstream reputations and the target stack, and the current stance holds up:

- **`typescript/strict-boolean-expressions` off** — the honest max-strictness lever, but `if (str)` is idiomatic JS and the rule fights the language everywhere; the comment says exactly this.
- **The five true `any`-quarantine rules off** (`no-unsafe-argument`/`assignment`/`call`/`member-access`/`return`) — with `no-explicit-any` on, what remains is third-party boundary noise; the family-block rationale is correct for these five (see T-13 for the sixth).
- **`eslint/require-await` + `typescript/require-await` off** — async-shaped interface conformance is real and common; both source configs agreeing is telling.
- **`unicorn/no-null` off, `unicorn/prefer-at` off, `unicorn/prefer-top-level-await` off** — all three are unicorn's most contested opinions; the comments give real reasons, not vibes.
- **Length/count caps off** (`max-lines`, `max-lines-per-function`, `max-statements`, `complexity`) — consistent stance, well argued in-line.
- **`eslint/no-undef` off** — correct for a TypeScript-only target; tsc owns identifier resolution.
- **react / react-perf / nextjs / jsx-a11y plugins unenabled** — right for a Svelte stack; T-09 makes the exclusion explicit instead of implicit.

## Suggested sequencing

1. **T-01, T-02** — metadata fixes, minutes each, must precede the first `npm publish`.
2. **T-03** — the smoke test, since T-04/T-05/T-07 all want its fixture harness.
3. **T-05, T-04** — settle the Svelte contract, then dogfood; fold findings back into the config while flips are still free.
4. Publish 1.0.0. 🎉
5. **T-06 → T-11** as fast follows (T-06 is a minor by policy; the gate/automation tickets are patches).
6. **T-12/T-13/T-14** opportunistically.
