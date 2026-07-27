/**
 * Consumer smoke test: exercises the package the way a consumer does, packed into a
 * tarball, installed by name, imported through the `exports` map, linting real
 * app-shaped files.
 *
 * The other gates (`lint`, `format:check`, `check-coverage`) only ever exercise the
 * source repo. This is the only one that catches a typo'd `exports` path, a broken
 * override in `src/svelte.ts` (self-lint deliberately skips svelte), a dead test-file
 * override in `src/base.ts`, or a type-aware handoff that works in-repo but not from
 * an install.
 *
 * Load-bearing findings, learned by running this end to end:
 *
 *   - `npm pack` does NOT run `prepublishOnly` (that fires only on `npm publish`), so
 *     the tarball is empty unless `dist/` was built first. Hence the guard below and
 *     the `tsc &&` in the `test:consumer` script.
 *   - oxlint lints `.svelte` natively: no flag, no plugin, no extra dependency.
 *   - `ignorePatterns` from an EXTENDED config is not inherited. `src/base.ts` ships
 *     `['node_modules', 'dist', ...]` but a consumer who does `extends: [config]` does
 *     not get it, so the scratch project needs its own ignore source or oxlint walks
 *     all of `node_modules`. A plain `.gitignore` is enough (oxlint honours it even
 *     outside a git repo), and it is what a real consumer project would have.
 *
 * The two "override applies" checks are asserted two-sided (the suppressed rule is
 * absent AND another rule still fires on the same file), so a fixture that was never
 * linted at all cannot pass as a success.
 *
 * Runs under bun (see `test:consumer`), so it uses Bun's runtime APIs directly:
 * `Bun.$` for subprocesses, `Bun.file`/`Bun.write` for IO, `node:fs/promises` for the
 * bits Bun has no equivalent of. Everything is async; the only sequencing is genuine
 * data dependency (pack, then install, then lint).
 *
 * Note the global `Bun.$` rather than `import { $ } from 'bun'`: that import drags the
 * bun type package's global augmentation into the shared type-aware program, which
 * changes `RegExpMatchArray` indexing over in check-coverage.ts and trips
 * `typescript/no-unnecessary-condition` in a file this script never touches.
 */
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

type Diagnostic = { readonly code: string; readonly filename: string };
type Manifest = { readonly devDependencies: Readonly<Record<string, string>> };

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));
// Installed alongside the tarball so the consumer install mirrors this repo's versions.
const PEERS = ['oxlint', 'oxlint-tsgolint'];

// Fixtures live as strings, not committed files: committed ones would be linted by our
// own self-lint (they violate rules by design) and rewritten by oxfmt.
const FIXTURES = [
	// Proves the exports map + base config reach a plain source file at all.
	{ path: 'src/bad.ts', content: 'var x = 1;\nexport default x;\n' },
	// Proves the oxlint to tsgolint type-aware pipeline survives a consumer install.
	{
		path: 'src/floating.ts',
		content:
			'async function work(): Promise<number> {\n' +
			'\treturn 1;\n' +
			'}\n' +
			'\n' +
			'export function run(): void {\n' +
			'\twork();\n' +
			'}\n'
	},
	// Proves the type-aware return-await correctness case fires from a consumer
	// install: `return` (not `return await`) inside try/catch skips the catch on
	// rejection, so in-try-catch mode must flag it.
	{
		path: 'src/return-await.ts',
		content:
			'declare function fetchData(): Promise<string>;\n' +
			'\n' +
			'async function load(): Promise<string> {\n' +
			'\ttry {\n' +
			'\t\treturn fetchData();\n' +
			'\t} catch {\n' +
			"\t\treturn 'fallback';\n" +
			'\t}\n' +
			'}\n' +
			'\n' +
			'export { load };\n'
	},
	// Proves the svelte override applies: a never-reassigned `let` (prefer-const would
	// fire without the override) plus a `var` the override does not touch.
	{
		path: 'src/routes/+page.svelte',
		content:
			'<script lang="ts">\n' +
			'\tlet count = $state(0);\n' +
			'\tvar sentinel = count;\n' +
			'\texport { sentinel };\n' +
			'</script>\n' +
			'\n' +
			'<p>{count}</p>\n'
	},
	// Proves the base test-file override applies: no-console suppressed, no-var not.
	{
		path: 'src/util.test.ts',
		content: "console.log('hi');\nvar probe = 1;\nexport default probe;\n"
	},
	// Proves the vitest add-on reaches a consumer: a committed .only must fail CI.
	{
		path: 'src/focused.test.ts',
		content: "it.only('runs alone', () => {\n\texpect(1).toBe(1);\n});\n"
	}
];

