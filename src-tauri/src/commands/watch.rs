use notify::{Config, RecommendedWatcher, RecursiveMode, Watcher, Event, EventKind};
use std::path::Path;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter};

static WATCHER: Mutex<Option<RecommendedWatcher>> = Mutex::new(None);

#[tauri::command]
pub fn watch_directory(app: AppHandle, directory: String) -> Result<(), String> {
    stop_watching_inner();

    let app_clone = app.clone();
    let mut watcher = RecommendedWatcher::new(
        move |res: Result<Event, notify::Error>| {
            if let Ok(event) = res {
                let has_md = event.paths.iter().any(|p| {
                    p.extension().map_or(false, |e| e == "md")
                });
                if has_md && matches!(event.kind, EventKind::Modify(_) | EventKind::Create(_) | EventKind::Remove(_)) {
                    let changed: Vec<String> = event.paths.iter()
                        .filter(|p| p.extension().map_or(false, |e| e == "md"))
                        .map(|p| p.to_string_lossy().to_string())
                        .collect();
                    let _ = app_clone.emit("skills-changed", changed);
                }
            }
        },
        Config::default(),
    ).map_err(|e| format!("Watch error: {e}"))?;

    watcher.watch(Path::new(&directory), RecursiveMode::Recursive)
        .map_err(|e| format!("Watch error: {e}"))?;

    *WATCHER.lock().unwrap() = Some(watcher);
    Ok(())
}

#[tauri::command]
pub fn stop_watching() -> Result<(), String> {
    stop_watching_inner();
    Ok(())
}

fn stop_watching_inner() {
    let mut guard = WATCHER.lock().unwrap();
    *guard = None;
}
