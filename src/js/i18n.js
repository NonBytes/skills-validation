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
    validate_empty: "Open a skills directory to begin validation.",
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
    validate_empty: "เปิดโฟลเดอร์ skill เพื่อเริ่มตรวจสอบ",
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
  },
};

let _lang = "en";

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
