import { defineConfig } from 'oxlint';
import base from './base.js';
import bun from './bun.js';
import svelte from './svelte.js';
import typeAware from './type-aware.js';
import vitest from './vitest.js';

export { default as base } from './base.js';
export { default as bun } from './bun.js';
export { default as svelte } from './svelte.js';
export { default as typeAware } from './type-aware.js';
export { default as vitest } from './vitest.js';

/**
 * Kitchen sink for Bun: base + bun + svelte + vitest + type-aware, in override-safe order.
 * Requires `oxlint-tsgolint` installed (type-aware rules are on).
 *
 * For à la carte composition, extend the named exports instead:
 *
 * ```ts
 * import base from "@himynameisdave/oxlint-config/base";
 * export default defineConfig({ extends: [base] });
 * ```
 */
export default defineConfig({
	extends: [base, bun, svelte, vitest, typeAware]
});
