import { defineConfig } from 'oxlint';
import base from './base.js';
import svelte from './svelte.js';
import typeAware from './type-aware.js';
import vitest from './vitest.js';

export { default as base } from './base.js';
export { default as svelte } from './svelte.js';
export { default as typeAware } from './type-aware.js';
export { default as vitest } from './vitest.js';

/**
 * Kitchen sink: base + svelte + vitest + type-aware, in override-safe order.
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
	extends: [base, svelte, vitest, typeAware]
});
