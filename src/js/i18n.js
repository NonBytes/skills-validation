const TRANSLATIONS = {
  en: {
    // Sidebar nav
    nav_validate: "Validate",
    nav_matcher: "Matcher",
    nav_coverage: "Coverage",
    nav_llm: "LLM Dry-Run",
    // Sidebar footer
    no_dir: "No directory loaded",
    btn_open_dir: "Open Dir",
    btn_open_file: "Open File",
    btn_check_update: "Check Update",
    // Common
    btn_export: "Export",
    btn_fix: "Fix",
    btn_fix_all: "Fix All",
    btn_cancel: "Cancel",
    btn_apply: "Apply Fix",
    btn_apply_all: "Apply All",
    btn_close: "Close",
    status_pass: "pass",
    status_fail: "fail",
    status_warn: "warn",
    status_error: "error",
    status_fixed: "fixed",
    filter_all: "All",
    filter_pass: "Pass",
    filter_fail: "Fail",
    filter_warn: "Warn",
    col_name: "Name",
    col_status: "Status",
    col_path: "Path",
    col_issues: "Issues",
    col_remediation: "Remediation",
    search_placeholder: "Search name or path…",
    // Validate page
    validate_title: "Frontmatter Lint & Validate",
    validate_subtitle: "Parse and lint skill frontmatter to catch schema errors, missing fields, and invalid phases before deployment.",
    matcher_subtitle: "Simulate trigger matching to see exactly which skills fire — and why — for any target scenario.",
    coverage_subtitle: "Visual map of gaps across kill-chain phases, agent tools, OWASP Top 10, MITRE ATT&CK, and CWE Top 25.",
    llm_subtitle: "Send a scenario to a local or cloud LLM with auto-matched skill context, then rate the quality of its response.",
    validate_empty: "Open a skills directory to begin validation.",
    validate_empty_hint: "Use the workspace controls in the sidebar to load a skill directory or a single skill file.",
    validate_loading: "Validating skills...",
    validate_single_loading: "Validating skill file...",
    validate_total: "Total",
    validate_skills_section: "Skills",
    validate_refs_section: "Reference Files",
    validate_excluded: "(excluded)",
    validate_auto_fixable: "auto-fixable",
    validate_preview_title: "Preview",
    validate_preview_hint: "The following changes will be applied:",
    validate_fix_preview_all: "Preview: Fix All",
    validate_nothing_to_fix: "Nothing to fix",
    validate_fixed: "Fixed",
    validate_no_fix_needed: "No fix needed",
    validate_text_view: "Text",
    validate_rendered_view: "Rendered",
    validate_load_err_yaml_hint: 'Quote description values containing ": " — e.g. description: "text: more text"',
    // Remediation hints for ref files
    ref_rem_orphan: "Add [link](references/{file}) in the parent SKILL.md",
    ref_rem_short: "Expand content to at least 100 words",
    ref_rem_no_heading: "Add at least one # Heading to structure the document",
    ref_rem_broken: "Fix or remove the link to: {path}",
    ref_rem_empty: "Add content to this reference file or delete it",
    // Matcher page
    matcher_title: "Trigger Matching Simulator",
    matcher_empty: "Open a skills directory first.",
    matcher_run: "Run Match",
    matcher_no_results: "No skills matched this scenario.",
    matcher_results: "matched skills",
    matcher_too_broad: "Too broad — consider adding more specific triggers.",
    matcher_technologies: "Technologies",
    matcher_services: "Services",
    matcher_ports: "Ports",
    matcher_paths: "Paths",
    matcher_signals: "Signals",
    matcher_phase: "Phase",
    matcher_phase_any: "Any phase",
    matcher_fired: "Fired",
    matcher_priority: "Priority",
    // Coverage page
    coverage_title: "Coverage Matrix",
    coverage_empty: "Open a skills directory first.",
    coverage_empty_hint: "Coverage needs the full directory so it can compare phases, tools, OWASP, MITRE, CWE, and PTES.",
    coverage_loading: "Computing coverage...",
    // LLM page
    llm_title: "LLM Dry-Run",
    llm_provider: "Provider",
    llm_model: "Model",
    llm_skill: "Skill",
    llm_scenario: "Scenario",
    llm_send: "Send",
    llm_cancel: "Cancel",
    llm_language: "Response Language",
    llm_lang_en: "English",
    llm_lang_th: "Thai",
    llm_good: "Good",
    llm_bad: "Bad",
    llm_unclear: "Unclear",
    llm_empty_skills: "Load a directory first.",
    llm_load_models: "Loading models...",
    llm_example_load: "Load example scenario…",
  },
  th: {
    // Sidebar nav
    nav_validate: "ตรวจสอบ",
    nav_matcher: "จับคู่",
    nav_coverage: "ความครอบคลุม",
    nav_llm: "ทดสอบ LLM",
    // Sidebar footer
    no_dir: "ยังไม่ได้เลือกโฟลเดอร์",
    btn_open_dir: "เปิดโฟลเดอร์",
    btn_open_file: "เปิดไฟล์",
    btn_check_update: "ตรวจสอบอัปเดต",
    // Common
    btn_export: "ส่งออก",
    btn_fix: "แก้ไข",
    btn_fix_all: "แก้ทั้งหมด",
    btn_cancel: "ยกเลิก",
    btn_apply: "ยืนยันแก้ไข",
    btn_apply_all: "ยืนยันทั้งหมด",
    btn_close: "ปิด",
    status_pass: "ผ่าน",
    status_fail: "ล้มเหลว",
    status_warn: "เตือน",
    status_error: "ข้อผิดพลาด",
    status_fixed: "แก้แล้ว",
    filter_all: "ทั้งหมด",
    filter_pass: "ผ่าน",
    filter_fail: "ล้มเหลว",
    filter_warn: "เตือน",
    col_name: "ชื่อ",
    col_status: "สถานะ",
    col_path: "พาธ",
    col_issues: "ปัญหา",
    col_remediation: "วิธีแก้ไข",
    search_placeholder: "ค้นหาชื่อหรือพาธ…",
    // Validate page
    validate_title: "ตรวจสอบ Frontmatter",
    validate_subtitle: "Parse และ lint frontmatter ของ skill เพื่อตรวจหา schema errors, field ที่หายไป และ phase ที่ไม่ถูกต้องก่อน deploy",
    matcher_subtitle: "จำลองการ match trigger เพื่อดูว่า skill ใดถูกเรียกใช้ และเพราะอะไร สำหรับ scenario เป้าหมายใดๆ",
    coverage_subtitle: "แผนผังช่องว่างของ kill-chain phase, agent tool, OWASP Top 10, MITRE ATT&CK และ CWE Top 25",
    llm_subtitle: "ส่ง scenario ไปยัง LLM พร้อม skill context ที่ match อัตโนมัติ แล้วประเมินคุณภาพของคำตอบที่ได้รับ",
    validate_empty: "เปิดโฟลเดอร์ skill เพื่อเริ่มตรวจสอบ",
    validate_empty_hint: "ใช้ปุ่มใน Workspace ด้านซ้ายเพื่อโหลดโฟลเดอร์ skill หรือไฟล์ skill เดี่ยว",
    validate_loading: "กำลังตรวจสอบ...",
    validate_single_loading: "กำลังตรวจสอบไฟล์...",
    validate_total: "รวม",
    validate_skills_section: "Skills",
    validate_refs_section: "ไฟล์อ้างอิง",
    validate_excluded: "(ยกเว้น)",
    validate_auto_fixable: "แก้อัตโนมัติได้",
    validate_preview_title: "ดูตัวอย่าง",
    validate_preview_hint: "การเปลี่ยนแปลงที่จะเกิดขึ้น:",
    validate_fix_preview_all: "ดูตัวอย่าง: แก้ทั้งหมด",
    validate_nothing_to_fix: "ไม่มีอะไรต้องแก้",
    validate_fixed: "แก้แล้ว",
    validate_no_fix_needed: "ไม่จำเป็นต้องแก้",
    validate_text_view: "ข้อความ",
    validate_rendered_view: "แสดงผล",
    validate_load_err_yaml_hint: 'ใส่เครื่องหมายอัญประกาศรอบค่า description ที่มี ": " เช่น description: "ข้อความ: เพิ่มเติม"',
    // Remediation hints for ref files
    ref_rem_orphan: "เพิ่ม [link](references/{file}) ใน SKILL.md ของโฟลเดอร์แม่",
    ref_rem_short: "เพิ่มเนื้อหาให้มากกว่า 100 คำ",
    ref_rem_no_heading: "เพิ่ม # หัวข้อ อย่างน้อยหนึ่งหัวข้อ",
    ref_rem_broken: "แก้ไขหรือลบลิงก์ไปยัง: {path}",
    ref_rem_empty: "เพิ่มเนื้อหาในไฟล์นี้ หรือลบออก",
    // Matcher page
    matcher_title: "จำลองการจับคู่ Trigger",
    matcher_empty: "เปิดโฟลเดอร์ skill ก่อน",
    matcher_run: "จับคู่",
    matcher_no_results: "ไม่มี skill ที่ตรงกับเงื่อนไขนี้",
    matcher_results: "skills ที่ตรงกัน",
    matcher_too_broad: "กว้างเกินไป — ลองเพิ่ม trigger ที่เจาะจงกว่านี้",
    matcher_technologies: "เทคโนโลยี",
    matcher_services: "บริการ",
    matcher_ports: "พอร์ต",
    matcher_paths: "พาธ",
    matcher_signals: "สัญญาณ",
    matcher_phase: "เฟส",
    matcher_phase_any: "ทุกเฟส",
    matcher_fired: "ตรงกับ",
    matcher_priority: "ลำดับความสำคัญ",
    // Coverage page
    coverage_title: "ตาราง Coverage",
    coverage_empty: "เปิดโฟลเดอร์ skill ก่อน",
    coverage_empty_hint: "Coverage ต้องใช้ทั้งโฟลเดอร์เพื่อเทียบ phase, tools, OWASP, MITRE, CWE และ PTES",
    coverage_loading: "กำลังคำนวณ...",
    // LLM page
    llm_title: "ทดสอบ LLM",
    llm_provider: "ผู้ให้บริการ",
    llm_model: "โมเดล",
    llm_skill: "Skill",
    llm_scenario: "สถานการณ์",
    llm_send: "ส่ง",
    llm_cancel: "ยกเลิก",
    llm_language: "ภาษาที่ตอบกลับ",
    llm_lang_en: "อังกฤษ",
    llm_lang_th: "ไทย",
    llm_good: "ดี",
    llm_bad: "ไม่ดี",
    llm_unclear: "ไม่ชัดเจน",
    llm_empty_skills: "โหลดโฟลเดอร์ก่อน",
    llm_load_models: "กำลังโหลดโมเดล...",
    llm_example_load: "โหลด scenario ตัวอย่าง…",
  },
};

