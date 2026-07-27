import { defineConfig } from 'oxlint';

/**
 * Vitest add-on: every rule from oxlint's `vitest` plugin, decided explicitly.
 * Opt in alongside base if your tests run under Vitest:
 *
 * ```ts
 * export default defineConfig({ extends: [base, vitest] });
 * ```
 *
 * These rules only fire on test-shaped syntax (describe/it/test/expect), so
 * they are inert in app code; no `files` scoping needed.
 *
 * Known limitation: oxlint resolves test functions by import source (`vitest`,
 * `@jest/globals`) or bare globals. `import { it } from 'bun:test'` is NOT
 * recognized, so none of these rules fire on bun:test-style suites. Bun users
 * get no coverage from this add-on until oxlint supports bun:test upstream.
 */
export default defineConfig({
	plugins: ['vitest'],
	rules: {
		/* ================================================================== *
		 * vitest — correctness
		 * ================================================================== */
		// A test with no assertion passes vacuously; it can never fail.
		'vitest/expect-expect': 'error',
		// vi.mock/vi.hoisted run before imports no matter where they're written;
		// placing them lower misleads readers about execution order.
		'vitest/hoisted-apis-on-top': 'error',
		// An expect inside if/catch can silently never run; the test still passes.
		'vitest/no-conditional-expect': 'error',
		// Conditionally-registered tests mean different environments run different
		// suites, so CI green stops meaning the same thing everywhere.
		'vitest/no-conditional-tests': 'error',
		// .skip rots invisibly and keeps CI green; use .todo for planned work
		// (allowed, see warn-todo) or delete the test.
		'vitest/no-disabled-tests': 'error',
		// .only committed to a suite makes CI silently green while skipping every
		// other test: the exact quiet failure this config exists to prevent.
		'vitest/no-focused-tests': 'error',
		// An expect in a describe body runs at collection time; its failure isn't
		// attributed to any test.
		'vitest/no-standalone-expect': 'error',
		// Auto-numbered snapshots shift identity when assertions are added or
		// reordered; a hint pins each one (fires only with multiple per test).
		'vitest/prefer-snapshot-hint': 'error',
		// An unawaited expect.poll()/expect.element() resolves after the test
		// ends, so the assertion never gets a chance to fail.
		'vitest/require-awaited-expect-poll': 'error',
		// Under test.concurrent, the global expect's snapshot state races; the
		// local context expect is the only reliable one.
		'vitest/require-local-test-context-for-concurrent-snapshots': 'error',
		// Untyped vi.fn() is (...args: any[]) => any, so wrong call shapes in
		// assertions pass silently.
		'vitest/require-mock-type-parameters': 'error',
		// Bare toThrow() passes on ANY error; asserting the message pins which
		// failure you actually meant.
		'vitest/require-to-throw-message': 'error',
		// A malformed describe callback (async, params, non-function) breaks
		// collection quietly.
		'vitest/valid-describe-callback': 'error',
		// expect() with no matcher, or a matcher misuse, asserts nothing at all.
		'vitest/valid-expect': 'error',
		// A promise-chained expect must be awaited/returned or it asserts after
		// the test has already passed.
		'vitest/valid-expect-in-promise': 'error',
		// Empty or dynamic-garbage titles break -t filtering and failure reports.
		'vitest/valid-title': 'error',
		// .todo is the sanctioned marker for planned tests; banning it would push
		// people back to .skip, which no-disabled-tests rightly forbids.
		'vitest/warn-todo': 'off',

		/* ================================================================== *
		 * vitest — suspicious
		 * ================================================================== */
		// Commented-out tests rot silently; delete them or mark .todo.
		'vitest/no-commented-out-tests': 'error',

		/* ================================================================== *
		 * vitest — pedantic
		 * ================================================================== */
		// Branching in fixture setup (platform switches, parameterization) is
		// legitimate; the real hazards are already errors via no-conditional-tests
		// and no-conditional-expect.
		'vitest/no-conditional-in-test': 'off',

		/* ================================================================== *
		 * vitest — style
		 * ================================================================== */
		// .each and .for differ semantically (.for passes the test context), so
		// the choice is per-case, not a consistency to police.
		'vitest/consistent-each-for': 'off',
		// The base test-file override deliberately supports both .test and .spec
		// conventions; picking one is repo policy, not lint.
		'vitest/consistent-test-filename': 'off',
		// One word per scope: the default (test at top level, it inside describe)
		// matches how each reads grammatically.
		'vitest/consistent-test-it': 'error',
		// vi and vitest are the same object; one accessor (vi, the documented one)
		// keeps greps and reviews single-spelling.
		'vitest/consistent-vitest-vi': 'error',
		// Assertion-count caps are arbitrary (same stance as max-lines).
		'vitest/max-expects': 'off',
		// Nesting-depth caps are arbitrary (same stance as max-lines).
		'vitest/max-nested-describe': 'off',
		// toBeCalled/toHaveBeenCalled are aliases; one canonical spelling.
		'vitest/no-alias-methods': 'error',
		// Two beforeEach in one describe both run; almost always a merge mistake.
		'vitest/no-duplicate-hooks': 'error',
		// Hooks are the normal setup mechanism; banning them outright is a niche
		// philosophy this config doesn't share.
		'vitest/no-hooks': 'off',
		// Duplicate titles make failures ambiguous and -t filtering grab both.
		'vitest/no-identical-title': 'error',
		// import from node:test in a Vitest suite runs under a different runner's
		// semantics; assertions quietly diverge.
		'vitest/no-import-node-test': 'error',
		// Twin of prefer-importing-vitest-globals; explicit imports win (below),
		// so the globals-only counterpart stays off.
		'vitest/no-importing-vitest-globals': 'off',
		// Interpolated inline snapshots can't be updated by the runner (-u).
		'vitest/no-interpolation-in-snapshots': 'error',
		// Snapshot size caps are arbitrary (same stance as max-lines).
		'vitest/no-large-snapshots': 'off',
		// Importing from __mocks__ directly bypasses the mocking system the
		// directory exists to feed.
		'vitest/no-mocks-import': 'error',
		// Inert without options; restricting matchers is a consumer decision.
		'vitest/no-restricted-matchers': 'off',
		// Inert without options; restricting vi methods is a consumer decision.
		'vitest/no-restricted-vi-methods': 'off',
		// xit/fdescribe are the sneaky spellings of .skip/.only; force the dotted
		// forms so no-disabled-tests/no-focused-tests can see them.
		'vitest/no-test-prefixes': 'error',
		// A return in a test body usually hides an unawaited promise; await it.
		'vitest/no-test-return-statement': 'error',
		// expect(async () => { await f(); }) wraps a promise in a function for no
		// reason; pass the promise straight to .rejects.
		'vitest/no-unneeded-async-expect-function': 'error',
		// Blank-line layout is oxfmt's job.
		'vitest/padding-around-after-all-blocks': 'off',
		// Blank-line layout is oxfmt's job.
		'vitest/padding-around-test-blocks': 'off',
		// One matcher stating the full contract (count + args) beats two that can
		// drift apart.
		'vitest/prefer-called-exactly-once-with': 'error',
		// toHaveBeenCalledOnce reads as the assertion it is; twin of
		// prefer-called-times, and exactly one direction can be on.
		'vitest/prefer-called-once': 'error',
		// Opposite twin of prefer-called-once (enabled above).
		'vitest/prefer-called-times': 'off',
		// Asserting the arguments catches wrong-payload bugs that a bare
		// "was it called" never will.
		'vitest/prefer-called-with': 'error',
		// toBeGreaterThan(x) reports both values on failure; toBe(a > x) reports
		// only true/false.
		'vitest/prefer-comparison-matcher': 'error',
		// describe(fn) survives renames; describe("fn") silently goes stale.
		'vitest/prefer-describe-function-title': 'error',
		// Hand-rolled for-loops around test() hide per-case titles that .each
		// reports individually.
		'vitest/prefer-each': 'error',
		// expect(a === b).toBe(true) hides both operands in the failure output.
		'vitest/prefer-equality-matcher': 'error',
		// expect.assertions() in every test is ceremony; expect-expect and
		// no-conditional-expect already cover the vacuous-pass risk.
		'vitest/prefer-expect-assertions': 'off',
		// await expect(p).resolves fails as an assertion; expect(await p) fails as
		// an unhandled rejection with a worse trace.
		'vitest/prefer-expect-resolves': 'error',
		// toBeTypeOf("string") reports the actual value; expect(typeof x) reports
		// two strings.
		'vitest/prefer-expect-type-of': 'error',
		// Lifecycle order (beforeAll, beforeEach, afterEach, afterAll) makes
		// suite setup scannable.
		'vitest/prefer-hooks-in-order': 'error',
		// Hooks buried below tests are easy to miss when reading a suite.
		'vitest/prefer-hooks-on-top': 'error',
		// vi.mock(import("./m")) is typed and refactor-safe; the string form
		// silently goes stale.
		'vitest/prefer-import-in-mock': 'error',
		// Explicit imports type-check and work whether or not globals: true is
		// set; twin no-importing-vitest-globals stays off.
		'vitest/prefer-importing-vitest-globals': 'error',
		// Title casing is cosmetic.
		'vitest/prefer-lowercase-title': 'off',
		// mockResolvedValue(x) states intent; mockImplementation(() =>
		// Promise.resolve(x)) buries it.
		'vitest/prefer-mock-promise-shorthand': 'error',
		// mockReturnValue(x) states intent; mockImplementation(() => x) buries it.
		'vitest/prefer-mock-return-shorthand': 'error',
		// vi.spyOn restores on mockRestore; assigning vi.fn() onto an object
		// clobbers the method for every later test.
		'vitest/prefer-spy-on': 'error',
		// toBeTruthy passes on 1, "x", {}; toBe(true) asserts the actual boolean.
		'vitest/prefer-strict-boolean-matchers': 'error',
		// toStrictEqual catches undefined-vs-missing keys and class mismatches
		// that toEqual ignores.
		'vitest/prefer-strict-equal': 'error',
		// toBe uses Object.is and prints a focused diff for primitives.
		'vitest/prefer-to-be': 'error',
		// Opposite of prefer-strict-boolean-matchers (enabled); loose truthiness
		// is exactly what we ban.
		'vitest/prefer-to-be-falsy': 'off',
		// Targets jest-extended's toBeObject, which vanilla Vitest doesn't ship.
		'vitest/prefer-to-be-object': 'off',
		// Opposite of prefer-strict-boolean-matchers (enabled); loose truthiness
		// is exactly what we ban.
		'vitest/prefer-to-be-truthy': 'off',
		// toContain prints the array on failure; .includes() toBe(true) prints a
		// boolean.
		'vitest/prefer-to-contain': 'error',
		// toHaveBeenCalledTimes keeps the mock's call log in the failure output;
		// asserting mock.calls.length loses it.
		'vitest/prefer-to-have-been-called-times': 'error',
		// toHaveLength reports the actual length; .length toBe(n) reports two
		// bare numbers.
		'vitest/prefer-to-have-length': 'error',
		// An empty test() body silently passes forever; .todo marks the intent
		// honestly (and warn-todo stays off to allow it).
		'vitest/prefer-todo': 'error',
		// Top-level fixture constants are idiomatic; hooks-only setup is ceremony.
		'vitest/require-hook': 'off',
		// Flat test files are fine; a mandatory describe wrapper is boilerplate.
		'vitest/require-top-level-describe': 'off',

		/* ================================================================== *
		 * vitest — restriction
		 * ================================================================== */
		// The runner's default timeout already bounds every test; repeating it
		// per-test is noise.
		'vitest/require-test-timeout': 'off'
	}
});
