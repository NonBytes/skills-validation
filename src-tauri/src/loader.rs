use std::fs;
use walkdir::WalkDir;

use crate::skill::{parse_skill, Skill};

pub struct LoadResult {
    pub skills: Vec<Skill>,
    pub errors: Vec<(String, String)>,
}

pub fn load_skills_from_directory(dir: &str) -> LoadResult {
    let mut skills = Vec::new();
    let mut errors = Vec::new();

    for entry in WalkDir::new(dir)
        .follow_links(true)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let path = entry.path();
        if !path.is_file() {
            continue;
        }
        if path.extension().map_or(true, |ext| ext != "md") {
            continue;
        }
        if path.file_name().map_or(false, |n| n == "README.md") {
            continue;
        }

        let path_str = path.to_string_lossy().to_string();
        match fs::read_to_string(path) {
            Ok(content) => match parse_skill(&content, &path_str) {
                Ok(skill) => skills.push(skill),
                Err(e) => errors.push((path_str, e)),
            },
            Err(e) => errors.push((path_str, format!("Read error: {e}"))),
        }
    }

    skills.sort_by(|a, b| {
        a.frontmatter
            .name
            .as_deref()
            .unwrap_or("")
            .cmp(b.frontmatter.name.as_deref().unwrap_or(""))
    });

    LoadResult { skills, errors }
}

pub fn load_single_skill(file_path: &str) -> LoadResult {
    let mut skills = Vec::new();
    let mut errors = Vec::new();

    match fs::read_to_string(file_path) {
        Ok(content) => match parse_skill(&content, file_path) {
            Ok(skill) => skills.push(skill),
            Err(e) => errors.push((file_path.to_string(), e)),
        },
        Err(e) => errors.push((file_path.to_string(), format!("Read error: {e}"))),
    }

    LoadResult { skills, errors }
}
