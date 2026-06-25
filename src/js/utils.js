const { invoke } = window.__TAURI__.core;
const { open } = window.__TAURI__.dialog;
const { listen } = window.__TAURI__.event;

let currentDirectory = null;
let currentFile = null;

async function saveSetting(key, value) {
  try { await invoke("save_setting", { key, value }); } catch (_) {}
}

async function loadSetting(key) {
  try { return await invoke("load_setting", { key }); } catch (_) { return null; }
}

async function pickDirectory() {
  const selected = await open({ directory: true, multiple: false, title: "Select Skills Directory" });
  if (selected) {
    currentDirectory = selected;
    currentFile = null;
    document.getElementById("current-dir").textContent = selected.split("/").slice(-2).join("/");
    saveSetting("last_directory", selected);
    document.dispatchEvent(new CustomEvent("directory-loaded", { detail: selected }));
    startWatching(selected);
  }
  return selected;
}

async function pickSingleFile() {
  const selected = await open({
    directory: false,
    multiple: false,
    title: "Select Skill File",
    filters: [{ name: "Markdown", extensions: ["md"] }],
  });
  if (selected) {
    currentFile = selected;
    currentDirectory = null;
    stopWatching();
    const fileName = selected.split("/").pop();
    document.getElementById("current-dir").textContent = fileName;
    document.dispatchEvent(new CustomEvent("file-loaded", { detail: selected }));
  }
  return selected;
}

async function loadDirectoryByPath(dir) {
  currentDirectory = dir;
  document.getElementById("current-dir").textContent = dir.split("/").slice(-2).join("/");
  saveSetting("last_directory", dir);
  document.dispatchEvent(new CustomEvent("directory-loaded", { detail: dir }));
  startWatching(dir);
}

async function restoreLastDirectory() {
  const dir = await loadSetting("last_directory");
  if (dir) {
    loadDirectoryByPath(dir);
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "light" ? "dark" : "light";
  applyTheme(next);
  saveSetting("theme", next);
}

function applyTheme(theme) {
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  const moon = document.getElementById("icon-moon");
  const sun = document.getElementById("icon-sun");
  if (moon && sun) {
    moon.style.display = theme === "light" ? "none" : "";
    sun.style.display = theme === "light" ? "" : "none";
  }
}

async function restoreTheme() {
  const theme = await loadSetting("theme");
  if (theme) applyTheme(theme);
}

async function checkForUpdate() {
  const btn = document.getElementById("btn-check-update");
  btn.disabled = true;
  btn.textContent = "Checking...";
  try {
    const result = await invoke("check_for_update");
    if (result.has_update) {
      btn.textContent = `Update: v${result.latest}`;
      btn.style.color = "var(--color-accent)";
    } else {
      btn.textContent = "Up to date";
      btn.style.color = "var(--color-pass)";
      setTimeout(() => {
        btn.textContent = "Check Update";
        btn.style.color = "";
        btn.disabled = false;
      }, 3000);
    }
  } catch (err) {
    btn.textContent = "Check Update";
    btn.disabled = false;
  }
}

let watchEnabled = false;

async function startWatching(dir) {
  try {
    await invoke("watch_directory", { directory: dir });
    watchEnabled = true;
    updateWatchIndicator();
  } catch (_) {}
}

async function stopWatching() {
  try {
    await invoke("stop_watching");
    watchEnabled = false;
    updateWatchIndicator();
  } catch (_) {}
}

function updateWatchIndicator() {
  const el = document.getElementById("watch-indicator");
  if (el) {
    el.style.display = watchEnabled ? "" : "none";
  }
}

let watchDebounce = null;
listen("skills-changed", () => {
  if (!currentDirectory) return;
  clearTimeout(watchDebounce);
  watchDebounce = setTimeout(() => {
    document.dispatchEvent(new CustomEvent("directory-loaded", { detail: currentDirectory }));
  }, 500);
});

function createTagInput(container, placeholder) {
  const tags = [];
  const wrapper = document.createElement("div");
  wrapper.className = "tag-input-container";

  const input = document.createElement("input");
  input.className = "tag-input";
  input.placeholder = placeholder || "Type and press Enter...";
  wrapper.appendChild(input);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && input.value.trim()) {
      e.preventDefault();
      const val = input.value.trim();
      if (!tags.includes(val)) {
        tags.push(val);
        renderTags();
      }
      input.value = "";
    } else if (e.key === "Backspace" && !input.value && tags.length) {
      tags.pop();
      renderTags();
    }
  });

  function renderTags() {
    wrapper.querySelectorAll(".tag").forEach((t) => t.remove());
    tags.forEach((tag, i) => {
      const el = document.createElement("span");
      el.className = "tag";
      el.innerHTML = `${escapeHtml(tag)}<span class="tag-remove" data-idx="${i}">&times;</span>`;
      wrapper.insertBefore(el, input);
    });
  }

  wrapper.addEventListener("click", (e) => {
    if (e.target.classList.contains("tag-remove")) {
      tags.splice(parseInt(e.target.dataset.idx), 1);
      renderTags();
    }
    input.focus();
  });

  container.appendChild(wrapper);
  return { getTags: () => [...tags], clear: () => { tags.length = 0; renderTags(); } };
}
