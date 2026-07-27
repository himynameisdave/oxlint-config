/**
 * Verifies the configs are exhaustive against the INSTALLED oxlint version:
 *
 *   1. Extracts every registered `plugin/rule` from oxlint's type definitions,
 *      and asserts every plugin prefix has a stance — configured or excluded.
 *   2. Resolves each rule's category via `oxlint --print-config` (one run per category).
 *   3. Asserts every rule we defer to the nursery is still IN the nursery.
 *   4. Asserts: every registered rule for our enabled plugins appears in exactly
 *      one of base.ts / type-aware.ts / vitest.ts — no missing, stale, duplicates.
 *   5. Asserts every rule named in an `overrides` block still exists upstream.
 *
 * Every severity it walks along the way — top level or override — must be
 * "error" or "off" (iron rule 2).
 *
 * Exits non-zero with a diff when oxlint added/removed/renamed/promoted rules,
 * which is the signal to run the update workflow (.claude/skills/update-oxlint-rules).
 *
 * Runs under bun (TypeScript, no build step) on Bun's own APIs — Bun.file,
 * Bun.write, Bun.spawnSync. `node:os` tmpdir is the lone holdout: Bun ships no
 * temp-directory equivalent, and hand-rolling one from $TMPDIR would be worse
 * than the thing it replaces. Imports the compiled configs from dist/, so
 * `check-coverage` runs tsc first.
 */
import { tmpdir } from 'node:os';
import base from '../dist/base.js';
import svelte from '../dist/svelte.js';
import typeAware from '../dist/type-aware.js';
import vitest from '../dist/vitest.js';

const PLUGINS = ['typescript', 'unicorn', 'oxc', 'import', 'promise', 'node', 'jsdoc', 'vitest'];
// Plugins we deliberately don't configure — same philosophy as the rules: every
// exclusion is explicit and says why. A prefix in neither list fails the gate,
// so a whole new upstream plugin can't slip past iron rule 1 unnoticed.
const EXCLUDED_PLUGINS: Record<string, string> = {
	react: 'JSX — not a target stack',
	'react-perf': 'JSX — not a target stack',
	nextjs: 'React meta-framework — not a target stack',
	'jsx-a11y': 'JSX accessibility — no JSX to check',
	vue: 'Vue SFCs — Svelte is the component framework this config supports',
	jest: 'test runner — vitest is the one this package supports (src/vitest.ts)'
};
// Rules that are off ONLY because oxlint still marks them nursery. Promotion
// doesn't rename a rule, so the coverage diff below can't see it — this list
// fails the gate instead, so a real decision gets made (then drop it from here).
// `eslint/no-undef` is deliberately absent: its off-reason (tsc already catches
// unknown identifiers) outlives promotion, so promotion shouldn't nag.
const NURSERY_WATCH = [
	'eslint/no-restricted-exports',
	'eslint/no-unreachable-loop',
	'eslint/no-useless-assignment',
	'unicorn/no-useless-iterator-to-array',
	'import/export',
	'import/named',
	'promise/no-return-in-finally'
];
const ANCHOR = 'interface DummyRuleMap {';
const CATEGORIES = [
	'correctness',
	'suspicious',
	'pedantic',
	'perf',
	'style',
	'restriction',
	'nursery'
];

// Iron rule 2: "error" or "off", never "warn". Applied wherever a rule is
// declared — a stray "warn" inside an overrides block ships just as silently.
function checkSeverity(name: string, file: string, entry: unknown): void {
	const severity: unknown = Array.isArray(entry) ? entry[0] : entry;
	if (severity !== 'error' && severity !== 'off') {
		console.error(
			`BAD SEVERITY: ${name} in ${file} is "${String(severity)}" — policy is "error" or "off" only`
		);
		process.exitCode = 1;
	}
}

// --- 1. Registered rules from oxlint's own types -----------------------------
const dts = await Bun.file(`${import.meta.dir}/../node_modules/oxlint/dist/index.d.ts`).text();
const mapStart = dts.indexOf(ANCHOR);
// Without this, a renamed interface makes indexOf return -1, the slice grabs the
// wrong span, and the gate fails as a giant STALE list instead of saying why.
if (mapStart === -1) {
	throw new Error(
		`oxlint d.ts anchor "${ANCHOR}" not found — upstream types changed shape; update check-coverage.ts`
	);
}
const mapBody = dts.slice(mapStart, dts.indexOf('\n}', mapStart));
const prefixed = [...mapBody.matchAll(/"(?<name>[a-z0-9-]+\/[a-z0-9-]+)"\?/gu)].map(
	(match) => match[1] ?? ''
);
const bare = [...mapBody.matchAll(/\n {2}"?(?<name>[a-zA-Z0-9/-]+)"?\?:/gu)]
	.map((match) => match[1] ?? '')
	.filter((key) => !key.includes('/'));

// Plugin stance, taken from the UNFILTERED list — eslint core rules are bare in
// the d.ts, so they're absent here by construction and need no stance entry.
for (const prefix of new Set(prefixed.map((rule) => rule.split('/')[0] ?? ''))) {
	if (!PLUGINS.includes(prefix) && !Object.hasOwn(EXCLUDED_PLUGINS, prefix)) {
		console.error(
			`NEW PLUGIN (no stance): ${prefix} — add it to PLUGINS and decide its rules, or to EXCLUDED_PLUGINS with a reason`
		);
		process.exitCode = 1;
	}
}

