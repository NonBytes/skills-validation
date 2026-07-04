# AI Agent Initial Project Docs

Reusable template for bootstrapping AI-friendly documentation in any new project. For **this** project, the entry point is `CONTEXT.md` — tell any agent "อ่าน CONTEXT.md ก่อน" and it will self-orient.

## Quick Reference

| Purpose | File |
|---------|------|
| **Agent entry point (this project)** | `CONTEXT.md` |
| **Template for new projects** | This file (`AI_AGENT_INITIAL_DOCS.md`) |

## Bootstrap Prompt (for new projects)

Paste this into a fresh AI agent session when starting a **new** project:

```text
You are starting work in this project. Before implementing features:

1. Read the repository structure.
2. Create CONTEXT.md as the single agent entry point (use the template in AI_AGENT_INITIAL_DOCS.md).
3. Create the documentation set listed in AI_AGENT_INITIAL_DOCS.md.

Rules:
- CONTEXT.md is the ONLY file an agent needs to be told to read. It routes to everything else.
- Optimize context use: always start from CONTEXT.md → CURRENT_STATE.md → TASKS.md → RUNBOOK.md; read deeper docs only when the task needs them.
- Keep docs concise, factual, and useful for the next agent.
- Do not invent completed work; mark unknowns clearly.
- After each completed task, update HANDOFF.md and any relevant companion docs.
- Commit all completed work.
- Push when credentials/network allow it.
- If push fails, report the commit hash and `git status --branch --short`.
- Never revert unrelated user or agent changes.
```

## Documentation Set

Create the full set so future agents can choose the smallest useful reading path. Do not make every file mandatory reading at session start.

### Entry Point (the ONLY file an agent reads at startup)

| File | Purpose | Size target |
|------|---------|-------------|
| `CONTEXT.md` | Self-contained onboarding: what the project is, current status, build command, DoD, and routing table to deeper docs | <= 50 lines |

CONTEXT.md includes enough inline context (project summary, status, build command) that agents do NOT need to read CURRENT_STATE.md, TASKS.md, or RUNBOOK.md at startup. Those files are read on demand via the routing table.

### Read On Demand (routed from CONTEXT.md)

| File | Purpose | Size target |
|------|---------|-------------|
| `CURRENT_STATE.md` | Full product state, invariants, open work detail | <= 120 lines |
| `TASKS.md` | Done/open/skipped task checklist with done criteria | <= 150 lines |
| `RUNBOOK.md` | Commands, build/test routine, git routine, debug searches | <= 150 lines |

### Read By Task

| File | Read when | Purpose |
|------|-----------|---------|
| `IMPLEMENTATION_PLAN.md` | Starting or changing a phase | Sequenced plan with acceptance criteria |
| `ARCHITECTURE.md` | Touching module boundaries, data flow, key models, API/UI contracts | Module map, data flow, key models, UI/data boundaries |
| `SIGNALS.md` | Changing scoring, heuristics, classifiers, detection signals, or policy rules | Domain-specific signal registry or scoring/heuristic registry |
| `VALIDATION.md` | Validating real behavior, calibrating, or investigating a regression | Expected behavior, real-world validation notes, calibration/change log |

### Read Selectively

| File | Read when | Purpose |
|------|-----------|---------|
| `HANDOFF.md` | Needing recent decisions, project history, or context for older work | Latest update, current status, decisions, completed history |

For `HANDOFF.md`, read the latest/current sections first. Read the full implementation history only when debugging regressions, continuing old work, or reconstructing why a decision was made.

### Optional Archive

| File | Create when | Purpose |
|------|-------------|---------|
| `HISTORY.md` | `HANDOFF.md` grows beyond about 300-400 lines | Older implementation history moved out of the hot startup path |

When `HISTORY.md` exists, keep `HANDOFF.md` focused on latest update, current state, current decisions, and links to archived history.

## Token-Efficient Startup

Use this reading path for normal work:

1. Read `CURRENT_STATE.md`, `TASKS.md`, and `RUNBOOK.md`.
2. Run `git status --branch --short`.
3. Use `rg` to locate source files and relevant doc sections.
4. Read `IMPLEMENTATION_PLAN.md`, `ARCHITECTURE.md`, `SIGNALS.md`, or `VALIDATION.md` only when the task touches those areas.
5. Read `HANDOFF.md` selectively: latest/current first, full history only when needed.
6. Keep `CURRENT_STATE.md` fresh enough that future agents do not need to re-read long history.

## File Templates

