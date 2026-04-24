import React, { useState, useEffect } from 'react';
// CORRECCIÓN: Importamos openUrl en lugar de open
import { openUrl } from '@tauri-apps/plugin-opener';
import { AppConfig } from '../hooks/useAppLogic';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    config: AppConfig;
    onSave: (newConfig: AppConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave }) => {
    const [apiKey, setApiKey] = useState(config.api_key_user);
    const [selectedModel, setSelectedModel] = useState(config.selected_model || 'gemini-1.5-flash');

    useEffect(() => {
        setApiKey(config.api_key_user);
        setSelectedModel(config.selected_model || 'gemini-1.5-flash');
    }, [config]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave({ ...config, api_key_user: apiKey.trim(), selected_model: selectedModel });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">

                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-slate-200">Configuración de Inteligencia Artificial</h2>
                    <p className="text-sm text-slate-400 mt-1">ATS-Optimizer funciona 100% gratis conectándose a tu propia cuenta de Google.</p>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="bg-slate-800/50 border border-indigo-500/30 rounded-lg p-5 mb-6">
                        <h3 className="text-indigo-400 font-bold mb-3 flex items-center gap-2">
                            <span>🚀</span> ¿Cómo obtener tu API Key gratuita en 1 minuto?
                        </h3>
                        <ol className="text-sm text-slate-300 space-y-3 list-decimal list-inside marker:text-indigo-500 marker:font-bold">
                            <li>Haz clic en este botón para ir a la plataforma oficial de Google: <br />
                                {/* CORRECCIÓN: Usamos openUrl() aquí */}
                                <button onClick={() => openUrl('https://aistudio.google.com/app/apikey')} className="mt-2 mb-1 px-4 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/50 rounded cursor-pointer transition-colors">
                                    Abrir Google AI Studio
                                </button>
                            </li>
                            <li>Inicia sesión con tu cuenta de Google (Gmail).</li>
                            <li>Haz clic en el botón azul gigante que dice <b>"Create API Key"</b>.</li>
                            <li>Copia el texto largo que empieza con <code className="bg-black/50 px-1 rounded text-emerald-400">AIzaSy...</code> y pégalo abajo.</li>
                        </ol>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                                Tu Google API Key
                            </label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Pega tu clave AIzaSy... aquí"
                                className="w-full bg-slate-950 border border-slate-600 rounded p-3 text-sm text-emerald-400 font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                                Modelo de Inteligencia Artificial
                            </label>
                            <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-600 rounded p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                            >
                                {/* Usamos los alias exactos que te dio el debug */}
                                <option value="gemini-2.0-flash">Gemini 2.0 Flash (El más rápido y recomendado)</option>
                                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Estándar)</option>
                                <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash-Lite (Ultra liviano)</option>
                                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Última versión)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50 rounded-b-xl">
                    <button onClick={onClose} className="px-6 py-2.5 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">
                        Cerrar
                    </button>
                    <button onClick={handleSave} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 cursor-pointer hover:scale-105">
                        Guardar y Conectar
                    </button>
                </div>
            </div>
        </div>
    );
};