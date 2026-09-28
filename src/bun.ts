import { fileURLToPath } from 'node:url';
import { defineConfig } from 'oxlint';

/**
 * Bun-targeted code: every rule in the pinned bunisms version is a warning.
 * Resolve from this package so consumers need no separate plugin installation.
 * `--deny-warnings` makes these warnings fail CI too.
 */
export default defineConfig({
	jsPlugins: [
		{
			name: 'bun',
			specifier: fileURLToPath(import.meta.resolve('eslint-plugin-bunisms'))
		}
	],
	rules: {
		// Bun.file keeps file reads on Bun's native file API.
		'bun/prefer-bun-file': 'warn',
		// Bun.write provides the native write path for Bun-targeted applications.
		'bun/prefer-bun-write': 'warn',
		// Bun's subprocess APIs integrate directly with its runtime and streams.
		'bun/prefer-bun-spawn': 'warn'
	}
});
