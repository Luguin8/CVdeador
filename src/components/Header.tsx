import React from 'react';
import { open } from '@tauri-apps/plugin-opener';

interface HeaderProps {
    hasCustomKey: boolean;
    onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ hasCustomKey, onOpenSettings }) => {
    return (
        <header className="mb-8 flex justify-between items-start border-b border-slate-800 pb-4 relative">
            <div>
                <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                    ATS-Optimizer Portable
                </h1>
                <p className="text-xs text-slate-500 mt-1">Local-First CV Generator</p>

                <div className="mt-3 flex items-center gap-3">
                    {hasCustomKey ? (
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">
                            🟢 IA CONECTADA
                        </span>
                    ) : (
                        <button
                            onClick={onOpenSettings}
                            className="text-xs font-bold text-red-400 bg-red-400/10 hover:bg-red-400/20 px-2 py-1 rounded border border-red-400/20 cursor-pointer animate-pulse"
                        >
                            🔴 REQUIERE API KEY (Click aquí)
                        </button>
                    )}
                </div>
            </div>
            {/* Sección de Monetización y Contacto */}
            <div className="flex flex-col items-end gap-2 text-[10px] uppercase tracking-widest font-bold">
                <div className="flex gap-4 border border-slate-700 bg-slate-900/50 p-2 rounded-lg">
                    <a href="https://cafecito.app/lugomartin" target="_blank" className="text-orange-400 hover:text-orange-300 transition-colors">
                        ☕ Cafecito
                    </a>
                    <a href="https://www.paypal.com/paypalme/lugomartin" target="_blank" className="text-blue-400 hover:text-blue-300 transition-colors">
                        💙 PayPal
                    </a>
                    <a href="mailto:lugoamartin@gmail.com" className="text-slate-400 hover:text-white transition-colors">
                        ✉️ Contacto
                    </a>
                </div>
                <span className="text-slate-600 mr-1">v1.0.0 Stable</span>
            </div>
        </header>
    );
};