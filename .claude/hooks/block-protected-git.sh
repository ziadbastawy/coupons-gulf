#!/bin/bash
# Blocks AI agents from merging PRs, pushing to main, force pushing, or changing repo protection. See AGENTS.md.
command=$(jq -r '.tool_input.command // empty')

blocked='(^|[^[:alnum:]_-])gh[[:space:]].*pr[[:space:]]+(merge|review)'
blocked+='|(^|[^[:alnum:]_-])gh[[:space:]]+api.*(/merge|/merges|/protection|/rulesets|auto-merge|mergePullRequest|enablePullRequestAutoMerge|addPullRequestReview)'
blocked+='|(^|[^[:alnum:]_-])git[[:space:]].*push.*[[:space:]:](refs/heads/)?main([[:space:]]|$|;|&|\|)'
blocked+='|(^|[^[:alnum:]_-])git[[:space:]].*push.*[[:space:]](--force|--force-with-lease|-f)([[:space:]=]|$)'

if printf '%s' "$command" | grep -qE "$blocked"; then
  echo "Blocked by .claude/hooks/block-protected-git.sh: AI agents work on a branch and open a PR. Only a human merges. See AGENTS.md." >&2
  exit 2
fi
exit 0
