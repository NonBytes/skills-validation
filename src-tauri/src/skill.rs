use regex::Regex;
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::sync::LazyLock;

use crate::constants::{EXCLUDED_CATEGORIES, VALID_PHASES};

static FRONTMATTER_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?s)\A---\r?\n(.*?)\r?\n---\r?\n?(.*)").unwrap());

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkillFrontmatter {
    pub name: Option<String>,
    pub description: Option<String>,
    #[serde(default)]
    pub technologies: Vec<String>,
    #[serde(default)]
    pub services: Vec<String>,
    #[serde(default)]
    pub ports: Vec<u16>,
    #[serde(default)]
    pub paths: Vec<String>,
    #[serde(default)]
    pub signals: Vec<String>,
    #[serde(default)]
    pub phases: Vec<String>,
    #[serde(default = "default_priority")]
    pub priority: i32,
}

fn default_priority() -> i32 {
    5
}

#[derive(Debug, Clone, Serialize)]
pub struct Skill {
    pub path: String,
    pub frontmatter: SkillFrontmatter,
    pub body: String,
    pub excluded: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct ValidationIssue {
    pub level: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct ValidationResult {
    pub path: String,
    pub name: String,
    pub status: String,
    pub issues: Vec<ValidationIssue>,
    pub excluded: bool,
}

pub fn parse_skill(content: &str, file_path: &str) -> Result<Skill, String> {
    let caps = FRONTMATTER_RE
        .captures(content)
        .ok_or_else(|| "No YAML frontmatter found (expected --- delimiters)".to_string())?;

    let yaml_str = &caps[1];
    let body = caps[2].to_string();

    let frontmatter: SkillFrontmatter =
        serde_yaml::from_str(yaml_str).map_err(|e| format!("YAML parse error: {e}"))?;

    let excluded = is_excluded_path(file_path);

    Ok(Skill {
        path: file_path.to_string(),
        frontmatter,
        body,
        excluded,
    })
}

pub fn validate_skill(skill: &Skill) -> ValidationResult {
    let mut issues = Vec::new();
    let name = skill
        .frontmatter
        .name
        .clone()
        .unwrap_or_else(|| "<unnamed>".to_string());

    if skill.frontmatter.name.as_ref().map_or(true, |n| n.trim().is_empty()) {
        issues.push(ValidationIssue {
            level: "error".into(),
            message: "Missing or empty 'name' field".into(),
        });
    }

    if skill.frontmatter.description.as_ref().map_or(true, |d| d.trim().is_empty()) {
        issues.push(ValidationIssue {
            level: "error".into(),
            message: "Missing or empty 'description' field".into(),
        });
    }

    if skill.body.trim().is_empty() {
        issues.push(ValidationIssue {
            level: "error".into(),
            message: "Empty body (no content after frontmatter)".into(),
        });
    }

    if skill.frontmatter.priority < 1 || skill.frontmatter.priority > 10 {
        issues.push(ValidationIssue {
            level: "warn".into(),
            message: format!(
                "Priority {} out of range 1-10, will be coerced to 5",
                skill.frontmatter.priority
            ),
        });
    }

    let has_triggers = !skill.frontmatter.technologies.is_empty()
        || !skill.frontmatter.services.is_empty()
        || !skill.frontmatter.ports.is_empty()
        || !skill.frontmatter.paths.is_empty()
        || !skill.frontmatter.signals.is_empty()
        || !skill.frontmatter.phases.is_empty();

    if !has_triggers {
        let level = if skill.excluded { "warn" } else { "error" };
        issues.push(ValidationIssue {
            level: level.into(),
            message: "No trigger categories populated (need at least one of: technologies, services, ports, paths, signals, phases)".into(),
        });
    }

    for phase in &skill.frontmatter.phases {
        let normalized = phase.to_lowercase().replace('-', "_");
        if !VALID_PHASES.contains(&normalized.as_str()) {
            issues.push(ValidationIssue {
                level: "error".into(),
                message: format!("Invalid phase: '{phase}'"),
            });
        }
    }

    if skill.excluded {
        issues.push(ValidationIssue {
            level: "warn".into(),
            message: "In excluded category (loaded by framework, not operator selection)".into(),
        });
    }

    let has_error = issues.iter().any(|i| i.level == "error");
    let has_warn = issues.iter().any(|i| i.level == "warn");
    let status = if has_error {
        "fail"
    } else if has_warn {
        "warn"
    } else {
        "pass"
    };

    ValidationResult {
        path: skill.path.clone(),
        name,
        status: status.into(),
        issues,
        excluded: skill.excluded,
    }
}

fn is_excluded_path(file_path: &str) -> bool {
    let path = Path::new(file_path);
    path.components().any(|c| {
        EXCLUDED_CATEGORIES.contains(&c.as_os_str().to_str().unwrap_or(""))
    })
}
