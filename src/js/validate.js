function initValidatePage() {
  const page = document.getElementById("page-validate");
  page.innerHTML = `
    <h1 class="page-title">Frontmatter Lint & Validate</h1>
    <div id="validate-content">
      <p style="color:var(--color-text-muted)">Open a skills directory to begin validation.</p>
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
  container.innerHTML = '<div style="display:flex;align-items:center;gap:8px;"><span class="spinner"></span> Validating skills...</div>';

  try {
    const result = await invoke("validate_skills", { directory: dir });
    renderValidation(container, result);
  } catch (err) {
    container.innerHTML = `<div class="warning-box warning-orange">${escapeHtml(String(err))}</div>`;
  }
}

async function runSingleFileValidation(filePath) {
  const container = document.getElementById("validate-content");
  container.innerHTML = '<div style="display:flex;align-items:center;gap:8px;"><span class="spinner"></span> Validating skill file...</div>';

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
  const { total, pass, fail, warn, results, load_errors } = data;
  const passPercent = total > 0 ? ((pass / total) * 100).toFixed(0) : 0;
  const fixableCount = results.filter(r => hasFixableIssues(r)).length;

  let html = `
    <div class="summary-bar">
      <span class="summary-stat"><span class="dot dot-total"></span> Total: ${total}</span>
      <span class="summary-stat"><span class="dot dot-pass"></span> Pass: ${pass}</span>
      <span class="summary-stat"><span class="dot dot-fail"></span> Fail: ${fail}</span>
      <span class="summary-stat"><span class="dot dot-warn"></span> Warn: ${warn}</span>
      <div style="margin-left:auto;display:flex;gap:6px;">
        <button class="btn btn-sm btn-ghost" id="btn-export">Export</button>
        ${fixableCount > 0 ? `<button class="btn btn-sm btn-accent-outline" id="btn-fix-all">Fix All (${fixableCount})</button>` : ''}
      </div>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width:${passPercent}%;background:linear-gradient(90deg, var(--color-pass) ${passPercent > 0 ? '0%' : ''}, var(--color-pass));"></div>
    </div>
    <div class="filter-bar">
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="pass">Pass</button>
      <button class="filter-btn" data-filter="fail">Fail</button>
      <button class="filter-btn" data-filter="warn">Warn</button>
    </div>
  `;

  if (load_errors.length > 0) {
    html += `<div class="card"><strong>Load Errors (${load_errors.length})</strong>`;
    load_errors.forEach(e => {
      html += `<div class="issue-item issue-error">${escapeHtml(e.path)}: ${escapeHtml(e.error)}</div>`;
    });
    html += `</div>`;
  }

  html += `<table class="results-table">
    <thead><tr><th>Name</th><th>Status</th><th>Path</th><th>Issues</th><th></th></tr></thead>
    <tbody id="validate-tbody">`;

  results.forEach(r => {
    const shortPath = r.path.split("/").slice(-3).join("/");
    const fixable = hasFixableIssues(r);
    const issuesHtml = r.issues.map(i => {
      const fixIcon = isFixable(i) ? ' <span style="color:var(--color-accent);font-size:10px;">auto-fixable</span>' : '';
      const tip = i.suggestion ? `<div class="issue-suggestion">${escapeHtml(i.suggestion)}</div>` : '';
      return `<div class="issue-item issue-${i.level}">${escapeHtml(i.message)}${fixIcon}${tip}</div>`;
    }).join("");

    const fixBtn = fixable
      ? `<button class="btn btn-sm btn-accent-outline btn-fix-single" data-path="${escapeHtml(r.path)}">Fix</button>`
      : '';

    html += `<tr data-status="${r.status}" data-path="${escapeHtml(r.path)}">
      <td><a href="#" class="skill-link" data-path="${escapeHtml(r.path)}">${escapeHtml(r.name)}</a>${r.excluded ? ' <span style="color:var(--color-text-muted);font-size:11px;">(excluded)</span>' : ''}</td>
      <td><span class="status-badge status-${r.status}">${r.status}</span></td>
      <td style="font-size:11px;color:var(--color-text-muted);font-family:monospace;">${escapeHtml(shortPath)}</td>
      <td>${issuesHtml || '<span style="color:var(--color-pass)">—</span>'}</td>
      <td>${fixBtn}</td>
    </tr>`;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;

  container.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;
      container.querySelectorAll("#validate-tbody tr").forEach(row => {
        row.style.display = (filter === "all" || row.dataset.status === filter) ? "" : "none";
      });
    });
  });

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

  container.querySelectorAll(".skill-link").forEach(link => {
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
      <div class="modal-header">Preview: ${escapeHtml(fileName)}</div>
      <div class="modal-body">
        <div style="font-size:12px;color:var(--color-text-muted);margin-bottom:8px;">The following changes will be applied:</div>
        ${changesHtml}
      </div>
      <div class="modal-footer">
        <button class="btn" id="btn-preview-cancel">Cancel</button>
        <button class="btn btn-sm btn-accent-outline" id="btn-preview-apply">Apply Fix</button>
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
      <div class="modal-header">Preview: Fix All (${previews.length} files)</div>
      <div class="modal-body" style="max-height:400px;overflow-y:auto;">
        ${itemsHtml}
      </div>
      <div class="modal-footer">
        <button class="btn" id="btn-preview-cancel">Cancel</button>
        <button class="btn btn-sm btn-accent-outline" id="btn-preview-apply-all">Apply All</button>
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
          <button class="filter-btn active" id="btn-view-text">Text</button>
          <button class="filter-btn" id="btn-view-md">Rendered</button>
        </div>
        <button class="btn btn-sm btn-ghost" id="btn-viewer-close" style="margin-left:8px;">✕</button>
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
    showMdView(body, content);
  });
}

function showTextView(container, content) {
  container.innerHTML = `<pre class="viewer-pre">${escapeHtml(content)}</pre>`;
}

function showMdView(container, content) {
  const rendered = typeof marked !== 'undefined' ? marked.parse(content) : escapeHtml(content);
  container.innerHTML = `<div class="viewer-md">${rendered}</div>`;
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
