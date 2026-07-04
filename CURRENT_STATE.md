# Current State

Last updated: 2026-07-05

## Repository State

- Branch: `main`
- Latest local commit: `4515336` Fix auto_match: check only technologies, not services/paths/signals
- Working tree: clean
- Remote: `https://github.com/NonBytes/skills-validation` (private), synced
- Known environment issues: `skills/` directory is `.gitignore`d — local only, ไม่ได้ push ขึ้น repo

## Product State

- **What the project is**: Offline desktop tool สำหรับ validate/test skill `.md` files ที่ใช้ใน penetration testing AI agent
- **Main user workflow**: Open skills directory → validate frontmatter → simulate trigger matching → inspect coverage gaps → dry-run LLM with matched skill context
- **Main completed capabilities**:
  - Frontmatter lint + validate (schema, phases, triggers, body) + auto-fix + watch mode
  - Trigger matching simulator (6 categories + phase, OR-match, priority sort)
  - Coverage matrix (9 phases, 87 tools, OWASP Top 10, MITRE ATT&CK, CWE Top 25, PTES)
  - LLM dry-run (5 providers, auto-match skills from scenario text, 50 example scenarios w/ optgroups)
  - Light/dark theme, EN/TH bilingual (Noto Sans Thai), topbar + sidebar layout

## Most Important Invariants

- **auto_match** ใช้ word-boundary + technologies-only (ไม่ใช้ services/paths/signals) เพื่อหลีกเลี่ยง false positives จาก `http`/`https` ที่มีอยู่ใน skill เกือบทุกตัว
- **skill body** ถูก cap ที่ 800 chars ต่อ skill ก่อน inject เข้า LLM system prompt เพื่อป้องกัน context overflow
- `output.css` อยู่ใน `.gitignore` — ต้อง run `npm run build:css` ก่อนใช้งานเสมอ
- Tauri CSP = null (disabled) → Google Fonts และ external requests ทำงานได้

## Open Work

1. ทดสอบ auto_match กับ skills directory จริงหลัง word-boundary + technologies-only fix
2. อาจต้องการ SIGNALS.md calibration เพิ่มเติมถ้า match ยังไม่แม่นยำ
3. Versioning: app แสดง v0.1.0 ในบาง UI area — sync กับ `Cargo.toml` (v0.2.0)

## Suggested Next Task

ทดสอบ auto_match กับ scenarios หลายประเภท (web, AD, cloud) แล้วบันทึกผลใน `VALIDATION.md` เพื่อยืนยันว่า false positives หายไปจริง

## Files To Read Next

- `TASKS.md` — checklist งานที่ทำแล้วและที่เปิดอยู่
- `RUNBOOK.md` — build/test/git commands
- `SIGNALS.md` — เมื่อแก้ auto_match heuristics
- `VALIDATION.md` — เมื่อ validate matching behavior
- `ARCHITECTURE.md` — เมื่อแตะ module boundaries หรือ data flow
- `HANDOFF.md` — เมื่อต้องการ decisions และ implementation history
