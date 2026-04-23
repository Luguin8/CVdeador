use crate::config::load_config;
use base64::{engine::general_purpose::STANDARD, Engine as _};
use reqwest::Client;
use serde_json::json;
use std::fs;

const APP_API_KEY: &str = ""; // Déjalo vacío, ahora usarás la interfaz para poner tu clave

#[tauri::command]
pub async fn read_file_as_base64(filePath: String) -> Result<(String, String), String> {
    let file_bytes = fs::read(&filePath).map_err(|e| format!("Error leyendo archivo: {}", e))?;
    let base64_data = STANDARD.encode(file_bytes);

    let mime_type = if filePath.to_lowercase().ends_with(".pdf") {
        "application/pdf".to_string()
    } else if filePath.to_lowercase().ends_with(".png") {
        "image/png".to_string()
    } else if filePath.to_lowercase().ends_with(".jpg")
        || filePath.to_lowercase().ends_with(".jpeg")
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
    base64Data: Option<String>,
    mimeType: Option<String>,
) -> Result<String, String> {
    let config = load_config();

    let user_key = config.api_key_user.trim();
    let api_key = if !user_key.is_empty() {
        user_key
    } else {
        APP_API_KEY
    };

    if api_key.is_empty() {
        return Err("API Key no configurada. Ve a Ajustes y pega tu clave.".to_string());
    }

    // Inyectamos el modelo seleccionado por el usuario en la URL
    let model = if !config.selected_model.trim().is_empty() {
        config.selected_model.trim()
    } else {
        "gemini-1.5-flash"
    };

    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
        model, api_key
    );

    let mut parts = vec![json!({"text": prompt})];

    if let (Some(data), Some(mime)) = (base64Data, mimeType) {
        parts.push(json!({
            "inline_data": { "mime_type": mime, "data": data }
        }));
    }

    let payload = json!({ "contents": [{ "parts": parts }] });

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

    if let Some(error) = res_json.get("error") {
        return Err(format!("Google Error: {}", error.to_string()));
    }

    if let Some(text) = res_json["candidates"][0]["content"]["parts"][0]["text"].as_str() {
        Ok(text.to_string())
    } else {
        Err(format!("Respuesta inesperada: {:?}", res_json))
    }
}
