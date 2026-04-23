import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

// Reflejamos la estructura de Rust en TypeScript
export interface AppConfig {
    api_key_user: string;
    last_usage: number;
    save_path: string;
    cv_base_text: string;
    cv_template: string;
}

export function useAppLogic() {
    const [config, setConfig] = useState<AppConfig | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cargar configuración al iniciar
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

    // Guardar configuración y actualizar el estado
    const saveConfig = async (newConfig: AppConfig) => {
        try {
            await invoke('save_app_config', { config: newConfig });
            setConfig(newConfig);
        } catch (err) {
            console.error("Error guardando config:", err);
            setError("No se pudo guardar la configuración.");
        }
    };

    // Función principal para llamar a Gemini a través de Rust
    const generateCV = async (prompt: string, filePath?: string) => {
        setIsGenerating(true);
        setError(null);
        try {
            let base64_data: string | undefined = undefined;
            let mime_type: string | undefined = undefined;

            // Si hay un archivo, le pedimos a Rust que lo lea
            if (filePath) {
                const [data, mime] = await invoke<[string, string]>('read_file_as_base64', { filePath });
                base64_data = data;
                mime_type = mime;
            }

            // Llamamos a la IA
            const result = await invoke<string>('generate_with_gemini', {
                prompt,
                base64Data: base64_data || null,
                mimeType: mime_type || null
            });

            setIsGenerating(false);
            return result;

        } catch (err) {
            console.error("Error en la IA:", err);
            setError(String(err));
            setIsGenerating(false);
            return null;
        }
    };

    return {
        config,
        isGenerating,
        error,
        saveConfig,
        generateCV,
        refreshConfig: loadConfig
    };
}