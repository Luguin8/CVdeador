import React, { useState, useEffect } from 'react';
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

    // Actualiza el estado local si la config cambia por detrás
    useEffect(() => {
        setApiKey(config.api_key_user);
        setSelectedModel(config.selected_model || 'gemini-1.5-flash');
    }, [config]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave({
            ...config,
            api_key_user: apiKey.trim(),
            selected_model: selectedModel,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md p-6 shadow-2xl">
                <h2 className="text-xl font-bold text-slate-200 mb-4">Ajustes del Sistema</h2>

                <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                        Google Gemini API Key
                    </label>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                        Consigue tu clave gratis en <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-indigo-400">aistudio.google.com</a>
                    </p>
                </div>

                <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                        Modelo de Inteligencia Artificial
                    </label>
                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                        <option value="gemini-1.5-flash">Gemini 1.5 Flash (Rápido/Recomendado)</option>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro (Más potente)</option>
                        <option value="gemini-2.0-flash">Gemini 2.0 Flash (Nuevo)</option>
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    </select>
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition-colors">
                        Guardar Ajustes
                    </button>
                </div>
            </div>
        </div>
    );
};