let _lang = "en";

// Maps Rust-generated English issue/suggestion strings to current language
const ISSUE_MAP_TH = [
  [/^Missing or empty 'name'/,         "ไม่มีหรือว่างเปล่า 'name'"],
  [/^Missing or empty 'description'/,  "ไม่มีหรือว่างเปล่า 'description'"],
  [/^Description is very short \((\d+) chars\)/, (m) => `คำอธิบายสั้นเกินไป (${m[1]} ตัวอักษร) — LLM matching อาจไม่แม่นยำ`],
  [/^Empty body/,                       "เนื้อหาว่างเปล่า (ไม่มีข้อความหลัง frontmatter)"],
  [/^Body is very short \((\d+) words\)/, (m) => `เนื้อหาสั้นเกินไป (${m[1]} คำ) — ควรเพิ่มคำแนะนำมากกว่านี้`],
  [/^Priority (\d+) out of range/,     (m) => `Priority ${m[1]} ไม่อยู่ในช่วง 1-10 จะถูก coerce เป็น 5`],
  [/^No trigger categories populated/, "ไม่มี trigger category ใดถูกระบุไว้"],
  [/^Invalid phase: '(.+)'/,           (m) => `Phase ไม่ถูกต้อง: '${m[1]}'`],
  [/^In excluded category/,            "อยู่ใน excluded category (โหลดโดย framework อัตโนมัติ)"],
  [/^Duplicate name '(.+)'/,           (m) => `ชื่อซ้ำกัน '${m[1]}' — framework ใช้ name เป็น unique ID`],
];