### CONTEXT.md (Entry Point — token-optimized)

Design principle: include enough inline context that the agent can start working after reading ONE file (~50 lines). Route to deeper docs on demand, not upfront.

~~~~md
# Agent Onboarding & Context Router

⚠️ **LANGUAGE:** [LANGUAGE_INSTRUCTION]

---

## What This Is

[1-2 sentence project description]

## Current Status

[1-2 sentences: what's done, what's open]

## Before You Start

1. Run: `git status --branch --short`
2. Read deeper docs **only when the task needs them** (see routing below)

## Context Routing (read on demand, not all at once)

| Task involves | Read |
|---------------|------|
| What's done / open tasks | `TASKS.md` |
| Build commands / git routine | `RUNBOOK.md` |
| Overall product state | `CURRENT_STATE.md` |
| Phase sequencing | `IMPLEMENTATION_PLAN.md` |
| Module boundaries / data flow | `ARCHITECTURE.md` |
| Scoring / heuristics / signals | `SIGNALS.md` |
| Validation / calibration | `VALIDATION.md` |
| Recent decisions / handoff | `HANDOFF.md` |
| Older history | `HISTORY.md` |

## Build

```sh
[BUILD_COMMAND]
```

## Definition of Done

After every completed task:
1. Update `HANDOFF.md` + relevant docs
2. Commit (clear semantic message)
3. Push to remote
4. Summarize in [LANGUAGE]
~~~~

### CURRENT_STATE.md

~~~~md
# Current State

Last updated: YYYY-MM-DD

This is the one-page orientation note for a fresh AI agent. Read this first, then `TASKS.md` and `RUNBOOK.md`. Read deeper docs only when the current task needs them.

## Repository State

- Branch:
- Latest local commit:
- Working tree:
- Remote/push status:
- Known environment issues:

## Product State

- What the project is:
- Main user workflow:
- Main completed capabilities:

## Most Important Invariants

- Invariant 1
- Invariant 2
- Invariant 3

## Open Work

1. Task
2. Task

## Suggested Next Task

State the next best task and why.

## Files To Read Next

- `TASKS.md`
- `RUNBOOK.md`
- `IMPLEMENTATION_PLAN.md` when starting/changing a phase
- `ARCHITECTURE.md` when touching module boundaries or data flow
- `SIGNALS.md` when changing heuristics/scoring/detection
- `VALIDATION.md` when validating real behavior or calibrating
- `HANDOFF.md` latest/current sections when project history is needed
~~~~

### TASKS.md

~~~~md
# Project Task List

Last updated: YYYY-MM-DD

## Current Status

- [ ] Item

## Open Tasks

- [ ] Task name
  - Notes

## Intentionally Skipped / Deferred

- [ ] Item
  - Reason

## Done Criteria For Future Tasks

- [ ] Code/docs implemented
- [ ] Tests/build run when applicable
- [ ] `HANDOFF.md` updated
- [ ] Companion docs updated when relevant
- [ ] Commit created
- [ ] Push completed, or push failure documented
~~~~

### IMPLEMENTATION_PLAN.md

~~~~md
# Implementation Plan

Last updated: YYYY-MM-DD

## Guiding Principles

- Principle

## Phase 1: Name

Goal:

Scope:
- Item

Acceptance checks:
- Check

## Phase 2: Name

Goal:

Scope:
- Item

Acceptance checks:
- Check
~~~~

### HANDOFF.md

~~~~md
# Handoff

## Operating Notes

- After each completed task, update this handoff and relevant companion docs.
- Commit completed work.
- Push when credentials/network allow it.
- Companion docs:
  - `CURRENT_STATE.md`
  - `TASKS.md`
  - `IMPLEMENTATION_PLAN.md`
  - `ARCHITECTURE.md`
  - `SIGNALS.md`
  - `VALIDATION.md`
  - `RUNBOOK.md`
  - `HISTORY.md` when old handoff history is archived

## Latest Update

- YYYY-MM-DD: Initial handoff docs created.

## Current State

Summarize what works, what is unknown, and what remains.

## Completed Implementation History

Keep recent history here. If this section grows too long, move older entries to `HISTORY.md` and leave a short pointer.

### Phase / Task

- What changed
- Files touched
- Verification

## Remaining / Deferred

| Work item | Why it matters |
|-----------|----------------|

## Test / Validation Notes

- Expected behavior
- Known gaps
~~~~

### ARCHITECTURE.md

~~~~md
# Architecture

