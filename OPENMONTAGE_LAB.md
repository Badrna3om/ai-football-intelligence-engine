# TACTIC OpenMontage Lab

This branch is an isolated experiment. It does **not** connect to n8n, Supabase, or the production TACTIC workflows.

## Purpose

Test whether OpenMontage can produce a better cinematic match recap for **Baniyas vs Al Wasl** before any production integration.

## Codespace boot

When this branch is opened in GitHub Codespaces, `.devcontainer/devcontainer.json` runs `scripts/setup-openmontage-lab.sh` automatically.

The setup creates a separate OpenMontage runtime at:

```text
/workspaces/OpenMontage
```

and the first test project at:

```text
/workspaces/OpenMontage/projects/wasl-baniyas-test
```

## Test structure

```text
wasl-baniyas-test/
├── assets/
│   ├── video/
│   ├── images/
│   ├── audio/
│   └── music/
├── artifacts/
├── renders/
├── TACTIC_INPUT_TEMPLATE.json
└── README_TACTIC.txt
```

## First test

Planned sequence:

```text
Intro
→ Goals
→ Possession
→ xG
→ Shots
→ Shots on target
→ Big chances
→ Man of the Match
→ Outro
```

OpenMontage configuration for the experiment:

- Pipeline: `hybrid`
- Render runtime: `remotion`
- Composition mode: `atelier`
- Output: 9:16, 1080x1920
- Language: Arabic

## Rules for the experiment

1. No production workflow connection.
2. Match videos are supplied manually.
3. TACTIC match data/logos are supplied manually.
4. Render output stays inside the Codespace until reviewed.
5. Only after several successful match tests do we design the n8n integration.
