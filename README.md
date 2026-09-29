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

- Requires `oxlint >=1.85.0 <2`. Why that range, and how it moves: [Versioning & compatibility](#versioning--compatibility).
- Type-aware linting requires TypeScript 7+ and a `strict` tsconfig.

## Configurations

| Config       | Import                                     | What it is                                                                   |
| ------------ | ------------------------------------------ | ---------------------------------------------------------------------------- |
| `base`       | `@himynameisdave/oxlint-config/base`       | Core JS/TS rules. No framework assumptions. Start here.                      |
| `bun`        | `@himynameisdave/oxlint-config/bun`        | All rules from the pinned bunisms plugin, as errors. Bun-targeted code only. |
| `svelte`     | `@himynameisdave/oxlint-config/svelte`     | Svelte 5 (runes) overrides for `.svelte`/`.svelte.ts` files.                 |
| `type-aware` | `@himynameisdave/oxlint-config/type-aware` | Rules needing type info. Requires `oxlint-tsgolint` + `--type-aware`.        |
| `vitest`     | `@himynameisdave/oxlint-config/vitest`     | Test-suite rules for Vitest projects (`.only` in CI, etc).                   |
| _(default)_  | `@himynameisdave/oxlint-config`            | Kitchen sink for Bun projects: all of the above.                             |

The default assumes your code targets Bun. For Node or browser projects, compose the individual presets without `bun`.

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

- **major**: structural change to what this package _is_. An oxlint major bump, a new plugin enabled in an existing preset, an entry point or public rule name renamed or removed, or an incompatible runtime requirement.
- **minor**: rule decisions. New rules decided (usually after an oxlint release adds them), an existing rule flipped between `error` and `off`, options tightened, or a plugin update changes lint findings. New errors can appear in code that passed before.
- **patch**: docs, comments, tooling. No behavior change.

Rule churn is deliberately _not_ a major bump. A newly-decided rule and a rule flipped from `off` to `error` break your build in exactly the same way, so pretending one is riskier than the other would just inflate the major number without telling you anything. New errors are the point of the package.

`^` accepts new errors on update. Don't want that? Use `~` (patch only) with a committed lockfile, and upgrade deliberately.

**Supported oxlint: `>=1.85.0 <2`.** The floor is the version this release's rule inventory was certified against, so it moves whenever new rules are decided. Older oxlint skips rules it doesn't know instead of erroring, which means a stale binary quietly under-lints. The `<2` ceiling is there because an oxlint 2.0 needs a release here anyway.

**Type-aware assumes a strict tsconfig.** The `type-aware` config expects `"strict": true`, and does its best work with `"noUncheckedIndexedAccess"`. Without them, rules like `typescript/no-unnecessary-condition` both over- and under-report.

**Plugins you add start off.** Every category is `"off"` by design, so adding `plugins: ['react']` to your own config enables zero react rules until you name each one. Surprising once, then greppable forever.

## Bun support and upstream updates

The `bun` preset includes `eslint-plugin-bunisms` **0.1.0** as an exactly pinned runtime dependency. For this preset, consumers install only this config and Oxlint; no separate bunisms, ESLint, or Bun runtime installation is needed to run the linter. Bunisms declares ESLint as an optional peer for ESLint users; Oxlint provides the plugin runtime here, so this package does not install ESLint. The linted application code should target Bun >=1.4.0.

```ts
import { defineConfig } from 'oxlint';
import base from '@himynameisdave/oxlint-config/base';
import bun from '@himynameisdave/oxlint-config/bun';

export default defineConfig({
	extends: [base, bun],
	rules: {
		// Keep a Node-compatible subprocess call where the application needs one.
		'bun/prefer-bun-spawn': 'off'
	}
});
```

All three rules are explicit errors: `bun/prefer-bun-file`, `bun/prefer-bun-write`, and `bun/prefer-bun-spawn`. They suggest Bun APIs for Node file reads, writes, and subprocess calls; they do not automatically rewrite code. They can report on Node-targeted code too, so use the standalone preset only where Bun is the intended runtime. Oxlint's JS plugin support is alpha; the consumer smoke test checks these rules at the supported Oxlint minimum and the development version.

Plugin resolution uses `fileURLToPath(import.meta.resolve('eslint-plugin-bunisms'))` inside the installed config package. This works with nested dependencies and does not depend on hoisting or a consumer-installed copy.

“All rules” means all rules in the **pinned, reviewed version**. We do not generate the shipped config from upstream presets or discover new rules at runtime. Dependabot proposes dependency updates; our coverage gate compares the plugin's exported rules with the explicit config and rejects missing/stale entries. Each update must review rule behavior and compatibility, update the decisions/comments, and pass consumer tests before release. A new upstream release alone changes nothing for consumers.

New rules and detection changes ship here as **minor** releases under the policy above, even when new errors fail CI. Public rule renames/removals and incompatible runtime requirements are **major** changes. Upstream version numbers prompt review rather than determine this package's release number. Consumers wanting deliberate rule upgrades should use `~` plus a committed lockfile.

**Migration for the next major release (2.0.0):** the default now includes Bun. Existing Node/browser consumers should compose `base`, `svelte`, `vitest`, and/or `typeAware` without `bun`. Bun consumers can keep the default import; review the new errors before upgrading CI.

## Enabled plugins

`typescript` · `unicorn` · `oxc` · `import` · `promise` · `node` · `jsdoc` (plus the core `eslint` rules) · `vitest` (via the `vitest` add-on) · `bun` (via the `bun` JS plugin add-on). Both add-ons are included in the default.

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

`eslint/no-unused-labels` is _not_ in that list: as of oxlint 1.85 it doesn't fire inside `.svelte` files at all (it does in `.ts`). Add it if a future oxlint starts flagging `$:`.

SvelteKit route files need no override. `unicorn/filename-case` skips the leading `+` and checks the rest, so `+page.svelte`, `+layout.server.ts` and friends all pass. Only genuinely bad casing after the `+` (`+Bad_Name.ts`) errors.

## Common overrides

Things real projects legitimately relax. Add these to _your_ config's `rules`/`overrides`; they don't belong in the shared one:

```ts
rules: {
	// ORM/bundler underscore conventions (Prisma _count, Vite __APP_VERSION__):
	"eslint/no-underscore-dangle": ["error", { allow: ["__APP_VERSION__", "_count"] }],
	// Framework types that can't be deeply readonly (SvelteKit RequestEvent, Playwright
	// Page/APIRequestContext). Overriding a rule replaces its options wholesale — it does
	// NOT merge — so restate the base config's platform exemptions alongside your additions:
	"typescript/prefer-readonly-parameter-types": ["error", {
		ignoreInferredTypes: true,
		allow: [
			{ from: "lib", name: "Date" },
			{ from: "lib", name: "URL" },
			{ from: "lib", name: "URLSearchParams" },
			{ from: "lib", name: "FormData" },
			{ from: "lib", name: "Request" },
			{ from: "lib", name: "Response" },
			{ from: "lib", name: "Headers" },
			{ from: "lib", name: "RegExp" },
			"RequestEvent", "Page", "APIRequestContext",
		],
	}],
	// Codebases that talk to sequential APIs:
	"eslint/no-await-in-loop": "off",
},
overrides: [
	// CLI scripts and DB seeds print to stdout and set exit codes by design:
	{
		files: ["scripts/**", "prisma/seed.ts"],
		rules: {
			"eslint/no-console": "off",
			"unicorn/no-process-exit": "off",
		},
	},
],
```

Vendored component code (e.g. shadcn-svelte's `src/lib/components/ui`) predates your lint config. Run `oxlint --fix` over it once (`unicorn/prefer-export-from` and `import/consistent-type-specifier-style` are both auto-fixable), or add the directory to `ignorePatterns` if you'd rather not touch scaffolded files.

Generated code and framework configs go in `ignorePatterns` (the base config only ignores build artifacts: `node_modules`, `dist`, `build`, `.svelte-kit`).

## License

[MIT](./LICENSE) © [Dave Lunny](https://github.com/himynameisdave)
