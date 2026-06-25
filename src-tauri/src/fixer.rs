use std::fs;
use regex::Regex;
use std::sync::LazyLock;

use crate::constants::VALID_PHASES;

static FRONTMATTER_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?s)\A(---\r?\n)(.*?)(\r?\n---\r?\n?)(.*)").unwrap());

pub struct FixResult {
    pub fixed: bool,
    pub changes: Vec<String>,
}

pub fn preview_skill_file(file_path: &str) -> Result<FixResult, String> {
    analyze_skill_file(file_path).map(|(result, _)| result)
}

pub fn fix_skill_file(file_path: &str) -> Result<FixResult, String> {
    let (result, new_content) = analyze_skill_file(file_path)?;

    if let Some(content) = new_content {
        fs::write(file_path, content)
            .map_err(|e| format!("Write error: {e}"))?;
    }

    Ok(result)
}

fn analyze_skill_file(file_path: &str) -> Result<(FixResult, Option<String>), String> {
    let content = fs::read_to_string(file_path)
        .map_err(|e| format!("Read error: {e}"))?;

    let caps = FRONTMATTER_RE
        .captures(&content)
        .ok_or("No YAML frontmatter found")?;

    let prefix = &caps[1];
    let yaml_str = caps[2].to_string();
    let separator = &caps[3];
    let body = &caps[4];

    let mut new_yaml = yaml_str.clone();
    let mut changes = Vec::new();

    new_yaml = fix_phases(&new_yaml, &mut changes);
    new_yaml = fix_priority(&new_yaml, &mut changes);

    if changes.is_empty() {
        return Ok((FixResult { fixed: false, changes }, None));
    }

    let new_content = format!("{prefix}{new_yaml}{separator}{body}");
    Ok((FixResult { fixed: true, changes }, Some(new_content)))
}

fn fix_phases(yaml: &str, changes: &mut Vec<String>) -> String {
    let mut result = yaml.to_string();

    let phase_line_re = Regex::new(r#"(?m)^(\s*phases:\s*\[)(.*?)(\])"#).unwrap();
    if let Some(caps) = phase_line_re.captures(&result) {
        let phases_str = &caps[2];
        let mut new_phases = Vec::new();
        let mut modified = false;

        for phase in phases_str.split(',') {
            let trimmed = phase.trim().trim_matches('"').trim_matches('\'');
            if trimmed.is_empty() {
                continue;
            }
            let normalized = trimmed.to_lowercase().replace('-', "_");
            if VALID_PHASES.contains(&normalized.as_str()) {
                if normalized != trimmed {
                    new_phases.push(format!("\"{}\"", normalized));
                    modified = true;
                    changes.push(format!("Normalized phase '{}' → '{}'", trimmed, normalized));
                } else {
                    new_phases.push(format!("\"{}\"", trimmed));
                }
            } else if let Some(suggestion) = find_closest_phase(&normalized) {
                new_phases.push(format!("\"{}\"", suggestion));
                modified = true;
                changes.push(format!("Replaced invalid phase '{}' → '{}'", trimmed, suggestion));
            } else {
                new_phases.push(format!("\"{}\"", trimmed));
            }
        }

        if modified {
            let new_line = format!("{}{}{}",
                &caps[1],
                new_phases.join(", "),
                &caps[3],
            );
            result = phase_line_re.replace(&result, new_line.as_str()).to_string();
        }
    }

    let multiline_re = Regex::new(r"(?m)^(\s*phases:\s*\n)((?:\s*-\s*.+\n?)+)").unwrap();
    if let Some(caps) = multiline_re.captures(&result.clone()) {
        let indent_re = Regex::new(r"(?m)^(\s*)-\s*(.+)").unwrap();
        let mut new_lines = String::new();
        let mut modified = false;

        for line_cap in indent_re.captures_iter(&caps[2]) {
            let indent = &line_cap[1];
            let val = line_cap[2].trim().trim_matches('"').trim_matches('\'');
            let normalized = val.to_lowercase().replace('-', "_");

            if VALID_PHASES.contains(&normalized.as_str()) {
                if normalized != val {
                    new_lines.push_str(&format!("{}- \"{}\"\n", indent, normalized));
                    modified = true;
                    changes.push(format!("Normalized phase '{}' → '{}'", val, normalized));
                } else {
                    new_lines.push_str(&format!("{}- {}\n", indent, val));
                }
            } else if let Some(suggestion) = find_closest_phase(&normalized) {
                new_lines.push_str(&format!("{}- \"{}\"\n", indent, suggestion));
                modified = true;
                changes.push(format!("Replaced invalid phase '{}' → '{}'", val, suggestion));
            } else {
                new_lines.push_str(&format!("{}- {}\n", indent, val));
            }
        }

        if modified {
            let replacement = format!("{}{}", &caps[1], new_lines);
            result = multiline_re.replace(&result, replacement.as_str()).to_string();
        }
    }

    result
}

fn fix_priority(yaml: &str, changes: &mut Vec<String>) -> String {
    let re = Regex::new(r"(?m)^(\s*priority:\s*)(\d+)").unwrap();
    if let Some(caps) = re.captures(yaml) {
        let val: i32 = caps[2].parse().unwrap_or(5);
        if val < 1 || val > 10 {
            changes.push(format!("Coerced priority {} → 5", val));
            return re.replace(yaml, format!("{}5", &caps[1]).as_str()).to_string();
        }
    }
    yaml.to_string()
}

fn find_closest_phase(input: &str) -> Option<&'static str> {
    let mut best: Option<(&str, usize)> = None;

    for &phase in VALID_PHASES {
        let dist = edit_distance(input, phase);
        match best {
            Some((_, best_dist)) if dist < best_dist => best = Some((phase, dist)),
            None => best = Some((phase, dist)),
            _ => {}
        }
    }

    best.and_then(|(phase, dist)| {
        if dist <= input.len() / 2 + 1 {
            Some(phase)
        } else {
            None
        }
    })
}

fn edit_distance(a: &str, b: &str) -> usize {
    let a: Vec<char> = a.chars().collect();
    let b: Vec<char> = b.chars().collect();
    let mut dp = vec![vec![0usize; b.len() + 1]; a.len() + 1];

    for i in 0..=a.len() { dp[i][0] = i; }
    for j in 0..=b.len() { dp[0][j] = j; }

    for i in 1..=a.len() {
        for j in 1..=b.len() {
            let cost = if a[i - 1] == b[j - 1] { 0 } else { 1 };
            dp[i][j] = (dp[i - 1][j] + 1)
                .min(dp[i][j - 1] + 1)
                .min(dp[i - 1][j - 1] + cost);
        }
    }

    dp[a.len()][b.len()]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_find_closest_phase() {
        assert_eq!(find_closest_phase("reconaissance"), Some("reconnaissance"));
        assert_eq!(find_closest_phase("exploitation"), Some("exploitation"));
        assert_eq!(find_closest_phase("post_exploitation"), Some("post_exploitation"));
        assert_eq!(find_closest_phase("scaning"), Some("scanning"));
    }

    #[test]
    fn test_edit_distance() {
        assert_eq!(edit_distance("kitten", "sitting"), 3);
        assert_eq!(edit_distance("", "abc"), 3);
        assert_eq!(edit_distance("abc", "abc"), 0);
    }
}
