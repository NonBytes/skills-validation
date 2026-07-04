function initValidatePage() {
  const page = document.getElementById("page-validate");
  page.innerHTML = `
    <h1 class="page-title">${t('validate_title')}</h1>
    <div id="validate-content">
      <p style="color:var(--color-text-muted)">${t('validate_empty')}</p>
    </div>
  `;

  document.addEventListener("directory-loaded", async (e) => {
    await runValidation(e.detail);
  });

  document.addEventListener("file-loaded", async (e) => {
    await runSingleFileValidation(e.detail);
  });
}

async function runValidation(dir) {
  const container = document.getElementById("validate-content");
  container.innerHTML = `<div style="display:flex;align-items:center;gap:8px;"><span class="spinner"></span> ${t('validate_loading')}</div>`;

  try {
    const result = await invoke("validate_skills", { directory: dir });
    renderValidation(container, result);
  } catch (err) {
    container.innerHTML = `<div class="warning-box warning-orange">${escapeHtml(String(err))}</div>`;
  }
}

async function runSingleFileValidation(filePath) {
  const container = document.getElementById("validate-content");
  container.innerHTML = `<div style="display:flex;align-items:center;gap:8px;"><span class="spinner"></span> ${t('validate_single_loading')}</div>`;

  try {
    const result = await invoke("validate_single_file", { filePath });
    renderValidation(container, result);
  } catch (err) {
    container.innerHTML = `<div class="warning-box warning-orange">${escapeHtml(String(err))}</div>`;
  }
}

let lastValidationData = null;

const FIXABLE_PATTERNS = ["Invalid phase", "Priority", "out of range"];

function isFixable(issue) {
  return FIXABLE_PATTERNS.some(p => issue.message.includes(p));
}

function hasFixableIssues(result) {
  return result.issues.some(i => isFixable(i));
}

