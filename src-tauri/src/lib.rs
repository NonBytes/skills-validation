pub mod constants;
pub mod coverage;
pub mod fixer;
pub mod llm;
pub mod loader;
pub mod matcher;
pub mod skill;
pub mod commands;

#[cfg(test)]
mod tests {
    use crate::loader::load_skills_from_directory;
    use crate::skill::validate_skill;
    use crate::matcher::{match_skills, Scenario};
    use crate::coverage::compute_coverage;

    const SKILLS_DIR: &str = "../skills";

    #[test]
    fn test_load_all_skills() {
        let result = load_skills_from_directory(SKILLS_DIR);
        assert!(result.skills.len() > 100, "Expected 100+ skills, got {}", result.skills.len());
        println!("Loaded {} skills, {} errors", result.skills.len(), result.errors.len());
        for (path, err) in &result.errors {
            println!("  ERROR: {path}: {err}");
        }
    }

    #[test]
    fn test_validate_all_skills() {
        let result = load_skills_from_directory(SKILLS_DIR);
        let mut pass = 0;
        let mut fail = 0;
        let mut warn = 0;
        for skill in &result.skills {
            let v = validate_skill(skill);
            match v.status.as_str() {
                "pass" => pass += 1,
                "fail" => {
                    fail += 1;
                    let issues: Vec<String> = v.issues.iter()
                        .map(|i| format!("[{}] {}", i.level, i.message)).collect();
                    println!("FAIL: {} -> {}", v.name, issues.join("; "));
                }
                "warn" => {
                    warn += 1;
                    let issues: Vec<String> = v.issues.iter()
                        .map(|i| format!("[{}] {}", i.level, i.message)).collect();
                    println!("WARN: {} -> {}", v.name, issues.join("; "));
                }
                _ => {}
            }
        }
        println!("Validation: {pass} pass, {fail} fail, {warn} warn");
        assert!(pass > 50, "Expected most skills to pass");
    }

    #[test]
    fn test_wordpress_match() {
        let result = load_skills_from_directory(SKILLS_DIR);
        let scenario = Scenario {
            technologies: vec!["wordpress".to_string()],
            services: vec![],
            ports: vec![],
            paths: vec![],
            signals: vec![],
            phase: Some("exploitation".to_string()),
        };
        let matches = match_skills(&result.skills, &scenario);
        println!("WordPress+exploitation matches: {}", matches.len());
        for m in &matches {
            println!("  {} (pri:{}) via {:?}", m.skill_name, m.priority, m.matched_categories);
        }
        assert!(!matches.is_empty(), "Expected wordpress matches");
    }

    #[tokio::test]
    async fn test_ollama_dry_run() {
        use crate::llm::{send_llm_request, LlmConfig};

        let result = load_skills_from_directory(SKILLS_DIR);
        let skill = result.skills.iter()
            .find(|s| s.frontmatter.name.as_deref() == Some("nmap"))
            .expect("nmap skill should exist");

        let config = LlmConfig {
            provider: "ollama".to_string(),
            api_key: None,
            model: Some("qwen3-coder:30b".to_string()),
            base_url: None,
            language: "en".to_string(),
        };

        let resp = send_llm_request(&config, "nmap", &skill.body, "Target: 10.10.10.5 running HTTP on port 80 and SSH on port 22")
            .await
            .expect("Ollama should respond");

        println!("Provider: {}, Model: {}", resp.provider, resp.model);
        println!("Response:\n{}", resp.content);
        assert!(!resp.content.is_empty(), "Response should not be empty");
        assert_eq!(resp.provider, "ollama");
    }

    #[test]
    fn test_coverage_gaps() {
        let result = load_skills_from_directory(SKILLS_DIR);
        let coverage = compute_coverage(&result.skills);
        let gaps: Vec<_> = coverage.owasp.iter().filter(|o| !o.covered).collect();
        println!("OWASP gaps: {:?}", gaps.iter().map(|g| &g.id).collect::<Vec<_>>());
        assert!(gaps.iter().any(|g| g.id == "A06"), "A06 should be a gap");
    }
}
