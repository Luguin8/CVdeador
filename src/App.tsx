import { useState } from "react";
import { useAppLogic } from "./hooks/useAppLogic";
import { Header } from "./components/Header";
import { Dropzone, FileData } from "./components/Dropzone";
import { SettingsModal } from "./components/SettingsModal";

function App() {
  const { config, isGenerating, error, generateCV, saveConfig } = useAppLogic();
  const [jobData, setJobData] = useState<FileData | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (!config) return (
    <div className="flex h-screen items-center justify-center bg-[#0f172a] text-slate-400 font-mono">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span>INITIALIZING CORE...</span>
      </div>
    </div>
  );

  const hasCustomKey = config.api_key_user.trim().length > 0;
  const canGenerate = !isGenerating && hasCustomKey && jobData !== null;

  const handleCVBaseSelected = async (data: FileData) => {
    if (!hasCustomKey) return setIsSettingsOpen(true);

    const prompt = "Extrae todo el texto de mi currículum de forma limpia y estructurada. Ignora el diseño, solo quiero el contenido técnico y profesional.";
    const extracted = await generateCV(prompt, data);
    if (extracted) {
      saveConfig({ ...config, cv_base_text: extracted });
    }
  };

  const handleGenerateClick = async () => {
    if (!jobData || !hasCustomKey) return;
    const prompt = `
      Actúa como experto en reclutamiento ATS.
      MI CV BASE: ${config.cv_base_text}
      REQUISITOS DEL PUESTO: (Ver documento adjunto)
      TAREA: Genera un currículum adaptado usando esta plantilla: ${config.cv_template}
      REGLA: Devuelve solo código HTML, sin markdown ni explicaciones.
    `;
    const result = await generateCV(prompt, jobData);
    if (result) {
      console.log("HTML Generado:", result);
      alert("¡Éxito! CV generado correctamente en la consola.");
    }
  };

  return (
    <main className="flex h-screen flex-col bg-[#0f172a] text-white p-6 overflow-hidden">
      <Header hasCustomKey={hasCustomKey} onOpenSettings={() => setIsSettingsOpen(true)} />

      <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
        <Dropzone
          title="1. Tu CV Base"
          description="Sube tu CV para que la IA lo aprenda."
          extractedText={config.cv_base_text || undefined}
          onDataSelected={handleCVBaseSelected}
        />
        <Dropzone
          title="2. La Vacante"
          description="Arrastra la captura o PDF del puesto."
          onDataSelected={setJobData}
          extractedText={jobData ? "✅ Vacante cargada y lista" : undefined}
        />
      </div>

      <footer className="mt-6 flex justify-between items-center bg-slate-900/30 p-4 rounded-xl border border-slate-800">
        <p className="text-red-400 text-[10px] italic max-w-xl truncate">{error || ""}</p>

        <div className="flex gap-4">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-4 py-3 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            ⚙️ AJUSTES
          </button>
          <button
            disabled={!canGenerate}
            onClick={handleGenerateClick}
            className={`px-8 py-3 rounded-lg font-black tracking-widest uppercase text-xs transition-all ${canGenerate ? "bg-indigo-600 hover:scale-105 shadow-indigo-500/20 shadow-xl cursor-pointer" : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
          >
            {isGenerating ? "ANALIZANDO..." : "OPTIMIZAR AHORA"}
          </button>
        </div>
      </footer>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSave={saveConfig}
      />
    </main>
  );
}

export default App;