import React from 'react';
// CORRECCIÓN: Importamos openUrl en lugar de open
import { openUrl } from '@tauri-apps/plugin-opener';

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
                            className="text-[10px] font-bold text-red-400 bg-red-400/10 hover:bg-red-400/20 px-2 py-1 rounded border border-red-400/20 cursor-pointer animate-pulse uppercase tracking-tighter"
                        >
                            🔴 REQUIERE API KEY (Configurar aquí)
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-end gap-2 text-[10px] uppercase tracking-widest font-bold">
                <div className="flex gap-4 border border-slate-700 bg-slate-900/50 p-2 rounded-lg">
                    {/* CORRECCIÓN: Usamos openUrl() en todos los botones */}
                    <button onClick={() => openUrl('https://cafecito.app/lugomartin')} className="text-orange-400 hover:text-orange-300 transition-colors cursor-pointer">
                        ☕ Cafecito
                    </button>
                    <button onClick={() => openUrl('https://www.paypal.com/paypalme/lugomartin')} className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
                        💙 PayPal
                    </button>
                    <button onClick={() => openUrl('mailto:lugoamartin@gmail.com')} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                        ✉️ Contacto
                    </button>
                </div>
                <span className="text-slate-600 mr-1 italic">v1.0.0 Stable Build</span>
            </div>
        </header>
    );
};