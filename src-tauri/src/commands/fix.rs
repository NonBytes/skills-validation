use serde::Serialize;
use crate::fixer;

#[derive(Debug, Serialize)]
pub struct FixResponse {
    pub fixed: bool,
    pub changes: Vec<String>,
}

#[tauri::command]
pub fn preview_fix(file_path: String) -> Result<FixResponse, String> {
    let result = fixer::preview_skill_file(&file_path)?;
    Ok(FixResponse {
        fixed: result.fixed,
        changes: result.changes,
    })
}

#[tauri::command]
pub fn fix_skill(file_path: String) -> Result<FixResponse, String> {
    let result = fixer::fix_skill_file(&file_path)?;
    Ok(FixResponse {
        fixed: result.fixed,
        changes: result.changes,
    })
}
