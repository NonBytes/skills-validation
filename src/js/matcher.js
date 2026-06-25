const VALID_PHASES = [
  "reconnaissance", "scanning", "enumeration", "application_intelligence",
  "exploitation", "credential_access", "lateral_movement",
  "privilege_escalation", "post_exploitation"
];

let matcherInputs = {};

function initMatcherPage() {
  const page = document.getElementById("page-matcher");
  page.innerHTML = `
    <h1 class="page-title">Trigger Matching Simulator</h1>
    <div class="card">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
        <div class="form-group">
          <label class="form-label">Technologies</label>
          <div id="input-technologies"></div>
        </div>
        <div class="form-group">
          <label class="form-label">Services</label>
          <div id="input-services"></div>
        </div>
        <div class="form-group">
          <label class="form-label">Ports</label>
          <div id="input-ports"></div>
        </div>
        <div class="form-group">
          <label class="form-label">Paths</label>
          <div id="input-paths"></div>
        </div>
        <div class="form-group">
          <label class="form-label">Signals</label>
          <div id="input-signals"></div>
        </div>
        <div class="form-group">
          <label class="form-label">Phase</label>
          <select id="input-phase" style="width:100%;">
            <option value="">— none —</option>
            ${VALID_PHASES.map(p => `<option value="${p}">${p}</option>`).join("")}
          </select>
        </div>
      </div>
      <div style="margin-top:12px;">
        <button class="btn btn-primary" id="btn-match">Run Match</button>
      </div>
    </div>
    <div id="match-results"></div>
  `;

  matcherInputs.technologies = createTagInput(document.getElementById("input-technologies"), "e.g. wordpress, apache");
  matcherInputs.services = createTagInput(document.getElementById("input-services"), "e.g. ssh, http");
  matcherInputs.ports = createTagInput(document.getElementById("input-ports"), "e.g. 22, 80, 443");
  matcherInputs.paths = createTagInput(document.getElementById("input-paths"), "e.g. /wp-admin");
  matcherInputs.signals = createTagInput(document.getElementById("input-signals"), "e.g. shell_obtained");

  document.getElementById("btn-match").addEventListener("click", runMatch);
}

async function runMatch() {
  if (!currentDirectory && !currentFile) {
    document.getElementById("match-results").innerHTML =
      '<div class="warning-box warning-orange">Open a skills directory or file first.</div>';
    return;
  }

  const scenario = {
    technologies: matcherInputs.technologies.getTags(),
    services: matcherInputs.services.getTags(),
    ports: matcherInputs.ports.getTags().map(p => parseInt(p)).filter(p => !isNaN(p)),
    paths: matcherInputs.paths.getTags(),
    signals: matcherInputs.signals.getTags(),
    phase: document.getElementById("input-phase").value || null,
  };

  const container = document.getElementById("match-results");
  container.innerHTML = '<div style="display:flex;align-items:center;gap:8px;"><span class="spinner"></span> Matching...</div>';

  try {
    const result = currentFile
      ? await invoke("match_scenario_file", { filePath: currentFile, scenario })
      : await invoke("match_scenario", { directory: currentDirectory, scenario });
    renderMatchResults(container, result);
  } catch (err) {
    container.innerHTML = `<div class="warning-box warning-orange">${escapeHtml(String(err))}</div>`;
  }
}

function renderMatchResults(container, data) {
  let html = "";

  if (data.warning) {
    const cls = data.matches.length === 0 ? "warning-orange" : "warning-yellow";
    html += `<div class="warning-box ${cls}">${escapeHtml(data.warning)}</div>`;
  }

  html += `<div style="font-size:13px;color:var(--color-text-muted);margin-bottom:8px;">
    ${data.matches.length} match${data.matches.length !== 1 ? "es" : ""} from ${data.total_skills} skills
  </div>`;

  if (data.matches.length > 0) {
    html += `<table class="results-table">
      <thead><tr><th>Priority</th><th>Skill</th><th>Matched On</th><th>Path</th></tr></thead>
      <tbody>`;

    data.matches.forEach(m => {
      const shortPath = m.skill_path.split("/").slice(-3).join("/");
      const cats = m.matched_categories.map(c => `<span class="match-category">${c}</span>`).join("");
      html += `<tr>
        <td><strong>${m.priority}</strong></td>
        <td>${escapeHtml(m.skill_name)}</td>
        <td>${cats}</td>
        <td style="font-size:11px;color:var(--color-text-muted);font-family:monospace;">${escapeHtml(shortPath)}</td>
      </tr>`;
    });

    html += `</tbody></table>`;
  }

  container.innerHTML = html;
}
