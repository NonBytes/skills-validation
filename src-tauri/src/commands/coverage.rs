use crate::coverage::{compute_coverage, CoverageReport};
use crate::loader::load_skills_from_directory;

#[tauri::command]
pub fn get_coverage(directory: String) -> Result<CoverageReport, String> {
    let load_result = load_skills_from_directory(&directory);
    Ok(compute_coverage(&load_result.skills))
}