const registered = new Set<string>([
	...prefixed.filter((rule) => PLUGINS.includes(rule.split('/')[0] ?? '')),
	...bare.map((rule) => `eslint/${rule}`)
]);

// --- 2. Category resolution via --print-config -------------------------------
// Bun.write builds the directory tree on the way, so there's nothing to mkdir;
// the UUID is what mkdtemp's suffix was for (concurrent runs must not collide).
const workDir = `${tmpdir()}/oxlint-coverage-${Bun.randomUUIDv7()}`;
const configPathFor = (category: string): string => `${workDir}/${category}.json`;
await Promise.all(
	CATEGORIES.map(async (category) =>
		Bun.write(
			configPathFor(category),
			JSON.stringify({ plugins: PLUGINS, categories: { [category]: 'error' } })
		)
	)
);

const categoryOf = new Map<string, string>();
for (const category of CATEGORIES) {
	const printed = Bun.spawnSync([
		'./node_modules/.bin/oxlint',
		'--print-config',
		'-c',
		configPathFor(category)
	]);
	// execFileSync used to throw this for us. Bun.spawnSync just hands back a
	// failed result, and an empty stdout would silently blank out the category
	// map — which is the input to every check below.
	if (!printed.success) {
		throw new Error(
			`oxlint --print-config failed for ${category}: ${printed.stderr.toString().trim()}`
		);
	}
	const parsed = JSON.parse(printed.stdout.toString()) as { rules: Record<string, string> };
	for (const [name, severity] of Object.entries(parsed.rules)) {
		if (severity !== 'deny') {
			continue;
		}
		categoryOf.set(name.includes('/') ? name : `eslint/${name}`, category);
	}
}

// --- 3. Nursery watchlist ----------------------------------------------------
// An absent category means the rule was deleted upstream, which the STALE diff
// in step 4 already reports — don't double-report it as a promotion.
for (const rule of NURSERY_WATCH) {
	const category = categoryOf.get(rule);
	if (category !== undefined && category !== 'nursery') {
		console.error(`PROMOTED (was nursery, now ${category} — decide it for real): ${rule}`);
		process.exitCode = 1;
	}
}

// --- 4. Compare against our shipped configs ----------------------------------
const configured = new Map<string, string>();
for (const [file, config] of Object.entries({
	'base.ts': base,
	'type-aware.ts': typeAware,
	'vitest.ts': vitest
})) {
	for (const [name, entry] of Object.entries(config.rules)) {
		const severity = Array.isArray(entry) ? entry[0] : entry;
		checkSeverity(name, file, entry);
		const firstFile = configured.get(name);
		// A later config re-declaring a rule as "off" is a deliberate handoff
		// (type-aware supersedes a base syntax rule); two ACTIVE entries are a bug.
		if (firstFile !== undefined && severity !== 'off') {
			console.error(`DUPLICATE: ${name} active in both ${firstFile} and ${file}`);
			process.exitCode = 1;
		}
		configured.set(name, firstFile ?? file);
	}
}

const missing = [...registered]
	.filter((rule) => !configured.has(rule))
	.toSorted((a, b) => a.localeCompare(b));
const stale = [...configured.keys()]
	.filter((rule) => !registered.has(rule))
	.toSorted((a, b) => a.localeCompare(b));

if (missing.length > 0) {
	console.error('MISSING (registered in oxlint, not decided in any config):');
	for (const rule of missing) {
		console.error(`  ${rule}  [${categoryOf.get(rule) ?? 'uncategorized'}]`);
	}
	process.exitCode = 1;
}
if (stale.length > 0) {
	console.error('STALE (configured, but no longer registered in oxlint):');
	for (const rule of stale) {
		console.error(`  ${rule}`);
	}
	process.exitCode = 1;
}

// --- 5. Overrides: staleness only --------------------------------------------
// Overrides don't need coverage (they adjust decisions already made at top
// level, so they're never MISSING), but a rule name that no longer exists
// upstream is a silently-dead override. oxlint infers each config's type from
// its literal, so they share no `overrides` shape — widen to the part we read.
// The index signature is load-bearing: without it this is a "weak type" and TS
// rejects type-aware.ts and vitest.ts, which have no overrides — yet. Every
// shipped config is listed so that adding an override anywhere is covered.
type ConfigWithOverrides = {
	overrides?: { rules?: Record<string, unknown> }[];
	[key: string]: unknown;
};
let overrideEntries = 0;
for (const [file, config] of Object.entries<ConfigWithOverrides>({
	'base.ts': base,
	'svelte.ts': svelte,
	'type-aware.ts': typeAware,
	'vitest.ts': vitest
})) {
	for (const override of config.overrides ?? []) {
		for (const [rawName, entry] of Object.entries(override.rules ?? {})) {
			overrideEntries += 1;
			const name = rawName.includes('/') ? rawName : `eslint/${rawName}`;
			checkSeverity(name, file, entry);
			if (!registered.has(name)) {
				console.error(`STALE (override): ${name} in ${file}`);
				process.exitCode = 1;
			}
		}
	}
}

if (process.exitCode !== 1) {
	console.log(
		`OK: ${registered.size} registered rules, all decided (${configured.size} entries); ` +
			`${overrideEntries} override entries and ${NURSERY_WATCH.length} nursery-watch rules verified.`
	);
}
