use crate::config::load_config;
use base64::{engine::general_purpose::STANDARD, Engine as _};
use reqwest::Client;
use serde_json::json;
use std::fs;

#[tauri::command]
pub async fn read_file_as_base64(file_path: String) -> Result<(String, String), String> {
    let file_bytes = fs::read(&file_path).map_err(|e| format!("Error leyendo archivo: {}", e))?;
    let base64_data = STANDARD.encode(file_bytes);

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
    let api_key = config.api_key_user.trim();

    // BLOQUEO ESTRICTO: Si no hay clave, devolvemos error
    if api_key.is_empty() {
        return Err(
            "API Key no configurada. Haz clic en 'Ajustes' para vincular tu cuenta.".to_string(),
        );
    }

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

    if let (Some(data), Some(mime)) = (base64_data, mime_type) {
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
        return Err(format!("Error de Google: {}", error.to_string()));
    }

    if let Some(text) = res_json["candidates"][0]["content"]["parts"][0]["text"].as_str() {
        Ok(text.to_string())
    } else {
        Err(format!("Respuesta inesperada: {:?}", res_json))
    }
}
