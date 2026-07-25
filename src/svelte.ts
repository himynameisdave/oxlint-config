import { defineConfig } from 'oxlint';

/**
 * Svelte overrides: rule adjustments for `.svelte` (and `.svelte.ts`/`.svelte.js`
 * rune modules). Extend AFTER base so these overrides win:
 *
 * ```ts
 * export default defineConfig({ extends: [base, svelte] });
 * ```
 */
export default defineConfig({
	overrides: [
		{
			files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
			rules: {
				// Svelte 5 runes ($state, $derived, $props) declare reactive state with
				// `let` — the compiler reassigns it, so const-ifying is a false positive.
				'eslint/prefer-const': 'off',
				// Rune destructuring (`let { data } = $props()`) trips the same way.
				'eslint/prefer-destructuring': 'off',
				// Component modules commonly hold a component + tiny helper classes.
				'eslint/max-classes-per-file': 'off',
				// `export let` (Svelte 4 props) and writable `$state` exports are the
				// framework's own mutation contract, not a shared-state accident.
				'import/no-mutable-exports': 'off'
			}
		}
	]
});
