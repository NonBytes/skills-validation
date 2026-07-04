# Skill Tester

Standalone Tauri v2 desktop app for testing agent skill files without running the full system.

## What This App Does

The framework has skill files in `skills/` — markdown with YAML frontmatter that get injected into LLM prompts during autonomous penetration testing. This app validates, simulates, and tests those skills offline.

## Skill File Format

Each skill is a `.md` file with YAML frontmatter:

```yaml
---
name: nmap                          # string, REQUIRED, unique slug
description: "Nmap CLI playbook..." # string, REQUIRED
technologies: ["linux", "network"]  # string[], optional
services: ["ssh", "http"]           # string[], optional
ports: [22, 80, 443]                # int[], optional
paths: ["/wp-admin"]                # string[], optional
signals: ["shell_obtained"]         # string[], optional
phases: ["reconnaissance"]          # string[], optional (9 valid values below)
priority: 9                         # int 1-10, optional, default 5
---

# Markdown body — tactical guidance for the AI
```

### Valid Phase Values (9)
`reconnaissance`, `scanning`, `enumeration`, `application_intelligence`, `exploitation`, `credential_access`, `lateral_movement`, `privilege_escalation`, `post_exploitation`

### Validation Rules (from brain-core)
- `name` and `description` are required, non-empty
- `priority` must be 1-10 (out of range coerced to 5)
- At least one trigger category must be populated (technologies, services, ports, paths, signals, or phases)
- Body (after frontmatter) cannot be empty
- `phases` values must be from the 9 valid values
- `scan_modes/` and `coordination/` subdirectories are "excluded categories" — loaded by framework, not operator selection. Still validate them but flag as excluded.

### Trigger Matching Logic (from brain-worker)
Skills match a scenario using OR across categories:
- **technologies/services/paths/signals**: case-insensitive substring match (bidirectional)
- **phases**: case-folded exact match
- **ports**: integer set intersection
- Any single category hit = skill matches

### Skills Directory Structure (13 subdirectories, ~137 files)
```
skills/
├── tooling/          (35) — CLI playbooks: nmap, nuclei, sqlmap, hydra, etc.
├── vulnerabilities/  (24) — Per-vuln: SQLi, XSS, SSRF, IDOR, etc.
├── protocols/        (13) — Protocol attacks: SMB, SSH, LDAP, Kerberos, etc.
├── technologies/     (13) — Tech catalogs: WordPress, Jenkins, Redis, etc.
├── reconnaissance/    (7) — Attack surface mapping
├── post_exploitation/ (6) — Privesc, credential reuse, pivoting
├── cloud/             (5) — AWS, Azure, GCP, Kubernetes
├── coordination/      (4) — Orchestrator discipline [EXCLUDED]
├── scan_modes/        (3) — Mission tempo [EXCLUDED]
├── frameworks/        (3) — FastAPI, NestJS, Next.js
├── databases/         (2) — MySQL, PostgreSQL
├── custom/            (1) — Source-aware SAST
└── reasoning/         (1) — Attack chain patterns
```

## Architecture

```
skills-validation/
├── src-tauri/           # Rust backend
│   └── src/
│       ├── main.rs      # Tauri entry + command registration
│       ├── lib.rs       # Module re-exports
│       ├── skill.rs     # Frontmatter struct, parse, validate
│       ├── loader.rs    # Recursive .md file loader (walkdir)
│       ├── matcher.rs   # Trigger matching (port of brain-worker Go logic)
│       ├── coverage.rs  # Coverage matrix computation
│       ├── llm.rs       # LLM API client (OpenAI/Anthropic/Ollama)
│       ├── constants.rs # Tool list (87), OWASP mapping, valid phases
│       └── commands/    # Tauri IPC commands
│           ├── mod.rs
│           ├── validate.rs
│           ├── match_cmd.rs
│           ├── coverage.rs
│           └── llm.rs
├── src/                 # Frontend (vanilla HTML/JS + Tailwind CSS)
│   ├── index.html       # Shell: sidebar nav + content area
│   ├── styles/
│   │   └── main.css     # Dark theme, Tailwind directives
│   └── js/
│       ├── app.js       # Router, sidebar navigation
│       ├── validate.js  # Lint & validate page
│       ├── matcher.js   # Trigger matching simulator
│       ├── coverage.js  # Coverage matrix page
│       ├── llm.js       # LLM dry-run page
│       └── utils.js     # Shared helpers
├── package.json         # Tailwind CLI only
└── tailwind.config.js
```

