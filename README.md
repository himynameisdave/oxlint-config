# @himynameisdave/oxlint-config

[![npm version](https://img.shields.io/npm/v/%40himynameisdave%2Foxlint-config.svg)](https://www.npmjs.com/package/@himynameisdave/oxlint-config)
[![license](https://img.shields.io/npm/l/%40himynameisdave%2Foxlint-config.svg)](./LICENSE)

> An opinionated [oxlint](https://oxc.rs/docs/guide/usage/linter.html) config, by and for [himynameisdave](https://github.com/himynameisdave).

The spiritual successor to [eslint-config-himynameisdave](https://github.com/himynameisdave/eslint-config-himynameisdave), rebuilt for the oxc era. Every rule from every enabled plugin — all ~540 of them — is listed explicitly with a severity and a one-line reason. No category-level magic, no "recommended" black boxes.

## Installation

```bash
bun add -D oxlint @himynameisdave/oxlint-config
```

For type-aware linting (you want this), also grab [`oxlint-tsgolint`](https://github.com/oxc-project/tsgolint):

```bash
bun add -D oxlint-tsgolint
```

Requires `oxlint >= 1.46.0` (config `extends` support). Type-aware linting requires TypeScript 7+.

## Configurations

| Config       | Import                                     | What it is                                                            |
| ------------ | ------------------------------------------ | --------------------------------------------------------------------- |
| `base`       | `@himynameisdave/oxlint-config/base`       | Core JS/TS rules. No framework assumptions. Start here.               |
| `svelte`     | `@himynameisdave/oxlint-config/svelte`     | Overrides for `.svelte`/`.svelte.ts` files (runes use `let`, etc).    |
| `type-aware` | `@himynameisdave/oxlint-config/type-aware` | Rules needing type info. Requires `oxlint-tsgolint` + `--type-aware`. |
| _(default)_  | `@himynameisdave/oxlint-config`            | Kitchen sink: all of the above.                                       |

## Usage

Composable — a SvelteKit project with type-aware linting:

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

1. **Error, never warn.** A rule is either enforced or it's off. Warnings are noise that scrolls by unfixed forever — run with `--deny-warnings` so nothing can.
2. **Explicit over implicit.** Every category is set to `"off"`; every active rule is listed by name. What's enforced is greppable, and rule-change diffs read like changelogs.
3. **Comments are mandatory.** Every rule — on _or_ off — has a one-line comment saying _why_. If a decision can't justify itself in one line, it's not a decision yet.
4. **Strict by default, escape hatches documented.** The base config assumes you want to be told. Common overrides are listed below, not baked in.
5. **No formatting rules.** Whitespace is [oxfmt](https://oxc.rs/docs/guide/usage/formatter.html)'s job. Anything purely about layout is off.

## Enabled plugins

`typescript` · `unicorn` · `oxc` · `import` · `promise` · `node` · `jsdoc` (plus the core `eslint` rules)

The `jsdoc` stance: exported symbols should be documented; internal code doesn't have to be. Any JSDoc you _do_ write must be complete and descriptive (a partial `@param` list or a bare `@returns` errors), and types never go in JSDoc — TypeScript owns them. oxlint has no `require-jsdoc` rule yet, so _existence_ of docs on exports stays a review expectation until upstream ships one (this config will adopt it with `publicOnly` when it lands).

## Common overrides

Things real projects legitimately relax — add these to _your_ config's `rules`/`overrides`, they don't belong in the shared one:

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
