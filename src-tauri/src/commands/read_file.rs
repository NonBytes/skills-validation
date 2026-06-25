use std::fs;

#[tauri::command]
pub fn read_skill_file(file_path: String) -> Result<String, String> {
    fs::read_to_string(&file_path).map_err(|e| format!("Read error: {e}"))
}
