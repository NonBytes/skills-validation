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

function coverageStat(items) {
  const covered = items.filter(i => i.covered).length;
  return `${covered}/${items.length}`;
}

function renderGrid(items) {
  return `<div class="owasp-grid">${items.map(o => {
    const cls = o.covered ? "covered" : "gap";
    const skillList = o.covered
      ? o.mapped_skills.map(s => `<span class="tool-tag tool-covered">${s}</span>`).join("")
      : '<span style="color:var(--color-fail);font-size:12px;">GAP</span>';
    return `<div class="owasp-card ${cls}">
      <div class="owasp-id" style="color:${o.covered ? 'var(--color-pass)' : 'var(--color-fail)'}">${o.id}</div>
      <div class="owasp-name">${escapeHtml(o.name)}</div>
      <div class="owasp-skills">${skillList}</div>
    </div>`;
  }).join("")}</div>`;
}

function section(title, badge, content, open) {
  return `<details class="coverage-section" ${open ? 'open' : ''}>
    <summary class="coverage-header">
      <span>${title}</span>
      <span class="coverage-badge">${badge}</span>
    </summary>
    <div class="coverage-body">${content}</div>
  </details>`;
}

function renderCoverage(container, data) {
  let html = "";

  // Phase Coverage
  const maxPhaseCount = Math.max(...data.phases.map(p => p.count), 1);
  const phaseGaps = data.phases.filter(p => p.count === 0).length;
  let phaseHtml = '<div class="bar-chart">';
  data.phases.forEach(p => {
    const pct = ((p.count / maxPhaseCount) * 100).toFixed(0);
    const cls = p.count === 0 ? "bar-fill-gap" : "bar-fill-ok";
    phaseHtml += `<div class="bar-row">
      <span class="bar-label">${p.phase}</span>
      <div class="bar-track"><div class="bar-fill ${cls}" style="width:${pct}%"></div></div>
      <span class="bar-count">${p.count}</span>
    </div>`;
  });
  phaseHtml += '</div>';
  const phaseBadge = phaseGaps > 0 ? `${phaseGaps} gaps` : 'All covered';
  html += section('Phase Coverage', phaseBadge, phaseHtml, true);

  // OWASP Top 10
  html += section(`OWASP Top 10`, coverageStat(data.owasp), renderGrid(data.owasp), false);

  // MITRE ATT&CK
  html += section(`MITRE ATT&CK Tactics`, coverageStat(data.mitre), renderGrid(data.mitre), false);

  // CWE Top 25
  html += section(`CWE Top 25`, coverageStat(data.cwe), renderGrid(data.cwe), false);

  // PTES
  html += section(`PTES Phases`, coverageStat(data.ptes), renderGrid(data.ptes), false);

  // Tool Coverage
  const coveredCount = data.tools.covered.length;
  const totalTools = data.tools.total;
  let toolHtml = `
    <div class="progress-bar" style="margin-bottom:12px;">
      <div class="progress-fill" style="width:${((coveredCount/totalTools)*100).toFixed(0)}%;background:var(--color-accent);"></div>
    </div>
    <div class="tool-lists">
      <div>
        <div class="tool-list-title" style="color:var(--color-pass);">Covered (${coveredCount})</div>
        <div>${data.tools.covered.map(t => `<span class="tool-tag tool-covered">${t}</span>`).join("")}</div>
      </div>
      <div>
        <div class="tool-list-title" style="color:var(--color-fail);">Missing (${data.tools.missing.length})</div>
        <div>${data.tools.missing.map(t => `<span class="tool-tag tool-missing">${t}</span>`).join("")}</div>
      </div>
    </div>`;
  html += section(`Agent Tools`, `${coveredCount}/${totalTools}`, toolHtml, false);

  container.innerHTML = html;
}
