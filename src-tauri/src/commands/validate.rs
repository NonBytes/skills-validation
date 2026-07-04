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
    pub ref_results: Vec<RefFileResult>,
}

#[derive(Debug, Serialize)]
pub struct LoadError {
    pub path: String,
    pub error: String,
}

#[derive(Debug, Serialize)]
pub struct RefFileResult {
    pub path: String,
    pub name: String,
    pub status: String,
    pub issues: Vec<String>,
}

fn validate_ref_file(path: &str, content: &str) -> RefFileResult {
    let name = std::path::Path::new(path)
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or(path)
        .to_string();

    let mut issues = Vec::new();

    if content.trim().is_empty() {
        issues.push("Empty file".into());
    } else if !content.lines().any(|l| l.starts_with('#')) {
        issues.push("No markdown headings found".into());
    }

    let status = if issues.iter().any(|i: &String| i == "Empty file") {
        "fail"
    } else if !issues.is_empty() {
        "warn"
    } else {
        "pass"
    };

    RefFileResult { path: path.to_string(), name, status: status.into(), issues }
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

    let ref_results: Vec<RefFileResult> = load_result
        .ref_files
        .iter()
        .map(|(path, content)| validate_ref_file(path, content))
        .collect();

    Ok(ValidateResponse {
        total: results.len() + load_errors.len(),
        pass,
        fail,
        warn,
        results,
        load_errors,
        ref_results,
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
        ref_results: Vec::new(),
    })
}
