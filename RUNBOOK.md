# Runbook

Last updated: 2026-07-05

## Read Order For A New Session

1. `CONTEXT.md` (entry point — อ่านเสมอ)
2. `CURRENT_STATE.md` + `TASKS.md` + `RUNBOOK.md`
3. `git status --branch --short`
4. Task-specific docs:
   - `IMPLEMENTATION_PLAN.md` — phase sequencing / acceptance criteria
   - `ARCHITECTURE.md` — module boundaries / data flow changes
   - `SIGNALS.md` — auto_match heuristics / scoring changes
   - `VALIDATION.md` — real behavior validation / calibration
   - `HANDOFF.md` latest sections — decisions / history

## Build / Test

```sh
# Install Node deps (first time only)
npm install

# Compile Tailwind CSS (required before dev or build)
npm run build:css

# Dev mode (hot-reload Rust + Tailwind watch)
npm run dev:css &   # watch CSS in background
cargo tauri dev     # launch app

# Production build
cargo tauri build   # output: src-tauri/target/release/bundle/

# Rust tests (unit tests in lib.rs)
cd src-tauri
cargo test

# Type check only (no app launch, fast)
cd src-tauri
cargo check
```

## Git Routine

```sh
git status --branch --short
git diff --stat
git add <specific files>   # ไม่ใช้ git add -A / git add . (หลีกเลี่ยง commit output.css)
git commit -m "$(cat <<'EOF'
<short description>

<detail if needed>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
git push
```

## Files That Must NOT Be Committed

- `src/styles/output.css` — Tailwind build output, อยู่ใน `.gitignore`
- `skills/` directory — skill files เป็น local only
- `.env` / API keys

## Known Issues

- **Noto Sans Thai** requires internet; ถ้า offline ให้ expect font fallback เป็น system-ui
- **output.css gitignored** — ถ้า app ไม่มี styles ให้ run `npm run build:css` ก่อน
- **auto_match** match เฉพาะ technologies + skill name (≥5 chars) ไม่ใช่ services/signals/paths — intentional (ดู `SIGNALS.md`)

## Debug Searches

```sh
# หา Tauri command ที่ invoke จาก frontend
rg -n "invoke(" src/js/

# หา skill field ที่ใช้ใน Rust
rg -n "frontmatter\." src-tauri/src/

# หา i18n key ที่ยังไม่มี translation
rg -n "t('" src/js/ | grep -v i18n.js

# ดู skill ที่ match scenario ด้วย auto_match (debug)
rg -n "word_in_text\|skill_matches" src-tauri/src/commands/llm.rs
```

## When To Update Which Doc

| Doc | Update when |
|-----|-------------|
| `CURRENT_STATE.md` | Status หรือ next task เปลี่ยน |
| `TASKS.md` | Checklist เปลี่ยน (tick done, add open) |
| `HANDOFF.md` | งานเสร็จหรือมี decision ใหม่ |
| `ARCHITECTURE.md` | เพิ่ม/ลบ module หรือแก้ data flow |
| `SIGNALS.md` | แก้ auto_match rules, min length, field exclusions |
| `VALIDATION.md` | บันทึกผล test จริง / calibration |
| `RUNBOOK.md` | Commands หรือ routine เปลี่ยน |
