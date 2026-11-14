# PR Review Workflow: Small, Stackable, Correctly Ordered

## The problem

We want pull requests that are **small and easy to review**. Two things work against that:

1. **Large PRs are not reviewable.** A PR that touches schema, model, controllers, routes, Swagger, frontend and the lockfile in one go — easily several hundred changed lines across a dozen files — is too big to review carefully. Reviewers skim instead of reviewing.

2. **Small, dependent PRs get handled incorrectly.** When work is split into a chain (e.g. A → B → C, where B needs A's code), the follow-up branch is often created *off the previous branch* instead of `main`. The result:
   - The PR diff shows the parent's changes too, so the description no longer matches the diff. This is worse with AI-generated descriptions: the tool reads the whole diff and describes the parent branches' changes as if they belonged to this PR.
   - If someone retargets the base to a feature branch to "clean up" the diff, that branch has **no branch protection**, so the review requirement silently disappears.
   - There is nothing stopping B from being merged before A.

So we need a setup that keeps PRs small **and** handles dependent PRs safely.

## The idea

Separate two things that are usually lumped together:

- **Review** — allowed and required on **every** branch. Reviewers can approve A, B and C at any time, in any order, across time zones, even while the branches are still stacked.
- **Merge** — allowed **only when the PR targets `main`**.

This gives us all three properties at once:

| Goal | How it is enforced |
|------|--------------------|
| Keep working without waiting for reviews | Stack branches: create B off A, C off B. Local work is never blocked. |
| No merge without review | Required approval on all branches. |
| Correct merge order (A before B before C) | A PR can only merge when its base is `main`. B's base is A's branch, so B cannot merge until A is merged. |

**How the order resolves automatically:** when A is merged and its branch is deleted, GitHub automatically retargets B's base from A's branch to `main`. B's base is now `main`, the merge check passes, and because B was already approved it can merge immediately — no second review needed.

## Prerequisite: the status check workflow

Merge ordering relies on one small GitHub Action: `.github/workflows/enforce-base-main.yml`.

```yaml
name: Enforce base branch

on:
  pull_request:
    types: [opened, edited, reopened, synchronize]

jobs:
  check-base:
    runs-on: ubuntu-latest
    steps:
      - name: Require base = main
        if: github.base_ref != 'main'
        run: |
          echo "PRs must target 'main' before merging (base was '${{ github.base_ref }}')."
          exit 1
```

What it does:

- Runs on every PR event, including when a PR's **base branch changes**.
- Checks the PR's base branch (`github.base_ref`).
  - Base **≠ `main`** → exits with an error → the check turns **red**.
  - Base **= `main`** → the step is skipped → the check is **green**.

The file alone blocks nothing. It only produces a pass/fail signal called `check-base`. The **ruleset** (below) is what turns that signal into a merge requirement.

Important: a required status check only appears in the ruleset dropdown **after it has run at least once**. So this file must be merged to `main` first; otherwise the check is not selectable (and typing its name by hand would block *every* PR, because the check would never run).

## Settings to configure

### 1. Repository settings
**Settings → General → Pull Requests**
- [x] **Automatically delete head branches** — required so B retargets to `main` automatically after A is merged.

### 2. Branch ruleset
**Settings → Rules → Rulesets → New ruleset → New branch ruleset**
- **Name:** `review-and-base-main`
- **Enforcement status:** Active
- **Target branches:** Include **all branches** (not just `main` — this is what closes the "unprotected feature branch" gap)

Enable these rules:
- [x] **Require a pull request before merging**
  - Required approvals: **1**
  - [x] Dismiss stale pull request approvals when new commits are pushed *(optional)*
- [x] **Require status checks to pass**
  - Add check: **`check-base`**
  - [ ] **Do NOT** enable "Require branches to be up to date before merging" — it would invalidate a pre-approval after the parent merges and force a second review.

### Order of setup
1. Merge `enforce-base-main.yml` to `main`.
2. Open one throwaway PR so `check-base` runs once and becomes selectable.
3. Enable "Automatically delete head branches".
4. Create the ruleset as above.

## Resulting behavior

| Situation | Result |
|-----------|--------|
| PR B, base = A's branch, approved | Review ✅, merge **blocked** (`check-base` red) |
| A merged, A's branch deleted | B's base auto-retargets to `main`, `check-base` turns green |
| PR with base = `main`, no approval | Merge blocked (approval missing) |
| Author approves own PR | Not allowed by GitHub |

## How to create stacked PRs (author side)

```bash
# A — off main
git checkout main && git pull
git checkout -b feature-a
# ...work, commit, push, open PR A (base: main)

# B — off A, while A is still in review
git checkout -b feature-b          # branches off feature-a
# ...work, commit, push, open PR B (base: feature-a)

# C — off B
git checkout -b feature-c
# ...work, commit, push, open PR C (base: feature-b)
```

Reviewers approve A, B and C whenever they are available. Merge A → B retargets to `main` and merges → C retargets to `main` and merges. Small PRs, correct order, review always enforced.
