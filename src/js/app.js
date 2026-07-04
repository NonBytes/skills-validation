document.addEventListener("DOMContentLoaded", async () => {
  await restoreLang();

  initValidatePage();
  initMatcherPage();
  initCoveragePage();
  initLlmPage();

  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
      document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
      item.classList.add("active");
      document.getElementById(`page-${item.dataset.page}`).classList.add("active");
      updateTopbarTitle(item.dataset.page);
    });
  });

  document.getElementById("btn-pick-dir").addEventListener("click", pickDirectory);
  document.getElementById("btn-pick-file").addEventListener("click", pickSingleFile);
  document.getElementById("btn-theme").addEventListener("click", toggleTheme);
  document.getElementById("btn-check-update").addEventListener("click", checkForUpdate);
  document.getElementById("btn-lang-en").addEventListener("click", () => switchLang("en"));
  document.getElementById("btn-lang-th").addEventListener("click", () => switchLang("th"));
  updateLangButtons();

  restoreTheme();
  // Don't restore last directory — always start fresh

  document.addEventListener("keydown", (e) => {
    const mod = e.metaKey || e.ctrlKey;
    if (!mod) return;
    const pages = ["validate", "matcher", "coverage", "llm"];
    if (e.key >= "1" && e.key <= "4") {
      e.preventDefault();
      switchToPage(pages[parseInt(e.key) - 1]);
    } else if (e.key === "o" && !e.shiftKey) {
      e.preventDefault();
      pickDirectory();
    } else if (e.key === "o" && e.shiftKey) {
      e.preventDefault();
      pickSingleFile();
    }
  });
});

function switchToPage(page) {
  document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navItem) navItem.classList.add("active");
  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) pageEl.classList.add("active");
  updateTopbarTitle(page);
}

function updateTopbarTitle(page) {
  const el = document.getElementById("topbar-title");
  if (!el) return;
  const keyMap = { validate: "nav_validate", matcher: "nav_matcher", coverage: "nav_coverage", llm: "nav_llm" };
  const key = keyMap[page] || page;
  el.setAttribute("data-i18n", key);
  el.textContent = t(key);
}

function updateLangButtons() {
  const lang = getLang();
  const en = document.getElementById("btn-lang-en");
  const th = document.getElementById("btn-lang-th");
  if (en) en.style.color = lang === "en" ? "var(--color-accent)" : "";
  if (th) th.style.color = lang === "th" ? "var(--color-accent)" : "";
}

function switchLang(lang) {
  setLang(lang);
  updateLangButtons();
  // Re-render all pages with new language
  initValidatePage();
  initMatcherPage();
  initCoveragePage();
  initLlmPage();
  // Re-load data if already open
  if (currentDirectory) {
    document.dispatchEvent(new CustomEvent("directory-loaded", { detail: currentDirectory }));
  } else if (currentFile) {
    document.dispatchEvent(new CustomEvent("file-loaded", { detail: currentFile }));
  }
}

async function restoreOrAutoDetectDirectory() {
  await restoreLastDirectory();
  if (!currentDirectory) {
    try {
      const defaultDir = await invoke("get_default_skills_dir");
      if (defaultDir) loadDirectoryByPath(defaultDir);
    } catch (_) {}
  }
}
