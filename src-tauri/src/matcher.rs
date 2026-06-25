use serde::{Deserialize, Serialize};

use crate::skill::Skill;

#[derive(Debug, Clone, Deserialize)]
pub struct Scenario {
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
    pub phase: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct MatchResult {
    pub skill_name: String,
    pub skill_path: String,
    pub priority: i32,
    pub matched_categories: Vec<String>,
}

pub fn match_skills(skills: &[Skill], scenario: &Scenario) -> Vec<MatchResult> {
    let mut results: Vec<MatchResult> = skills
        .iter()
        .filter_map(|skill| match_single(skill, scenario))
        .collect();

    results.sort_by(|a, b| b.priority.cmp(&a.priority));
    results
}

fn match_single(skill: &Skill, scenario: &Scenario) -> Option<MatchResult> {
    let fm = &skill.frontmatter;
    let mut matched = Vec::new();

    if any_substring_hit(&scenario.technologies, &fm.technologies) {
        matched.push("technologies".to_string());
    }
    if any_substring_hit(&scenario.services, &fm.services) {
        matched.push("services".to_string());
    }
    if any_int_hit(&scenario.ports, &fm.ports) {
        matched.push("ports".to_string());
    }
    if any_substring_hit(&scenario.paths, &fm.paths) {
        matched.push("paths".to_string());
    }
    if any_substring_hit(&scenario.signals, &fm.signals) {
        matched.push("signals".to_string());
    }
    if let Some(ref phase) = scenario.phase {
        let norm_phase = phase.to_lowercase().replace('-', "_");
        if !norm_phase.is_empty()
            && fm
                .phases
                .iter()
                .any(|p| p.to_lowercase().replace('-', "_") == norm_phase)
        {
            matched.push("phases".to_string());
        }
    }

    if matched.is_empty() {
        None
    } else {
        let priority = if (1..=10).contains(&fm.priority) {
            fm.priority
        } else {
            5
        };

        Some(MatchResult {
            skill_name: fm.name.clone().unwrap_or_default(),
            skill_path: skill.path.clone(),
            priority,
            matched_categories: matched,
        })
    }
}

fn any_substring_hit(scenario_vals: &[String], skill_vals: &[String]) -> bool {
    if scenario_vals.is_empty() || skill_vals.is_empty() {
        return false;
    }
    for sv in scenario_vals {
        let sv_lower = sv.to_lowercase();
        for kv in skill_vals {
            let kv_lower = kv.to_lowercase();
            if sv_lower.contains(&kv_lower) || kv_lower.contains(&sv_lower) {
                return true;
            }
        }
    }
    false
}

fn any_int_hit(scenario_ports: &[u16], skill_ports: &[u16]) -> bool {
    if scenario_ports.is_empty() || skill_ports.is_empty() {
        return false;
    }
    scenario_ports.iter().any(|p| skill_ports.contains(p))
}
