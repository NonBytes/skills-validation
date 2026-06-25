use reqwest::Client;
use serde::Serialize;

const GITHUB_REPO: &str = "NonBytes/skills-validation";
const CURRENT_VERSION: &str = env!("CARGO_PKG_VERSION");

#[derive(Debug, Serialize)]
pub struct UpdateCheck {
    pub current: String,
    pub latest: String,
    pub has_update: bool,
    pub url: Option<String>,
    pub notes: Option<String>,
}

#[tauri::command]
pub async fn check_for_update() -> Result<UpdateCheck, String> {
    let client = Client::new();
    let resp = client
        .get(format!("https://api.github.com/repos/{GITHUB_REPO}/releases/latest"))
        .header("User-Agent", "skills-validation")
        .header("Accept", "application/vnd.github.v3+json")
        .send()
        .await
        .map_err(|e| format!("Network error: {e}"))?;

    if resp.status().as_u16() == 404 {
        return Ok(UpdateCheck {
            current: CURRENT_VERSION.to_string(),
            latest: CURRENT_VERSION.to_string(),
            has_update: false,
            url: None,
            notes: Some("No releases published yet.".to_string()),
        });
    }

    if !resp.status().is_success() {
        return Err(format!("GitHub API error: {}", resp.status()));
    }

    let body: serde_json::Value = resp.json().await.map_err(|e| format!("Parse error: {e}"))?;

    let latest_tag = body["tag_name"]
        .as_str()
        .unwrap_or("")
        .trim_start_matches('v')
        .to_string();

    let url = body["html_url"].as_str().map(|s| s.to_string());
    let notes = body["body"].as_str().map(|s| s.to_string());

    let has_update = version_newer(&latest_tag, CURRENT_VERSION);

    Ok(UpdateCheck {
        current: CURRENT_VERSION.to_string(),
        latest: latest_tag,
        has_update,
        url,
        notes,
    })
}

fn version_newer(latest: &str, current: &str) -> bool {
    let parse = |v: &str| -> Vec<u32> {
        v.split('.').filter_map(|s| s.parse().ok()).collect()
    };
    let l = parse(latest);
    let c = parse(current);
    for i in 0..l.len().max(c.len()) {
        let lv = l.get(i).copied().unwrap_or(0);
        let cv = c.get(i).copied().unwrap_or(0);
        if lv > cv { return true; }
        if lv < cv { return false; }
    }
    false
}