## 4 Features to Build

### Feature 1: Frontmatter Lint & Validate
- Directory picker -> load all .md files
- Parse YAML frontmatter, run validation rules
- Summary bar: total/pass/fail/warn with progress bar
- Expandable results table: path, name, status, issues
- Filter by status (all/pass/fail/warn)

### Feature 2: Trigger Matching Simulator
- Input fields: technologies, services, ports, paths, signals (comma-separated tag inputs)
- Phase dropdown (9 options)
- Run match -> show matched skills sorted by priority DESC
- Each result shows which trigger category fired
- Warnings: 0 matches (orange), >20 matches (yellow "too broad")

### Feature 3: Coverage Matrix
- **Phase coverage**: horizontal bar chart -- skills count per phase, gaps in red
- **Tool coverage**: 87 agent tools vs skill names -- covered/missing lists
- **OWASP Top 10**: map vuln skills to categories, highlight uncovered categories
- All rendered with pure CSS (no charting library)

### Feature 4: LLM Dry-Run Test
- Provider selector: OpenAI / Anthropic / Ollama
- API key input (stored via tauri-plugin-store)
- Skill dropdown (from loaded skills)
- Scenario textarea
- Send -> LLM responds with 3 recommended actions
- Markdown rendering (marked.js)
- Quality rating buttons: good/bad/unclear

## Rust Crates
- `tauri` 2.x
- `serde`, `serde_json`, `serde_yaml`
- `regex` (frontmatter delimiter)
- `walkdir` (directory traversal)
- `reqwest` (LLM API calls, feature `rustls-tls`)
- `tokio` (async, already Tauri dep)
- `tauri-plugin-dialog` (folder picker)
- `tauri-plugin-store` (encrypted settings)

## UI Design
- Dark OLED theme (#0a0a0a background)
- Sidebar: 220px fixed, purple accent (#7c3aed) for active item
- Fonts: system-ui (or Space Grotesk for headings if available)
- Status colors: green=pass, red=fail, yellow=warn
- Transitions: 0.15s ease

## Source Files to Reference
- `brain-worker/internal/domain/skill.go` -- `Matches()`, `anySubstringHit()`, `containsFold()`, `anyIntHit()`
- `brain-core/internal/service/skill_file_loader.go` -- `parseFrontmatter()`, validation rules
- `agent/internal/adapter/tool_info.go` -- tool names for coverage matrix
- `ui/src/theme/index.ts` -- dark theme tokens

## OWASP Top 10 -> Skill Mapping
| Category | Skills |
|----------|--------|
| A01 Broken Access Control | idor, broken-function-level-authorization, mass-assignment, path-traversal-lfi-rfi |
| A02 Cryptographic Failures | tls-testing |
| A03 Injection | sql-injection, nosql-injection, xss, ssti, xxe, header-injection |
| A04 Insecure Design | business-logic, race-conditions |
| A05 Security Misconfiguration | information-disclosure, open-redirect |
| A06 Vulnerable Components | (GAP -- no direct skill) |
| A07 Auth Failures | authentication-jwt, authentication-cheap-alternatives, oauth-oidc, csrf |
| A08 Data Integrity Failures | deserialization, insecure-file-uploads |
| A09 Logging Failures | (GAP -- no direct skill) |
| A10 SSRF | ssrf, http-request-smuggling, subdomain-takeover |

## Implementation Order
1. Scaffold Tauri v2 project + Tailwind + dark theme sidebar
2. Rust: skill.rs (parse + validate) + loader.rs + validate command
3. Frontend: validate page
4. Rust: matcher.rs + match command
5. Frontend: matcher page
6. Rust: constants.rs + coverage.rs + coverage command
7. Frontend: coverage page
8. Rust: llm.rs + llm command
9. Frontend: LLM page
10. Polish: error handling, loading states

## Build & Run
```bash
# Dev mode
npm install          # Tailwind only
cargo tauri dev      # Launches app with hot-reload

# Production build
cargo tauri build    # .dmg (macOS) / .msi (Windows)
```

## Testing
1. Load `skills/` -> all files parse
2. Scenario `{technologies: ["wordpress"], phase: "exploitation"}` -> matches wordpress, wpscan, gobuster, nikto
3. Coverage shows OWASP A06, A09 as gaps
4. LLM dry-run with Ollama returns actionable plan
