mod commands;
mod config; // Registramos el nuevo módulo

use commands::{generate_with_gemini, read_file_as_base64};
use config::{load_config, save_app_config, AppConfig};
use tauri_plugin_dialog;

#[tauri::command]
fn get_app_config() -> AppConfig {
    load_config()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        // Exponemos TODOS los comandos al Frontend
        .invoke_handler(tauri::generate_handler![
            get_app_config,
            save_app_config,
            read_file_as_base64,
            generate_with_gemini
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
