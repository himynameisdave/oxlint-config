# Publishing to npm

Releases are driven by [np](https://github.com/sindresorhus/np) — it handles the version bump, git tag, npm publish, and GitHub release draft in one interactive flow.

## One-time setup

1. **npm account with publish rights.** You need to be logged in:

   ```bash
   npm whoami || npm login
   ```

2. **Scope access.** The package publishes under the `@himynameisdave` scope — your npm user (or an org you belong to) must own that scope. Personal npm usernames own their matching scope automatically.

3. **2FA.** If your npm account has two-factor auth enabled for writes (it should), keep your authenticator handy — np prompts for the OTP at publish time.

> `publishConfig.access: "public"` is already set in package.json, so the first scoped publish won't default to private. No `--access public` flag needed.

## Releasing

From a clean checkout of `main` (np refuses a dirty tree or unpushed/unpulled state):

```bash
bun run release
```

np then walks through, in order:

1. **Preflight** — verifies clean working tree, current branch, and that the remote is in sync; pulls latest.
2. **Tests** — runs `npm test`, which here is all three CI gates: `lint` (tsc build + self-lint with our own config, type-aware on), `format:check` (oxfmt), and `check-coverage` (every registered oxlint rule has an explicit decision). A red gate aborts the release.
3. **Version prompt** — pick the bump. House rules (see CLAUDE.md):
   - **patch** — comment fixes, README/docs, tooling that doesn't change shipped rules
   - **minor** — new rules decided (e.g. after an oxlint upgrade via the `update-oxlint-rules` skill), new config entry points
   - **major** — any existing rule flipped `error` ↔ `off`, or options tightened — either can break a consumer's CI
4. **Publish** — `prepublishOnly` runs the build (`tsc` → `dist/`), then npm uploads the tarball (11 files: `dist/` + LICENSE + README + package.json — `src/` never ships). OTP prompt happens here.
5. **Tag + release** — np pushes the `vX.Y.Z` tag and opens a prefilled GitHub release draft in your browser. Paste highlights (notable new rules / flips) and publish it.

## Verify afterwards

```bash
# npm has it and the tarball looks right:
npm view @himynameisdave/oxlint-config version dist.fileCount

# it actually resolves and lints from a consumer:
cd "$(mktemp -d)" && bun init -y > /dev/null && bun add -D oxlint @himynameisdave/oxlint-config
```

Sanity-check the [npm page](https://www.npmjs.com/package/@himynameisdave/oxlint-config) renders the README, and that the [FOSSA badges](https://app.fossa.com/projects/git%2Bgithub.com%2Fhimynameisdave%2Foxlint-config) go green once FOSSA rescans.

## Manual fallback (np unavailable)

```bash
bun run test                 # all three gates, same as CI
npm version minor            # or patch/major — commits + tags
npm publish                  # prepublishOnly builds; OTP when prompted
git push --follow-tags
```

Then create the GitHub release for the new tag by hand.

## If a publish goes wrong

- **Bad tarball / broken release:** publish a fixed **patch** version. Don't `npm unpublish` — it breaks anyone who already installed it (and npm heavily restricts it after 72 hours anyway).
- **Deprecating a version:** `npm deprecate @himynameisdave/oxlint-config@"1.2.3" "reason"` steers installs away without breaking existing ones.
