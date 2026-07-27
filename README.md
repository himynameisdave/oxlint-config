# @himynameisdave/oxlint-config

[![npm version](https://img.shields.io/npm/v/%40himynameisdave%2Foxlint-config.svg)](https://www.npmjs.com/package/@himynameisdave/oxlint-config)
[![license](https://img.shields.io/npm/l/%40himynameisdave%2Foxlint-config.svg)](./LICENSE)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fhimynameisdave%2Foxlint-config.svg?type=shield&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2Fhimynameisdave%2Foxlint-config?ref=badge_shield&issueType=license)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fhimynameisdave%2Foxlint-config.svg?type=shield&issueType=security)](https://app.fossa.com/projects/git%2Bgithub.com%2Fhimynameisdave%2Foxlint-config?ref=badge_shield&issueType=security)

> An opinionated [oxlint](https://oxc.rs/docs/guide/usage/linter.html) config, by and for [himynameisdave](https://github.com/himynameisdave).

The spiritual successor to [eslint-config-himynameisdave](https://github.com/himynameisdave/eslint-config-himynameisdave), rebuilt for the oxc era. Every rule from every enabled plugin (all ~610 of them) is listed explicitly with a severity and a one-line reason. No category-level magic, no "recommended" black boxes.

## Installation

```bash
bun add -D oxlint @himynameisdave/oxlint-config
```

For type-aware linting (you want this), also grab [`oxlint-tsgolint`](https://github.com/oxc-project/tsgolint):

```bash
bun add -D oxlint-tsgolint
```

Not a bun user? It's a regular npm package, so any package manager works:

```bash
npm install -D oxlint @himynameisdave/oxlint-config
pnpm add -D oxlint @himynameisdave/oxlint-config
yarn add -D oxlint @himynameisdave/oxlint-config
```

- Requires `oxlint >=1.75.0 <2`. Why that range, and how it moves: [Versioning & compatibility](#versioning--compatibility).
- Type-aware linting requires TypeScript 7+ and a `strict` tsconfig.

## Configurations

| Config       | Import                                     | What it is                                                            |
| ------------ | ------------------------------------------ | --------------------------------------------------------------------- |
| `base`       | `@himynameisdave/oxlint-config/base`       | Core JS/TS rules. No framework assumptions. Start here.               |
| `svelte`     | `@himynameisdave/oxlint-config/svelte`     | Svelte 5 (runes) overrides for `.svelte`/`.svelte.ts` files.          |
| `type-aware` | `@himynameisdave/oxlint-config/type-aware` | Rules needing type info. Requires `oxlint-tsgolint` + `--type-aware`. |
| `vitest`     | `@himynameisdave/oxlint-config/vitest`     | Test-suite rules for Vitest projects (`.only` in CI, etc).            |
| _(default)_  | `@himynameisdave/oxlint-config`            | Kitchen sink: all of the above.                                       |

## Usage

Composable (a SvelteKit project with type-aware linting):

```ts
// oxlint.config.ts
import { defineConfig } from 'oxlint';
import base from '@himynameisdave/oxlint-config/base';
import svelte from '@himynameisdave/oxlint-config/svelte';
import typeAware from '@himynameisdave/oxlint-config/type-aware';

export default defineConfig({
	extends: [base, svelte, typeAware],
	rules: {
		// Project-specific overrides go here
	}
});
```

All-in-one:

```ts
// oxlint.config.ts
import { defineConfig } from 'oxlint';
import config from '@himynameisdave/oxlint-config';

export default defineConfig({
	extends: [config]
});
```

Then lint:

```bash
oxlint -c oxlint.config.ts --deny-warnings
```

## Philosophy

1. **Error, never warn.** A rule is either enforced or it's off. Warnings are noise that scrolls by unfixed forever, so run with `--deny-warnings` and nothing can.
2. **Explicit over implicit.** Every category is set to `"off"`; every active rule is listed by name. What's enforced is greppable, and rule-change diffs read like changelogs.
3. **Comments are mandatory.** Every rule (on _or_ off) has a one-line comment saying _why_. If a decision can't justify itself in one line, it's not a decision yet.
4. **Strict by default, escape hatches documented.** The base config assumes you want to be told. Common overrides are listed below, not baked in.
5. **No formatting rules.** Whitespace is [oxfmt](https://oxc.rs/docs/guide/usage/formatter.html)'s job. Anything purely about layout is off.

## Versioning & compatibility

Version bumps describe what a release does to _your_ CI:

- **major**: an existing rule flipped between `error` and `off`, or an option tightened. Your build may break. Read the release notes.
- **minor**: new rules decided, usually after an oxlint release adds them. New errors can appear in code that passed before.
- **patch**: docs, comments, tooling. No behavior change.

So `^` means you accept new errors on update, in exchange for getting new rules as they land. Don't want that? Pin an exact version (or use `~`) and bump deliberately.

**Supported oxlint: `>=1.75.0 <2`.** The floor is the version this release's rule inventory was certified against, so it moves whenever new rules are decided. Older oxlint skips rules it doesn't know instead of erroring, which means a stale binary quietly under-lints. The `<2` ceiling is there because an oxlint 2.0 needs a release here anyway.

**Type-aware assumes a strict tsconfig.** The `type-aware` config expects `"strict": true`, and does its best work with `"noUncheckedIndexedAccess"`. Without them, rules like `typescript/no-unnecessary-condition` both over- and under-report.

**Plugins you add start off.** Every category is `"off"` by design, so adding `plugins: ['react']` to your own config enables zero react rules until you name each one. Surprising once, then greppable forever.

## Enabled plugins

`typescript` · `unicorn` · `oxc` · `import` · `promise` · `node` · `jsdoc` (plus the core `eslint` rules) · `vitest` (via the opt-in `vitest` add-on)

The `vitest` stance: test suites deserve the same rigor as app code. The flagship rule is `no-focused-tests`: a committed `it.only` makes CI silently green while skipping every other test. The add-on's rules only fire on test-shaped syntax, so extending it is harmless for non-test files. **Not for `bun:test` suites:** oxlint recognizes test functions by import source (`vitest`, `@jest/globals`) or bare globals, and `import { it } from 'bun:test'` is invisible to it (verified empirically; see `src/vitest.ts`). Bun-native suites get no lint coverage until oxlint supports `bun:test` upstream.

The `jsdoc` stance: exported symbols should be documented; internal code doesn't have to be. Any JSDoc you _do_ write must be complete and descriptive (a partial `@param` list or a bare `@returns` errors), and types never go in JSDoc (TypeScript owns them). oxlint has no `require-jsdoc` rule yet, so _existence_ of docs on exports stays a review expectation until upstream ships one (this config will adopt it with `publicOnly` when it lands).

## Svelte support

The `svelte` config targets **Svelte 5 (runes)**. Svelte 4 / legacy-mode syntax errors by design (nothing here is relaxed to accommodate it), so the base rules flag it like any other unwanted pattern:

| Svelte 4 pattern                  | What errors                                                     |
| --------------------------------- | --------------------------------------------------------------- |
| `$: doubled = count * 2;`         | `eslint/no-labels` (`$:` is a labeled statement to a JS parser) |
| `$: sideEffect();`                | `eslint/no-labels`                                              |
| `$: someValue;` (bare identifier) | `eslint/no-labels` **and** `eslint/no-unused-expressions`       |
| `export let count = 0;` (props)   | `import/no-mutable-exports`                                     |

Still shipping legacy components? Relax those three rules in _your_ config, scoped to `.svelte` files so the rest of the codebase keeps the enforcement:

```ts
// oxlint.config.ts
import { defineConfig } from 'oxlint';
import base from '@himynameisdave/oxlint-config/base';
import svelte from '@himynameisdave/oxlint-config/svelte';

export default defineConfig({
	extends: [base, svelte],
	overrides: [
		{
			files: ['**/*.svelte'],
			rules: {
				// Svelte 4 `$:` reactive statements are labeled statements.
				'eslint/no-labels': 'off',
				// Bare `$: someValue;` reads as an unused expression.
				'eslint/no-unused-expressions': 'off',
				// `export let` is how Svelte 4 declares component props.
				'import/no-mutable-exports': 'off'
			}
		}
	]
});
```

`eslint/no-unused-labels` is _not_ in that list: as of oxlint 1.75 it doesn't fire inside `.svelte` files at all (it does in `.ts`). Add it if a future oxlint starts flagging `$:`.

SvelteKit route files need no override. `unicorn/filename-case` skips the leading `+` and checks the rest, so `+page.svelte`, `+layout.server.ts` and friends all pass. Only genuinely bad casing after the `+` (`+Bad_Name.ts`) errors.

## Common overrides

Things real projects legitimately relax. Add these to _your_ config's `rules`/`overrides`; they don't belong in the shared one:

```ts
rules: {
	// ORM/bundler underscore conventions (Prisma _count, Vite __APP_VERSION__):
	"eslint/no-underscore-dangle": ["error", { allow: ["__APP_VERSION__", "_count"] }],
	// Framework types that can't be deeply readonly (SvelteKit RequestEvent, Playwright Page):
	"typescript/prefer-readonly-parameter-types": ["error", { ignoreInferredTypes: true, allow: ["RequestEvent", "Page"] }],
	// Codebases that talk to sequential APIs:
	"eslint/no-await-in-loop": "off",
},
```

Generated code and framework configs go in `ignorePatterns` (the base config only ignores build artifacts: `node_modules`, `dist`, `build`, `.svelte-kit`).

## License

[MIT](./LICENSE) © [Dave Lunny](https://github.com/himynameisdave)