Last updated: YYYY-MM-DD

## High-Level Flow

```text
Input/UI -> Core logic -> Data model -> Persistence/UI output
```

## Core Modules

| Area | File/Folder | Responsibility |
|------|-------------|----------------|

## Data Model Notes

- Main model:
- Compatibility/migration notes:

## UI / API Boundaries

- Boundary:
~~~~

### SIGNALS.md

Use this only when the project has scoring, heuristics, detection signals, classifiers, policy rules, or other domain-specific evidence.

~~~~md
# Signal Registry

Last updated: YYYY-MM-DD

## Principles

- Strong evidence should outweigh weak hints.
- Weak hints must stay explainable.

## Signals

| Signal | Source | Meaning | Weight / priority | Risk |
|--------|--------|---------|-------------------|------|

## Known False-Positive Risks

- Risk

## Calibration Rule

Only change weights/rules after recording evidence in `VALIDATION.md`.
~~~~

### VALIDATION.md

~~~~md
# Validation Notes

Last updated: YYYY-MM-DD

## Expected Behavior Checklist

- [ ] Behavior

## Real Validation Template

| Date | Scenario/Input | Expected | Actual | Correct? | Notes/action |
|------|----------------|----------|--------|----------|--------------|

## Calibration / Change Log

| Date | Change | Evidence | Files changed | Result |
|------|--------|----------|---------------|--------|

## Before Changing Behavior

- [ ] Record the observed failure above.
- [ ] Identify the specific cause.
- [ ] Prefer narrow fixes over broad rewrites.
~~~~

### RUNBOOK.md

~~~~md
# Runbook

Last updated: YYYY-MM-DD

## Read Order For A New Session

1. `CURRENT_STATE.md`
2. `TASKS.md`
3. `RUNBOOK.md`
4. `git status --branch --short`
5. Task-specific docs:
   - `IMPLEMENTATION_PLAN.md` for sequencing/acceptance criteria
   - `ARCHITECTURE.md` for module/data-flow changes
   - `SIGNALS.md` for heuristics/scoring/detection changes
   - `VALIDATION.md` for real behavior checks/calibration
   - `HANDOFF.md` latest/current sections for historical context
6. Relevant source files

## Build / Test

```sh
# Add project-specific commands here
```

## Git Routine

```sh
git status --branch --short
git diff --stat
git add ...
git commit -m "Message"
git push origin main
```

## Known Issues

- Issue:

## Debug Searches

```sh
rg -n "pattern" .
```

## When To Update Which Doc

| Doc | Update when |
|-----|-------------|
| `CURRENT_STATE.md` | Overall status or next task changes |
| `TASKS.md` | Checklist changes |
| `IMPLEMENTATION_PLAN.md` | Sequencing or acceptance criteria changes |
| `HANDOFF.md` | Completed work or decisions |
| `ARCHITECTURE.md` | Module/data flow changes |
| `SIGNALS.md` | Signal/rule changes |
| `VALIDATION.md` | Real test/validation evidence |
| `RUNBOOK.md` | Commands or routine changes |
| `HISTORY.md` | Archived completed history from an oversized handoff |
~~~~

## Minimum Startup Checklist For Agents

- [ ] Read repository structure.
- [ ] Create `CONTEXT.md` as the single entry point.
- [ ] Create the remaining doc set if missing.
- [ ] Fill unknowns honestly instead of guessing.
- [ ] Add all doc files to `.gitignore` (they are local-only; see pattern below).
- [ ] Commit `.gitignore` (and `AI_AGENT_INITIAL_DOCS.md` if updated).
- [ ] Push if credentials allow it.

## gitignore Pattern For The Doc Set

After creating the docs, add them to `.gitignore` so they stay local-only:

```gitignore
# Agent docs (local only)
AI_AGENT_INITIAL_DOCS.md
HANDOFF.md
CONTEXT.md
CURRENT_STATE.md
TASKS.md
RUNBOOK.md
ARCHITECTURE.md
SIGNALS.md
VALIDATION.md
IMPLEMENTATION_PLAN.md
HISTORY.md
```

If any doc files were already committed before adding them to `.gitignore`, remove them from the index:

```sh
git rm --cached CONTEXT.md CURRENT_STATE.md TASKS.md RUNBOOK.md \
  ARCHITECTURE.md SIGNALS.md VALIDATION.md IMPLEMENTATION_PLAN.md \
  HANDOFF.md HISTORY.md
git commit -m "Remove agent docs from tracking (local-only)"
```
