use serde::Serialize;
use std::collections::{HashMap, HashSet};

use crate::constants::{AGENT_TOOLS, OWASP_TOP_10, VALID_PHASES};
use crate::skill::Skill;

#[derive(Debug, Clone, Serialize)]
pub struct PhaseCoverage {
    pub phase: String,
    pub count: usize,
}

#[derive(Debug, Clone, Serialize)]
pub struct ToolCoverage {
    pub covered: Vec<String>,
    pub missing: Vec<String>,
    pub total: usize,
}

#[derive(Debug, Clone, Serialize)]
pub struct OwaspCoverage {
    pub id: String,
    pub name: String,
    pub mapped_skills: Vec<String>,
    pub covered: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct CoverageReport {
    pub phases: Vec<PhaseCoverage>,
    pub tools: ToolCoverage,
    pub owasp: Vec<OwaspCoverage>,
}

pub fn compute_coverage(skills: &[Skill]) -> CoverageReport {
    let phase_coverage = compute_phase_coverage(skills);
    let tool_coverage = compute_tool_coverage(skills);
    let owasp_coverage = compute_owasp_coverage(skills);

    CoverageReport {
        phases: phase_coverage,
        tools: tool_coverage,
        owasp: owasp_coverage,
    }
}

fn compute_phase_coverage(skills: &[Skill]) -> Vec<PhaseCoverage> {
    let mut counts: HashMap<&str, usize> = HashMap::new();
    for phase in VALID_PHASES {
        counts.insert(phase, 0);
    }

    for skill in skills {
        for phase in &skill.frontmatter.phases {
            let normalized = phase.to_lowercase().replace('-', "_");
            for valid in VALID_PHASES {
                if *valid == normalized.as_str() {
                    *counts.get_mut(valid).unwrap() += 1;
                }
            }
        }
    }

    VALID_PHASES
        .iter()
        .map(|p| PhaseCoverage {
            phase: p.to_string(),
            count: counts[p],
        })
        .collect()
}

fn compute_tool_coverage(skills: &[Skill]) -> ToolCoverage {
    let skill_names: HashSet<String> = skills
        .iter()
        .filter_map(|s| s.frontmatter.name.as_ref())
        .map(|n| n.to_lowercase())
        .collect();

    let mut covered = Vec::new();
    let mut missing = Vec::new();

    for tool in AGENT_TOOLS {
        let tool_lower = tool.to_lowercase();
        if skill_names.contains(&tool_lower) {
            covered.push(tool.to_string());
        } else {
            missing.push(tool.to_string());
        }
    }

    let total = AGENT_TOOLS.len();
    ToolCoverage {
        covered,
        missing,
        total,
    }
}

fn compute_owasp_coverage(skills: &[Skill]) -> Vec<OwaspCoverage> {
    let skill_names: HashSet<String> = skills
        .iter()
        .filter_map(|s| s.frontmatter.name.as_ref())
        .map(|n| n.to_lowercase())
        .collect();

    OWASP_TOP_10
        .iter()
        .map(|cat| {
            let mapped: Vec<String> = cat
                .skill_names
                .iter()
                .filter(|sn| skill_names.contains(&sn.to_lowercase()))
                .map(|s| s.to_string())
                .collect();
            let covered = !mapped.is_empty();
            OwaspCoverage {
                id: cat.id.to_string(),
                name: cat.name.to_string(),
                mapped_skills: mapped,
                covered,
            }
        })
        .collect()
}
