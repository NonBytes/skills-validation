const LLM_EXAMPLES = [
  // CMS
  { cat: "CMS", label: "WordPress — plugin recon", scenario: "Target: https://example.com running WordPress 5.8.2 on Apache 2.4.41 / PHP 7.4. Login at /wp-admin. Directory listing enabled on /uploads/. WooCommerce and Contact Form 7 plugins detected. No WAF visible." },
  { cat: "CMS", label: "WordPress — WPScan aggressive", scenario: "WordPress site at https://target.local. Admin user 'admin' confirmed via author enumeration. xmlrpc.php accessible. Need to enumerate all installed plugins including inactive ones and check for known CVEs." },
  { cat: "CMS", label: "Drupal — exposed admin", scenario: "Drupal 8.9.0 running at https://example.com. /admin/config accessible without auth (misconfigured .htaccess). PHP filter module enabled. Enumerate installed modules and check for Drupalgeddon2 (CVE-2018-7600)." },
  // Network / Infrastructure
  { cat: "Network / Infrastructure", label: "Linux server — initial foothold", scenario: "Nmap result: 22/tcp OpenSSH 8.2 (Ubuntu), 80/tcp Apache 2.4.41, 3306/tcp MySQL (filtered), 8080/tcp Tomcat 9.0.45. OS: Ubuntu 20.04 LTS. No credentials yet. Identify attack surface and prioritize entry points." },
  { cat: "Network / Infrastructure", label: "Windows — SMB exposed", scenario: "Windows Server 2016 at 192.168.1.10. SMB port 445 open, no signing enforced. NetBIOS name: FILESERVER. Null session allowed. Guest account enabled. Enumerate shares, users, and check for EternalBlue (MS17-010)." },
  { cat: "Network / Infrastructure", label: "Active Directory — Kerberoasting", scenario: "Domain: corp.local. Got low-privilege domain user creds (jsmith:Password1). Domain Controller at 192.168.1.1. Enumerate SPNs, perform Kerberoasting, and identify paths to Domain Admin via BloodHound analysis." },
  { cat: "Network / Infrastructure", label: "Active Directory — AS-REP Roasting", scenario: "Active Directory domain corp.internal. Found user list via LDAP anonymous bind. Several accounts have UF_DONT_REQUIRE_PREAUTH set. DC at 10.10.10.5. Perform AS-REP Roasting and crack offline." },
  // Protocols
  { cat: "Protocols", label: "SSH — weak credentials", scenario: "SSH server OpenSSH 7.4 on port 22. Banner shows CentOS 7. Username enumeration possible via timing attack. Known usernames: admin, root, deploy. Try credential stuffing with top-100 SSH passwords and check for weak key algos (DSA)." },
  { cat: "Protocols", label: "LDAP — null bind + injection", scenario: "LDAP server at 192.168.1.20:389. Anonymous bind allowed — can enumerate OUs, users, and group memberships. Login form at /login uses LDAP auth. Test LDAP injection in username field: admin)(&) and *()|%26." },
  { cat: "Protocols", label: "Redis — unauthenticated RCE", scenario: "Redis 6.2.1 running on 10.0.0.5:6379 with no authentication. CONFIG SET allowed. Server is Linux with cron jobs running as root. Exploit via cron job write, SSH key injection via authorized_keys, and RDB file path manipulation." },
  { cat: "Protocols", label: "FTP — anonymous + traversal", scenario: "FTP server at 192.168.1.30. Anonymous login accepted. Writable /pub/ directory. Server is vsFTPd 2.3.4 — check for backdoor (port 6200). Test path traversal to /var/www/html and attempt to drop a web shell via FTP + SSRF combo." },
  // Cloud
  { cat: "Cloud", label: "AWS — S3 & IAM", scenario: "AWS environment. Found public S3 bucket 'corp-backups' via DNS brute-force. Bucket ACL allows public read. Downloaded DB backup with hardcoded RDS credentials. Test for IAM privilege escalation via iam:PassRole and lambda:CreateFunction." },
  { cat: "Cloud", label: "AWS — IMDS exploitation", scenario: "EC2 instance with SSRF confirmed via /redirect?url=. Access AWS IMDS v1 at 169.254.169.254. Retrieve IAM role credentials, enumerate attached policies, S3 buckets, Secrets Manager entries, and attempt lateral movement within the account." },
  { cat: "Cloud", label: "Kubernetes — exposed dashboard", scenario: "Kubernetes cluster at https://k8s.example.com. Dashboard exposed at :8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/ without auth. Enumerate pods, secrets, and ServiceAccount tokens. Test for container escape." },
  { cat: "Cloud", label: "Docker — API exposed", scenario: "Docker daemon API exposed on TCP port 2375 at 10.10.1.5 with no TLS. List running containers, mount host filesystem via volume, extract sensitive files (/etc/shadow, /root/.ssh/), and escape to host via privileged container." },
  // Applications
  { cat: "Applications", label: "Jenkins — script console RCE", scenario: "Jenkins 2.303.1 at https://ci.example.com. Admin panel accessible with default credentials (admin:admin). Script Console at /script enabled. Enumerate environment variables, extract Git credentials, and pivot to connected servers." },
  { cat: "Applications", label: "Spring Boot — actuator exposure", scenario: "Spring Boot app at https://app.example.com. Actuator endpoints exposed: /actuator/env, /actuator/heapdump, /actuator/mappings. Extract datasource passwords from /env, download heap dump for credential mining. Test for Spring4Shell if version < 5.3.18." },
  { cat: "Applications", label: "Apache Struts — RCE", scenario: "Apache Struts 2.5.16 at https://example.com/struts2/index.action. Content-Type OGNL injection (S2-045/CVE-2017-5638) may be possible. Server is Linux/Tomcat. Confirm RCE, establish reverse shell, and enumerate internal network." },
  // API
  { cat: "API", label: "REST API — SQL injection", scenario: "REST API at https://api.example.com/v1/. Swagger UI at /api/docs exposed publicly. SQL error triggered on GET /v1/users?id=1' — 'You have an error in your SQL syntax near...'. JWT auth, no rate limiting." },
  { cat: "API", label: "REST API — IDOR & mass assignment", scenario: "Mobile app backend at https://api.target.com/v2/. Authenticated as user ID 1042. Endpoint GET /v2/account/{id} returns full user profile for any ID. PUT /v2/account allows setting arbitrary fields including role:admin." },
  { cat: "API", label: "GraphQL — introspection + injection", scenario: "GraphQL endpoint at /graphql with introspection enabled. Schema reveals admin mutations. Found batching attack possible. IDOR via user(id: X) query. Check for field-level injection and broken object-level authorization." },
  { cat: "API", label: "GraphQL — broken auth", scenario: "GraphQL at https://api.example.com/graphql. Introspection enabled. Schema exposes adminUsers query and deleteUser mutation. Authenticated as regular user — sending adminUsers query returns full user list without 403. Test all mutations for missing authorization checks." },
  { cat: "API", label: "JWT — algorithm confusion", scenario: "Web app using JWT for auth. Token header: {alg: RS256}. Public key exposed at /api/.well-known/jwks.json. Test for algorithm confusion (RS256→HS256), none algorithm, weak secret brute-force, and kid header injection." },
  { cat: "API", label: "API key leakage via JS", scenario: "SPA at https://app.example.com. Reviewing bundled JS (main.chunk.js): found hardcoded Stripe secret key sk_live_..., Google Maps API key, and internal API base URL https://internal-api.corp.com. Test scope of leaked keys and enumerate internal API endpoints." },
  // Auth / Session
  { cat: "Auth / Session", label: "OAuth2 — redirect_uri bypass", scenario: "OAuth2 authorization server at https://auth.example.com. Client registered with redirect_uri https://app.example.com/callback. Test for open redirect in redirect_uri, state parameter bypass for CSRF, and authorization code interception via Referer header." },
  { cat: "Auth / Session", label: "Password reset — race condition", scenario: "Password reset flow at /forgot-password uses 6-digit numeric OTP sent via email (expires 10 min). No rate limiting on /verify-otp endpoint. Test for race condition to brute-force OTP, token leakage in Referer, and account takeover via email parameter pollution." },
  { cat: "Auth / Session", label: "CSRF on sensitive action", scenario: "Banking app at https://bank.example.com. Fund transfer at POST /transfer uses session cookie only — no CSRF token, no SameSite attribute. Origin and Referer not validated server-side. Craft a PoC page that silently triggers a $1 transfer when visited by an authenticated user." },
  // Injection
  { cat: "Injection", label: "SSRF — internal cloud metadata", scenario: "Web app at https://example.com has image proxy endpoint: /fetch?url=. Confirmed SSRF by fetching http://127.0.0.1/. AWS environment suspected (EC2 metadata at 169.254.169.254). Enumerate IAM credentials and internal services." },
  { cat: "Injection", label: "XXE — file read", scenario: "XML-based SOAP web service at /api/soap. Accepts user-supplied XML without entity filtering. DTD processing enabled. Server is Linux, app runs as www-data. Extract /etc/passwd, check for SSRF via XXE, and test blind XXE via DNS/HTTP callback." },
  { cat: "Injection", label: "SSTI in template engine", scenario: "Python Flask app at https://app.example.com/greet?name=World. Response: 'Hello, World!'. Testing name={{7*7}} returns 'Hello, 49!'. Server uses Jinja2. Escalate from math eval to RCE via __class__.__mro__ gadget chain. App runs as www-data on Ubuntu." },
  { cat: "Injection", label: "Deserialization — Java", scenario: "Java web application at https://app.example.com. AMF endpoint at /messagebroker/amf. Discovered serialized Java objects in cookie (rO0AB...). Apache Commons Collections 3.1 on classpath. Test for RCE via ysoserial gadget chains." },
  { cat: "Injection", label: "HTTP request smuggling", scenario: "Reverse proxy (Nginx 1.18) in front of backend (Apache 2.4). Found discrepancy in handling of Content-Length vs Transfer-Encoding: chunked headers. Test CL.TE and TE.CL variants, attempt to poison the request queue and capture another user's request." },
  { cat: "Injection", label: "HTTP header injection", scenario: "App at https://example.com/redirect?url=/dashboard. Server reflects the url parameter into a Location header without sanitization. Inject CRLF sequence (%0d%0a) to add arbitrary headers (Set-Cookie, X-Custom). Escalate to response splitting and session fixation." },
  { cat: "Injection", label: "Prototype pollution", scenario: "Node.js app using lodash.merge for request body handling. POST /api/settings with body {\"__proto__\":{\"admin\":true}} pollutes Object prototype. Subsequent calls that check obj.admin return true for all objects. Identify sink functions and escalate to RCE via constructor.prototype injection." },
  // XSS / Client-side
  { cat: "XSS / Client-side", label: "Stored XSS in profile", scenario: "Social platform at https://social.example.com. User display name field allows HTML. Input '<script>alert(1)</script>' stored and reflected to all visitors on the profile page. No CSP header. Escalate to session hijacking via document.cookie exfiltration to attacker-controlled server." },
  { cat: "XSS / Client-side", label: "Reflected XSS via search", scenario: "E-commerce site https://shop.example.com/search?q=term reflects the query parameter raw into the page without encoding. User-Agent and Referer headers also reflected in an admin-visible error log page. Identify XSS vectors, bypass any filters, and demonstrate DOM-based variant." },
  { cat: "XSS / Client-side", label: "WebSocket injection", scenario: "Real-time chat at wss://chat.example.com/ws. Messages sent as JSON: {type:'message', to:'user2', body:'hello'}. Test JSON injection in 'to' field, XSS in body field (reflected to recipients), privilege escalation by spoofing type:'admin_command', and insecure direct messaging to other users." },
  { cat: "XSS / Client-side", label: "Clickjacking", scenario: "Banking portal https://bank.example.com/transfer does not set X-Frame-Options or CSP frame-ancestors. Page can be framed. Craft a transparent iframe overlay on a fake 'Win a prize' page to trick authenticated users into clicking the transfer button without their knowledge." },
  { cat: "XSS / Client-side", label: "Open redirect to phishing", scenario: "Login portal at https://corp.example.com/login?next=/dashboard. The 'next' parameter accepts arbitrary URLs including https://evil.com. No whitelist validation. Combine with a phishing email to redirect users post-login to a credential-harvesting clone." },
  // Access Control
  { cat: "Access Control", label: "Insecure direct object reference", scenario: "Healthcare portal at https://portal.example.com/api/records/12345. Authenticated as patient ID 12345. Incrementing the ID returns other patients' full medical records. No ownership check server-side. Enumerate range 10000–13000 to quantify scope." },
  { cat: "Access Control", label: "Broken function-level auth", scenario: "SaaS app at https://app.example.com. Regular user account. Admin API endpoints documented in leaked JS bundle: DELETE /api/admin/users/{id}, POST /api/admin/roles. Calling these with a regular-user JWT returns 200 instead of 403. No role check on server." },
  { cat: "Access Control", label: "Mass assignment", scenario: "Node.js Express API. POST /api/register accepts {username, password, email}. MongoDB backend uses req.body spread directly into User model. Sending {username:'x', password:'y', role:'admin'} results in admin account creation. Check all CRUD endpoints for unfiltered field binding." },
  // File / Path
  { cat: "File / Path", label: "Path traversal + LFI", scenario: "PHP app at https://example.com/view?file=welcome.php. Changing file=../../../etc/passwd returns contents. PHP wrappers may be available. Test php://filter to read source code, php://input for RCE, and check for log poisoning via User-Agent to /var/log/apache2/access.log." },
  { cat: "File / Path", label: "File upload — bypass", scenario: "File upload at /upload.php. Server-side validation checks Content-Type and extension. Web root is writable. Try MIME-type spoofing, double extension (.php.jpg), null byte injection, and polyglot PHP/image payload to achieve RCE." },
  { cat: "File / Path", label: "Insecure file download", scenario: "Document management app at https://docs.example.com/download?path=reports/q1.pdf. Changing path to ../../config/database.yml downloads the file. Server is Linux. Enumerate config files, .env, backup files (.bak, ~, .old), and SSH keys in /home/*/.ssh/." },
  { cat: "File / Path", label: "Exposed .git directory", scenario: "Running https://example.com/.git/HEAD returns 'ref: refs/heads/main'. Dump the full repository using git-dumper. Extract database credentials from config/database.yml, AWS keys from .env, and find hardcoded API tokens in commit history via git log -p." },
  { cat: "File / Path", label: "Exposed admin panel", scenario: "Found https://target.com/admin/ returning a login form. Default credentials admin:admin work. Panel runs PHPMyAdmin 4.9.5 (CVE-2020-5504 — SQL injection). Also accessible: phpinfo.php leaking full server config, and /server-status showing active connections." },
  // Business Logic
  { cat: "Business Logic", label: "Coupon abuse", scenario: "E-commerce at https://shop.example.com. Coupon code SAVE10 gives 10% off. Test: applying multiple coupons on one order, negative quantity items, race condition to apply a single-use coupon multiple times simultaneously, and integer overflow on cart total." },
  { cat: "Business Logic", label: "Race condition — account balance", scenario: "Fintech app at https://pay.example.com/withdraw. Withdrawal endpoint does: read balance → check balance → deduct. No database-level locking. Send 20 concurrent withdrawal requests for the full balance using Burp Turbo Intruder or ffuf. Confirm double-spend." },
  // Recon / OSINT
  { cat: "Recon / OSINT", label: "External recon — full surface", scenario: "Initial external recon for domain targetcorp.com. No prior access. Tasks: subdomain enumeration, port scanning top-1000, web tech fingerprinting, email harvesting, GitHub/GitLab exposure, S3 bucket enumeration, and pastebin leaks." },
  { cat: "Recon / OSINT", label: "Subdomain takeover", scenario: "Found CNAME for staging.example.com → examplecorp.azurewebsites.net. Azure site returns 'No web site is configured at this address'. Check takeover feasibility, register the Azure subdomain, serve a proof-of-concept response, and document impact." },
];