const CONSUMER_CONFIG = `import { defineConfig } from 'oxlint';
import config from '@himynameisdave/oxlint-config';

export default defineConfig({ extends: [config] });
`;

const RESOLVE_CHECK = `import { createRequire } from 'node:module';

const subpaths = ['', '/base', '/svelte', '/type-aware', '/vitest'];

for (const sub of subpaths) {
	const specifier = \`@himynameisdave/oxlint-config\${sub}\`;
	const mod = await import(specifier);
	if (typeof mod.default !== 'object' || mod.default === null) {
		throw new Error(\`\${specifier} resolved but has no default export object\`);
	}
}

// The ./package.json export: publint, Renovate and some bundlers read it, and an
// exports map without it blocks the subpath outright. require() rather than import
// so the check does not depend on import-attributes support.
const pkg = createRequire(import.meta.url)('@himynameisdave/oxlint-config/package.json');
if (typeof pkg.version !== 'string') {
	throw new Error('package.json subpath resolved but has no version string');
}
`;

const failures: string[] = [];

const record = (message: string): void => {
	failures.push(message);
};

const diagnosticsIn = (all: readonly Diagnostic[], file: string): Diagnostic[] =>
	all.filter((entry) => entry.filename === file);

const hasCode = (found: readonly Diagnostic[], fragment: string): boolean =>
	found.some((entry) => entry.code.includes(fragment));

/** Asserts a rule fires on a file, naming what the failure would mean. */
const expectRule = (
	all: readonly Diagnostic[],
	file: string,
	fragment: string,
	proves: string
): void => {
	if (!hasCode(diagnosticsIn(all, file), fragment)) {
		record(`expected \`${fragment}\` on ${file} (${proves})`);
	}
};

/**
 * Asserts an override suppressed a rule on a file, and that the file was linted at all
 * (a fixture oxlint never opened would otherwise look identical to a working override).
 */
const expectSuppressed = (
	all: readonly Diagnostic[],
	file: string,
	fragment: string,
	proves: string
): void => {
	const found = diagnosticsIn(all, file);
	if (found.length === 0) {
		record(
			`${file} produced no diagnostics at all, so it was never linted and the` +
				` suppression of \`${fragment}\` proves nothing (${proves})`
		);
		return;
	}
	if (hasCode(found, fragment)) {
		record(`\`${fragment}\` fired on ${file} but should be suppressed (${proves})`);
	}
};

// --- 1. Pack the package exactly as npm would ---------------------------------
if (!(await Bun.file(join(REPO_ROOT, 'dist', 'index.js')).exists())) {
	console.error('dist/ is missing. Build first (`bun run build`, or `bun run test:consumer`).');
	process.exitCode = 1;
	throw new Error('dist/ not built');
}

const manifest = (await Bun.file(join(REPO_ROOT, 'package.json')).json()) as Manifest;
const workDir = await mkdtemp(join(tmpdir(), 'oxlint-consumer-'));
const projectDir = join(workDir, 'app');

// `--silent` reduces npm pack's output to the tarball filename alone.
const packed = await Bun.$`npm pack --silent --pack-destination ${workDir}`.cwd(REPO_ROOT).text();
const tarball = join(workDir, packed.trim().split('\n').at(-1) ?? '');

