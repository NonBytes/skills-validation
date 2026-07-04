# Signal Registry — auto_match Heuristics

Last updated: 2026-07-05

## What This Covers

`auto_match()` ใน `src-tauri/src/commands/llm.rs` — logic ที่เลือก skills จาก free-text scenario ก่อนส่งไป LLM

ไม่เกี่ยวกับ `match_skills()` ใน `matcher.rs` ซึ่งใช้ structured `Scenario` input และถูก design มาสำหรับ runtime agent

## Current Rules

| Rule | Detail | Rationale |
|------|--------|-----------|
| **Field scope** | Check เฉพาะ `technologies[]` + skill name; ไม่ check `services`, `paths`, `signals` | `services: [http, https]` มีในเกือบทุก skill → match กับทุก URL ใน scenario |
| **Min keyword length** | ≥ 5 chars; keywords สั้นกว่าถูก skip | `php`(3), `ad`(2), `rce`(3) → false positives กับ "admin", "xmlrpc.php", etc. |
| **Word boundary** | keyword ต้องไม่ติดกับ alphanumeric ทั้งสองด้าน | ป้องกัน `ad` match "admin", `php` match "phpinfo", `rce` match substring |
| **Case** | scenario และ keywords lowercase ก่อน compare | "WordPress" == "wordpress" ✓ |
| **Hyphen variant** | check ทั้ง original และ `replace('-', " ")` | ช่วยให้ `sql-injection` match "sql injection" ใน scenario |
| **Port intersection** | exact `Vec<u16>` intersection กับ port numbers ที่ extract จาก scenario text | ช่วย match network-specific skills (e.g., port 3306 → MySQL skill) |
| **Max results** | top 5 by `priority DESC` | จำกัด token ใน system prompt |

## Known False-Positive Risks

- **Protocol prefix**: "https://" → "https" มี word boundary ก่อน ":" → ถ้าลด min length ต่ำกว่า 5 จะ match skill ที่มี `technologies: ["https"]`; ตอนนี้ป้องกันโดย technologies-only rule (ไม่ใช่ min length เพราะ "https" = 5)
- **Common tech words**: "admin", "login", "shell" ≥5 chars แต่ skill บางตัวอาจมีในรายการ technologies → match ได้โดยไม่ตั้งใจ; ให้ monitor ใน `VALIDATION.md`
- **URL paths**: `/wp-admin` → "admin" มี word boundary หลัง "/" → ถ้ามี skill `technologies: ["admin"]` จะ match; ยังไม่พบใน current skill set
- **Short technology names จาก skills จริง**: `java`(4), `php`(3), `ruby`(4) → ถูก skip ด้วย min length rule ✓

## Calibration Rule

อย่าเปลี่ยน rules จาก intuition — บันทึก observed failure ใน `VALIDATION.md` ก่อน แล้วค่อย narrow-fix

## Possible Future Improvements

- Phase detection จาก scenario text (เช่น "post exploitation" → match phases)
- TF-IDF หรือ keyword density แทน substring match
- User-configurable min keyword length ใน settings
