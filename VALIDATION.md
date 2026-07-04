# Validation Notes

Last updated: 2026-07-05

## Expected Behavior Checklist

- [ ] WordPress scenario → match `wordpress`, `wpscan`, `cms-framework-cve-chains`; ไม่ match `rce`, `confluence`, `deserialization`
- [ ] Active Directory scenario → match `active-directory-*`, `bloodhound`, `kerberoasting`; ไม่ match unrelated web skills
- [ ] AWS/Cloud scenario → match `cloud`, `aws-*`; ไม่ match AD skills
- [ ] SQL injection scenario → match `sql-injection`; ไม่ match network-only skills
- [ ] Scenario ที่ไม่มีคำ match → "No skills matched" แสดงถูกต้อง ไม่ fallback แบบผิดๆ
- [ ] Scenario ที่มี port 3306 → match MySQL skill ผ่าน port intersection
- [ ] Noto Sans Thai font โหลดถูกต้องเมื่อสลับไป TH (ต้องมี internet)

## Real Validation Log

| Date | Scenario | Expected skills | Actual skills | Correct? | Notes |
|------|----------|----------------|---------------|----------|-------|
| 2026-07-04 | WordPress site, admin enum, xmlrpc.php | wordpress, wpscan, cms-framework-cve-chains | rce, authentication-cheap-alternatives, cms-framework-cve-chains, confluence, deserialization | ❌ | services (http/https) matching ทุก URL — fixed by technologies-only rule |
| 2026-07-04 | WordPress site (หลัง fix ครั้งแรก) | wordpress, wpscan | rce, authentication-cheap-alternatives, cms-framework-cve-chains, confluence, deserialization | ❌ | word-boundary สั้นเกินไป (min 3) + ยัง check services — fixed by min=5 + technologies-only |
| 2026-07-05 | (pending) WordPress scenario หลัง fix สุดท้าย | wordpress, cms-framework-cve-chains | ? | ? | ต้อง rebuild และทดสอบ |

## Calibration / Change Log

| Date | Change | Evidence | Files changed | Result |
|------|--------|----------|---------------|--------|
| 2026-07-04 | Initial: scenario text เป็น single token ส่งให้ `match_skills()` | match ทุกอย่างที่มี keyword ใน scenario text | `commands/llm.rs` | Overmatch มาก |
| 2026-07-04 | Word-boundary check + min length 3 | ลด false positives แต่ "https" (5 chars via URL) ยัง match services | `commands/llm.rs` | ยังผิดอยู่ |
| 2026-07-05 | **Min length 5 + technologies-only** (ไม่ check services/paths/signals) | `services: [http, https]` อยู่ใน skill เกือบทุกตัว, "https" = 5 chars = พอดี min threshold → false match ทุก URL scenario | `commands/llm.rs` | รอ verify |

## Before Changing auto_match Behavior

- [ ] บันทึก observed failure ใน Real Validation Log ด้านบน
- [ ] ระบุ root cause ที่แท้จริง (keyword ใดที่ match ผิด, ทำไม)
- [ ] อ่าน `SIGNALS.md` ก่อนเปลี่ยน rules
- [ ] Prefer narrow fix — อย่าเปลี่ยน algorithm ใหม่ทั้งหมดถ้าแค่ adjust threshold ได้
