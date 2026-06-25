use serde::Serialize;
use std::collections::{HashMap, HashSet};

use crate::constants::{AGENT_TOOLS, CWE_TOP_25, MITRE_TACTICS, OWASP_TOP_10, PTES_PHASES, VALID_PHASES};
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
pub struct MitreCoverage {
    pub id: String,
    pub name: String,
    pub mapped_skills: Vec<String>,
    pub covered: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct FrameworkCoverage {
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
    pub mitre: Vec<MitreCoverage>,
    pub cwe: Vec<FrameworkCoverage>,
    pub ptes: Vec<FrameworkCoverage>,
}

pub fn compute_coverage(skills: &[Skill]) -> CoverageReport {
    let phase_coverage = compute_phase_coverage(skills);
    let tool_coverage = compute_tool_coverage(skills);
    let owasp_coverage = compute_owasp_coverage(skills);
    let mitre_coverage = compute_mitre_coverage(skills);
    let cwe_coverage = compute_framework_coverage(skills, CWE_TOP_25.iter().map(|c| (c.id, c.name, c.skill_names)));
    let ptes_coverage = compute_framework_coverage(skills, PTES_PHASES.iter().map(|p| (p.id, p.name, p.skill_names)));

    CoverageReport {
        phases: phase_coverage,
        tools: tool_coverage,
        owasp: owasp_coverage,
        mitre: mitre_coverage,
        cwe: cwe_coverage,
        ptes: ptes_coverage,
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

fn compute_mitre_coverage(skills: &[Skill]) -> Vec<MitreCoverage> {
    let skill_names: HashSet<String> = skills
        .iter()
        .filter_map(|s| s.frontmatter.name.as_ref())
        .map(|n| n.to_lowercase())
        .collect();

    MITRE_TACTICS
        .iter()
        .map(|tactic| {
            let mapped: Vec<String> = tactic
                .skill_names
                .iter()
                .filter(|sn| skill_names.contains(&sn.to_lowercase()))
                .map(|s| s.to_string())
                .collect();
            let covered = !mapped.is_empty();
            MitreCoverage {
                id: tactic.id.to_string(),
                name: tactic.name.to_string(),
                mapped_skills: mapped,
                covered,
            }
        })
        .collect()
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

fn compute_framework_coverage<'a>(
    skills: &[Skill],
    entries: impl Iterator<Item = (&'a str, &'a str, &'a [&'a str])>,
) -> Vec<FrameworkCoverage> {
    let skill_names: HashSet<String> = skills
        .iter()
        .filter_map(|s| s.frontmatter.name.as_ref())
        .map(|n| n.to_lowercase())
        .collect();

    entries
        .map(|(id, name, mapped_names)| {
            let mapped: Vec<String> = mapped_names
                .iter()
                .filter(|sn| skill_names.contains(&sn.to_lowercase()))
                .map(|s| s.to_string())
                .collect();
            FrameworkCoverage {
                id: id.to_string(),
                name: name.to_string(),
                mapped_skills: mapped.clone(),
                covered: !mapped.is_empty(),
            }
        })
        .collect()
}
