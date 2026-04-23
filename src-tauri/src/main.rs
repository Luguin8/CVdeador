// Evita que se abra una consola extra en Windows al ejecutar el .exe en release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        // Aquí registraremos nuestros comandos (ej: lectura de config, llamadas a Gemini)
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
