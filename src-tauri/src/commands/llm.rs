use crate::llm::{send_llm_request, list_ollama_models, list_openai_compat_models, LlmConfig, LlmResponse, ModelInfo};
use crate::loader::{load_skills_from_directory, load_single_skill};
use crate::skill::Skill;

const MAX_MATCHED_SKILLS: usize = 5;

// Word-boundary check: keyword must not be flanked by alphanumeric chars.
// Prevents "ad" matching "admin", "uploads", etc.
fn word_in_text(text: &str, keyword: &str) -> bool {
    if keyword.len() < 5 {
        return false;
    }
    let text_bytes = text.as_bytes();
    let kw_bytes = keyword.as_bytes();
    let mut start = 0;
    while start + kw_bytes.len() <= text_bytes.len() {
        if let Some(rel) = text[start..].find(keyword) {
            let abs = start + rel;
            let pre_ok = abs == 0 || !text_bytes[abs - 1].is_ascii_alphanumeric();
            let end = abs + kw_bytes.len();
            let post_ok = end >= text_bytes.len() || !text_bytes[end].is_ascii_alphanumeric();
            if pre_ok && post_ok {
                return true;
            }
            start = abs + 1;
        } else {
            break;
        }
    }
    false
}

fn skill_matches_scenario(skill: &Skill, scenario_lower: &str) -> bool {
    let fm = &skill.frontmatter;

    // Check skill name (also try hyphen→space variant for multi-word names)
    if let Some(ref name) = fm.name {
        let n = name.to_lowercase();
        if word_in_text(scenario_lower, &n) || word_in_text(scenario_lower, &n.replace('-', " ")) {
            return true;
        }
    }

    let check = |list: &Vec<String>| -> bool {
        list.iter().any(|kw| {
            let k = kw.to_lowercase();
            word_in_text(scenario_lower, &k) || word_in_text(scenario_lower, &k.replace('-', " "))
        })
    };

    check(&fm.technologies) || check(&fm.services) || check(&fm.paths) || check(&fm.signals)
}

fn auto_match(skills: &[Skill], scenario: &str) -> Vec<usize> {
    let scenario_lower = scenario.to_lowercase();

    let ports: Vec<u16> = scenario
        .split(|c: char| !c.is_ascii_digit())
        .filter_map(|s| s.parse::<u16>().ok())
        .filter(|&p| p > 0)
        .collect();

    let mut scored: Vec<(usize, u8)> = skills
        .iter()
        .enumerate()
        .filter_map(|(i, skill)| {
            let port_hit = skill.frontmatter.ports.iter().any(|p| ports.contains(p));
            if port_hit || skill_matches_scenario(skill, &scenario_lower) {
                Some((i, skill.frontmatter.priority as u8))
            } else {
                None
            }
        })
        .collect();

    scored.sort_by(|a, b| b.1.cmp(&a.1));
    scored.iter().take(MAX_MATCHED_SKILLS).map(|(i, _)| *i).collect()
}

#[tauri::command]
pub async fn llm_dry_run(
    directory: String,
    scenario: String,
    config: LlmConfig,
) -> Result<LlmResponse, String> {
    let load_result = load_skills_from_directory(&directory);
    let skills = &load_result.skills;

    let indices = auto_match(skills, &scenario);
    let pairs: Vec<(&str, &str)> = indices.iter()
        .map(|&i| (skills[i].frontmatter.name.as_deref().unwrap_or("skill"), skills[i].body.as_str()))
        .collect();
    let names: Vec<String> = indices.iter()
        .filter_map(|&i| skills[i].frontmatter.name.clone())
        .collect();

    send_llm_request(&config, &pairs, &scenario, names).await
}

#[tauri::command]
pub async fn llm_dry_run_file(
    file_path: String,
    scenario: String,
    config: LlmConfig,
) -> Result<LlmResponse, String> {
    let load_result = load_single_skill(&file_path);
    let skills = &load_result.skills;
    if skills.is_empty() {
        return Err(format!("Failed to load skill from '{file_path}'"));
    }

    let pairs: Vec<(&str, &str)> = skills.iter()
        .map(|s| (s.frontmatter.name.as_deref().unwrap_or("skill"), s.body.as_str()))
        .collect();
    let names: Vec<String> = skills.iter()
        .filter_map(|s| s.frontmatter.name.clone())
        .collect();

    send_llm_request(&config, &pairs, &scenario, names).await
}

#[tauri::command]
pub async fn get_ollama_models() -> Result<Vec<ModelInfo>, String> {
    list_ollama_models(None).await
}

#[tauri::command]
pub async fn get_lmstudio_models() -> Result<Vec<ModelInfo>, String> {
    list_openai_compat_models("http://localhost:1234/v1", None).await
}

#[tauri::command]
pub async fn get_anythingllm_models(api_key: Option<String>) -> Result<Vec<ModelInfo>, String> {
    list_openai_compat_models("http://localhost:3001/api/v1", api_key.as_deref()).await
}
