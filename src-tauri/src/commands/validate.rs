use serde::Serialize;
use crate::loader::{load_skills_from_directory, load_single_skill};
use crate::skill::validate_skill;
use crate::skill::ValidationResult;

#[derive(Debug, Serialize)]
pub struct ValidateResponse {
    pub total: usize,
    pub pass: usize,
    pub fail: usize,
    pub warn: usize,
    pub results: Vec<ValidationResult>,
    pub load_errors: Vec<LoadError>,
}

#[derive(Debug, Serialize)]
pub struct LoadError {
    pub path: String,
    pub error: String,
}

#[tauri::command]
pub fn validate_skills(directory: String) -> Result<ValidateResponse, String> {
    let load_result = load_skills_from_directory(&directory);

    let results: Vec<ValidationResult> = load_result
        .skills
        .iter()
        .map(|s| validate_skill(s))
        .collect();

    let pass = results.iter().filter(|r| r.status == "pass").count();
    let fail = results.iter().filter(|r| r.status == "fail").count();
    let warn = results.iter().filter(|r| r.status == "warn").count();

    let load_errors: Vec<LoadError> = load_result
        .errors
        .into_iter()
        .map(|(path, error)| LoadError { path, error })
        .collect();

    Ok(ValidateResponse {
        total: results.len() + load_errors.len(),
        pass,
        fail,
        warn,
        results,
        load_errors,
    })
}

#[tauri::command]
pub fn validate_single_file(file_path: String) -> Result<ValidateResponse, String> {
    let load_result = load_single_skill(&file_path);

    let results: Vec<ValidationResult> = load_result
        .skills
        .iter()
        .map(|s| validate_skill(s))
        .collect();

    let pass = results.iter().filter(|r| r.status == "pass").count();
    let fail = results.iter().filter(|r| r.status == "fail").count();
    let warn = results.iter().filter(|r| r.status == "warn").count();

    let load_errors: Vec<LoadError> = load_result
        .errors
        .into_iter()
        .map(|(path, error)| LoadError { path, error })
        .collect();

    Ok(ValidateResponse {
        total: results.len() + load_errors.len(),
        pass,
        fail,
        warn,
        results,
        load_errors,
    })
}
