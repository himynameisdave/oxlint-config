import { defineConfig } from 'oxlint';

/**
 * Base config: core JS/TS rules with no framework assumptions.
 *
 * Every rule from every enabled plugin is listed explicitly with a severity and
 * a reason. Categories are all `"off"` — nothing is enabled implicitly, so this
 * file is the complete, greppable inventory of what is enforced.
 *
 * Severity policy: `"error"` or `"off"`, never `"warn"` — warnings are noise
 * that scroll by unfixed. Run with `--deny-warnings` anyway.
 *
 * Type-aware rules (requiring `--type-aware` + `oxlint-tsgolint`) live in
 * `type-aware.ts`, not here.
 */
export default defineConfig({
	// Explicit over implicit: every category off; only the rules below are active.
	categories: {
		correctness: 'off',
		suspicious: 'off',
		pedantic: 'off',
		perf: 'off',
		style: 'off',
		restriction: 'off',
		nursery: 'off'
	},
	plugins: ['typescript', 'unicorn', 'oxc', 'import', 'promise', 'node', 'jsdoc'],
	env: {
		browser: true,
		es2024: true
	},
	rules: {
		/* ================================================================== *
		 * eslint — correctness
		 * ================================================================== */
		// Missing super() in a derived class throws at construction time.
		'eslint/constructor-super': 'error',
		// A for-loop counting the wrong direction never terminates.
		'eslint/for-direction': 'error',
		// A getter with no return silently yields undefined.
		'eslint/getter-return': 'error',
		// Async executors swallow rejections the Promise constructor can't see.
		'eslint/no-async-promise-executor': 'error',
		// arguments.caller/callee are deprecated and break in strict mode.
		'eslint/no-caller': 'error',
		// Reassigning a class binding clobbers the class for all callers.
		'eslint/no-class-assign': 'error',
		// x === -0 passes for +0 too; Object.is is the real check.
		'eslint/no-compare-neg-zero': 'error',
		// Assignment in a condition is almost always a typo'd comparison.
		'eslint/no-cond-assign': 'error',
		// Reassigning a const throws at runtime.
		'eslint/no-const-assign': 'error',
		// Expressions like `x === y || z` with constant halves are always bugs.
		'eslint/no-constant-binary-expression': 'error',
		// while(true) is fine only when intentional; constant conditions usually aren't.
		'eslint/no-constant-condition': 'error',
		// Control characters in regexes are invisible and almost never intended.
		'eslint/no-control-regex': 'error',
		// debugger statements must not ship.
		'eslint/no-debugger': 'error',
		// delete on a plain variable is a strict-mode SyntaxError.
		'eslint/no-delete-var': 'error',
		// Duplicate class members: the last silently wins.
		'eslint/no-dupe-class-members': 'error',
		// Duplicate else-if conditions make the later branch dead code.
		'eslint/no-dupe-else-if': 'error',
		// Duplicate object keys: the last silently wins.
		'eslint/no-dupe-keys': 'error',
		// Duplicate case labels make the later case unreachable.
		'eslint/no-duplicate-case': 'error',
		// [] in a regex matches nothing — the pattern is broken.
		'eslint/no-empty-character-class': 'error',
		// Empty destructuring patterns do nothing and hide typos.
		'eslint/no-empty-pattern': 'error',
		// An empty static block is leftover scaffolding.
		'eslint/no-empty-static-block': 'error',
		// eval executes arbitrary strings — a security hole and an optimizer killer.
		'eslint/no-eval': 'error',
		// Reassigning the caught error loses the original failure.
		'eslint/no-ex-assign': 'error',
		// !!x in a boolean context is redundant noise.
		'eslint/no-extra-boolean-cast': 'error',
		// Reassigning a function declaration confuses hoisting and readers.
		'eslint/no-func-assign': 'error',
		// Assigning to window/globalThis members clobbers shared state.
		'eslint/no-global-assign': 'error',
		// Assigning to an import binding throws in ESM.
		'eslint/no-import-assign': 'error',
		// Invalid regex literals throw at parse time in RegExp().
		'eslint/no-invalid-regexp': 'error',
		// Zero-width/irregular whitespace is invisible and breaks tokenizing.
		'eslint/no-irregular-whitespace': 'error',
		// __iterator__ is dead legacy API.
		'eslint/no-iterator': 'error',
		// Literals beyond Number precision silently round (9007199254740993 → ...992).
		'eslint/no-loss-of-precision': 'error',
		// Astral-plane chars split across character classes match garbage.
		'eslint/no-misleading-character-class': 'error',
		// Symbol/BigInt with `new` throw at runtime.
		'eslint/no-new-native-nonconstructor': 'error',
		// \8 and \9 escapes are legacy octal traps.
		'eslint/no-nonoctal-decimal-escape': 'error',
		// Calling Math/JSON/Reflect as functions throws.
		'eslint/no-obj-calls': 'error',
		// x = x is dead code or a typo.
		'eslint/no-self-assign': 'error',
		// Returning from a setter silently discards the value.
		'eslint/no-setter-return': 'error',
		// Shadowing undefined/NaN/Infinity poisons the whole scope.
		'eslint/no-shadow-restricted-names': 'error',
		// [1, , 3] holes behave inconsistently across array methods.
		'eslint/no-sparse-arrays': 'error',
		// `this` before super() throws in derived constructors.
		'eslint/no-this-before-super': 'error',
		// A declared-but-never-assigned variable read as undefined is a latent bug.
		'eslint/no-unassigned-vars': 'error',
		// Code after return/throw never runs.
		'eslint/no-unreachable': 'error',
		// return/throw in finally silently overrides the try block's result.
		'eslint/no-unsafe-finally': 'error',
		// !x in instanceof/in negates the operand, not the expression.
		'eslint/no-unsafe-negation': 'error',
		// (a?.b).c throws when a is nullish — optional chain gives false safety.
		'eslint/no-unsafe-optional-chaining': 'error',
		// An expression statement that does nothing is a lost assignment or call.
		'eslint/no-unused-expressions': 'error',
		// Labels that nothing jumps to are dead weight.
		'eslint/no-unused-labels': 'error',
		// Unused private members are unreachable dead code.
		'eslint/no-unused-private-class-members': 'error',
		// Unused variables hide refactoring leftovers and typos.
		'eslint/no-unused-vars': 'error',
		// Backreferences to groups that can't have matched are always empty.
		'eslint/no-useless-backreference': 'error',
		// catch { throw e } is a no-op that destroys stack usefulness signals.
		'eslint/no-useless-catch': 'error',
		// Escaping characters that don't need it obscures the real escapes.
		'eslint/no-useless-escape': 'error',
		// import { a as a } is noise.
		'eslint/no-useless-rename': 'error',
		// `with` is banned in strict mode and defeats static analysis.
		'eslint/no-with': 'error',
		// A generator that never yields should be a function.
		'eslint/require-yield': 'error',
		// x === NaN is always false; isNaN/Number.isNaN is the real check.
		'eslint/use-isnan': 'error',
		// typeof x === "strnig" typos silently never match.
		'eslint/valid-typeof': 'error',

		/* ================================================================== *
		 * eslint — suspicious
		 * ================================================================== */
		// var hoisted out of its block reads as in-scope when it isn't.
		'eslint/block-scoped-var': 'error',
		// Mutating builtin prototypes breaks every other consumer of the runtime.
		'eslint/no-extend-native': 'error',
		// bind() on a function that never uses `this` is a silent no-op.
		'eslint/no-extra-bind': 'error',
		// setTimeout("code") is eval with extra steps.
		'eslint/no-implied-eval': 'error',
		// `new Foo()` purely for side effects hides the effect in a constructor.
		'eslint/no-new': 'error',
		// Shadowed names make the inner scope silently read the wrong variable.
		'eslint/no-shadow': 'error',
		// Dangling underscores fake privacy JS doesn't have; use #private or naming.
		// Consumers with ORM/bundler conventions (_count, __APP_VERSION__) add their own `allow`.
		'eslint/no-underscore-dangle': 'error',
		// ASI hazards: a line starting with ( or [ glues onto the previous statement.
		'eslint/no-unexpected-multiline': 'error',
		// A loop condition never touched inside the loop never exits.
		'eslint/no-unmodified-loop-condition': 'error',
		// cond ? true : false is just Boolean(cond).
		'eslint/no-unneeded-ternary': 'error',
		// "a" + "b" between literals should be one literal.
		'eslint/no-useless-concat': 'error',
		// A constructor that only calls super() is implicit anyway.
		'eslint/no-useless-constructor': 'error',
		// Rethrowing a new error without `cause` erases the original stack.
		'eslint/preserve-caught-error': 'error',

		/* ================================================================== *
		 * eslint — pedantic
		 * ================================================================== */
		// A setter without a getter makes a write-only property — usually a mistake.
		'eslint/accessor-pairs': 'error',
		// map/filter callbacks that forget to return produce arrays of undefined.
		'eslint/array-callback-return': 'error',
		// == coerces operands unpredictably; === says what it means.
		'eslint/eqeqeq': 'error',
		// One class per file keeps modules focused; tests are exempt (override below).
		'eslint/max-classes-per-file': 'error',
		// Nesting past 4 levels reads as a flowchart; extract functions instead.
		'eslint/max-depth': 'error',
		// File-length caps punish cohesive modules — splitting to satisfy a number helps nobody.
		'eslint/max-lines': 'off',
		// Function-length caps do the same; complexity shows up in review, not line counts.
		'eslint/max-lines-per-function': 'off',
		// Deeply nested callbacks are what promises/async exist to fix.
		'eslint/max-nested-callbacks': 'error',
		// Array(3) makes holes, Array(3, 4) makes elements — too confusable; use literals.
		'eslint/no-array-constructor': 'error',
		// let/const in a case without braces leaks into sibling cases.
		'eslint/no-case-declarations': 'error',
		// Returning a value from a constructor is discarded (or hijacks `new`).
		'eslint/no-constructor-return': 'error',
		// `return x; else return y` — the else is dead ceremony.
		'eslint/no-else-return': 'error',
		// Silent case fallthrough is the classic switch bug; comment it if intended.
		'eslint/no-fallthrough': 'error',
		// Inline comments are fine — position of a comment isn't a defect.
		'eslint/no-inline-comments': 'off',
		// Function declarations inside blocks hoist differently across engines.
		'eslint/no-inner-declarations': 'error',
		// else { if } is an else-if written the long way.
		'eslint/no-lonely-if': 'error',
		// Closures over loop variables capture the final value with var semantics.
		'eslint/no-loop-func': 'error',
		// if (!x) {a} else {b} reads backwards; flip the branches.
		'eslint/no-negated-condition': 'error',
		// new String/Number/Boolean create objects that compare by reference.
		'eslint/no-new-wrappers': 'error',
		// new Object() is {} with extra steps.
		'eslint/no-object-constructor': 'error',
		// Returning from a promise executor doesn't resolve anything — a silent bug.
		'eslint/no-promise-executor-return': 'error',
		// obj.hasOwnProperty breaks on null-prototype objects; use Object.hasOwn.
		'eslint/no-prototype-builtins': 'error',
		// Redeclaring a variable is either a typo or shadowing done wrong.
		'eslint/no-redeclare': 'error',
		// x === x is only useful as a NaN check, and use-isnan bans that spelling too.
		'eslint/no-self-compare': 'error',
		// throw "string" produces errors with no stack trace.
		'eslint/no-throw-literal': 'error',
		// A bare return at the end of a function is dead code.
		'eslint/no-useless-return': 'error',
		// TODO/FIXME are legitimate workflow markers; banning them just renames them.
		// (Stricter cacographer config had this on via category — deliberate deviation.)
		'eslint/no-warning-comments': 'off',
		// parseInt without a radix guesses base from the string's shape.
		'eslint/radix': 'error',
		// The u flag makes regexes treat astral chars correctly and rejects bad escapes.
		'eslint/require-unicode-regexp': 'error',
		// Same stance as sort-keys: alphabetizing declarations is churn, not clarity.
		'eslint/sort-vars': 'off',
		// async without await is a sync function wearing a costume — but wrapper
		// functions matching an async interface are common; off per both source configs.
		'eslint/require-await': 'off',
		// Symbol("what-this-is") makes debugging findable; bare Symbol() doesn't.
		'eslint/symbol-description': 'error',

		/* ================================================================== *
		 * eslint — perf
		 * ================================================================== */
		// Sequential awaits in a loop serialize what Promise.all can parallelize;
		// intentionally sequential work gets a disable comment explaining why.
		'eslint/no-await-in-loop': 'error',
		// fn.call(undefined, x) is fn(x).
		'eslint/no-useless-call': 'error',

		/* ================================================================== *
		 * eslint — style
		 * ================================================================== */
		// Arrow bodies with a lone return should be expressions (as-needed default).
		'eslint/arrow-body-style': 'error',
		// Comment casing isn't worth policing.
		'eslint/capitalized-comments': 'off',
		// Braces on every block: the goto-fail bug was an unbraced if.
		'eslint/curly': 'error',
		// default anywhere but last in a switch reads as a case.
		'eslint/default-case-last': 'error',
		// Optional params before required ones can never be omitted.
		'eslint/default-param-last': 'error',
		// const handleClick = function handleTap() {} — two names, one lie.
		'eslint/func-name-matching': 'error',
		// Anonymous function expressions produce anonymous stack traces.
		'eslint/func-names': 'error',
		// Declaration vs expression is context-dependent; not worth enforcing globally.
		'eslint/func-style': 'off',
		// get/set for the same property should sit together.
		'eslint/grouped-accessor-pairs': 'error',
		// for-in walks the prototype chain; guard or use Object.keys.
		'eslint/guard-for-in': 'error',
		// No-op without a project-specific list; consumers configure it if wanted.
		'eslint/id-denylist': 'off',
		// Short names are fine where scope is short (i, x, db).
		'eslint/id-length': 'off',
		// No-op without a project-specific pattern; consumers configure it if wanted.
		'eslint/id-match': 'off',
		// `let x;` then assign-in-branches is a legitimate pattern.
		'eslint/init-declarations': 'off',
		// x = x || y has a ??=/||= spelling now.
		'eslint/logical-assignment-operators': 'error',
		// Beyond 5 params, nobody remembers the order — take an options object.
		'eslint/max-params': ['error', { max: 5 }],
		// Statement-count caps are line-count caps with extra steps.
		'eslint/max-statements': 'off',
		// Constructors are capitalized; calling a lowercase name with `new` is a smell.
		'eslint/new-cap': 'error',
		// continue is a fine guard-clause tool in loops.
		'eslint/no-continue': 'off',
		// import/no-duplicates covers this with type-import awareness; avoid double reports.
		'eslint/no-duplicate-imports': 'off',
		// A label on the loop `break` already targets is noise.
		'eslint/no-extra-label': 'error',
		// !!x and +x golf coercion; Boolean(x) and Number(x) say it.
		'eslint/no-implicit-coercion': 'error',
		// A label sharing a variable's name makes break/continue ambiguous to readers.
		'eslint/no-label-var': 'error',
		// Labeled blocks are goto cosplay; restructure instead.
		'eslint/no-labels': 'error',
		// A block that creates no scope is visual noise.
		'eslint/no-lone-blocks': 'error',
		// Magic numbers are usually self-evident in context; naming 86400 helps, naming 2 doesn't.
		'eslint/no-magic-numbers': 'off',
		// a = b = c makes b a global in sloppy contexts and hides one assignment.
		'eslint/no-multi-assign': 'error',
		// Multiline strings via trailing backslash break when trailing space sneaks in.
		'eslint/no-multi-str': 'error',
		// unicorn/no-nested-ternary is on instead — it allows one parenthesized level.
		'eslint/no-nested-ternary': 'off',
		// new Function("code") is eval with extra steps.
		'eslint/no-new-func': 'error',
		// return (x = y) hides mutation inside a return.
		'eslint/no-return-assign': 'error',
		// javascript: URLs are eval in href clothing.
		'eslint/no-script-url': 'error',
		// "Hello ${name}" in a plain string means someone forgot the backticks.
		'eslint/no-template-curly-in-string': 'error',
		// Ternaries are expressions doing their job.
		'eslint/no-ternary': 'off',
		// {["a"]: 1} is {a: 1}.
		'eslint/no-useless-computed-key': 'error',
		// {x: x} has a shorthand for a reason.
		'eslint/object-shorthand': 'error',
		// x = x + y has a += spelling.
		'eslint/operator-assignment': 'error',
		// Arrow callbacks keep lexical this; function callbacks invite this-bugs.
		'eslint/prefer-arrow-callback': 'error',
		// A binding that's never reassigned is a const fact — let claims otherwise.
		'eslint/prefer-const': 'error',
		// const [first] = xs names the shape; const first = xs[0] hides it.
		'eslint/prefer-destructuring': 'error',
		// Math.pow(x, 2) predates **.
		'eslint/prefer-exponentiation-operator': 'error',
		// match[3] means nothing next month; (?<name>) documents the group.
		'eslint/prefer-named-capture-group': 'error',
		// parseInt("0xFF", 16) has a 0xFF literal spelling.
		'eslint/prefer-numeric-literals': 'error',
		// Object.hasOwn is the safe hasOwnProperty.
		'eslint/prefer-object-has-own': 'error',
		// {...a, b} beats Object.assign for immutability and inference.
		'eslint/prefer-object-spread': 'error',
		// reject("nope") produces rejections with no stack; reject(new Error(...)).
		'eslint/prefer-promise-reject-errors': 'error',
		// new RegExp("static") should be /static/ — literals get syntax checking at parse.
		'eslint/prefer-regex-literals': 'error',
		// arguments is array-like legacy; rest params are real arrays.
		'eslint/prefer-rest-params': 'error',
		// fn.apply(null, args) is fn(...args).
		'eslint/prefer-spread': 'error',
		// "a" + x + "b" is a template literal written the hard way.
		'eslint/prefer-template': 'error',
		// Import order carries meaning (side effects, grouping); alphabetizing is churn.
		'eslint/sort-imports': 'off',
		// Key order carries meaning (importance, schema shape); alphabetizing is churn.
		'eslint/sort-keys': 'off',
		// Only applies to var, which no-var already bans; kept on to catch stragglers.
		'eslint/vars-on-top': 'error',
		// if (5 === x) guards against a typo === already catches.
		'eslint/yoda': 'error',

		/* ================================================================== *
		 * eslint — restriction
		 * ================================================================== */
		// Forcing static for this-less methods churns APIs mid-refactor.
		'eslint/class-methods-use-this': 'off',
		// Cyclomatic thresholds are arbitrary; same stance as max-lines.
		'eslint/complexity': 'off',
		// TS exhaustiveness (switch-exhaustiveness-check, type-aware) beats dead default branches.
		'eslint/default-case': 'off',
		// alert/confirm block the main thread — leftover debug UI.
		'eslint/no-alert': 'error',
		// Bitwise ops are legitimate (hashing, flags, graphics); oxc/bad-bitwise-operator catches typos.
		'eslint/no-bitwise': 'off',
		// console output is debugging residue in app code; tests exempt via override.
		'eslint/no-console': 'error',
		// Obscure rule about /=/ regexes; a parenthesized regex is not clearer.
		'eslint/no-div-regex': 'off',
		// An empty block either hides a swallowed error or marks unfinished work.
		'eslint/no-empty': 'error',
		// () => {} as a deliberate noop/default is idiomatic; no-empty covers accidents.
		'eslint/no-empty-function': 'off',
		// eqeqeq (set to always, no null exception) already bans == null.
		'eslint/no-eq-null': 'off',
		// Accidental globals from script-scope declarations; harmless in ESM, fatal outside it.
		'eslint/no-implicit-globals': 'error',
		// Mutating a parameter mutates the caller's object — spooky action at a distance.
		'eslint/no-param-reassign': 'error',
		// i++ in a for-header is not a readability problem.
		'eslint/no-plusplus': 'off',
		// __proto__ is deprecated; Object.getPrototypeOf is the API.
		'eslint/no-proto': 'error',
		// /a  b/ with meaningful double spaces is unreadable; use /a {2}b/.
		'eslint/no-regex-spaces': 'error',
		// No-op without a project-specific list.
		'eslint/no-restricted-globals': 'off',
		// No-op without a project-specific list.
		'eslint/no-restricted-imports': 'off',
		// No-op without a project-specific list.
		'eslint/no-restricted-properties': 'off',
		// The comma operator hides side effects in expression position.
		'eslint/no-sequences': 'error',
		// undefined as a value is normal JS; unicorn/no-useless-undefined trims the noise cases.
		'eslint/no-undefined': 'off',
		// TDZ errors and hoisting confusion; declare before use.
		'eslint/no-use-before-define': 'error',
		// var is function-scoped legacy; let/const or nothing.
		'eslint/no-var': 'error',
		// `void promise` is the idiomatic fire-and-forget marker under no-floating-promises.
		'eslint/no-void': 'off',
		// A BOM breaks shebangs, concatenation, and some parsers.
		'eslint/unicode-bom': 'error',

		/* ================================================================== *
		 * eslint — nursery (all off: not stabilized in oxlint yet)
		 * ================================================================== */
		// Nursery + no-op without a project-specific list.
		'eslint/no-restricted-exports': 'off',
		// TypeScript already errors on unknown identifiers; this duplicates tsc, with false positives.
		'eslint/no-undef': 'off',
		// Nursery: revisit when stabilized.
		'eslint/no-unreachable-loop': 'off',
		// Nursery: revisit when stabilized.
		'eslint/no-useless-assignment': 'off',

		/* ================================================================== *
		 * typescript — correctness
		 * ================================================================== */
		// Two enum members with one value make reverse lookups ambiguous.
		'typescript/no-duplicate-enum-values': 'error',
		// x!! is x! — the second assertion asserts nothing.
		'typescript/no-extra-non-null-assertion': 'error',
		// `new` on an interface method or class-typed `constructor` is always wrong.
		'typescript/no-misused-new': 'error',
		// foo?.bar! contradicts itself — asserting non-null on an optional chain.
		'typescript/no-non-null-asserted-optional-chain': 'error',
		// const self = this defeats arrow functions and types alike.
		'typescript/no-this-alias': 'error',
		// Assigning to a parameter property already assigned by the constructor shorthand.
		'typescript/no-unnecessary-parameter-property-assignment': 'error',
		// Merging a class with an interface silently adds unimplemented members.
		'typescript/no-unsafe-declaration-merging': 'error',
		// export {} in a module that already has exports is dead syntax.
		'typescript/no-useless-empty-export': 'error',
		// String/Number/Boolean types accept boxed objects; use string/number/boolean.
		'typescript/no-wrapper-object-types': 'error',
		// as const preserves literal types; manual literal annotations drift.
		'typescript/prefer-as-const': 'error',
		// `module` keyword for namespaces collides with ESM vocabulary.
		'typescript/prefer-namespace-keyword': 'error',
		// /// <reference> is pre-ESM dependency wiring; imports do this now.
		'typescript/triple-slash-reference': 'error',

		/* ================================================================== *
		 * typescript — suspicious
		 * ================================================================== */
		// a! == b reads as (a!) == b to the compiler but not to humans.
		'typescript/no-confusing-non-null-assertion': 'error',
		// A class of only statics is a namespace; use module-level functions.
		'typescript/no-extraneous-class': 'error',
		// <T extends unknown> constrains nothing.
		'typescript/no-unnecessary-type-constraint': 'error',

		/* ================================================================== *
		 * typescript — pedantic
		 * ================================================================== */
		// A ts-ignore directive hides errors forever; ts-expect-error (with description) self-expires.
		'typescript/ban-ts-comment': 'error',
		// Deprecated upstream — split into no-wrapper-object-types/no-empty-object-type (both on).
		'typescript/ban-types': 'off',
		// The Function type accepts any callable with any args; write a signature.
		'typescript/no-unsafe-function-type': 'error',
		// Implicit enum values renumber when members reorder — breaks serialized data.
		'typescript/prefer-enum-initializers': 'error',
		// Same reasoning as ban-ts-comment: expect-error errors when the error is fixed.
		'typescript/prefer-ts-expect-error': 'error',

		/* ================================================================== *
		 * typescript — style
		 * ================================================================== */
		// Overloads scattered through a class read as duplicates.
		'typescript/adjacent-overload-signatures': 'error',
		// T[] over Array<T> for simple types — reads left-to-right.
		'typescript/array-type': 'error',
		// tslint died in 2019; its disable comments are fossils.
		'typescript/ban-tslint-comment': 'error',
		// readonly field = "x" beats get x() { return "x" } — no call overhead, same guarantee.
		'typescript/class-literal-property-style': 'error',
		// new Map<string, number>() vs new Map(): pick constructor-side annotations consistently.
		'typescript/consistent-generic-constructors': 'error',
		// Record<K, V> over {[k: K]: V} — it's the same type with a name.
		'typescript/consistent-indexed-object-style': 'error',
		// `as T` over <T> casts — angle brackets collide with JSX and read as generics.
		'typescript/consistent-type-assertions': 'error',
		// type over interface: no declaration merging surprises, works for unions too.
		'typescript/consistent-type-definitions': ['error', 'type'],
		// Inline `import { x, type Y }` keeps mixed value+type imports on one line; the
		// all-type case is handled by import/consistent-type-specifier-style below, which
		// sends it top-level so erasure drops it (issue #33).
		'typescript/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
		// Property signatures (fn: () => void) get strict variance checking; methods don't.
		'typescript/method-signature-style': 'error',
		// An empty interface is {} — either meaningless or a wrong extends.
		'typescript/no-empty-interface': 'error',
		// const x: number = 5 — the annotation restates the obvious.
		'typescript/no-inferrable-types': 'error',
		// Constructor parameter properties hide field declarations in a signature; off per
		// cacographer — declare fields explicitly where you want them visible.
		'typescript/parameter-properties': 'off',
		// for-of over index loops when the index isn't used.
		'typescript/prefer-for-of': 'error',
		// An interface with only a call signature is a function type.
		'typescript/prefer-function-type': 'error',
		// Overloads differing only in one union'd param should be one signature.
		'typescript/unified-signatures': 'error',

		/* ================================================================== *
		 * typescript — restriction
		 * ================================================================== */
		// Inference is TypeScript's core value; annotating every return is ceremony.
		'typescript/explicit-function-return-type': 'off',
		// public-by-default is idiomatic TS; annotating it is noise.
		'typescript/explicit-member-accessibility': 'off',
		// Same stance as explicit-function-return-type — inference carries module boundaries.
		'typescript/explicit-module-boundary-types': 'off',
		// delete obj[computed] defeats shape optimization and type tracking.
		'typescript/no-dynamic-delete': 'error',
		// {} means "anything non-nullish", never "empty object" — a classic trap.
		'typescript/no-empty-object-type': 'error',
		// any turns the checker off for everything it touches; unknown keeps it on.
		'typescript/no-explicit-any': 'error',
		// import type with side-effect syntax emits an unexpected runtime import.
		'typescript/no-import-type-side-effects': 'error',
		// void outside return position (unions, params) behaves surprisingly.
		'typescript/no-invalid-void-type': 'error',
		// Namespaces predate ES modules; files are the namespace now.
		'typescript/no-namespace': 'error',
		// x! ?? y: the assertion makes the ?? dead code.
		'typescript/no-non-null-asserted-nullish-coalescing': 'error',
		// ! is an unchecked cast wearing a convenience syntax; tests exempt via override.
		'typescript/no-non-null-assertion': 'error',
		// require() in TS is CJS leakage; import.
		'typescript/no-require-imports': 'error',
		// No-op without a project-specific list.
		'typescript/no-restricted-types': 'off',
		// const x = require() bypasses the module graph and its types.
		'typescript/no-var-requires': 'error',
		// Computed enum members from function calls aren't statically analyzable.
		'typescript/prefer-literal-enum-member': 'error',

		/* ================================================================== *
		 * unicorn — correctness
		 * ================================================================== */
		// await inside Promise.all's array argument serializes what it parallelizes.
		'unicorn/no-await-in-promise-methods': 'error',
		// An empty file is a merge artifact or a forgotten stub.
		'unicorn/no-empty-file': 'error',
		// fetch(url, {body}) without method: "POST" throws or silently GETs.
		'unicorn/no-invalid-fetch-options': 'error',
		// removeEventListener with an inline arrow can never remove anything.
		'unicorn/no-invalid-remove-event-listener': 'error',
		// new Array(n) makes holes; Array.from({length: n}) makes elements.
		'unicorn/no-new-array': 'error',
		// Promise.all([one]) is just await one.
		'unicorn/no-single-promise-in-promise-methods': 'error',
		// Objects with a `then` method get absorbed by await — a footgun, not a feature.
		'unicorn/no-thenable': 'error',
		// await on a non-promise is a no-op that implies async where there is none.
		'unicorn/no-unnecessary-await': 'error',
		// {...(foo || {})} — spread already treats nullish as empty.
		'unicorn/no-useless-fallback-in-spread': 'error',
		// arr.length > 0 && arr.some(...) — some() already handles empty.
		'unicorn/no-useless-length-check': 'error',
		// [...arr] passed straight to a function that doesn't mutate is a wasted copy.
		'unicorn/no-useless-spread': 'error',
		// new Set(x).size === 1 checks uniqueness; .length on a Set is undefined.
		'unicorn/prefer-set-size': 'error',
		// /^foo/.test(s) is s.startsWith("foo") without the regex overhead.
		'unicorn/prefer-string-starts-ends-with': 'error',

		/* ================================================================== *
		 * unicorn — suspicious
		 * ================================================================== */
		// A function that doesn't capture from its enclosing scope belongs outside it.
		'unicorn/consistent-function-scoping': 'error',
		// A getter reading itself recurses forever.
		'unicorn/no-accessor-recursion': 'error',
		// arr.fill({}) shares ONE object across every slot.
		'unicorn/no-array-fill-with-reference-type': 'error',
		// reverse() mutates in place; toReversed() doesn't surprise the other holder.
		'unicorn/no-array-reverse': 'error',
		// sort() mutates and compares as strings by default; toSorted(comparator).
		'unicorn/no-array-sort': 'error',
		// new Array().with() on sparse arrays behaves unexpectedly.
		'unicorn/no-confusing-array-with': 'error',
		// instanceof breaks across realms/iframes for builtins; use type-specific checks.
		'unicorn/no-instanceof-builtins': 'error',
		// onclick= assignment silently replaces the previous handler; addEventListener stacks.
		'unicorn/prefer-add-event-listener': 'error',
		// Bare `import {}` braces style — off per smallreads; not worth policing.
		'unicorn/require-module-specifiers': 'off',
		// postMessage without targetOrigin broadcasts to any origin — a security hole.
		'unicorn/require-post-message-target-origin': 'error',

		/* ================================================================== *
		 * unicorn — pedantic
		 * ================================================================== */
		// assert() from node:assert vs console.assert have different failure modes; be consistent.
		'unicorn/consistent-assert': 'error',
		// [...(cond ? [a] : [])] conditional spread has one idiomatic shape; stick to it.
		'unicorn/consistent-empty-array-spread': 'error',
		// \xFF vs \xff: one casing for escapes.
		'unicorn/escape-case': 'error',
		// if (arr.length) hides a number-as-boolean coercion; compare > 0.
		'unicorn/explicit-length-check': 'error',
		// Map/Set/Date without new work differently or throw; always new for builtins.
		'unicorn/new-for-builtins': 'error',
		// arr.map(parseInt) passes the index as radix — the canonical extra-args bug.
		'unicorn/no-array-callback-reference': 'error',
		// \x1B over \u{1b}: hex escapes for bytes.
		'unicorn/no-hex-escape': 'error',
		// Mutating right after creation ([...x].sort()) has non-mutating spellings (toSorted).
		'unicorn/no-immediate-mutation': 'error',
		// Array.isArray works across realms; instanceof Array doesn't.
		'unicorn/no-instanceof-array': 'error',
		// Same as eslint/no-lonely-if but catches unicorn-specific shapes.
		'unicorn/no-lonely-if': 'error',
		// Negated condition with an else: flip it.
		'unicorn/no-negated-condition': 'error',
		// !(a === b) is a !== b.
		'unicorn/no-negation-in-equality-check': 'error',
		// new Buffer() is deprecated and unsafe; Buffer.from/alloc.
		'unicorn/no-new-buffer': 'error',
		// Object literal defaults ({} = {}) create a new object per call — surprises identity checks.
		'unicorn/no-object-as-default-parameter': 'error',
		// A class of only statics is a namespace (mirrors typescript/no-extraneous-class).
		'unicorn/no-static-only-class': 'error',
		// const self = this — arrow functions exist (mirrors typescript/no-this-alias).
		'unicorn/no-this-assignment': 'error',
		// typeof x === "undefined" for a known binding is x === undefined.
		'unicorn/no-typeof-undefined': 'error',
		// flat(1) is flat().
		'unicorn/no-unnecessary-array-flat-depth': 'error',
		// splice(0, arr.length) has clearer spellings.
		'unicorn/no-unnecessary-array-splice-count': 'error',
		// slice(0, arr.length) — the default end is already the end.
		'unicorn/no-unnecessary-slice-end': 'error',
		// An IIFE with convoluted wrapping obscures what actually runs.
		'unicorn/no-unreadable-iife': 'error',
		// return Promise.resolve(x) inside async is return x.
		'unicorn/no-useless-promise-resolve-reject': 'error',
		// A case that only falls through to default is dead syntax.
		'unicorn/no-useless-switch-case': 'error',
		// return undefined / foo(undefined) — undefined is the default everywhere.
		'unicorn/no-useless-undefined': 'error',
		// [].concat(...arrays) flattens; flat() says so.
		'unicorn/prefer-array-flat': 'error',
		// filter(...).length > 0 scans everything; some() short-circuits.
		'unicorn/prefer-array-some': 'error',
		// arr[arr.length - 1] is fine; .at(-1) adds no clarity and costs in hot paths
		// (off per smallreads).
		'unicorn/prefer-at': 'off',
		// FileReader is callback-era; blob.text()/arrayBuffer() are promises.
		'unicorn/prefer-blob-reading-methods': 'error',
		// charCodeAt splits surrogate pairs; codePointAt handles all of Unicode.
		'unicorn/prefer-code-point': 'error',
		// new Date().getTime() is Date.now() with an allocation.
		'unicorn/prefer-date-now': 'error',
		// append() takes strings and multiple args; appendChild doesn't.
		'unicorn/prefer-dom-node-append': 'error',
		// dataset.foo over getAttribute("data-foo").
		'unicorn/prefer-dom-node-dataset': 'error',
		// el.remove() over parent.removeChild(el).
		'unicorn/prefer-dom-node-remove': 'error',
		// EventTarget is the standard; EventEmitter is Node-only.
		'unicorn/prefer-event-target': 'error',
		// import.meta.dirname/filename over fileURLToPath gymnastics.
		'unicorn/prefer-import-meta-properties': 'error',
		// Math.min(a, b) over a < b ? a : b.
		'unicorn/prefer-math-min-max': 'error',
		// Math.trunc over |0 bit-twiddling.
		'unicorn/prefer-math-trunc': 'error',
		// Number over x => Number(x) wrapper arrows.
		'unicorn/prefer-native-coercion-functions': 'error',
		// Number(x) over +x (pairs with eslint/no-implicit-coercion).
		'unicorn/prefer-number-coercion': 'error',
		// Array.prototype.slice.call over [].slice.call — no throwaway array.
		'unicorn/prefer-prototype-methods': 'error',
		// querySelector is one API for every selector; getElementById et al are shards.
		'unicorn/prefer-query-selector': 'error',
		// regex.test() for booleans; match() allocates the result you're discarding.
		'unicorn/prefer-regexp-test': 'error',
		// append(a); append(b) → append(a, b).
		'unicorn/prefer-single-call': 'error',
		// replaceAll says all; replace(/g/) hides it in a flag.
		'unicorn/prefer-string-replace-all': 'error',
		// slice over substr (deprecated) and substring (argument-swapping).
		'unicorn/prefer-string-slice': 'error',
		// Top-level await vs .then() at module top is a per-project loading decision
		// (off per smallreads — TLA blocks the whole module graph).
		'unicorn/prefer-top-level-await': 'off',
		// Wrong-type arguments deserve TypeError, not Error.
		'unicorn/prefer-type-error': 'error',
		// toFixed() without digits defaults to 0 — surprising; say toFixed(0).
		'unicorn/require-number-to-fixed-digits-argument': 'error',

		/* ================================================================== *
		 * unicorn — perf
		 * ================================================================== */
		// filter(fn)[0] scans everything; find(fn) stops at the first hit.
		'unicorn/prefer-array-find': 'error',
		// map(fn).flat() makes two arrays; flatMap makes one.
		'unicorn/prefer-array-flat-map': 'error',
		// arr.includes in a loop is O(n²); Set.has is O(1) (explicit in cacographer).
		'unicorn/prefer-set-has': 'error',

		/* ================================================================== *
		 * unicorn — style
		 * ================================================================== */
		// catch (e) — name it error; abbreviations hide what it is.
		'unicorn/catch-error-name': 'error',
		// new Date(date) clones; new Date(date.getTime()) is the same with extra steps.
		'unicorn/consistent-date-clone': 'error',
		// indexOf(x) !== -1 vs includes(x): one existence idiom.
		'unicorn/consistent-existence-index-check': 'error',
		// One escaping style inside template literals.
		'unicorn/consistent-template-literal-escape': 'error',
		// Custom errors need name set and prototype fixed; enforce the full pattern.
		'unicorn/custom-error-definition': 'error',
		// Pure whitespace — oxfmt's jurisdiction, but harmless and autofixed.
		'unicorn/empty-brace-spaces': 'off',
		// new Error() with no message throws away the one chance to say what broke.
		'unicorn/error-message': 'error',
		// setTimeout(fn) with no delay hides the "run async" intent; write the 0.
		'unicorn/explicit-timer-delay': 'error',
		// Mixed-case filenames break on case-insensitive filesystems mid-collaboration;
		// kebab/camel/pascal each allowed (per cacographer), just be internally consistent.
		'unicorn/filename-case': [
			'error',
			{ cases: { kebabCase: true, camelCase: true, pascalCase: true } }
		],
		// fn(fn(fn(fn(x)))) — extract intermediates.
		'unicorn/max-nested-calls': 'error',
		// map(fn, thisArg) — the thisArg param is invisible at the callsite; bind or arrow.
		'unicorn/no-array-method-this-argument': 'error',
		// (await foo()).bar buries the await; name the intermediate.
		'unicorn/no-await-expression-member': 'error',
		// console.log("a ", x) — the stray space was probably not a choice.
		'unicorn/no-console-spaces': 'error',
		// Allows ONE parenthesized nesting level — stricter eslint version off above.
		'unicorn/no-nested-ternary': 'error',
		// null is a legitimate value (JSON, DBs, DOM APIs return it) — off per cacographer.
		'unicorn/no-null': 'off',
		// const [,, third] = arr — count the commas to find the bug.
		'unicorn/no-unreadable-array-destructuring': 'error',
		// new Set([...set]) copies a copy.
		'unicorn/no-useless-collection-argument': 'error',
		// 1.0 is 1; the fraction implies float semantics JS doesn't have.
		'unicorn/no-zero-fractions': 'error',
		// 0xFF not 0xff, 1e10 not 1E10: one casing for literals.
		'unicorn/number-literal-case': 'error',
		// 1_000_000 over 1000000 past four digits.
		'unicorn/numeric-separators-style': 'error',
		// findIndex(x => x === v) is indexOf(v).
		'unicorn/prefer-array-index-of': 'error',
		// 123n over BigInt(123) for constants.
		'unicorn/prefer-bigint-literals': 'error',
		// Class fields over constructor-only assignments.
		'unicorn/prefer-class-fields': 'error',
		// classList.toggle(name, force) over if/add/else/remove.
		'unicorn/prefer-classlist-toggle': 'error',
		// function f(x = 1) over x = x || 1 in the body.
		'unicorn/prefer-default-parameters': 'error',
		// textContent over innerText (no reflow, no CSS-awareness surprises).
		'unicorn/prefer-dom-node-text-content': 'error',
		// export { x } from "./mod" over import-then-export.
		'unicorn/prefer-export-from': 'error',
		// globalThis is the one spelling that works in every runtime.
		'unicorn/prefer-global-this': 'error',
		// arr.indexOf(x) !== -1 is arr.includes(x).
		'unicorn/prefer-includes': 'error',
		// event.key ("Enter") over event.keyCode (13) — keyCode is deprecated.
		'unicorn/prefer-keyboard-event-key': 'error',
		// a || b over a ? a : b — no double evaluation.
		'unicorn/prefer-logical-operator-over-ternary': 'error',
		// replaceChildren/before/after over replaceChild/insertBefore contortions.
		'unicorn/prefer-modern-dom-apis': 'error',
		// slice(-2) over slice(arr.length - 2).
		'unicorn/prefer-negative-index': 'error',
		// Object.fromEntries over reduce-into-object.
		'unicorn/prefer-object-from-entries': 'error',
		// catch {} over catch (unused) {}.
		'unicorn/prefer-optional-catch-binding': 'error',
		// Reflect.apply over Function.prototype.apply.call gymnastics.
		'unicorn/prefer-reflect-apply': 'error',
		// Response.json(data) over new Response(JSON.stringify(data), headers...).
		'unicorn/prefer-response-static-json': 'error',
		// [...iterable] over Array.from(iterable) when no map fn.
		'unicorn/prefer-spread': 'error',
		// String.raw for windows\paths and regex sources — no double-backslash counting.
		'unicorn/prefer-string-raw': 'error',
		// trimStart/trimEnd over trimLeft/trimRight (RTL-ambiguous aliases).
		'unicorn/prefer-string-trim-start-end': 'error',
		// structuredClone over JSON.parse(JSON.stringify(x)) — handles Dates, Maps, cycles.
		'unicorn/prefer-structured-clone': 'error',
		// Simple if/else assignments read fine as ternaries; pairs with no-nested-ternary.
		'unicorn/prefer-ternary': 'error',
		// ./relative URLs in new URL(): one style.
		'unicorn/relative-url-style': 'error',
		// join() defaults to commas — say join(",") so the reader needn't remember.
		'unicorn/require-array-join-separator': 'error',
		// import attrs (with { type: "json" }) required where the runtime needs them.
		'unicorn/require-module-attributes': 'error',
		// Braces on every case (pairs with eslint/no-case-declarations).
		'unicorn/switch-case-braces': 'error',
		// break at the end of the case body, not mid-block.
		'unicorn/switch-case-break-position': 'error',
		// "utf8" not "UTF-8": one spelling for encoding identifiers.
		'unicorn/text-encoding-identifier-case': 'error',
		// throw new Error() not throw Error() — consistency with every other constructor.
		'unicorn/throw-new-error': 'error',

		/* ================================================================== *
		 * unicorn — restriction
		 * ================================================================== */
		// Named vs default vs namespace import preference is per-library; not enforceable globally.
		'unicorn/import-style': 'off',
		// A disable comment without a rule name disables everything, forever, silently.
		'unicorn/no-abusive-eslint-disable': 'error',
		// export default () => {} shows up as "default" in every stack trace and dev tool.
		'unicorn/no-anonymous-default-export': 'error',
		// for-of is faster, breakable, awaitable; forEach is none of those.
		'unicorn/no-array-for-each': 'error',
		// reduce is fine when the accumulator is named well; banning it forces clunkier loops.
		'unicorn/no-array-reduce': 'off',
		// document.cookie's string API is a parsing trap; use CookieStore or a helper.
		'unicorn/no-document-cookie': 'error',
		// slice(1, arr.length) as "to the end" — just omit the argument.
		'unicorn/no-length-as-slice-end': 'error',
		// flat(2) — why 2? Name the depth or restructure the data.
		'unicorn/no-magic-array-flat-depth': 'error',
		// process.exit skips flush/cleanup handlers; throw and let the top level decide.
		'unicorn/no-process-exit': 'error',
		// captureStackTrace on an Error that already has a stack.
		'unicorn/no-useless-error-capture-stack-trace': 'error',
		// Math.hypot et al over hand-rolled sqrt(x*x + y*y).
		'unicorn/prefer-modern-math-apis': 'error',
		// ESM only — CJS files don't belong in new code (pairs with import/no-commonjs).
		'unicorn/prefer-module': 'error',
		// node: prefix makes builtin imports unambiguous and un-shadowable.
		'unicorn/prefer-node-protocol': 'error',
		// Number.parseInt/isNaN over globals — no coercion surprises, greppable.
		'unicorn/prefer-number-properties': 'error',

		/* ================================================================== *
		 * unicorn — nursery (off: not stabilized)
		 * ================================================================== */
		// Nursery: revisit when stabilized.
		'unicorn/no-useless-iterator-to-array': 'off',

		/* ================================================================== *
		 * oxc — correctness
		 * ================================================================== */
		// Array methods on `arguments` (not a real array) misbehave.
		'oxc/bad-array-method-on-arguments': 'error',
		// charAt(n) === "ab" can never be true — charAt returns one char.
		'oxc/bad-char-at-comparison': 'error',
		// a === b === c compares a boolean to c.
		'oxc/bad-comparison-sequence': 'error',
		// matchAll with a non-global regex throws at runtime (twin of bad-replace-all-arg).
		'oxc/bad-match-all-arg': 'error',
		// Math.min(Math.max(x, hi), lo) with swapped bounds clamps to a constant.
		'oxc/bad-min-max-func': 'error',
		// obj === {} is always false — reference comparison against a fresh literal.
		'oxc/bad-object-literal-comparison': 'error',
		// replaceAll with a non-global regex throws at runtime.
		'oxc/bad-replace-all-arg': 'error',
		// x < x and friends are always true/false — a typo'd variable.
		'oxc/const-comparisons': 'error',
		// (x == y) == z double comparisons don't chain like math.
		'oxc/double-comparisons': 'error',
		// x & 0 and x * 0 erase the operand — either dead code or a typo.
		'oxc/erasing-op': 'error',
		// `new Error(...)` without throw constructs an error and drops it.
		'oxc/missing-throw': 'error',
		// toFixed(101) and friends throw RangeError at runtime.
		'oxc/number-arg-out-of-range': 'error',
		// A parameter only passed to the recursive call does nothing.
		'oxc/only-used-in-recursion': 'error',
		// Array-from callback constructed but never invoked.
		'oxc/uninvoked-array-callback': 'error',

		/* ================================================================== *
		 * oxc — suspicious
		 * ================================================================== */
		// 3.14 inline where Math.PI was meant loses precision silently.
		'oxc/approx-constant': 'error',
		// a += a + b was probably a = a + b or a += b.
		'oxc/misrefactored-assign-op': 'error',
		// Express-4-specific (async handlers need wrappers there); not a general defect.
		'oxc/no-async-endpoint-handlers': 'off',
		// `this` in an exported plain function is undefined in ESM strict mode.
		'oxc/no-this-in-exported-function': 'error',

		/* ================================================================== *
		 * oxc — pedantic
		 * ================================================================== */
		// Identical code in both branches belongs outside the if.
		'oxc/branches-sharing-code': 'error',

		/* ================================================================== *
		 * oxc — perf
		 * ================================================================== */
		// [...acc, x] in reduce is O(n²) — push instead.
		'oxc/no-accumulating-spread': 'error',
		// map(x => ({...x, y})) clones every element; mutate a fresh object or restructure.
		'oxc/no-map-spread': 'error',

		/* ================================================================== *
		 * oxc — restriction
		 * ================================================================== */
		// & where && was meant type-checks but computes garbage; this catches the typo
		// shapes (which is why plain no-bitwise stays off).
		'oxc/bad-bitwise-operator': 'error',
		// Banning async/await outright is for esoteric codebases only.
		'oxc/no-async-await': 'off',
		// Barrel files are a build-perf tradeoff, not a defect; per-project call.
		'oxc/no-barrel-file': 'off',
		// const enum breaks isolatedModules and every non-tsc transpiler.
		'oxc/no-const-enum': 'error',
		// Optional chaining is standard now; banning it is for ES2019 targets only.
		'oxc/no-optional-chaining': 'off',
		// Rest/spread properties are standard now; same legacy-target reasoning.
		'oxc/no-rest-spread-properties': 'off',

		/* ================================================================== *
		 * import — correctness
		 * ================================================================== */
		// Importing a default from a module that has none is undefined at runtime.
		'import/default': 'error',
		// ns.missing on a namespace import is undefined at runtime.
		'import/namespace': 'error',

		/* ================================================================== *
		 * import — suspicious
		 * ================================================================== */
		// Absolute paths are machine-specific; they break on every other machine.
		'import/no-absolute-path': 'error',
		// import {} from "x" — empty braces import nothing; make it a side-effect import or delete.
		'import/no-empty-named-blocks': 'error',
		// Importing a named export under the default's name reads as the wrong binding.
		'import/no-named-as-default': 'error',
		// default.namedExport — the member lives on the module, not the default.
		'import/no-named-as-default-member': 'error',
		// A module importing itself is always a refactoring accident.
		'import/no-self-import': 'error',
		// Bare imports hide side effects; CSS is the sanctioned exception (per cacographer).
		'import/no-unassigned-import': ['error', { allow: ['**/*.css'] }],

		/* ================================================================== *
		 * import — pedantic
		 * ================================================================== */
		// Past ~24 imports a module is doing too many jobs (threshold per cacographer).
		'import/max-dependencies': ['error', { max: 24 }],

		/* ================================================================== *
		 * import — style
		 * ================================================================== */
		// Top-level `import type { X }` only when every specifier is a type — that shape
		// fully erases, so this agrees with typescript/no-import-type-side-effects and
		// --fix converges; mixed imports keep inline `type` on one line (see issue #33).
		'import/consistent-type-specifier-style': ['error', 'prefer-top-level-if-only-type-imports'],
		// Export placement is layout preference, not correctness (off per cacographer).
		'import/exports-last': 'off',
		// Imports scattered below code hide the dependency list.
		'import/first': 'error',
		// Grouping all exports into one statement is ceremony (off per cacographer).
		'import/group-exports': 'off',
		// Blank-line-after-imports is whitespace — oxfmt's jurisdiction.
		'import/newline-after-import': 'off',
		// unicorn/no-anonymous-default-export covers this; avoid double reports.
		'import/no-anonymous-default-export': 'off',
		// Two imports from one module belong on one line (type-aware, unlike eslint's).
		'import/no-duplicates': 'error',
		// Reassigning an exported binding mutates state for every importer.
		'import/no-mutable-exports': 'error',
		// import { default as x } is import x.
		'import/no-named-default': 'error',
		// Named exports are the default stance here (off per cacographer).
		'import/no-named-export': 'off',
		// import * pulls the whole module and defeats tree-shaking signals; import what you use.
		'import/no-namespace': 'error',
		// Node builtins are fine — universal-runtime purity is a per-project choice.
		'import/no-nodejs-modules': 'off',
		// Default exports rename themselves at every import site; prefer named (off per cacographer).
		'import/prefer-default-export': 'off',

		/* ================================================================== *
		 * import — restriction
		 * ================================================================== */
		// Extension requirements are bundler/tsconfig-dependent; the resolver enforces reality.
		'import/extensions': 'off',
		// AMD is a dead module format.
		'import/no-amd': 'error',
		// CJS in source is legacy (pairs with unicorn/prefer-module).
		'import/no-commonjs': 'error',
		// Import cycles make module init order undefined — the bug appears at 3am.
		'import/no-cycle': 'error',
		// Frameworks require default exports (routes, configs, Svelte); can't ban globally.
		'import/no-default-export': 'off',
		// require(variable) defeats static analysis and bundling.
		'import/no-dynamic-require': 'error',
		// ../ imports are normal; path aliases are a per-project choice.
		'import/no-relative-parent-imports': 'off',
		// loader!./file syntax is webpack-specific and non-portable.
		'import/no-webpack-loader-syntax': 'error',
		// Script-vs-module ambiguity is moot in ESM-only codebases.
		'import/unambiguous': 'off',

		/* ================================================================== *
		 * import — nursery (off: not stabilized; tsc catches missing exports)
		 * ================================================================== */
		// Nursery: tsc already errors on importing a missing export.
		'import/export': 'off',
		// Nursery: same — TypeScript validates named imports.
		'import/named': 'off',

		/* ================================================================== *
		 * promise — correctness
		 * ================================================================== */
		// Calling a node-style callback inside a promise chain mixes error channels.
		'promise/no-callback-in-promise': 'error',
		// Promise.all is static-only; new Promise.all() throws.
		'promise/no-new-statics': 'error',
		// Promise.all(notAnArray) rejects at runtime.
		'promise/valid-params': 'error',

		/* ================================================================== *
		 * promise — suspicious
		 * ================================================================== */
		// A .then that sometimes returns and sometimes doesn't feeds undefined downstream.
		'promise/always-return': 'error',
		// Two code paths resolving the same promise: the second silently loses.
		'promise/no-multiple-resolved': 'error',
		// Promises inside node-style callbacks — pick one async model per boundary.
		'promise/no-promise-in-callback': 'error',

		/* ================================================================== *
		 * promise — style
		 * ================================================================== */
		// new Promise() is the correct tool for wrapping callback APIs.
		'promise/avoid-new': 'off',
		// Nested .then chains are callback hell with promises; flatten or use await.
		'promise/no-nesting': 'error',
		// resolve(Promise.resolve(x)) double-wraps; return the value.
		'promise/no-return-wrap': 'error',
		// (resolve, reject) — the standard names; anything else makes readers translate.
		'promise/param-names': 'error',
		// Callback APIs deserve promisification at the boundary, not propagation.
		'promise/prefer-await-to-callbacks': 'error',
		// await reads top-to-bottom; .then chains read inside-out.
		'promise/prefer-await-to-then': 'error',
		// .catch(fn) over .then(undefined, fn) — the two-arg form skips same-handler errors.
		'promise/prefer-catch': 'error',

		/* ================================================================== *
		 * promise — restriction
		 * ================================================================== */
		// Every .then chain must end handled (caught or returned) — the syntax-level
		// floating-promise guard for non-type-aware runs.
		'promise/catch-or-return': 'error',
		// Flags newly-standardized statics (Promise.try) as nonstandard; too eager.
		'promise/spec-only': 'off',

		/* ================================================================== *
		 * promise — nursery (off: not stabilized)
		 * ================================================================== */
		// Nursery: revisit when stabilized.
		'promise/no-return-in-finally': 'off',

		/* ================================================================== *
		 * node
		 * ================================================================== */
		// Callback-era Node style; ESM codebases promisify instead.
		'node/callback-return': 'off',
		// CJS-era rule; import/no-commonjs already bans require wholesale.
		'node/global-require': 'off',
		// Which flavor of CJS export to use is moot — no-commonjs bans them all.
		'node/exports-style': 'off',
		// Assigning to `exports` alone silently breaks — module.exports is the binding.
		'node/no-exports-assign': 'error',
		// CJS-era rule about require grouping; moot under no-commonjs.
		'node/no-mixed-requires': 'off',
		// Sync fs calls are legitimate in CLIs/scripts/startup (off per cacographer).
		'node/no-sync': 'off',
		// Callback-era error handling; promises carry errors now.
		'node/handle-callback-err': 'off',
		// CJS-era (new require()); moot under no-commonjs.
		'node/no-new-require': 'off',
		// __dirname + "/file" breaks on Windows; path.join.
		'node/no-path-concat': 'error',
		// Reading process.env is how configuration works; banning it is impractical.
		'node/no-process-env': 'off',
		// Top-level await is standard ESM; unicorn/prefer-top-level-await is equally off —
		// no stance either direction.
		'node/no-top-level-await': 'off',

		/* ================================================================== *
		 * jsdoc
		 *
		 * Stance: every EXPORTED symbol should have JSDoc; internal code doesn't
		 * need it. oxlint's jsdoc plugin has no require-jsdoc rule yet (upstream's
		 * has publicOnly — exactly this stance), so existence-on-exports stays a
		 * review expectation for now. What IS enforced: any doc you do write must
		 * be complete and descriptive — half-documented is worse than undocumented.
		 * Types never go in JSDoc; TypeScript owns them.
		 * ================================================================== */
		// @property names that don't match the object shape are lies.
		'jsdoc/check-property-names': 'error',
		// @returnz and made-up tags render as nothing everywhere.
		'jsdoc/check-tag-names': 'error',
		// @implements on a non-class is meaningless.
		'jsdoc/implements-on-classes': 'error',
		// Defaults documented in JSDoc drift from the code's actual defaults.
		'jsdoc/no-defaults': 'error',
		// Demanding @property blocks on every typedef is ceremony; completeness
		// rules below govern the ones you write.
		'jsdoc/require-property': 'off',
		// A @property tag with no description tells the reader nothing.
		'jsdoc/require-property-description': 'error',
		// A @property tag with no name documents nothing at all.
		'jsdoc/require-property-name': 'error',
		// Types live in TypeScript, not JSDoc annotations.
		'jsdoc/require-property-type': 'off',
		// Description-only docs on generators are fine; don't force @yields tags.
		'jsdoc/require-yields': 'off',
		// If you document SOME params you must document them all — a partial list
		// reads as complete and misleads. One-line description-only docs stay legal
		// (ignoreWhenAllParamsMissing), which is what keeps this off internal code's back.
		'jsdoc/require-param': ['error', { ignoreWhenAllParamsMissing: true }],
		// A @param with no description is a name the signature already shows.
		'jsdoc/require-param-description': 'error',
		// A @param with no name can't be matched to a parameter.
		'jsdoc/require-param-name': 'error',
		// Types live in TypeScript; @param {type} duplicates and drifts.
		'jsdoc/require-param-type': 'off',
		// Description-only docs are fine; don't force a @returns tag onto every function.
		'jsdoc/require-returns': 'off',
		// But a @returns you did write with no description says nothing.
		'jsdoc/require-returns-description': 'error',
		// Types live in TypeScript; @returns {type} duplicates and drifts.
		'jsdoc/require-returns-type': 'off',
		// Types live in TypeScript — and it has no throws clause to sync with anyway.
		'jsdoc/require-throws-type': 'off',
		// Types live in TypeScript.
		'jsdoc/require-yields-type': 'off',
		// A @throws with no description doesn't say when or why it throws.
		'jsdoc/require-throws-description': 'error',
		// A @yields with no description doesn't say what comes out.
		'jsdoc/require-yields-description': 'error',
		// @access/@public/@private validation — on, since wrong access tags mislead.
		'jsdoc/check-access': 'error',
		// @param with no name/description is an empty tag — either fill it or delete it.
		'jsdoc/empty-tags': 'error'
	},
	overrides: [
		{
			// Ambient declaration files augment existing scopes (SvelteKit's app.d.ts
			// App namespace, module augmentation) — declaration merging only works
			// with interface, so forcing type there breaks the file's whole purpose.
			files: ['**/*.d.ts'],
			rules: {
				'typescript/consistent-type-definitions': 'off'
			}
		},
		{
			// Tests trade some rigor for expressiveness: console output for debugging,
			// any/! for constructing intentionally-invalid fixtures, multiple tiny
			// classes for scenario setup.
			files: ['**/*.test.ts', '**/*.spec.ts', 'tests/**/*.ts', '**/testUtils.ts'],
			rules: {
				'eslint/no-console': 'off',
				'typescript/no-explicit-any': 'off',
				'typescript/no-non-null-assertion': 'off',
				'eslint/max-classes-per-file': 'off',
				// Type-aware rule: only fires for consumers who also extend type-aware.ts.
				'typescript/no-unsafe-type-assertion': 'off'
			}
		}
	],
	// Build artifacts only — project-specific ignores (generated code, configs)
	// belong in the consumer's own ignorePatterns.
	ignorePatterns: ['node_modules', 'dist', 'build', '.svelte-kit']
});
