import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";

interface ResultModalProps {
    html: string | null;
    onClose: () => void;
}

export function ResultModal({ html, onClose }: ResultModalProps) {
    const [saved, setSaved] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [view, setView] = useState<"preview" | "code">("preview");

    if (html === null) return null;

    const handleSave = async () => {
        setSaving(true);
        try {
            const path = await save({
                defaultPath: "CV-ATS-optimizado.html",
                filters: [{ name: "HTML", extensions: ["html"] }],
            });
            if (path) {
                const finalPath = await invoke<string>("save_html_cv", { path, html });
                setSaved(finalPath);
            }
        } catch (e) {
            alert("No se pudo guardar: " + e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl h-[90vh] shadow-2xl flex flex-col">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-200">CV optimizado para ATS</h2>
                        <p className="text-xs text-slate-400">HTML puro, listo para exportar a PDF desde el navegador.</p>
                    </div>
                    <div className="flex gap-1 bg-slate-950 rounded-lg p-1">
                        <button
                            onClick={() => setView("preview")}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${view === "preview" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                        >
                            Vista previa
                        </button>
                        <button
                            onClick={() => setView("code")}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${view === "code" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                        >
                            Código HTML
                        </button>
                    </div>
                </div>

                <div className="flex-1 min-h-0 overflow-hidden bg-white">
                    {view === "preview" ? (
                        <iframe title="CV" srcDoc={html} className="w-full h-full border-0" />
                    ) : (
                        <pre className="w-full h-full overflow-auto bg-slate-950 text-emerald-300 text-xs p-4 font-mono whitespace-pre-wrap">
                            {html}
                        </pre>
                    )}
                </div>

                <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/50 rounded-b-xl">
                    <p className="text-xs text-emerald-400">{saved ? `Guardado en: ${saved}` : ""}</p>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-5 py-2.5 text-sm text-slate-400 hover:text-white transition-colors">
                            Cerrar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-indigo-500/20"
                        >
                            {saving ? "Guardando..." : "💾 Guardar HTML"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
