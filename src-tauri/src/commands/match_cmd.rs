use serde::Serialize;
use crate::loader::{load_skills_from_directory, load_single_skill};
use crate::matcher::{match_skills, MatchResult, Scenario};

#[derive(Debug, Serialize)]
pub struct MatchResponse {
    pub matches: Vec<MatchResult>,
    pub total_skills: usize,
    pub warning: Option<String>,
}

#[tauri::command]
pub fn match_scenario(directory: String, scenario: Scenario) -> Result<MatchResponse, String> {
    let load_result = load_skills_from_directory(&directory);
    let results = match_skills(&load_result.skills, &scenario);

    let warning = if results.is_empty() {
        Some("No skills matched this scenario".to_string())
    } else if results.len() > 20 {
        Some(format!("{} matches — scenario may be too broad", results.len()))
    } else {
        None
    };

    Ok(MatchResponse {
        matches: results,
        total_skills: load_result.skills.len(),
        warning,
    })
}

#[tauri::command]
pub fn match_scenario_file(file_path: String, scenario: Scenario) -> Result<MatchResponse, String> {
    let load_result = load_single_skill(&file_path);
    let results = match_skills(&load_result.skills, &scenario);

    let warning = if results.is_empty() {
        Some("Skill did not match this scenario".to_string())
    } else {
        None
    };

    Ok(MatchResponse {
        matches: results,
        total_skills: load_result.skills.len(),
        warning,
    })
}
