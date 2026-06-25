use tauri::AppHandle;
use tauri_plugin_store::StoreExt;
use serde_json::Value;

#[tauri::command]
pub fn save_setting(app: AppHandle, key: String, value: Value) -> Result<(), String> {
    let store = app.store("settings.json").map_err(|e| e.to_string())?;
    store.set(&key, value);
    store.save().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn load_setting(app: AppHandle, key: String) -> Result<Option<Value>, String> {
    let store = app.store("settings.json").map_err(|e| e.to_string())?;
    Ok(store.get(&key))
}
