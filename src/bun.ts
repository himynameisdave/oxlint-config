import { fileURLToPath } from 'node:url';
import { defineConfig } from 'oxlint';

/**
 * Bun-targeted code: every rule in the pinned bunisms version is an error.
 * Resolve from this package so consumers need no separate plugin installation.
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
		// https://github.com/himynameisdave/eslint-plugin-bunisms/blob/main/docs/rules/prefer-bun-file.md
		'bun/prefer-bun-file': 'error',
		// Bun.write provides the native write path for Bun-targeted applications.
		// https://github.com/himynameisdave/eslint-plugin-bunisms/blob/main/docs/rules/prefer-bun-write.md
		'bun/prefer-bun-write': 'error',
		// Bun's subprocess APIs integrate directly with its runtime and streams.
		// https://github.com/himynameisdave/eslint-plugin-bunisms/blob/main/docs/rules/prefer-bun-spawn.md
		'bun/prefer-bun-spawn': 'error'
	}
});
