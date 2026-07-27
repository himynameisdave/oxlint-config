/**
 * Verifies the configs are exhaustive against the INSTALLED oxlint version:
 *
 *   1. Extracts every registered `plugin/rule` from oxlint's type definitions.
 *   2. Resolves each rule's category via `oxlint --print-config` (one run per category).
 *   3. Asserts every rule we defer to the nursery is still IN the nursery.
 *   4. Asserts: every registered rule for our enabled plugins appears in exactly
 *      one of base.ts / type-aware.ts — no missing, no stale, no duplicates.
 *   5. Asserts every rule named in an `overrides` block still exists upstream.
 *
 * Exits non-zero with a diff when oxlint added/removed/renamed/promoted rules,
 * which is the signal to run the update workflow (.claude/skills/update-oxlint-rules).
 *
 * Runs under bun (TypeScript, no build step); imports the compiled configs from
 * dist/, so `check-coverage` runs tsc first.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import base from '../dist/base.js';
import svelte from '../dist/svelte.js';
import typeAware from '../dist/type-aware.js';
import vitest from '../dist/vitest.js';

const PLUGINS = ['typescript', 'unicorn', 'oxc', 'import', 'promise', 'node', 'jsdoc', 'vitest'];
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
const CATEGORIES = [
	'correctness',
	'suspicious',
	'pedantic',
	'perf',
	'style',
	'restriction',
	'nursery'
];

// --- 1. Registered rules from oxlint's own types -----------------------------
const dts = readFileSync(
	new URL('../node_modules/oxlint/dist/index.d.ts', import.meta.url),
	'utf8'
);
const mapStart = dts.indexOf('interface DummyRuleMap {');
const mapBody = dts.slice(mapStart, dts.indexOf('\n}', mapStart));
const prefixed = [...mapBody.matchAll(/"(?<name>[a-z0-9-]+\/[a-z0-9-]+)"\?/gu)].map(
	(match) => match[1] ?? ''
);
const bare = [...mapBody.matchAll(/\n {2}"?(?<name>[a-zA-Z0-9/-]+)"?\?:/gu)]
	.map((match) => match[1] ?? '')
	.filter((key) => !key.includes('/'));
const registered = new Set<string>([
	...prefixed.filter((rule) => PLUGINS.includes(rule.split('/')[0] ?? '')),
	...bare.map((rule) => `eslint/${rule}`)
]);

// --- 2. Category resolution via --print-config -------------------------------
const workDir = mkdtempSync(join(tmpdir(), 'oxlint-coverage-'));
const categoryOf = new Map<string, string>();
for (const category of CATEGORIES) {
	const configPath = join(workDir, `${category}.json`);
	writeFileSync(
		configPath,
		JSON.stringify({ plugins: PLUGINS, categories: { [category]: 'error' } })
	);
	const printed = execFileSync('./node_modules/.bin/oxlint', ['--print-config', '-c', configPath], {
		encoding: 'utf8'
	});
	const parsed = JSON.parse(printed) as { rules: Record<string, string> };
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
		for (const rawName of Object.keys(override.rules ?? {})) {
			overrideEntries += 1;
			const name = rawName.includes('/') ? rawName : `eslint/${rawName}`;
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
