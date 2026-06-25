use crate::llm::{send_llm_request, list_ollama_models, list_openai_compat_models, LlmConfig, LlmResponse, ModelInfo};
use crate::loader::{load_skills_from_directory, load_single_skill};

#[tauri::command]
pub async fn llm_dry_run(
    directory: String,
    skill_name: String,
    scenario: String,
    config: LlmConfig,
) -> Result<LlmResponse, String> {
    let load_result = load_skills_from_directory(&directory);

    let skill = load_result
        .skills
        .iter()
        .find(|s| s.frontmatter.name.as_deref() == Some(&skill_name))
        .ok_or_else(|| format!("Skill '{skill_name}' not found"))?;

    send_llm_request(&config, &skill_name, &skill.body, &scenario).await
}

#[tauri::command]
pub async fn llm_dry_run_file(
    file_path: String,
    skill_name: String,
    scenario: String,
    config: LlmConfig,
) -> Result<LlmResponse, String> {
    let load_result = load_single_skill(&file_path);

    let skill = load_result
        .skills
        .into_iter()
        .next()
        .ok_or_else(|| format!("Failed to load skill from '{file_path}'"))?;

    send_llm_request(&config, &skill_name, &skill.body, &scenario).await
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
