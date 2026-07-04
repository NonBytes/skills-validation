# Architecture

Last updated: 2026-07-05

## High-Level Flow

```
User (Tauri UI)
  ↓  invoke("command", args)
Tauri IPC (commands/)
  ↓
Rust backend (skill.rs / loader.rs / matcher.rs / coverage.rs / llm.rs)
  ↓
File system (.md files) / External APIs (LLM providers)
```

## Core Modules

| Area | File | Responsibility |
|------|------|----------------|
| Entry | `src-tauri/src/main.rs` | Tauri builder + register all commands |
| Re-exports | `src-tauri/src/lib.rs` | Module re-exports + unit tests |
| Skill model | `src-tauri/src/skill.rs` | `SkillFrontmatter` struct, YAML parse, validate, `ValidationResult` |
| File loading | `src-tauri/src/loader.rs` | Recursive `.md` walk (walkdir), single-file load, `LoadResult` |
| Matching | `src-tauri/src/matcher.rs` | `match_skills()`, `Scenario` struct, OR-match across 6 categories |
| Coverage | `src-tauri/src/coverage.rs` | Phase bars, OWASP/MITRE/CWE/PTES maps, tool coverage |
| Auto-fix | `src-tauri/src/fixer.rs` | Edit-distance phase correction, priority coercion, diff preview |
| LLM client | `src-tauri/src/llm.rs` | `send_llm_request()`, 5 provider adapters, `LlmResponse` |
| Constants | `src-tauri/src/constants.rs` | 87 tool names, OWASP map, valid phases |
| IPC commands | `src-tauri/src/commands/` | Tauri `#[tauri::command]` wrappers |

### Commands subdirectory

| File | Commands |
|------|----------|
| `validate.rs` | `validate_skills`, `validate_single_file` |
| `match_cmd.rs` | `match_scenario`, `match_scenario_file` |
| `coverage.rs` | `get_coverage` |
| `llm.rs` | `llm_dry_run`, `llm_dry_run_file`, `get_ollama_models`, `get_lmstudio_models`, `get_anythingllm_models` |
| `fix.rs` | `preview_fix`, `fix_skill` |
| `watch.rs` | `watch_directory`, `stop_watching` |
| `read_file.rs` | `read_skill_file` |
| `settings.rs` | `save_setting`, `load_setting` |

## Frontend Structure

```
src/
├── index.html          # Shell: topbar + sidebar + content-area
├── styles/main.css     # Source CSS (Tailwind directives + custom)
├── styles/output.css   # Build output (gitignored, generated)
└── js/
    ├── app.js          # Router, sidebar nav, updateTopbarTitle()
    ├── i18n.js         # t(), setLang(), translateIssue/Suggestion/RefIssue()
    ├── utils.js        # applyTheme(), toggleTheme(), invoke wrappers
    ├── validate.js     # Validate page: render results, auto-fix modal
    ├── matcher.js      # Matcher page: tag inputs, run match
    ├── coverage.js     # Coverage page: bar charts, OWASP/tool grids
    └── llm.js          # LLM page: LLM_EXAMPLES, optgroups, auto-match display
```

## Data Model Notes

- **`SkillFrontmatter`**: `name: Option<String>`, `description: Option<String>`, `technologies: Vec<String>`, `services: Vec<String>`, `ports: Vec<u16>`, `paths: Vec<String>`, `signals: Vec<String>`, `phases: Vec<String>`, `priority: i32`
- All trigger fields default to empty `Vec` (not `Option`) via `#[serde(default)]`
- `priority` defaults to 5 when missing; coerced if out-of-range [1, 10]

## Key Boundaries

- **auto_match** (in `commands/llm.rs`) uses its own word-boundary matching — does NOT reuse `match_skills()` from `matcher.rs`. Rationale: free-text input requires different precision than structured `Scenario` matching. See `SIGNALS.md`.
- **LLM skill context** is capped at 800 chars per skill body before injection into the system prompt to avoid context overflow on local models.
- **Excluded categories**: `scan_modes/` and `coordination/` subdirs are loaded and validated but flagged as excluded in results.