const SUGGESTION_MAP_TH = [
  [/^Add name:/,                        'เพิ่ม name: "ชื่อ-skill" ใน frontmatter'],
  [/^Add description:/,                 'เพิ่ม description: "อธิบาย skill นี้" ใน frontmatter'],
  [/^Expand description to at least/,   "ขยายคำอธิบายให้มีอย่างน้อย 20 ตัวอักษร เพื่อให้ matching แม่นยำขึ้น"],
  [/^Add tactical guidance/,            "เพิ่มเนื้อหาคำแนะนำใน markdown หลัง delimiter ---"],
  [/^Aim for at least 50 words/,        "ควรมีเนื้อหาอย่างน้อย 50 คำ เพื่อให้ AI มี context เพียงพอ"],
  [/^Set priority to a value/,          "ตั้ง priority ระหว่าง 1 (ต่ำสุด) ถึง 10 (สูงสุด) หรือกด Fix เพื่อแก้อัตโนมัติ"],
  [/^Add at least one of: technologies/, "เพิ่มอย่างน้อยหนึ่งใน: technologies, services, ports, paths, signals, หรือ phases"],
  [/^Use one of:/,                       "ใช้ค่าที่ถูกต้องสำหรับ phases หรือกด Fix เพื่อแก้อัตโนมัติ"],
  [/^This is expected for scan_modes/,  "ปกติสำหรับ scan_modes/ และ coordination/ ไม่จำเป็นต้องแก้ไข"],
  [/^Rename this skill/,                "เปลี่ยนชื่อ skill นี้ให้เป็น slug ที่ไม่ซ้ำกัน"],
];

