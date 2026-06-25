let llmSkillList = [];

function initLlmPage() {
  const page = document.getElementById("page-llm");
  page.innerHTML = `
    <h1 class="page-title">LLM Dry-Run Test</h1>
    <div class="card">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
        <div class="form-group">
          <label class="form-label">Provider</label>
          <select id="llm-provider" style="width:100%;">
            <option value="ollama">Ollama</option>
            <option value="lmstudio">LM Studio</option>
            <option value="anythingllm">AnythingLLM</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Model</label>
          <div style="display:flex;gap:6px;align-items:center;">
            <select id="llm-model" style="flex:1;min-width:0;">
              <option value="">— select provider first —</option>
            </select>
            <button class="btn btn-ghost" id="btn-refresh-models" title="Refresh models" style="width:38px;height:38px;padding:0;flex-shrink:0;display:flex;align-items:center;justify-content:center;">↻</button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Response Language</label>
          <select id="llm-lang" style="width:100%;">
            <option value="en">English</option>
            <option value="th">ไทย</option>
          </select>
        </div>
        <div class="form-group" style="grid-column:span 3;">
          <label class="form-label">API Key</label>
          <input id="llm-apikey" type="password" placeholder="Not needed for local providers" style="width:100%;box-sizing:border-box;" />
        </div>
        <div class="form-group" style="grid-column:span 3;">
          <label class="form-label">Skill</label>
          <select id="llm-skill" style="width:100%;">
            <option value="">— load skills directory first —</option>
          </select>
        </div>
        <div class="form-group" style="grid-column:span 3;">
          <label class="form-label">Scenario</label>
          <textarea id="llm-scenario" placeholder="Describe the target scenario..." style="width:100%;box-sizing:border-box;"></textarea>
        </div>
      </div>
      <div style="margin-top:12px;">
        <button class="btn btn-primary" id="btn-llm-run">Send to LLM</button>
      </div>
    </div>
    <div id="llm-results"></div>
  `;

  document.getElementById("btn-llm-run").addEventListener("click", runLlm);
  document.getElementById("btn-refresh-models").addEventListener("click", () => loadModels());

  document.getElementById("llm-provider").addEventListener("change", () => {
    const provider = document.getElementById("llm-provider").value;
    saveSetting("llm_provider", provider);
    loadModels();
  });
  document.getElementById("llm-model").addEventListener("change", () => {
    saveSetting("llm_model", document.getElementById("llm-model").value);
  });
  document.getElementById("llm-apikey").addEventListener("change", () => {
    saveSetting("llm_apikey", document.getElementById("llm-apikey").value);
  });
  document.getElementById("llm-lang").addEventListener("change", () => {
    saveSetting("llm_lang", document.getElementById("llm-lang").value);
  });

  restoreLlmSettings();

  document.addEventListener("directory-loaded", async (e) => {
    try {
      const result = await invoke("validate_skills", { directory: e.detail });
      llmSkillList = result.results.map(r => r.name).filter(n => n !== "<unnamed>").sort();
      const sel = document.getElementById("llm-skill");
      sel.innerHTML = llmSkillList.map(n => `<option value="${n}">${n}</option>`).join("");
    } catch (_) {}
  });

  document.addEventListener("file-loaded", async (e) => {
    try {
      const result = await invoke("validate_single_file", { filePath: e.detail });
      llmSkillList = result.results.map(r => r.name).filter(n => n !== "<unnamed>").sort();
      const sel = document.getElementById("llm-skill");
      sel.innerHTML = llmSkillList.map(n => `<option value="${n}">${n}</option>`).join("");
    } catch (_) {}
  });
}

async function restoreLlmSettings() {
  const provider = await loadSetting("llm_provider");
  const model = await loadSetting("llm_model");
  const apikey = await loadSetting("llm_apikey");
  const lang = await loadSetting("llm_lang");
  if (provider) document.getElementById("llm-provider").value = provider;
  if (apikey) document.getElementById("llm-apikey").value = apikey;
  if (lang) document.getElementById("llm-lang").value = lang;
  await loadModels(model);
}

