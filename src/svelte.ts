import { defineConfig } from 'oxlint';

/**
 * Svelte overrides: rule adjustments for `.svelte` (and `.svelte.ts`/`.svelte.js`
 * rune modules).
 *
 * **Svelte 5 (runes) only.** Svelte 4 / legacy-mode syntax errors on purpose: `$:`
 * reactive statements trip `eslint/no-labels` and `export let` props trip
 * `import/no-mutable-exports`. See the "Svelte support" section of the README for the
 * exact rules to relax if you still ship legacy components.
 *
 * Extend AFTER base so these overrides win:
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
				// `let` (the compiler reassigns it), so const-ifying is a false positive.
				'eslint/prefer-const': 'off',
				// Rune destructuring (`let { data } = $props()`) trips the same way.
				'eslint/prefer-destructuring': 'off',
				// Component modules commonly hold a component + tiny helper classes.
				'eslint/max-classes-per-file': 'off',
				// import * as Dialog is the compound-component idiom (shadcn-svelte,
				// bits-ui): <Dialog.Root><Dialog.Trigger/> needs the namespace.
				'import/no-namespace': 'off'
			}
		}
	]
});