function _buildExampleOptgroups() {
  const groups = {};
  LLM_EXAMPLES.forEach((ex, i) => {
    if (!groups[ex.cat]) groups[ex.cat] = [];
    groups[ex.cat].push({ label: ex.label, i });
  });
  return Object.entries(groups).map(([cat, items]) =>
    `<optgroup label="${escapeHtml(cat)}">${items.map(({ label, i }) =>
      `<option value="${i}">${escapeHtml(label)}</option>`
    ).join("")}</optgroup>`
  ).join("");
}

function initLlmPage() {
  const page = document.getElementById("page-llm");
  page.innerHTML = `
    <h1 class="page-title">${t('llm_title')}</h1>
    <div class="card">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
        <div class="form-group">
          <label class="form-label">${t('llm_provider')}</label>
          <select id="llm-provider" style="width:100%;">
            <option value="ollama">Ollama</option>
            <option value="lmstudio">LM Studio</option>
            <option value="anythingllm">AnythingLLM</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">${t('llm_model')}</label>
          <div style="display:flex;gap:6px;align-items:center;">
            <select id="llm-model" style="flex:1;min-width:0;">
              <option value="">— select provider first —</option>
            </select>
            <button class="btn btn-ghost" id="btn-refresh-models" title="Refresh models" style="width:38px;height:38px;padding:0;flex-shrink:0;display:flex;align-items:center;justify-content:center;">↻</button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">${t('llm_language')}</label>
          <select id="llm-lang" style="width:100%;">
            <option value="en">${t('llm_lang_en')}</option>
            <option value="th">${t('llm_lang_th')}</option>
          </select>
        </div>
        <div class="form-group" style="grid-column:span 3;">
          <label class="form-label">API Key</label>
          <input id="llm-apikey" type="password" placeholder="Not needed for local providers" style="width:100%;box-sizing:border-box;" />
        </div>
        <div class="form-group" style="grid-column:span 3;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">
            <label class="form-label" style="margin-bottom:0;">${t('llm_scenario')}</label>
            <select id="llm-example" style="height:28px;font-size:11px;padding:0 28px 0 8px;border-radius:5px;color:var(--color-text-muted);">
              <option value="">${t('llm_example_load')}</option>
              ${_buildExampleOptgroups()}
            </select>
          </div>
          <textarea id="llm-scenario" placeholder="Describe the target scenario..." style="width:100%;box-sizing:border-box;min-height:100px;"></textarea>
        </div>
      </div>
      <div style="margin-top:12px;">
        <button class="btn btn-primary" id="btn-llm-run">${t('llm_send')}</button>
      </div>
    </div>
    <div id="llm-results"></div>
  `;

  document.getElementById("btn-llm-run").addEventListener("click", runLlm);
  document.getElementById("btn-refresh-models").addEventListener("click", () => loadModels());
  document.getElementById("llm-example").addEventListener("change", (e) => {
    const idx = e.target.value;
    if (idx === "") return;
    const ex = LLM_EXAMPLES[parseInt(idx)];
    if (ex) document.getElementById("llm-scenario").value = ex.scenario;
    e.target.value = "";
  });

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

  const scenario = document.getElementById("llm-scenario").value;
  if (!scenario.trim()) {
    document.getElementById("llm-results").innerHTML =
      '<div class="warning-box warning-orange">Enter a scenario first.</div>';
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
      ? { filePath: currentFile, scenario, config }
      : { directory: currentDirectory, scenario, config };
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
  const skillChips = (data.matched_skills || []).length > 0
    ? `<div style="margin-bottom:10px;display:flex;flex-wrap:wrap;gap:5px;align-items:center;">
        <span style="font-size:11px;color:var(--color-text-muted);">Skills matched:</span>
        ${data.matched_skills.map(s => `<span class="match-category">${escapeHtml(s)}</span>`).join("")}
       </div>`
    : `<div style="margin-bottom:10px;font-size:11px;color:var(--color-text-muted);">No skills matched — responding as general assistant.</div>`;

  let html = `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <div style="font-size:11px;color:var(--color-text-muted);">${data.provider} → ${data.model}${timeStr}</div>
      </div>
      ${skillChips}
      <div class="llm-response">${typeof marked !== 'undefined' ? marked.parse(data.content) : escapeHtml(data.content)}</div>
      <div class="quality-btns">
        <button class="quality-btn" data-quality="good">${t('llm_good')}</button>
        <button class="quality-btn" data-quality="bad">${t('llm_bad')}</button>
        <button class="quality-btn" data-quality="unclear">${t('llm_unclear')}</button>
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
