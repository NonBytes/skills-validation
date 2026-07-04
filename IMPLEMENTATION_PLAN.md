# Implementation Plan

Last updated: 2026-07-05

## Guiding Principles

- Validate behavior in the real app (cargo tauri dev), not just type checks
- Keep matching logic separate: `auto_match()` (free-text) ≠ `match_skills()` (structured runtime)
- Prefer narrow fixes over broad rewrites — document evidence first in `VALIDATION.md`
- Ship incrementally: commit + push after each phase

---

## Phase 1: Core Features ✅ Complete

**Goal**: 4 features ครบ และ app เปิดได้

| Feature | Status |
|---------|--------|
| Validate (lint + validate + auto-fix + watch) | ✅ |
| Matcher (6 categories, OR-match, priority sort) | ✅ |
| Coverage (phases, OWASP, tools, MITRE, CWE, PTES) | ✅ |
| LLM Dry-Run (5 providers, dynamic model list) | ✅ |

---

## Phase 2: UX & Bilingual Polish ✅ Complete

**Goal**: Light theme, EN/TH UI, example scenarios, page subtitles

| Item | Status |
|------|--------|
| Nubo-style light theme + dark toggle | ✅ |
| Topbar + sidebar layout | ✅ |
| EN/TH bilingual (labels, validation messages, i18n.js) | ✅ |
| Noto Sans Thai font (Google Fonts, lang selector) | ✅ |
| 50 example scenarios with 13 optgroup categories | ✅ |
| Page subtitles bilingual | ✅ |
| LLM auto-match from scenario (remove manual skill dropdown) | ✅ |

---

## Phase 3: auto_match Accuracy 🔄 In Progress

**Goal**: Skills matched ใน LLM page ตรงกับ scenario จริง ไม่มี false positives

| Item | Status | Notes |
|------|--------|-------|
| Word-boundary matching | ✅ | แทน substring match |
| Technologies-only (ไม่ใช้ services/signals/paths) | ✅ | ป้องกัน http/https false match |
| Min keyword length 5 | ✅ | ป้องกัน php/rce/ad |
| Skill body cap 800 chars | ✅ | ป้องกัน context overflow |
| Real-world validation | ⬜ | บันทึกผลใน `VALIDATION.md` |

Acceptance checks:
- [ ] WordPress scenario → match wordpress/wpscan/cms-framework-cve-chains เท่านั้น
- [ ] AD scenario → match AD-related skills เท่านั้น
- [ ] Cloud scenario → match cloud skills เท่านั้น
- [ ] ไม่มี rce/deserialization/confluence ใน unrelated scenarios

---

## Phase 4: Calibration & Documentation (Current)

**Goal**: ทำให้ next agent เข้าใจโปรเจกต์ได้โดยอ่าน CONTEXT.md อย่างเดียว

| Item | Status |
|------|--------|
| CONTEXT.md | ✅ |
| CURRENT_STATE.md | ✅ |
| TASKS.md | ✅ |
| RUNBOOK.md | ✅ |
| ARCHITECTURE.md | ✅ |
| SIGNALS.md | ✅ |
| VALIDATION.md | ✅ |
| IMPLEMENTATION_PLAN.md | ✅ |
| HANDOFF.md update | ✅ |
| Version sync (v0.1.0 → v0.2.0 ใน UI) | ⬜ |
