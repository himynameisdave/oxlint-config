import { defineConfig } from 'oxlint';

/**
 * Type-aware rules: everything here needs type information, which means the
 * `oxlint-tsgolint` package installed and linting run with `--type-aware`
 * (or this file's `options.typeAware` — set below, so extending is enough).
 *
 * These are the highest-value rules in the whole config — they catch the bugs
 * syntax-level linting can't see (floating promises, impossible conditions,
 * unsound assertions).
 */
export default defineConfig({
	options: {
		typeAware: true
	},
	rules: {
		// await on a non-Thenable is dead syntax that implies async behavior.
		'typescript/await-thenable': 'error',
		// tsconfig's noImplicitReturns enforces this at compile time with fewer false positives.
		'typescript/consistent-return': 'off',
		// export type for type-only exports — keeps them erasable by any transpiler.
		'typescript/consistent-type-exports': 'error',
		// obj["key"] for a statically-known key is obj.key.
		'typescript/dot-notation': 'error',
		// NOTE: tsgolint also implements naming-convention and prefer-destructuring,
		// but oxlint 1.75 doesn't register those rule names yet — add them here once
		// they land upstream.
		// delete arr[i] leaves a hole, not a shorter array — splice/filter instead.
		'typescript/no-array-delete': 'error',
		// `${object}` renders "[object Object]" — the type system knows and can stop it.
		'typescript/no-base-to-string': 'error',
		// const x = voidFn() assigns undefined while looking meaningful.
		'typescript/no-confusing-void-expression': 'error',
		// Using @deprecated APIs is scheduled breakage; migrate at lint time, not upgrade time.
		'typescript/no-deprecated': 'error',
		// string | string unions signal a broken type expression.
		'typescript/no-duplicate-type-constituents': 'error',
		// An unawaited promise swallows its rejection — the #1 async bug this stack catches.
		'typescript/no-floating-promises': 'error',
		// for-in over an array iterates string keys and prototype pollution.
		'typescript/no-for-in-array': 'error',
		// setTimeout("string") — the type-aware twin of the base rule (see off below).
		'typescript/no-implied-eval': 'error',
		// void x to discard a value the type system says is already void.
		'typescript/no-meaningless-void-operator': 'error',
		// A promise where a boolean/void is expected (if (asyncCheck()) — always truthy).
		'typescript/no-misused-promises': 'error',
		// Spreading a Promise/function/Map into an object silently produces garbage.
		'typescript/no-misused-spread': 'error',
		// Enums mixing string and number members defeat both mental models.
		'typescript/no-mixed-enums': 'error',
		// `string | never` and friends — a constituent that changes nothing signals a typo.
		'typescript/no-redundant-type-constituents': 'error',
		// x === true on a boolean is x.
		'typescript/no-unnecessary-boolean-literal-compare': 'error',
		// A condition the types prove always-true/false is dead code or a wrong type.
		'typescript/no-unnecessary-condition': 'error',
		// Namespace.member where member is already in scope.
		'typescript/no-unnecessary-qualifier': 'error',
		// `${"literal"}` — a template around nothing dynamic.
		'typescript/no-unnecessary-template-expression': 'error',
		// Type args matching the defaults restate the obvious.
		'typescript/no-unnecessary-type-arguments': 'error',
		// `as T` where the value is already T teaches readers to ignore assertions.
		'typescript/no-unnecessary-type-assertion': 'error',
		// String(alreadyString) — conversion of a value already that type.
		'typescript/no-unnecessary-type-conversion': 'error',
		// A type param used once constrains nothing — inline it.
		'typescript/no-unnecessary-type-parameters': 'error',
		// enumValue === "raw string" bypasses the enum's whole point.
		'typescript/no-unsafe-enum-comparison': 'error',
		// Unary minus on non-numbers produces NaN silently.
		'typescript/no-unsafe-unary-minus': 'error',
		// param = defaultValue where the type already guarantees non-undefined.
		'typescript/no-useless-default-assignment': 'error',
		// x as T where x! expresses exactly "remove null" — say the narrower thing.
		'typescript/non-nullable-type-assertion-style': 'error',
		// throw of non-Error values loses stack traces (type-aware big sibling of
		// eslint/no-throw-literal, which is off below).
		'typescript/only-throw-error': 'error',
		// filter(...)[0] over the whole array; find stops early (supersedes unicorn's twin, off below).
		'typescript/prefer-find': 'error',
		// indexOf !== -1 is includes, with types (supersedes unicorn's twin, off below).
		'typescript/prefer-includes': 'error',
		// || treats 0/"" as missing; ?? means "nullish only". A/B disagreed — stricter B wins.
		'typescript/prefer-nullish-coalescing': 'error',
		// a && a.b chains have an a?.b spelling that can't typo the guard.
		'typescript/prefer-optional-chain': 'error',
		// Rejections must be Errors for stacks (supersedes eslint/prefer-promise-reject-errors below).
		'typescript/prefer-promise-reject-errors': 'error',
		// A private field never reassigned is readonly — let the type say so.
		'typescript/prefer-readonly': 'error',
		// Parameters you don't mutate should say so — readonly params make mutation
		// a visible API decision. ignoreInferredTypes spares callback params; the allow
		// list exempts inherently-mutable platform types. Consumers append their own
		// framework types (RequestEvent, Page, ...) via their overrides.
		'typescript/prefer-readonly-parameter-types': [
			'error',
			{
				ignoreInferredTypes: true,
				allow: [
					{ from: 'lib', name: 'Date' },
					{ from: 'lib', name: 'URL' },
					{ from: 'lib', name: 'URLSearchParams' },
					{ from: 'lib', name: 'FormData' },
					{ from: 'lib', name: 'Request' },
					{ from: 'lib', name: 'Response' },
					{ from: 'lib', name: 'Headers' },
					{ from: 'lib', name: 'RegExp' }
				]
			}
		],
		// reduce<T>(...) over reduce(...) as T — the type param checks, the cast lies.
		'typescript/prefer-reduce-type-parameter': 'error',
		// exec() over match() for single-match regexes — same result, no branching on flags.
		'typescript/prefer-regexp-exec': 'error',
		// Chainable methods returning `this` should say `this`, not the class name.
		'typescript/prefer-return-this-type': 'error',
		// startsWith over regex/indexOf checks, with types confirming string-ness
		// (supersedes unicorn's twin, off below).
		'typescript/prefer-string-starts-ends-with': 'error',
		// A function returning Promise should be async — the keyword is the documentation.
		'typescript/promise-function-async': 'error',
		// A getter/setter pair with mismatched types breaks obj.x = obj.x.
		'typescript/related-getter-setter-pairs': 'error',
		// sort() without a comparator sorts numbers as strings ([1, 10, 2]).
		'typescript/require-array-sort-compare': 'error',
		// async-without-await wrappers are common API-uniformity tools (off per smallreads).
		'typescript/require-await': 'off',
		// "str" + num coercion — make the conversion explicit.
		'typescript/restrict-plus-operands': 'error',
		// `${obj}` in templates — same [object Object] family as no-base-to-string.
		'typescript/restrict-template-expressions': 'error',
		// return-vs-return-await has real try/catch stack differences, but enforcing a
		// direction flip-flops with runtime optimizations (off per smallreads).
		'typescript/return-await': 'off',
		// if (str) conflating "" with absence is idiomatic JS; requiring !== "" everywhere
		// fights the language (off per smallreads).
		'typescript/strict-boolean-expressions': 'off',
		// Returning a value from a void-typed callback gets silently discarded.
		'typescript/strict-void-return': 'error',
		// A switch on a union that misses a member compiles today, breaks when the union grows.
		'typescript/switch-exhaustiveness-check': 'error',
		// Passing obj.method unbound loses `this` at the callsite.
		'typescript/unbound-method': 'error',
		// catch (e: unknown) in callbacks — forces narrowing instead of assuming Error.
		'typescript/use-unknown-in-catch-callback-variable': 'error',

		/* ------------------------------------------------------------------ *
		 * The unsafe-* family: all off. They exist to quarantine `any`, but
		 * no-explicit-any already bans introducing it — what remains is `any`
		 * leaking from third-party APIs, where these produce walls of noise
		 * at every boundary (both source configs agree).
		 * ------------------------------------------------------------------ */
		// any as a function argument.
		'typescript/no-unsafe-argument': 'off',
		// Assigning an any value.
		'typescript/no-unsafe-assignment': 'off',
		// Calling an any value.
		'typescript/no-unsafe-call': 'off',
		// Member access on an any value.
		'typescript/no-unsafe-member-access': 'off',
		// Returning an any value.
		'typescript/no-unsafe-return': 'off',
		// Asserting from any (`x as T`); tests exempt it anyway in base's override.
		'typescript/no-unsafe-type-assertion': 'off',

		/* ------------------------------------------------------------------ *
		 * Base-rule handoffs: the type-aware extension version above replaces
		 * the syntax-only base rule, so turn the base one off to avoid double
		 * reports on the same line.
		 * ------------------------------------------------------------------ */
		// Superseded by typescript/no-implied-eval.
		'eslint/no-implied-eval': 'off',
		// Superseded by typescript/only-throw-error.
		'eslint/no-throw-literal': 'off',
		// Superseded by typescript/prefer-promise-reject-errors.
		'eslint/prefer-promise-reject-errors': 'off',
		// Superseded by typescript/prefer-find.
		'unicorn/prefer-array-find': 'off',
		// Superseded by typescript/prefer-includes.
		'unicorn/prefer-includes': 'off',
		// Superseded by typescript/prefer-string-starts-ends-with.
		'unicorn/prefer-string-starts-ends-with': 'off'
	}
});
