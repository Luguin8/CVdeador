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

    if api_key.is_empty() {
        return Err(
            "API Key no configurada. Haz clic en 'Ajustes' para vincular tu cuenta.".to_string(),
        );
    }

    let model = if !config.selected_model.trim().is_empty() {
        config.selected_model.trim()
    } else {
        "gemini-flash-latest"
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

    // INTERCEPTAMOS ERRORES ESPECÍFICOS DE GOOGLE
    if let Some(error) = res_json.get("error") {
        let code = error.get("code").and_then(|c| c.as_i64()).unwrap_or(0);

        // Si es error 429, damos un mensaje humano
        if code == 429 {
            return Err("Límite gratuito de Google alcanzado. Por favor, espera 1 minuto y vuelve a intentar.".to_string());
        }

        // Si es otro error, mostramos el mensaje original pero limpio
        let msg = error
            .get("message")
            .and_then(|m| m.as_str())
            .unwrap_or("Error desconocido");
        return Err(format!("Error de IA: {}", msg));
    }

    if let Some(text) = res_json["candidates"][0]["content"]["parts"][0]["text"].as_str() {
        Ok(strip_code_fences(text))
    } else {
        Err(format!("Respuesta inesperada: {:?}", res_json))
    }
}

/// Gemini suele envolver el HTML en ```html ... ```; lo limpiamos.
fn strip_code_fences(text: &str) -> String {
    let t = text.trim();
    if let Some(rest) = t.strip_prefix("```") {
        let rest = rest
            .strip_prefix("html")
            .or_else(|| rest.strip_prefix("HTML"))
            .unwrap_or(rest);
        return rest.trim().trim_end_matches("```").trim().to_string();
    }
    t.to_string()
}

/// Guarda el CV HTML generado en la ruta indicada (elegida con el diálogo del front).
#[tauri::command]
pub fn save_html_cv(path: String, html: String) -> Result<String, String> {
    fs::write(&path, html).map_err(|e| format!("Error al guardar: {}", e))?;
    Ok(path)
}
