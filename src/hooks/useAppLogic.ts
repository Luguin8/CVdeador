import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

export interface AppConfig {
    api_key_user: string;
    selected_model: string;
    save_path: string;
    cv_base_text: string;
    cv_template: string;
}

export function useAppLogic() {
    const [config, setConfig] = useState<AppConfig | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadConfig = useCallback(async () => {
        try {
            const data = await invoke<AppConfig>('get_app_config');
            setConfig(data);
        } catch (err) {
            console.error("Error cargando config:", err);
            setError("No se pudo cargar la configuración.");
        }
    }, []);

    useEffect(() => {
        loadConfig();
    }, [loadConfig]);

    const saveConfig = async (newConfig: AppConfig) => {
        try {
            await invoke('save_app_config', { config: newConfig });
            setConfig(newConfig);
        } catch (err) {
            setError("No se pudo guardar la configuración.");
        }
    };

    const generateCV = async (prompt: string, fileData: { path?: string, base64?: string, mimeType?: string }) => {
        setIsGenerating(true);
        setError(null);
        try {
            let b64 = fileData.base64;
            let mime = fileData.mimeType;

            if (fileData.path) {
                // CAMBIO AQUÍ: file_path (Rust) -> filePath (JS/Tauri v2)
                const [data, detectedMime] = await invoke<[string, string]>('read_file_as_base64', {
                    filePath: fileData.path
                });
                b64 = data;
                mime = detectedMime;
            }

            // CAMBIO AQUÍ: base64_data -> base64Data | mime_type -> mimeType
            const result = await invoke<string>('generate_with_gemini', {
                prompt,
                base64Data: b64 || null,
                mimeType: mime || null
            });

            setIsGenerating(false);
            return result;
        } catch (err) {
            setError(String(err));
            setIsGenerating(false);
            return null;
        }
    };

    return { config, isGenerating, error, saveConfig, generateCV, refreshConfig: loadConfig };
}