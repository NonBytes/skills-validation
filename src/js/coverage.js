function initCoveragePage() {
  const page = document.getElementById("page-coverage");
  page.innerHTML = `
    <h1 class="page-title">Coverage Matrix</h1>
    <div id="coverage-content">
      <p style="color:var(--color-text-muted)">Open a skills directory to compute coverage.</p>
    </div>
  `;

  document.addEventListener("directory-loaded", async (e) => {
    await runCoverage(e.detail);
  });

  document.addEventListener("file-loaded", () => {
    document.getElementById("coverage-content").innerHTML =
      '<div class="warning-box warning-yellow">Coverage matrix requires a full skills directory. Open a directory to compute coverage across all skills.</div>';
  });
}

async function runCoverage(dir) {
  const container = document.getElementById("coverage-content");
  container.innerHTML = '<div style="display:flex;align-items:center;gap:8px;"><span class="spinner"></span> Computing coverage...</div>';

  try {
    const result = await invoke("get_coverage", { directory: dir });
    renderCoverage(container, result);
  } catch (err) {
    container.innerHTML = `<div class="warning-box warning-orange">${escapeHtml(String(err))}</div>`;
  }
}

function renderCoverage(container, data) {
  const maxPhaseCount = Math.max(...data.phases.map(p => p.count), 1);

  let html = `<div class="card">
    <h3 style="margin:0 0 12px;font-size:15px;">Phase Coverage</h3>
    <div class="bar-chart">`;

  data.phases.forEach(p => {
    const pct = ((p.count / maxPhaseCount) * 100).toFixed(0);
    const cls = p.count === 0 ? "bar-fill-gap" : "bar-fill-ok";
    html += `<div class="bar-row">
      <span class="bar-label">${p.phase}</span>
      <div class="bar-track"><div class="bar-fill ${cls}" style="width:${pct}%"></div></div>
      <span class="bar-count">${p.count}</span>
    </div>`;
  });

  html += `</div></div>`;

  // OWASP
  html += `<div class="card">
    <h3 style="margin:0 0 12px;font-size:15px;">OWASP Top 10 Coverage</h3>
    <div class="owasp-grid">`;

  data.owasp.forEach(o => {
    const cls = o.covered ? "covered" : "gap";
    const skillList = o.covered
      ? o.mapped_skills.map(s => `<span class="tool-tag tool-covered">${s}</span>`).join("")
      : '<span style="color:var(--color-fail);font-size:12px;">GAP — no skills mapped</span>';
    html += `<div class="owasp-card ${cls}">
      <div class="owasp-id" style="color:${o.covered ? 'var(--color-pass)' : 'var(--color-fail)'}">${o.id}</div>
      <div class="owasp-name">${escapeHtml(o.name)}</div>
      <div class="owasp-skills">${skillList}</div>
    </div>`;
  });

  html += `</div></div>`;

  // Tool coverage
  const coveredCount = data.tools.covered.length;
  const totalTools = data.tools.total;
  html += `<div class="card">
    <h3 style="margin:0 0 12px;font-size:15px;">Agent Tool Coverage (${coveredCount}/${totalTools})</h3>
    <div class="progress-bar" style="margin-bottom:12px;">
      <div class="progress-fill" style="width:${((coveredCount/totalTools)*100).toFixed(0)}%;background:var(--color-accent);"></div>
    </div>
    <div class="tool-lists">
      <div>
        <div class="tool-list-title" style="color:var(--color-pass);">Covered (${data.tools.covered.length})</div>
        <div>${data.tools.covered.map(t => `<span class="tool-tag tool-covered">${t}</span>`).join("")}</div>
      </div>
      <div>
        <div class="tool-list-title" style="color:var(--color-fail);">Missing (${data.tools.missing.length})</div>
        <div>${data.tools.missing.map(t => `<span class="tool-tag tool-missing">${t}</span>`).join("")}</div>
      </div>
    </div>
  </div>`;

  container.innerHTML = html;
}
