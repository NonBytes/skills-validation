# Agent Onboarding & Context Router

⚠️ **LANGUAGE:** ตอบภาษาไทยได้ แต่ชื่อไฟล์/คำสั่ง/code ใช้ภาษาอังกฤษเสมอ

---

## What This Is

Tauri v2 desktop app สำหรับ validate, simulate, และ dry-run test agent skill files (`.md` + YAML frontmatter) ที่ใช้ใน autonomous penetration testing agent framework ออฟไลน์

## Current Status

ฟีเจอร์หลัก 4 อย่างเสร็จสมบูรณ์และใช้งานได้ — Validate, Matcher, Coverage, LLM Dry-Run พร้อม light/dark theme, bilingual EN/TH, และ auto-match skills จาก scenario text

## Before You Start

1. Run: `git status --branch --short`
2. อ่าน docs เพิ่มเติม **เฉพาะเมื่อ task นั้นต้องการ** (ดู routing ด้านล่าง)

## Context Routing (read on demand, not all at once)

| Task involves | Read |
|---------------|------|
| สิ่งที่เสร็จแล้ว / งานที่เปิดอยู่ | `TASKS.md` |
| Build commands / git routine | `RUNBOOK.md` |
| Product state รายละเอียด | `CURRENT_STATE.md` |
| Phase sequencing | `IMPLEMENTATION_PLAN.md` |
| Module boundaries / data flow | `ARCHITECTURE.md` |
| Auto-match logic / scoring heuristics | `SIGNALS.md` |
| Validation / calibration ของ matching | `VALIDATION.md` |
| Recent decisions / handoff | `HANDOFF.md` |

## Build

```sh
npm run build:css      # compile Tailwind (required before dev/build)
cargo tauri dev        # dev mode with hot-reload
cargo tauri build      # production .dmg / .msi / .deb
```

## Definition of Done

After every completed task:
1. Update `HANDOFF.md` + relevant docs
2. Commit (clear semantic message + Co-Authored-By)
3. Push to remote
4. สรุปผลเป็นภาษาไทย
