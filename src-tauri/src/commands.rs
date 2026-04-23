use crate::config::load_config;
use base64::{engine::general_purpose::STANDARD, Engine as _};
use reqwest::Client;
use serde_json::json;
use std::fs;

// CLAVE PÚBLICA INTEGRADA (Reemplaza con tu clave real para el uso gratuito de la app)
const APP_API_KEY: &str = "AQUI_TU_API_KEY_PUBLICA";

#[tauri::command]
pub async fn read_file_as_base64(file_path: String) -> Result<(String, String), String> {
    let file_bytes = fs::read(&file_path).map_err(|e| format!("Error leyendo archivo: {}", e))?;
    let base64_data = STANDARD.encode(file_bytes);

    // Detección básica de MIME type (puedes expandirla luego)
    let mime_type = if file_path.to_lowercase().ends_with(".pdf") {
        "application/pdf".to_string()
    } else if file_path.to_lowercase().ends_with(".png") {
        "image/png".to_string()
    } else if file_path.to_lowercase().ends_with(".jpg")
        || file_path.to_lowercase().ends_with(".jpeg")
    {
        "image/jpeg".to_string()
    } else {
        "text/plain".to_string()
    };

    Ok((base64_data, mime_type))
}

#[tauri::command]
pub async fn generate_with_gemini(
    prompt: String,
    base64_data: Option<String>,
    mime_type: Option<String>,
) -> Result<String, String> {
    let config = load_config();

    // Usa la clave del usuario si existe, sino usa la clave pública de la app
    let api_key = if !config.api_key_user.trim().is_empty() {
        config.api_key_user
    } else {
        APP_API_KEY.to_string()
    };

    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={}",
        api_key
    );

    // Construir el payload de Gemini
    let mut parts = vec![json!({"text": prompt})];

    // Si se adjunta un archivo (PDF o Imagen), lo agregamos al payload multimodal
    if let (Some(data), Some(mime)) = (base64_data, mime_type) {
        parts.push(json!({
            "inline_data": {
                "mime_type": mime,
                "data": data
            }
        }));
    }

    let payload = json!({
        "contents": [{ "parts": parts }]
    });

    let client = Client::new();
    let res = client
        .post(&url)
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Error de red: {}", e))?;

    let res_json: serde_json::Value = res
        .json()
        .await
        .map_err(|e| format!("Error parseando respuesta: {}", e))?;

    // Extraer el texto de la respuesta de Gemini
    if let Some(text) = res_json["candidates"][0]["content"]["parts"][0]["text"].as_str() {
        Ok(text.to_string())
    } else {
        Err(format!("Error en la API de Gemini: {:?}", res_json))
    }
}
