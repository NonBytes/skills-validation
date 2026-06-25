use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Debug, Clone, Deserialize)]
pub struct LlmConfig {
    pub provider: String,
    pub api_key: Option<String>,
    pub model: Option<String>,
    pub base_url: Option<String>,
    #[serde(default = "default_language")]
    pub language: String,
}

fn default_language() -> String { "en".to_string() }

#[derive(Debug, Clone, Serialize)]
pub struct LlmResponse {
    pub content: String,
    pub model: String,
    pub provider: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct ModelInfo {
    pub name: String,
    pub size: String,
}

pub async fn list_ollama_models(base_url: Option<&str>) -> Result<Vec<ModelInfo>, String> {
    let base = base_url.unwrap_or("http://localhost:11434");
    let client = Client::new();
    let resp = client
        .get(format!("{base}/api/tags"))
        .send()
        .await
        .map_err(|e| format!("Ollama not reachable: {e}"))?;

    let body: serde_json::Value = resp.json().await.map_err(|e| format!("Parse error: {e}"))?;

    let models = body["models"]
        .as_array()
        .unwrap_or(&vec![])
        .iter()
        .map(|m| {
            let size_bytes = m["size"].as_u64().unwrap_or(0);
            let size_gb = size_bytes as f64 / 1_073_741_824.0;
            ModelInfo {
                name: m["name"].as_str().unwrap_or("unknown").to_string(),
                size: format!("{:.1}GB", size_gb),
            }
        })
        .collect();

    Ok(models)
}

pub async fn list_openai_compat_models(base_url: &str, api_key: Option<&str>) -> Result<Vec<ModelInfo>, String> {
    let client = Client::new();
    let mut req = client.get(format!("{base_url}/models"));
    if let Some(key) = api_key {
        if !key.is_empty() {
            req = req.header("Authorization", format!("Bearer {key}"));
        }
    }

    let resp = req.send().await.map_err(|e| format!("Not reachable: {e}"))?;
    let body: serde_json::Value = resp.json().await.map_err(|e| format!("Parse error: {e}"))?;

    let models = body["data"]
        .as_array()
        .unwrap_or(&vec![])
        .iter()
        .map(|m| ModelInfo {
            name: m["id"].as_str().unwrap_or("unknown").to_string(),
            size: String::new(),
        })
        .collect();

    Ok(models)
}

pub async fn send_llm_request(
    config: &LlmConfig,
    skill_name: &str,
    skill_body: &str,
    scenario: &str,
) -> Result<LlmResponse, String> {
    let lang_instruction = match config.language.as_str() {
        "th" => "Respond entirely in Thai. Use Thai for explanations but keep tool commands and code in English.",
        _ => "Respond in English.",
    };
    let system_prompt = format!(
        "You are an offensive security AI assistant testing skill: {skill_name}.\n\
         Given the skill guidance and a target scenario, recommend exactly 3 concrete actions \
         the operator should take. Be specific with tool commands and flags.\n\
         {lang_instruction}\n\n\
         ## Skill Guidance\n{skill_body}"
    );
    let user_prompt = format!("Target scenario:\n{scenario}\n\nRecommend 3 actions:");

    match config.provider.as_str() {
        "openai" => call_openai_compat(config, &system_prompt, &user_prompt,
            "https://api.openai.com/v1", "gpt-4o-mini", true).await,
        "lmstudio" => call_openai_compat(config, &system_prompt, &user_prompt,
            "http://localhost:1234/v1", "default", false).await,
        "anythingllm" => call_openai_compat(config, &system_prompt, &user_prompt,
            "http://localhost:3001/api/v1", "default", false).await,
        "anthropic" => call_anthropic(config, &system_prompt, &user_prompt).await,
        "ollama" => call_ollama(config, &system_prompt, &user_prompt).await,
        other => Err(format!("Unknown provider: {other}")),
    }
}

async fn call_openai_compat(
    config: &LlmConfig,
    system: &str,
    user: &str,
    default_base: &str,
    default_model: &str,
    require_key: bool,
) -> Result<LlmResponse, String> {
    let api_key = config.api_key.as_deref().unwrap_or("");
    if require_key && api_key.is_empty() {
        return Err(format!("{} API key required", config.provider));
    }
    let model = config.model.as_deref().unwrap_or(default_model);
    let base = config.base_url.as_deref().unwrap_or(default_base);

    let client = Client::new();
    let mut req = client
        .post(format!("{base}/chat/completions"))
        .json(&json!({
            "model": model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user}
            ],
            "max_tokens": 1024
        }));

    if !api_key.is_empty() {
        req = req.header("Authorization", format!("Bearer {api_key}"));
    }

    let resp = req.send().await.map_err(|e| format!("Request failed: {e}"))?;
    let body: serde_json::Value = resp.json().await.map_err(|e| format!("Parse error: {e}"))?;

    let content = body["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or("No response")
        .to_string();

    Ok(LlmResponse {
        content,
        model: model.to_string(),
        provider: config.provider.clone(),
    })
}

async fn call_anthropic(
    config: &LlmConfig,
    system: &str,
    user: &str,
) -> Result<LlmResponse, String> {
    let api_key = config.api_key.as_deref().ok_or("Anthropic API key required")?;
    let model = config.model.as_deref().unwrap_or("claude-sonnet-4-20250514");

    let client = Client::new();
    let resp = client
        .post("https://api.anthropic.com/v1/messages")
        .header("x-api-key", api_key)
        .header("anthropic-version", "2023-06-01")
        .header("content-type", "application/json")
        .json(&json!({
            "model": model,
            "max_tokens": 1024,
            "system": system,
            "messages": [{"role": "user", "content": user}]
        }))
        .send()
        .await
        .map_err(|e| format!("Request failed: {e}"))?;

    let body: serde_json::Value = resp.json().await.map_err(|e| format!("Parse error: {e}"))?;

    let content = body["content"][0]["text"]
        .as_str()
        .unwrap_or("No response")
        .to_string();

    Ok(LlmResponse {
        content,
        model: model.to_string(),
        provider: "anthropic".to_string(),
    })
}

async fn call_ollama(
    config: &LlmConfig,
    system: &str,
    user: &str,
) -> Result<LlmResponse, String> {
    let model = config.model.as_deref().unwrap_or("llama3.1");
    let base = config.base_url.as_deref().unwrap_or("http://localhost:11434");

    let client = Client::new();
    let resp = client
        .post(format!("{base}/api/chat"))
        .json(&json!({
            "model": model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user}
            ],
            "stream": false
        }))
        .send()
        .await
        .map_err(|e| format!("Request failed: {e}"))?;

    let body: serde_json::Value = resp.json().await.map_err(|e| format!("Parse error: {e}"))?;

    let content = body["message"]["content"]
        .as_str()
        .unwrap_or("No response")
        .to_string();

    Ok(LlmResponse {
        content,
        model: model.to_string(),
        provider: "ollama".to_string(),
    })
}
