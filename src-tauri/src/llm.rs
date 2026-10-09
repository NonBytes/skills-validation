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
    pub matched_skills: Vec<String>,
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

pub async fn list_anthropic_models(api_key: &str) -> Result<Vec<ModelInfo>, String> {
    if api_key.is_empty() {
        return Err("Anthropic API key required".to_string());
    }
    let client = Client::new();
    let resp = client
        .get("https://api.anthropic.com/v1/models")
        .header("x-api-key", api_key)
        .header("anthropic-version", "2023-06-01")
        .send()
        .await
        .map_err(|e| format!("Request failed: {e}"))?;

    let body: serde_json::Value = resp.json().await.map_err(|e| format!("Parse error: {e}"))?;

    let data = body["data"].as_array().ok_or_else(|| {
        body["error"]["message"]
            .as_str()
            .unwrap_or("Unexpected response from Anthropic")
            .to_string()
    })?;

    let models = data
        .iter()
        .map(|m| ModelInfo {
            name: m["id"].as_str().unwrap_or("unknown").to_string(),
            size: String::new(),
        })
        .collect();

    Ok(models)
}

// OpenCode's local server (`opencode serve`) is NOT OpenAI-compatible -- it has
// its own session/message API. Model list comes from GET /api/model, and each
// entry needs both providerID and modelID to send a prompt, so we encode the
// model value as "providerID/modelID" for the UI to round-trip unchanged.
pub async fn list_opencode_models(base_url: Option<&str>) -> Result<Vec<ModelInfo>, String> {
    let base = base_url.unwrap_or("http://localhost:4096");
    let client = Client::new();
    let resp = client
        .get(format!("{base}/api/model"))
        .send()
        .await
        .map_err(|e| format!("OpenCode not reachable: {e}"))?;

    let body: serde_json::Value = resp.json().await.map_err(|e| format!("Parse error: {e}"))?;

    let models = body["data"]
        .as_array()
        .unwrap_or(&vec![])
        .iter()
        .filter(|m| {
            m["enabled"].as_bool().unwrap_or(true)
                && m["status"].as_str() != Some("deprecated")
        })
        .map(|m| {
            let provider_id = m["providerID"].as_str().unwrap_or("opencode");
            let model_id = m["id"].as_str().unwrap_or("unknown");
            ModelInfo {
                name: format!("{provider_id}/{model_id}"),
                size: String::new(),
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
    skills: &[(&str, &str)],  // (name, body) pairs
    scenario: &str,
    matched_skill_names: Vec<String>,
) -> Result<LlmResponse, String> {
    let lang_instruction = match config.language.as_str() {
        "th" => "Respond entirely in Thai. Use Thai for explanations but keep tool commands and code in English.",
        _ => "Respond in English.",
    };

    // Cap each skill body at 800 chars to avoid overflowing local model context windows
    const MAX_BODY_CHARS: usize = 800;
    let skill_context = if skills.is_empty() {
        String::new()
    } else {
        skills.iter().map(|(name, body)| {
            let truncated = if body.len() > MAX_BODY_CHARS {
                &body[..MAX_BODY_CHARS]
            } else {
                body
            };
            format!("## Skill: {name}\n{truncated}")
        }).collect::<Vec<_>>().join("\n\n")
    };

    let system_prompt = if skill_context.is_empty() {
        format!(
            "You are an offensive security AI assistant. Given a target scenario, recommend \
             exactly 3 concrete actions the operator should take. Be specific with tool commands and flags.\n\
             {lang_instruction}"
        )
    } else {
        format!(
            "You are an offensive security AI assistant. The following skill playbooks have been \
             automatically matched to the scenario. Use their guidance to recommend exactly 3 concrete \
             actions the operator should take. Be specific with tool commands and flags.\n\
             {lang_instruction}\n\n{skill_context}"
        )
    };
    let user_prompt = format!("Target scenario:\n{scenario}\n\nRecommend 3 actions:");

    let mut response = match config.provider.as_str() {
        "openai" => call_openai_compat(config, &system_prompt, &user_prompt,
            "https://api.openai.com/v1", "gpt-4o-mini", true).await,
        "lmstudio" => call_openai_compat(config, &system_prompt, &user_prompt,
            "http://localhost:1234/v1", "default", false).await,
        "anythingllm" => call_openai_compat(config, &system_prompt, &user_prompt,
            "http://localhost:3001/api/v1", "default", false).await,
        "opencode" => call_opencode(config, &system_prompt, &user_prompt).await,
        "openrouter" => call_openai_compat(config, &system_prompt, &user_prompt,
            "https://openrouter.ai/api/v1", "openrouter/auto", true).await,
        "anthropic" => call_anthropic(config, &system_prompt, &user_prompt).await,
        "ollama" => call_ollama(config, &system_prompt, &user_prompt).await,
        other => Err(format!("Unknown provider: {other}")),
    }?;
    response.matched_skills = matched_skill_names;
    Ok(response)
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
    if base.contains("openrouter.ai") {
        // Recommended (not required) by OpenRouter for their leaderboards/rankings.
        req = req
            .header("HTTP-Referer", "https://github.com/NonBytes/skills-validation")
            .header("X-Title", "Skill Tester");
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
        matched_skills: vec![],
    })
}

async fn call_anthropic(
    config: &LlmConfig,
    system: &str,
    user: &str,
) -> Result<LlmResponse, String> {
    let api_key = config.api_key.as_deref().ok_or("Anthropic API key required")?;
    let model = config.model.as_deref().unwrap_or("claude-sonnet-5-5");

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
        matched_skills: vec![],
    })
}

