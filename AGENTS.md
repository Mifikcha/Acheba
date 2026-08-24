# Workspace Agent Instructions

This workspace keeps local agent skills and long-term context in `AGENTS/`.

## Local Skills

At the start of work in this workspace, be aware that local skills may exist under:

- `AGENTS/memory/SKILL.md`
- `AGENTS/physics-solver/SKILL.md`
- `AGENTS/superpowers/skills/*/SKILL.md`

If a task might match one of these local skills, read and follow the relevant `SKILL.md` before acting.

## Memory Ritual

Use `AGENTS/memory/SKILL.md` whenever the task involves persistent context, user preferences, workspace rules, project history, or saving/updating what was learned.

For tasks that may depend on prior context:

1. Read `AGENTS/memory/SKILL.md`.
2. Read `AGENTS/About_me.md` when user profile, preferences, goals, or communication style matter.
3. Read `AGENTS/memory/lessons-learned.md` when project history, previous decisions, or follow-up items may matter.

Before finishing a task that changes durable context, update the relevant memory file and mention that memory was updated.

## Git Workflow

After every completed set of workspace changes, create a focused commit and push it to the corresponding remote branch. Skip committing or pushing only when the user explicitly asks to keep the changes local.

For the public Quartz site, do not treat a push as complete by itself. After changes that affect the live site:

- push content changes to `main` and Quartz/runtime changes to `_quartz` branch `v5`;
- wait for the GitHub Pages workflow to finish successfully;
- verify the live site, preferably by checking `https://mifikcha.github.io/Acheba/deploy-info.json` plus the specific changed page, CSS, or asset URL;
- if Pages is still queued/in progress, say that explicitly instead of implying the live site is updated.

## Skill Visibility

Workspace-local skills are a fallback source. Personal Codex skills in `~/.codex/skills` are the preferred always-visible source and require restarting Codex after installation or changes.
