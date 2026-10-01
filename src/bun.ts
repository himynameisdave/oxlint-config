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
		'bun/prefer-bun-spawn': 'error',
		// Bun Shell is the cross-platform API for shell-oriented process execution.
		// https://github.com/himynameisdave/eslint-plugin-bunisms/blob/main/docs/rules/prefer-bun-shell.md
		'bun/prefer-bun-shell': 'error',
		// Bun loads environment files automatically, making dotenv redundant.
		// https://github.com/himynameisdave/eslint-plugin-bunisms/blob/main/docs/rules/no-dotenv.md
		'bun/no-dotenv': 'error',
		// Bun exposes the current module directory directly.
		// https://github.com/himynameisdave/eslint-plugin-bunisms/blob/main/docs/rules/prefer-import-meta-dir.md
		'bun/prefer-import-meta-dir': 'error',
		// Bun exposes an entrypoint check directly on import.meta.
		// https://github.com/himynameisdave/eslint-plugin-bunisms/blob/main/docs/rules/prefer-import-meta-main.md
		'bun/prefer-import-meta-main': 'error',
		// Bun exposes the current module path directly on import.meta.
		// https://github.com/himynameisdave/eslint-plugin-bunisms/blob/main/docs/rules/prefer-import-meta-path.md
		'bun/prefer-import-meta-path': 'error',
		// Bun's native CryptoHasher handles supported cryptographic digest chains.
		// https://github.com/himynameisdave/eslint-plugin-bunisms/blob/main/docs/rules/prefer-bun-crypto-hasher.md
		'bun/prefer-bun-crypto-hasher': 'error',
		// Fetch provides Bun's native promise-based HTTP client API.
		// https://github.com/himynameisdave/eslint-plugin-bunisms/blob/main/docs/rules/prefer-fetch.md
		'bun/prefer-fetch': 'error',
		// Bun ESM exposes module-relative resolution through import.meta.
		// https://github.com/himynameisdave/eslint-plugin-bunisms/blob/main/docs/rules/prefer-import-meta-resolve.md
		'bun/prefer-import-meta-resolve': 'error',
		// Static imports can run module side effects before a late Bun mock.
		// https://github.com/himynameisdave/eslint-plugin-bunisms/blob/main/docs/rules/no-late-module-mock.md
		'bun/no-late-module-mock': 'error'
	}
});
