use std::collections::HashMap;
use std::path::Path;
use regex::Regex;
use serde::Serialize;
use crate::loader::{load_skills_from_directory, load_single_skill};
use crate::skill::{validate_skill, Skill, ValidationIssue};
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

fn is_orphan(ref_path: &str, skills: &[Skill]) -> bool {
    let path = Path::new(ref_path);
    let filename = match path.file_name().and_then(|f| f.to_str()) {
        Some(f) => f,
        None => return true,
    };
    // Only check orphan status if inside a references/ directory
    let parent = match path.parent() {
        Some(p) => p,
        None => return true,
    };
    if parent.file_name().and_then(|f| f.to_str()) != Some("references") {
        return false;
    }
    let skill_dir = match parent.parent() {
        Some(d) => d,
        None => return true,
    };
    // Find any skill whose file lives in skill_dir
    let parent_skill = skills.iter().find(|s| {
        Path::new(&s.path).parent() == Some(skill_dir)
    });
    match parent_skill {
        Some(skill) => !skill.body.contains(filename),
        None => true,
    }
}

fn broken_links(ref_path: &str, content: &str) -> Vec<String> {
    let re = Regex::new(r"\[(?:[^\]]*)\]\(([^)#\s]+)\)").unwrap();
    let dir = match Path::new(ref_path).parent() {
        Some(d) => d,
        None => return Vec::new(),
    };
    re.captures_iter(content)
        .filter_map(|cap| {
            let href = cap[1].trim();
            if href.starts_with("http") || href.starts_with("mailto") {
                return None;
            }
            // Skip anything that contains regex metacharacters — not a real path
            let has_regex_chars = href.contains('[') || href.contains('{')
                || href.contains('|') || href.contains('\\')
                || href.contains('^') || href.contains('*')
                || href.contains('+') || href.contains('?');
            if has_regex_chars {
                return None;
            }
            // Only check hrefs that look like file paths
            let looks_like_path = href.contains('/') || href.ends_with(".md")
                || href.ends_with(".txt") || href.ends_with(".sh")
                || href.ends_with(".yaml") || href.ends_with(".json");
            if !looks_like_path {
                return None;
            }
            let target = dir.join(href);
            if !target.exists() {
                Some(format!("Broken link: {href}"))
            } else {
                None
            }
        })
        .collect()
}

fn validate_ref_file(path: &str, content: &str, orphan: bool) -> RefFileResult {
    let name = Path::new(path)
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or(path)
        .to_string();

    let mut issues = Vec::new();

    if content.trim().is_empty() {
        issues.push("Empty file".into());
    } else {
        let word_count = content.split_whitespace().count();
        if word_count < 100 {
            issues.push(format!("Very short ({word_count} words) — consider expanding content"));
        }
        if !content.lines().any(|l| l.starts_with('#')) {
            issues.push("No markdown headings found".into());
        }
        for broken in broken_links(path, content) {
            issues.push(broken);
        }
    }

    if orphan {
        issues.push("Orphan: no skill links to this file".into());
    }

    let status = if content.trim().is_empty() || issues.iter().any(|i: &String| i.starts_with("Broken link")) {
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

    // Detect duplicate names before per-skill validation
    let mut name_count: HashMap<String, usize> = HashMap::new();
    for skill in &load_result.skills {
        if let Some(name) = &skill.frontmatter.name {
            *name_count.entry(name.clone()).or_insert(0) += 1;
        }
    }

    let mut results: Vec<ValidationResult> = load_result
        .skills
        .iter()
        .map(|s| validate_skill(s))
        .collect();

    // Inject duplicate name issues
    for (result, skill) in results.iter_mut().zip(load_result.skills.iter()) {
        if let Some(name) = &skill.frontmatter.name {
            if name_count.get(name).copied().unwrap_or(0) > 1 {
                result.issues.push(ValidationIssue {
                    level: "error".into(),
                    message: format!("Duplicate name '{name}' — framework uses name as unique ID"),
                    suggestion: Some("Rename this skill to a unique slug.".into()),
                });
                result.status = "fail".into();
            }
        }
    }

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
        .map(|(path, content)| validate_ref_file(path, content, is_orphan(path, &load_result.skills)))
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

