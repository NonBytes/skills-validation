use crate::llm::{send_llm_request, list_ollama_models, list_openai_compat_models, LlmConfig, LlmResponse, ModelInfo};
use crate::loader::{load_skills_from_directory, load_single_skill};
use crate::matcher::{match_skills, Scenario};
use crate::skill::Skill;

const MAX_MATCHED_SKILLS: usize = 5;

fn auto_match(skills: &[Skill], scenario: &str) -> Vec<usize> {
    // Extract port numbers from scenario text
    let ports: Vec<u16> = scenario
        .split(|c: char| !c.is_ascii_digit())
        .filter_map(|s| s.parse::<u16>().ok())
        .filter(|&p| p > 0 && p <= 65535)
        .collect();

    // Use the full scenario text as a single "technology" token —
    // the matcher's anySubstringHit does bidirectional substring matching,
    // so any skill keyword that appears in the scenario text will fire.
    let sc = Scenario {
        technologies: vec![scenario.to_string()],
        services: vec![scenario.to_string()],
        paths: vec![scenario.to_string()],
        signals: vec![],
        ports,
        phase: None,
    };

    let results = match_skills(skills, &sc);
    results.iter().take(MAX_MATCHED_SKILLS).filter_map(|r| {
        skills.iter().position(|s| s.frontmatter.name.as_deref() == Some(r.skill_name.as_str()))
    }).collect()
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