async fn call_opencode(
    config: &LlmConfig,
    system: &str,
    user: &str,
) -> Result<LlmResponse, String> {
    let base = config.base_url.as_deref().unwrap_or("http://localhost:4096");
    let model_str = config.model.as_deref().unwrap_or("opencode/big-pickle");
    let (provider_id, model_id) = model_str.split_once('/').ok_or_else(|| {
        format!("OpenCode model must be \"providerID/modelID\", got \"{model_str}\"")
    })?;

    let client = Client::new();

    // 1. Create a session.
    let session: serde_json::Value = client
        .post(format!("{base}/session"))
        .send()
        .await
        .map_err(|e| format!("OpenCode not reachable: {e}"))?
        .json()
        .await
        .map_err(|e| format!("OpenCode session create failed: {e}"))?;
    let session_id = session["id"]
        .as_str()
        .ok_or("OpenCode session create returned no id")?
        .to_string();

    // 2. Send the prompt to that session (synchronous legacy endpoint).
    let resp = client
        .post(format!("{base}/session/{session_id}/message"))
        .json(&json!({
            "model": {"providerID": provider_id, "modelID": model_id},
            "system": system,
            "parts": [{"type": "text", "text": user}]
        }))
        .send()
        .await
        .map_err(|e| format!("Request failed: {e}"))?;
    let body: serde_json::Value = resp.json().await.map_err(|e| format!("Parse error: {e}"))?;

    // OpenCode can reject the request in two different shapes, neither of
    // which is an HTTP error status:
    //   1. a model-level error nested in a successful-looking session
    //      response: info.error.data.message (e.g. deprecated model)
    //   2. a top-level server error: {"name": "...Error", "data": {"message": ...}}
    //      (e.g. the session/message call itself blew up server-side)
    // Check both before treating a text-less response as merely empty.
    let err_msg = body["info"]["error"]["data"]["message"].as_str()
        .or_else(|| {
            if body["name"].as_str().is_some_and(|n| n.ends_with("Error")) {
                body["data"]["message"].as_str()
            } else {
                None
            }
        });
    if let Some(err_msg) = err_msg {
        let _ = client.delete(format!("{base}/session/{session_id}")).send().await;
        return Err(format!("OpenCode: {err_msg}"));
    }

    let content = body["parts"]
        .as_array()
        .unwrap_or(&vec![])
        .iter()
        .filter(|p| p["type"].as_str() == Some("text"))
        .filter_map(|p| p["text"].as_str())
        .collect::<Vec<_>>()
        .join("");
    let content = if content.is_empty() {
        format!("No response (raw: {})", &body.to_string()[..body.to_string().len().min(200)])
    } else {
        content
    };

    // 3. Best-effort session cleanup -- don't fail the whole call over this.
    let _ = client.delete(format!("{base}/session/{session_id}")).send().await;

    Ok(LlmResponse {
        content,
        model: model_str.to_string(),
        provider: "opencode".to_string(),
        matched_skills: vec![],
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

    // Ollama /api/chat → body["message"]["content"]
    // Some models/versions may use body["response"] (generate endpoint format)
    let content = body["message"]["content"]
        .as_str()
        .or_else(|| body["response"].as_str())
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .map(|s| s.to_string())
        .unwrap_or_else(|| format!("No response (raw: {})", &body.to_string()[..body.to_string().len().min(200)]));

    Ok(LlmResponse {
        content,
        model: model.to_string(),
        provider: "ollama".to_string(),
        matched_skills: vec![],
    })
}
