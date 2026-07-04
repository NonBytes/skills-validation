# Project Task List

Last updated: 2026-07-05

## Current Status

4 features เสร็จสมบูรณ์ + UX polish เสร็จ — อยู่ในขั้น calibration และ validation

---

## Done

- [x] **Feature 1: Validate** — parse YAML frontmatter, validate schema, summary bar, filterable table, single-file mode
- [x] **Feature 2: Matcher** — tag inputs, 6 trigger categories + phase dropdown, OR-match, priority sort
- [x] **Feature 3: Coverage** — phase bars, OWASP Top 10, 87 agent tools, MITRE ATT&CK, CWE Top 25, PTES
- [x] **Feature 4: LLM Dry-Run** — 5 providers (Ollama, LM Studio, AnythingLLM, OpenAI, Anthropic), dynamic model loading
- [x] Auto-fix with preview modal (edit-distance phase correction + priority coercion)
- [x] Watch mode (notify crate, green dot indicator)
- [x] Keyboard shortcuts (Cmd+1-4, Cmd+O, Cmd+Shift+O)
- [x] Skill file viewer modal (Text/Rendered toggle)
- [x] Export validation report (JSON)
- [x] Light/dark theme toggle (persists via tauri-plugin-store)
- [x] Bilingual UI EN/TH — labels, validation messages, suggestions, phase names
- [x] Noto Sans Thai font (Google Fonts CDN, `[lang="th"]` selector)
- [x] Retheme to Nubo-style light UI (white sidebar, topbar, cards with shadow)
- [x] Page subtitles (bilingual) บน 4 หน้าหลัก
- [x] Remove skill dropdown from LLM page → auto-match from scenario text
- [x] 50 example scenarios with `<optgroup>` categories (13 categories)
- [x] auto_match: word-boundary check (not substring), technologies-only, min keyword length 5
- [x] Skill body cap 800 chars ก่อน inject เข้า system prompt
- [x] Ollama "No response" fallback parser (body["response"] + debug excerpt)
- [x] Fix Rust warning: redundant `u16` upper-bound check

## Open Tasks

- [ ] **Validate auto_match accuracy** — run ≥5 scenario types (WordPress, AD, cloud, API, SQLi) และบันทึกผลใน `VALIDATION.md`
- [ ] **Version sync** — sidebar แสดง v0.1.0, Cargo.toml เป็น v0.2.0; align ให้ตรงกัน
- [ ] **MITRE/CWE/PTES coverage** — ตรวจสอบว่า mapping ใน `constants.rs` ครบถ้วนและ up-to-date

## Intentionally Skipped / Deferred

- [ ] **Offline font bundling** — Noto Sans Thai โหลดจาก Google Fonts CDN ต้องมี internet; พิจารณา self-host ถ้า offline use case เป็น requirement จริง
- [ ] **Rate limiting / retry** — LLM API call ไม่มี retry logic; ยังไม่จำเป็นสำหรับ dry-run tool
- [ ] **Phase-based auto_match** — detect phases จาก scenario text (เช่น "post exploitation" → `phases: post_exploitation`); complex, deferred

## Done Criteria For Future Tasks

- [ ] Code/docs implemented
- [ ] `cargo check` clean (no warnings, no errors)
- [ ] Feature ทดสอบใน app จริง (cargo tauri dev) ไม่ใช่แค่ type check
- [ ] `HANDOFF.md` + relevant companion docs updated
- [ ] Commit created with clear semantic message + Co-Authored-By
- [ ] Push completed
