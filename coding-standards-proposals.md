# Coding Standards Proposals

A discussion document for the team meeting.

## Purpose

We want to practice the Git pull-request workflow (branch → PR → review → merge)
on real, meaningful work. These three proposals each **add tooling or
configuration only** — they do **not** change any existing application source
code. That keeps them aligned with this repository's brownfield rules (the
existing technical debt is intentional and should not be "fixed" via PRs).

Each proposal is sized as one independent issue so that every team member can
take one, open a branch, submit a PR, have it reviewed, and merge it. The three
touch different new files, so they will not conflict with each other.

## Sequencing note

Proposal 1 (Husky pre-push hook) sets up Husky itself (`husky` dependency,
`prepare` script, `.husky/` directory). Proposal 3 (commit-msg hook) builds on
that Husky setup. If work happens in parallel, Proposal 3 should either be
merged after Proposal 1 or include the Husky base setup in its own branch.

---

# Proposal 1 — Add Husky pre-push hook that runs lint

## Description
- Add a shared Git pre-push hook so `npm run lint` runs automatically before every push.
- The hook must be versioned in the repo and set up automatically on install.

## Spec
### Goal
Block pushing code that fails `npm run lint` by wiring a Husky pre-push hook into the repo.

### Steps
- Add `husky` as a devDependency.
- Add a `"prepare": "husky"` script to `package.json` (installs the hook after `npm install`).
- Create `.husky/pre-push` that runs `npm run lint`.
- Commit `.husky/pre-push` and the `package.json` changes.

### Notes
- The hook activates after `npm install` runs the `prepare` script.
- It is a local convenience, not hard enforcement: it can be bypassed with `git push --no-verify`.

## Definition of Done
- `.husky/pre-push` exists and is tracked in git.
- `npm install` activates the hook.
- A push with an intentional lint error is rejected locally.
- A push with clean code succeeds.

---

# Proposal 2 — Add an .editorconfig for consistent formatting

## Description
- Add an `.editorconfig` file so all contributors get consistent indentation, line endings, and charset regardless of editor or operating system.
- It does not reformat existing code; it applies to future editing only.

## Spec
### Goal
Reduce formatting noise in diffs across different editors and operating systems.

### Steps
- Create `.editorconfig` in the repo root with `root = true`.
- Define defaults for all files: UTF-8, LF line endings, space indentation (size 4), insert final newline, trim trailing whitespace.
- Override for Markdown: keep trailing whitespace (it means a line break there).
- Override for JSON: indent size 2.
- Commit the file.

### Notes
- EditorConfig is supported natively by many editors; VS Code needs the "EditorConfig for VS Code" extension.
- It configures the editor; it does not enforce formatting at commit time.

## Definition of Done
- `.editorconfig` exists and is tracked in git.
- Opening and saving a file in a supported editor applies the settings (e.g., LF, 4-space indent).
- Adding the file does not modify any existing source files.

---

# Proposal 3 — Add a commit-msg hook that enforces Conventional Commits

## Description
- Add a Git `commit-msg` hook (via Husky) that validates every commit message.
- Reject commits whose message does not follow the Conventional Commits format (`type: subject`).

## Spec
### Goal
Enforce a consistent, readable commit history using Conventional Commits.

### Steps
- Add `@commitlint/cli` and `@commitlint/config-conventional` as devDependencies.
- Create `commitlint.config.js` that extends `@commitlint/config-conventional`.
- Create `.husky/commit-msg` running `npx --no-install commitlint --edit "$1"`.
- Commit the config file and the hook.

### Notes
- Allowed types include: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- Requires the Husky setup from Proposal 1.
- Bypassable with `git commit --no-verify`; activates after `npm install`.

## Definition of Done
- `.husky/commit-msg` and `commitlint.config.js` exist and are tracked in git.
- `git commit -m "fixed stuff"` is rejected.
- `git commit -m "fix: correct wording"` is accepted.