function renderValidation(container, data) {
  lastValidationData = data;
  const { total, pass, fail, warn, results, load_errors, ref_results = [] } = data;
  const passPercent = total > 0 ? ((pass / total) * 100).toFixed(0) : 0;
  const fixableCount = results.filter(r => hasFixableIssues(r)).length;

  let html = `
    <div class="summary-bar">
      <span class="summary-stat"><span class="dot dot-total"></span> ${t('validate_total')}: ${total}</span>
      <span class="summary-stat"><span class="dot dot-pass"></span> ${t('filter_pass')}: ${pass}</span>
      <span class="summary-stat"><span class="dot dot-fail"></span> ${t('filter_fail')}: ${fail}</span>
      <span class="summary-stat"><span class="dot dot-warn"></span> ${t('filter_warn')}: ${warn}</span>
      <div style="margin-left:auto;display:flex;gap:6px;">
        <button class="btn btn-sm btn-ghost" id="btn-export">${t('btn_export')}</button>
        ${fixableCount > 0 ? `<button class="btn btn-sm btn-accent-outline" id="btn-fix-all">${t('btn_fix_all')} (${fixableCount})</button>` : ''}
      </div>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width:${passPercent}%;background:linear-gradient(90deg, var(--color-pass) ${passPercent > 0 ? '0%' : ''}, var(--color-pass));"></div>
    </div>
    <div class="filter-bar">
      <button class="filter-btn active" data-filter="all">${t('filter_all')}</button>
      <button class="filter-btn" data-filter="pass">${t('filter_pass')}</button>
      <button class="filter-btn" data-filter="fail">${t('filter_fail')}</button>
      <button class="filter-btn" data-filter="warn">${t('filter_warn')}</button>
      ${load_errors.length > 0 ? `<button class="filter-btn" data-filter="error">${t('status_error')} (${load_errors.length})</button>` : ''}
      <input id="validate-search" type="search" placeholder="${t('search_placeholder')}"
        style="margin-left:auto;padding:4px 10px;border-radius:6px;border:1px solid var(--color-border);background:var(--color-surface);color:var(--color-text);font-size:13px;width:220px;">
    </div>
  `;

  html += `
  <details open style="margin-top:8px;">
    <summary style="cursor:pointer;font-size:13px;font-weight:600;color:var(--color-text-muted);padding:6px 0;user-select:none;">
      ${t('validate_skills_section')} (${results.length})
      <span style="font-weight:400;margin-left:8px;">
        <span style="color:var(--color-pass);">${pass} ${t('filter_pass').toLowerCase()}</span>
        ${fail > 0 ? `· <span style="color:var(--color-fail);">${fail} ${t('filter_fail').toLowerCase()}</span>` : ''}
        ${warn > 0 ? `· <span style="color:var(--color-warn);">${warn} ${t('filter_warn').toLowerCase()}</span>` : ''}
        ${load_errors.length > 0 ? `· <span style="color:var(--color-fail);">${load_errors.length} ${t('status_error')}</span>` : ''}
      </span>
    </summary>
    <table class="results-table" style="margin-top:8px;">
    <thead><tr><th>${t('col_name')}</th><th>${t('col_status')}</th><th>${t('col_path')}</th><th>${t('col_issues')}</th><th>${t('col_remediation')}</th><th></th></tr></thead>
    <tbody id="validate-tbody">`;

  load_errors.forEach(e => {
    const name = e.path.split("/").pop();
    const shortPath = e.path.split("/").slice(-3).join("/");
    html += `<tr data-status="error" data-path="${escapeHtml(e.path)}">
      <td style="font-weight:500;">${escapeHtml(name)}</td>
      <td><span class="status-badge status-fail">error</span></td>
      <td style="font-size:11px;color:var(--color-text-muted);font-family:monospace;">${escapeHtml(shortPath)}</td>
      <td><div class="issue-item issue-error">${escapeHtml(e.error)}</div></td>
      <td><div class="issue-suggestion">${t('validate_load_err_yaml_hint')}</div></td>
      <td></td>
    </tr>`;
  });

  results.forEach(r => {
    const shortPath = r.path.split("/").slice(-3).join("/");
    const fixable = hasFixableIssues(r);
    const issuesHtml = r.issues.map(i => {
      const fixIcon = isFixable(i) ? ` <span style="color:var(--color-accent);font-size:10px;">${t('validate_auto_fixable')}</span>` : '';
      return `<div class="issue-item issue-${i.level}">${escapeHtml(translateIssue(i.message))}${fixIcon}</div>`;
    }).join("");
    const remHtml = r.issues.filter(i => i.suggestion).map(i =>
      `<div class="issue-suggestion">${escapeHtml(translateSuggestion(i.suggestion))}</div>`
    ).join("") || '<span style="color:var(--color-text-muted)">—</span>';

    const fixBtn = fixable
      ? `<button class="btn btn-sm btn-accent-outline btn-fix-single" data-path="${escapeHtml(r.path)}">${t('btn_fix')}</button>`
      : '';

    html += `<tr data-status="${r.status}" data-path="${escapeHtml(r.path)}">
      <td><a href="#" class="skill-link" data-path="${escapeHtml(r.path)}">${escapeHtml(r.name)}</a>${r.excluded ? ` <span style="color:var(--color-text-muted);font-size:11px;">${t('validate_excluded')}</span>` : ''}</td>
      <td><span class="status-badge status-${r.status}">${r.status}</span></td>
      <td style="font-size:11px;color:var(--color-text-muted);font-family:monospace;">${escapeHtml(shortPath)}</td>
      <td>${issuesHtml || '<span style="color:var(--color-pass)">—</span>'}</td>
      <td>${remHtml}</td>
      <td>${fixBtn}</td>
    </tr>`;
  });

  html += `</tbody></table></details>`;

  if (ref_results.length > 0) {
    const refPass = ref_results.filter(r => r.status === "pass").length;
    const refWarn = ref_results.filter(r => r.status === "warn").length;
    const refFail = ref_results.filter(r => r.status === "fail").length;
    html += `
      <details style="margin-top:16px;">
        <summary style="cursor:pointer;font-size:13px;font-weight:600;color:var(--color-text-muted);padding:6px 0;user-select:none;">
          ${t('validate_refs_section')} (${ref_results.length})
          <span style="font-weight:400;margin-left:8px;">
            <span style="color:var(--color-pass);">${refPass} ok</span>
            ${refWarn > 0 ? `· <span style="color:var(--color-warn);">${refWarn} ${t('filter_warn').toLowerCase()}</span>` : ''}
            ${refFail > 0 ? `· <span style="color:var(--color-fail);">${refFail} ${t('filter_fail').toLowerCase()}</span>` : ''}
          </span>
        </summary>
        <table class="results-table" style="margin-top:8px;">
          <thead><tr><th>${t('col_name')}</th><th>${t('col_status')}</th><th>${t('col_path')}</th><th>${t('col_issues')}</th><th>${t('col_remediation')}</th></tr></thead>
          <tbody id="ref-tbody">
            ${ref_results.map(r => {
              const shortPath = r.path.split("/").slice(-4).join("/");
              const issuesHtml = r.issues.map(i =>
                `<div class="issue-item issue-${r.status === "fail" ? "error" : "warn"}">${escapeHtml(translateRefIssue(i))}</div>`
              ).join("") || '<span style="color:var(--color-pass)">—</span>';
              const remHtml = r.issues.map(i => refRemediation(i, r.path)).filter(Boolean).map(s =>
                `<div class="issue-suggestion">${escapeHtml(s)}</div>`
              ).join("") || '<span style="color:var(--color-text-muted)">—</span>';
              return `<tr data-status="${r.status}" data-path="${escapeHtml(r.path)}">
                <td><a href="#" class="skill-link ref-link" data-path="${escapeHtml(r.path)}">${escapeHtml(r.name)}</a></td>
                <td><span class="status-badge status-${r.status}">${r.status}</span></td>
                <td style="font-size:11px;color:var(--color-text-muted);font-family:monospace;">${escapeHtml(shortPath)}</td>
                <td>${issuesHtml}</td>
                <td>${remHtml}</td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </details>`;
  }

  container.innerHTML = html;

  let activeFilter = "all";
  let searchQuery = "";

  function applyFilters() {
    const q = searchQuery.toLowerCase();
    container.querySelectorAll("#validate-tbody tr, #ref-tbody tr").forEach(row => {
      const matchStatus = activeFilter === "all" || row.dataset.status === activeFilter;
      const name = row.querySelector(".skill-link")?.textContent || row.querySelector("td")?.textContent || "";
      const matchSearch = !q || row.dataset.path.toLowerCase().includes(q) || name.toLowerCase().includes(q);
      row.style.display = matchStatus && matchSearch ? "" : "none";
    });
  }

  container.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      applyFilters();
    });
  });

  const searchInput = document.getElementById("validate-search");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      searchQuery = searchInput.value;
      applyFilters();
    });
  }

  container.querySelectorAll(".btn-fix-single").forEach(btn => {
    btn.addEventListener("click", async () => {
      await fixSingleSkill(btn, btn.dataset.path);
    });
  });

  const fixAllBtn = document.getElementById("btn-fix-all");
  if (fixAllBtn) {
    fixAllBtn.addEventListener("click", async () => {
      await fixAllSkills(container, results);
    });
  }

  document.getElementById("btn-export").addEventListener("click", exportReport);

  container.querySelectorAll(".skill-link, .ref-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      openSkillViewer(link.dataset.path);
    });
  });
}

async function fixSingleSkill(btn, filePath) {
  btn.disabled = true;
  btn.textContent = "Checking...";
  try {
    const preview = await invoke("preview_fix", { filePath });
    if (!preview.fixed) {
      btn.textContent = "No fix needed";
      return;
    }
    showPreviewModal(filePath, preview.changes, btn);
  } catch (err) {
    btn.disabled = false;
    btn.textContent = "Fix";
    btn.title = String(err);
  }
}

function showPreviewModal(filePath, changes, triggerBtn) {
  let overlay = document.getElementById("fix-preview-overlay");
  if (overlay) overlay.remove();

  const fileName = filePath.split("/").pop();
  const changesHtml = changes.map(c =>
    `<div class="preview-change">${escapeHtml(c)}</div>`
  ).join("");

  overlay = document.createElement("div");
  overlay.id = "fix-preview-overlay";
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">${t('validate_preview_title')}: ${escapeHtml(fileName)}</div>
      <div class="modal-body">
        <div style="font-size:12px;color:var(--color-text-muted);margin-bottom:8px;">${t('validate_preview_hint')}</div>
        ${changesHtml}
      </div>
      <div class="modal-footer">
        <button class="btn" id="btn-preview-cancel">${t('btn_cancel')}</button>
        <button class="btn btn-sm btn-accent-outline" id="btn-preview-apply">${t('btn_apply')}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById("btn-preview-cancel").addEventListener("click", () => {
    overlay.remove();
    triggerBtn.disabled = false;
    triggerBtn.textContent = "Fix";
  });

  document.getElementById("btn-preview-apply").addEventListener("click", async () => {
    const applyBtn = document.getElementById("btn-preview-apply");
    applyBtn.disabled = true;
    applyBtn.textContent = "Applying...";
    try {
      const result = await invoke("fix_skill", { filePath });
      overlay.remove();
      if (result.fixed) {
        triggerBtn.textContent = "Fixed";
        triggerBtn.classList.add("btn-success");
        const row = triggerBtn.closest("tr");
        if (row) {
          const html = result.changes.map(c =>
            `<div class="issue-item" style="color:var(--color-pass);">${escapeHtml(c)}</div>`
          ).join("");
          const issueCell = row.querySelector("td:nth-child(4)");
          if (issueCell) issueCell.innerHTML = html;
          row.dataset.status = "pass";
          const badge = row.querySelector(".status-badge");
          if (badge) {
            badge.textContent = "fixed";
            badge.className = "status-badge status-pass";
          }
        }
      }
    } catch (err) {
      overlay.remove();
      triggerBtn.disabled = false;
      triggerBtn.textContent = "Error";
      triggerBtn.title = String(err);
    }
  });
}

async function fixAllSkills(container, results) {
  const fixable = results.filter(r => hasFixableIssues(r));
  const btn = document.getElementById("btn-fix-all");

  // Preview all changes first
  const allPreviews = [];
  if (btn) { btn.disabled = true; btn.textContent = "Previewing..."; }

  for (const r of fixable) {
    try {
      const preview = await invoke("preview_fix", { filePath: r.path });
      if (preview.fixed) {
        allPreviews.push({ path: r.path, name: r.name, changes: preview.changes });
      }
    } catch (_) {}
  }

  if (allPreviews.length === 0) {
    if (btn) { btn.textContent = "Nothing to fix"; }
    return;
  }

  showPreviewAllModal(allPreviews, container, btn);
}

function showPreviewAllModal(previews, container, fixAllBtn) {
  let overlay = document.getElementById("fix-preview-overlay");
  if (overlay) overlay.remove();

  const itemsHtml = previews.map(p => `
    <div class="preview-group">
      <div class="preview-skill-name">${escapeHtml(p.name)}</div>
      ${p.changes.map(c => `<div class="preview-change">${escapeHtml(c)}</div>`).join("")}
    </div>
  `).join("");

  overlay = document.createElement("div");
  overlay.id = "fix-preview-overlay";
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">${t('validate_fix_preview_all')} (${previews.length} files)</div>
      <div class="modal-body" style="max-height:400px;overflow-y:auto;">
        ${itemsHtml}
      </div>
      <div class="modal-footer">
        <button class="btn" id="btn-preview-cancel">${t('btn_cancel')}</button>
        <button class="btn btn-sm btn-accent-outline" id="btn-preview-apply-all">${t('btn_apply_all')}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById("btn-preview-cancel").addEventListener("click", () => {
    overlay.remove();
    if (fixAllBtn) { fixAllBtn.disabled = false; fixAllBtn.textContent = `Fix All (${previews.length})`; }
  });

  document.getElementById("btn-preview-apply-all").addEventListener("click", async () => {
    const applyBtn = document.getElementById("btn-preview-apply-all");
    applyBtn.disabled = true;
    applyBtn.textContent = "Applying...";

    let fixed = 0;
    for (const p of previews) {
      try {
        const result = await invoke("fix_skill", { filePath: p.path });
        if (result.fixed) fixed++;
      } catch (_) {}
    }

    overlay.remove();
    if (fixAllBtn) {
      fixAllBtn.textContent = `Fixed ${fixed}/${previews.length}`;
      fixAllBtn.classList.add("btn-success");
    }

    if (currentDirectory) {
      await runValidation(currentDirectory);
    } else if (currentFile) {
      await runSingleFileValidation(currentFile);
    }
  });
}

async function openSkillViewer(filePath) {
  let overlay = document.getElementById("skill-viewer-overlay");
  if (overlay) overlay.remove();

  const fileName = filePath.split("/").pop();

  overlay = document.createElement("div");
  overlay.id = "skill-viewer-overlay";
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-content viewer-modal">
      <div class="modal-header" style="display:flex;align-items:center;">
        <span style="flex:1;">${escapeHtml(fileName)}</span>
        <div class="viewer-toggle">
          <button class="filter-btn active" id="btn-view-text">${t('validate_text_view')}</button>
          <button class="filter-btn" id="btn-view-md">${t('validate_rendered_view')}</button>
        </div>
        <button class="btn btn-sm btn-ghost" id="btn-viewer-close" style="margin-left:8px;">${t('btn_close')}</button>
      </div>
      <div class="modal-body" id="viewer-body" style="padding:0;">
        <div style="display:flex;align-items:center;justify-content:center;padding:40px;"><span class="spinner"></span></div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById("btn-viewer-close").addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });

  let content;
  try {
    content = await invoke("read_skill_file", { filePath });
  } catch (err) {
    document.getElementById("viewer-body").innerHTML =
      `<div class="warning-box warning-orange" style="margin:16px;">${escapeHtml(String(err))}</div>`;
    return;
  }

  const body = document.getElementById("viewer-body");
  showTextView(body, content);

  document.getElementById("btn-view-text").addEventListener("click", () => {
    document.getElementById("btn-view-text").classList.add("active");
    document.getElementById("btn-view-md").classList.remove("active");
    showTextView(body, content);
  });

  document.getElementById("btn-view-md").addEventListener("click", () => {
    document.getElementById("btn-view-md").classList.add("active");
    document.getElementById("btn-view-text").classList.remove("active");
    showMdView(body, content, filePath);
  });
}

function showTextView(container, content) {
  container.innerHTML = `<pre class="viewer-pre">${escapeHtml(content)}</pre>`;
}

function showMdView(container, content, filePath) {
  const rendered = typeof marked !== 'undefined' ? marked.parse(content) : escapeHtml(content);
  container.innerHTML = `<div class="viewer-md">${rendered}</div>`;

  if (!filePath) return;
  const dir = filePath.substring(0, filePath.lastIndexOf("/"));
  container.querySelectorAll("a[href]").forEach(a => {
    const href = a.getAttribute("href");
    if (!href || href.startsWith("http") || href.startsWith("#")) return;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const target = href.startsWith("/") ? href : `${dir}/${href}`;
      openSkillViewer(target);
    });
  });
}

function refRemediation(issue, filePath) {
  const filename = filePath.split("/").pop();
  if (issue.startsWith("Orphan")) return t('ref_rem_orphan', { file: filename });
  if (issue.startsWith("Very short")) return t('ref_rem_short');
  if (issue.startsWith("No markdown headings")) return t('ref_rem_no_heading');
  if (issue.startsWith("Broken link:")) return t('ref_rem_broken', { path: issue.replace("Broken link:", "").trim() });
  if (issue.startsWith("Empty file")) return t('ref_rem_empty');
  return null;
}

function exportReport() {
  if (!lastValidationData) return;
  const d = lastValidationData;
  const report = {
    timestamp: new Date().toISOString(),
    summary: { total: d.total, pass: d.pass, fail: d.fail, warn: d.warn },
    results: d.results.map(r => ({
      name: r.name, status: r.status, path: r.path, excluded: r.excluded,
      issues: r.issues.map(i => ({ level: i.level, message: i.message })),
    })),
    load_errors: d.load_errors,
  };
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `skills-validation-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