function translateRustMsg(str, map) {
  if (_lang === "en") return str;
  for (const [pattern, replacement] of map) {
    const m = str.match(pattern);
    if (m) return typeof replacement === "function" ? replacement(m) : replacement;
  }
  return str;
}

const REF_ISSUE_MAP_TH = [
  [/^Orphan:/,                                "ไฟล์กำพร้า: ไม่มีลิงก์จาก SKILL.md ของโฟลเดอร์แม่"],
  [/^Very short content \((\d+) words\)/,     (m) => `เนื้อหาสั้นเกินไป (${m[1]} คำ)`],
  [/^No markdown headings/,                   "ไม่มี # หัวข้อ"],
  [/^Broken link: (.+)/,                      (m) => `ลิงก์เสีย: ${m[1]}`],
  [/^Empty file/,                             "ไฟล์ว่างเปล่า"],
];

function translateIssue(msg) { return translateRustMsg(msg, ISSUE_MAP_TH); }
function translateSuggestion(msg) { return translateRustMsg(msg, SUGGESTION_MAP_TH); }
function translateRefIssue(msg) { return translateRustMsg(msg, REF_ISSUE_MAP_TH); }

function t(key, vars = {}) {
  const dict = TRANSLATIONS[_lang] || TRANSLATIONS.en;
  let str = dict[key] || TRANSLATIONS.en[key] || key;
  Object.entries(vars).forEach(([k, v]) => {
    str = str.replace(`{${k}}`, v);
  });
  return str;
}

function getLang() { return _lang; }

function setLang(lang) {
  _lang = TRANSLATIONS[lang] ? lang : "en";
  document.documentElement.lang = _lang;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (el.tagName === "INPUT") {
      el.placeholder = t(key);
    } else {
      el.textContent = t(key);
    }
  });
  saveSetting("lang", _lang);
}

async function restoreLang() {
  const saved = await loadSetting("lang");
  if (saved && TRANSLATIONS[saved]) {
    _lang = saved;
    document.documentElement.lang = _lang;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      if (el.tagName === "INPUT") {
        el.placeholder = t(key);
      } else {
        el.textContent = t(key);
      }
    });
  }
}
