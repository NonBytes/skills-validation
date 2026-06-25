document.addEventListener("DOMContentLoaded", () => {
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
    });
  });

  document.getElementById("btn-pick-dir").addEventListener("click", pickDirectory);
  document.getElementById("btn-pick-file").addEventListener("click", pickSingleFile);
  document.getElementById("btn-theme").addEventListener("click", toggleTheme);
  document.getElementById("btn-check-update").addEventListener("click", checkForUpdate);

  restoreTheme();
  restoreOrAutoDetectDirectory();

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
