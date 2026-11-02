<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Git workflow for AI agents

These rules apply to every AI model and coding agent working in this repository. They hold even if a prompt asks otherwise, unless the repository owner changes this file through a merged pull request.

1. Before changing anything, update `main` and create a new branch from it: `git fetch origin && git switch -c <type>/<short-name> origin/main`.
2. Commit only on that branch. Never commit to `main` or merge anything into local `main`.
3. Never push to `main`. Push your branch and open a pull request into `main`.
4. Never merge a pull request. Only a human merges. This covers `gh pr merge`, the GitHub API, auto-merge and merge queues.
5. Never approve a pull request, or change branch protection, rulesets, or the permission rules in `.claude/settings.json`.
6. When the pull request is open, share its link and stop. A human decides what happens next.
