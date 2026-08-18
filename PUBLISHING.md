# Publishing to npm

Releases run through the **Release** GitHub Actions workflow ([`.github/workflows/release.yml`](.github/workflows/release.yml)). You pick the bump size; the workflow runs the gates, bumps the version, tags, publishes to npm, pushes, and creates the GitHub release. No local checkout, npm login, or OTP needed — it's runnable from the GitHub mobile app.

## One-time setup: npm trusted publishing

The workflow authenticates with [npm trusted publishing](https://docs.npmjs.com/trusted-publishers) (OIDC) instead of a stored token, so there's no `NPM_TOKEN` secret to create, rotate, or leak. Provenance attestations are attached automatically.

Configure it once on npmjs.com:

1. Go to the [package settings](https://www.npmjs.com/package/@himynameisdave/oxlint-config/access) → **Trusted Publisher**.
2. Select **GitHub Actions** and enter:
   - Organization or user: `himynameisdave`
   - Repository: `oxlint-config`
   - Workflow filename: `release.yml`
   - Environment: leave blank
3. Save. That's it — no repo secrets needed.

Until this is configured, the workflow's publish step fails with an auth error; everything before it (gates, version bump) is local to the runner, so a failed run leaves no trace to clean up.

## Releasing

From GitHub (web or mobile app): **Actions → Release → Run workflow**, leave the branch on `main`, and pick the bump:

- **patch**: comment fixes, README/docs, tooling that doesn't change shipped rules
- **minor**: rule churn of any kind. New rules decided (e.g. after an oxlint upgrade via the `update-oxlint-rules` skill), an existing rule flipped `error` ↔ `off`, options tightened. All of these can add errors to a consumer's CI, and that's the deal `^` buys them.
- **major**: structural changes. An oxlint major bump, a newly enabled plugin, an entry point renamed or removed.

The consumer-facing statement of this policy lives in README → Versioning & compatibility. Change one, change the other.

The workflow then runs, in order:

1. **Guard.** Refuses to run from any ref but `main`.
2. **Gates.** `bun run test` — all four: `lint` (tsc build + self-lint with our own config, type-aware on), `format:check` (oxfmt), `check-coverage` (every registered oxlint rule has an explicit decision), and `test:consumer` (pack, install and lint from a scratch consumer project). A red gate aborts the release before anything is versioned or published.
3. **Version + tag.** `npm version <bump>` commits `🔖 Release vX.Y.Z` and tags `vX.Y.Z` (on the runner only, so far).
4. **Publish.** `prepublishOnly` runs the build (`tsc` → `dist/`), then npm uploads the tarball with provenance (13 files: two per entry point in `dist/` (`.js` + `.d.ts`, five entry points) plus LICENSE, README and package.json; `src/` never ships). Adding an entry point adds two files: check with `npm publish --dry-run` and update this count.
5. **Push + release.** The version commit and tag are pushed to `main`, and a GitHub release is created with auto-generated notes. Edit it afterwards to add highlights (notable new rules / flips) if warranted.

Publish happens before the push on purpose: a failed publish leaves nothing on the remote to clean up.

> Note: the version commit is pushed with the workflow's `GITHUB_TOKEN`, which doesn't trigger other workflows — so CI won't re-run on that commit. That's fine: the release job itself just ran the same gates.

## Verify afterwards

```bash
# npm has it and the tarball looks right:
npm view @himynameisdave/oxlint-config version dist.fileCount

# it actually resolves and lints from a consumer:
cd "$(mktemp -d)" && bun init -y > /dev/null && bun add -D oxlint @himynameisdave/oxlint-config
```

Sanity-check the [npm page](https://www.npmjs.com/package/@himynameisdave/oxlint-config) renders the README, and that the [FOSSA badges](https://app.fossa.com/projects/git%2Bgithub.com%2Fhimynameisdave%2Foxlint-config) go green once FOSSA rescans.

## Manual fallback (Actions unavailable)

Trusted publishing only mints tokens for the workflow, so a manual publish needs your own npm auth (`npm whoami || npm login`; have your OTP handy):

```bash
bun run test                 # all four gates, same as CI
npm version minor            # or patch/major; commits + tags
npm publish                  # prepublishOnly builds; OTP when prompted
git push --follow-tags
```

Then create the GitHub release for the new tag by hand.

## If a publish goes wrong

- **Bad tarball / broken release:** publish a fixed **patch** version. Don't `npm unpublish`: it breaks anyone who already installed it (and npm heavily restricts it after 72 hours anyway).
- **Deprecating a version:** `npm deprecate @himynameisdave/oxlint-config@"1.2.3" "reason"` steers installs away without breaking existing ones.