// --- 2. Scaffold a scratch consumer project -----------------------------------
// Bun.write creates missing parent directories, so the fixture paths need no mkdir.
await Promise.all([
	Bun.write(join(projectDir, 'package.json'), `${JSON.stringify({ type: 'module' }, null, 2)}\n`),
	// tsgolint needs a real TS project to type-check the type-aware fixture against.
	Bun.write(
		join(projectDir, 'tsconfig.json'),
		`${JSON.stringify({ compilerOptions: { strict: true } }, null, 2)}\n`
	),
	// node_modules: see the header note, or oxlint lints every installed file.
	// resolve-check.mjs: harness scaffolding, not consumer app code. It has to sit
	// inside the project for Node to resolve the package from it, but it is not a
	// fixture and must not show up in the diagnostics.
	Bun.write(join(projectDir, '.gitignore'), 'node_modules\nresolve-check.mjs\n'),
	Bun.write(join(projectDir, 'oxlint.config.ts'), CONSUMER_CONFIG),
	Bun.write(join(projectDir, 'resolve-check.mjs'), RESOLVE_CHECK),
	...FIXTURES.map(async (fixture) => Bun.write(join(projectDir, fixture.path), fixture.content))
]);

// --- 3. Install the tarball by name, with this repo's peer versions -----------
const peerSpecs = PEERS.map((dep) => `${dep}@${manifest.devDependencies[dep] ?? 'latest'}`);
await Bun.$`npm install --silent --no-audit --no-fund ${tarball} ${peerSpecs}`
	.cwd(projectDir)
	.quiet();

// --- 4. Lint the scratch project ----------------------------------------------
// A non-zero exit is the expected outcome (the fixtures violate rules on purpose), so
// `.nothrow()` keeps the diagnostics readable off stdout.
const linted = await Bun.$`./node_modules/.bin/oxlint -c oxlint.config.ts --format json`
	.cwd(projectDir)
	.nothrow()
	.quiet();
const raw = linted.stdout.toString().trim();

if (raw === '') {
	record('oxlint produced no output in the scratch project');
}

const diagnostics =
	raw === '' ? [] : (JSON.parse(raw) as { diagnostics: Diagnostic[] }).diagnostics;

// --- 5. Assert the six consumer-visible contracts -----------------------------
expectRule(diagnostics, 'src/bad.ts', 'no-var', 'the exports map and base config resolve');
expectRule(
	diagnostics,
	'src/floating.ts',
	'no-floating-promises',
	'the type-aware (tsgolint) pipeline runs from a consumer install'
);
expectRule(
	diagnostics,
	'src/return-await.ts',
	'return-await',
	'the return-await correctness fix (in-try-catch mode) fires from a consumer install'
);
expectSuppressed(
	diagnostics,
	'src/routes/+page.svelte',
	'prefer-const',
	'the svelte.ts override applies to .svelte files'
);
expectSuppressed(
	diagnostics,
	'src/util.test.ts',
	'no-console',
	"the base config's test-file override applies"
);
expectRule(
	diagnostics,
	'src/focused.test.ts',
	'no-focused-tests',
	'the vitest add-on rules fire from a consumer install'
);

// Anything outside src/ means the scratch setup rotted (see the ignorePatterns note).
const strays = [
	...new Set(
		diagnostics.filter((entry) => !entry.filename.startsWith('src/')).map((entry) => entry.filename)
	)
];
if (strays.length > 0) {
	record(`lint escaped the fixtures and hit: ${strays.slice(0, 5).join(', ')}`);
}

// --- 6. Assert every subpath resolves by package name -------------------------
const resolved = await Bun.$`node resolve-check.mjs`.cwd(projectDir).nothrow().quiet();
if (resolved.exitCode !== 0) {
	// Node leads with a stack frame, so pick the line that actually names the failure.
	const lines = resolved.stderr.toString().trim().split('\n');
	const reason = lines.find((line) => /(?:Error|ERR_[A-Z_]+)/u.test(line)) ?? lines[0];
	record(`subpath imports failed (exports map): ${reason.trim()}`);
}

// --- 7. Report ------------------------------------------------------------------
if (failures.length > 0) {
	console.error('CONSUMER SMOKE TEST FAILED:');
	for (const failure of failures) {
		console.error(`  ${failure}`);
	}
	console.error(`\nScratch project kept for debugging: ${projectDir}`);
	console.error(
		`Diagnostics seen: ${diagnostics.map((entry) => entry.code).join(', ') || '(none)'}`
	);
	process.exitCode = 1;
} else {
	await rm(workDir, { recursive: true, force: true });
	console.log(
		`OK: packed tarball installs, all 5 subpaths + ./package.json resolve,` +
			` ${FIXTURES.length} fixtures behave.`
	);
}
