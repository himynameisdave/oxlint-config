import { defineConfig } from "oxlint";
import base from "./dist/base.js";
import typeAware from "./dist/type-aware.js";

// Self-lint: this package eats its own dog food (minus svelte — no components
// here). Imports from dist/ because oxlint loads configs through Node, which
// can't resolve the .ts sources — hence `lint` runs the build first.
export default defineConfig({
	extends: [base, typeAware],
	overrides: [
		{
			// Repo scripts are CLIs — console IS their output.
			files: ["scripts/**"],
			rules: {
				"eslint/no-console": "off",
			},
		},
	],
});
