#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use skills_validation_lib::commands;

#[tauri::command]
fn get_default_skills_dir() -> Option<String> {
    let manifest = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let project_root = manifest.parent()?;
    let skills_dir = project_root.join("skills");
    if skills_dir.is_dir() {
        return Some(skills_dir.to_string_lossy().to_string());
    }
    let cwd = std::env::current_dir().ok()?;
    for ancestor in cwd.ancestors() {
        let candidate = ancestor.join("skills");
        if candidate.is_dir() && candidate.join("tooling").is_dir() {
            return Some(candidate.to_string_lossy().to_string());
        }
    }
    None
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            commands::validate::validate_skills,
            commands::validate::validate_single_file,
            commands::match_cmd::match_scenario,
            commands::match_cmd::match_scenario_file,
            commands::coverage::get_coverage,
            commands::llm::llm_dry_run,
            commands::llm::llm_dry_run_file,
            commands::llm::get_ollama_models,
            commands::llm::get_lmstudio_models,
            commands::llm::get_anythingllm_models,
            commands::fix::preview_fix,
            commands::fix::fix_skill,
            commands::watch::watch_directory,
            commands::watch::stop_watching,
            commands::read_file::read_skill_file,
            commands::settings::save_setting,
            commands::settings::load_setting,
            get_default_skills_dir,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
