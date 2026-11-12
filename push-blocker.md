# Lint Before Push

Implemented in [issue #16](https://github.com/beyersdorfertj/cse341.9-kizuna-rail/issues/16). This document should be incorporated into `coding-standards-proposals.md` after [PR #3](https://github.com/beyersdorfertj/cse341.9-kizuna-rail/pull/3) is merged, then removed.

## Setup

Run `npm install` after cloning. The `prepare` script activates Husky automatically; no manual hook setup is needed.

## Behavior

- The `.husky/pre-push` hook runs `npm run lint` before each push.
- ESLint errors abort the push. Fix them and push again.
- Run `npm run lint` to check manually or `npm run lint:fix` to apply supported automatic fixes.
- No pre-commit hook is installed.

## Limitations

This is a local guardrail, not a server-side gate. It can be bypassed with `git push --no-verify`. Enforcing lint on the remote would require CI checks and branch protection, which are outside the scope of issue #16.