async function loadModels(selectModel) {
  const provider = document.getElementById("llm-provider").value;
  const sel = document.getElementById("llm-model");

  const fetchCommands = {
    ollama: "get_ollama_models",
    lmstudio: "get_lmstudio_models",
    anythingllm: "get_anythingllm_models",
  };

  if (fetchCommands[provider]) {
    sel.innerHTML = '<option value="">Loading...</option>';
    try {
      const args = provider === "anythingllm"
        ? { apiKey: document.getElementById("llm-apikey").value || null }
        : {};
      const models = await invoke(fetchCommands[provider], args);
      if (models.length === 0) {
        sel.innerHTML = '<option value="">No models found</option>';
      } else {
        sel.innerHTML = models.map(m => {
          const label = m.size ? `${m.name} (${m.size})` : m.name;
          return `<option value="${escapeHtml(m.name)}">${escapeHtml(label)}</option>`;
        }).join("");
      }
    } catch (err) {
      const name = { ollama: "Ollama", lmstudio: "LM Studio", anythingllm: "AnythingLLM" }[provider];
      sel.innerHTML = `<option value="">${name} not running</option>`;
    }
  } else if (provider === "openai") {
    sel.innerHTML = `
      <option value="gpt-4o-mini">gpt-4o-mini</option>
      <option value="gpt-4o">gpt-4o</option>
      <option value="gpt-4.1-mini">gpt-4.1-mini</option>
      <option value="gpt-4.1">gpt-4.1</option>
    `;
  } else if (provider === "anthropic") {
    sel.innerHTML = `
      <option value="claude-sonnet-4-20250514">claude-sonnet-4</option>
      <option value="claude-haiku-4-5-20251001">claude-haiku-4.5</option>
    `;
  }

  if (selectModel) {
    const opt = sel.querySelector(`option[value="${selectModel}"]`);
    if (opt) sel.value = selectModel;
  }
}

async function runLlm() {
  if (!currentDirectory && !currentFile) {
    document.getElementById("llm-results").innerHTML =
      '<div class="warning-box warning-orange">Open a skills directory or file first.</div>';
    return;
  }

  const skillName = document.getElementById("llm-skill").value;
  const scenario = document.getElementById("llm-scenario").value;
  if (!skillName || !scenario.trim()) {
    document.getElementById("llm-results").innerHTML =
      '<div class="warning-box warning-orange">Select a skill and enter a scenario.</div>';
    return;
  }

  const lang = document.getElementById("llm-lang").value;
  const config = {
    provider: document.getElementById("llm-provider").value,
    api_key: document.getElementById("llm-apikey").value || null,
    model: document.getElementById("llm-model").value || null,
    base_url: null,
    language: lang,
  };

  const container = document.getElementById("llm-results");
  const modelName = document.getElementById("llm-model").value || "default";
  const providerName = document.getElementById("llm-provider").selectedOptions[0].text;

  let elapsed = 0;
  let cancelled = false;
  container.innerHTML = `
    <div class="llm-progress">
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="spinner"></span>
        <div>
          <div>Sending to <strong>${escapeHtml(providerName)}</strong> → <strong>${escapeHtml(modelName)}</strong></div>
          <div style="font-size:11px;color:var(--color-text-muted);" id="llm-elapsed">0s elapsed</div>
        </div>
      </div>
      <button class="btn btn-sm btn-ghost" id="btn-llm-cancel">Cancel</button>
    </div>`;

  const timer = setInterval(() => {
    elapsed++;
    const el = document.getElementById("llm-elapsed");
    if (el) el.textContent = `${elapsed}s elapsed`;
  }, 1000);

  document.getElementById("btn-llm-cancel").addEventListener("click", () => {
    cancelled = true;
    clearInterval(timer);
    container.innerHTML = '<div style="color:var(--color-text-muted);font-size:13px;">Cancelled.</div>';
  });

  try {
    const cmdArgs = currentFile
      ? { filePath: currentFile, skillName, scenario, config }
      : { directory: currentDirectory, skillName, scenario, config };
    const cmdName = currentFile ? "llm_dry_run_file" : "llm_dry_run";
    const result = await invoke(cmdName, cmdArgs);
    clearInterval(timer);
    if (!cancelled) renderLlmResult(container, result, elapsed);
  } catch (err) {
    clearInterval(timer);
    if (!cancelled) container.innerHTML = `<div class="warning-box warning-orange">${escapeHtml(String(err))}</div>`;
  }
}

function renderLlmResult(container, data, elapsed) {
  const timeStr = elapsed ? ` | ${elapsed}s` : '';
  let html = `
    <div class="card">
      <div style="font-size:11px;color:var(--color-text-muted);margin-bottom:8px;">
        ${data.provider} → ${data.model}${timeStr}
      </div>
      <div class="llm-response">${typeof marked !== 'undefined' ? marked.parse(data.content) : escapeHtml(data.content)}</div>
      <div class="quality-btns">
        <button class="quality-btn" data-quality="good">Good</button>
        <button class="quality-btn" data-quality="bad">Bad</button>
        <button class="quality-btn" data-quality="unclear">Unclear</button>
      </div>
    </div>
  `;
  container.innerHTML = html;

  container.querySelectorAll(".quality-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".quality-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });
}
