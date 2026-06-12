# Superpowers for Codex

This folder contains a workspace-local copy of the Codex-adapted Superpowers skills from:

https://github.com/obra/superpowers

Skills are stored in `skills/`.

Installed/adapted skills:

- `brainstorming`
- `dispatching-parallel-agents`
- `executing-plans`
- `finishing-a-development-branch`
- `receiving-code-review`
- `requesting-code-review`
- `subagent-driven-development`
- `systematic-debugging`
- `test-driven-development`
- `using-git-worktrees`
- `using-superpowers`
- `verification-before-completion`
- `writing-plans`
- `writing-skills`

Codex adaptation notes:

- `TodoWrite` references were converted to `update_plan`.
- `superpowers:` skill namespace references were converted to local skill names.
- Parallel-agent examples were converted from `Task(...)` to Codex-style multi-agent references: `spawn_agent`, `wait_agent`, `close_agent`.
- Personal skill paths were adapted to `~/.codex/skills`.

