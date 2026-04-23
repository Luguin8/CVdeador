use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AppConfig {
    pub api_key_user: String,
    pub last_usage: u64,
    pub save_path: String,
    pub cv_base_text: String,
    pub cv_template: String,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            api_key_user: "".to_string(),
            last_usage: 0,
            save_path: "./output".to_string(),
            cv_base_text: "".to_string(),
            cv_template: "<h1>{{name}}</h1>".to_string(),
        }
    }
}

pub fn get_config_path() -> PathBuf {
    let mut path = std::env::current_exe().unwrap_or_else(|_| PathBuf::from("./"));
    path.pop();
    path.push("config.json");
    path
}

pub fn load_config() -> AppConfig {
    let path = get_config_path();
    if path.exists() {
        let content = fs::read_to_string(path).unwrap_or_default();
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        let config = AppConfig::default();
        let _ = save_config_internal(&config);
        config
    }
}

pub fn save_config_internal(config: &AppConfig) -> Result<(), String> {
    let path = get_config_path();
    let content = serde_json::to_string_pretty(config).map_err(|e| e.to_string())?;
    fs::write(path, content).map_err(|e| e.to_string())
}

// Este es el comando que llamaremos desde React
#[tauri::command]
pub fn save_app_config(config: AppConfig) -> Result<(), String> {
    save_config_internal(&config)
}
