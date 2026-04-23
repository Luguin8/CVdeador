import { useState } from "react";
import { useAppLogic } from "./hooks/useAppLogic";
import { useCooldown } from "./hooks/useCooldown";
import { Header } from "./components/Header";
import { Dropzone, FileData } from "./components/Dropzone";
import { SettingsModal } from "./components/SettingsModal";

function App() {
  const { config, isGenerating, error, generateCV, saveConfig } = useAppLogic();
  const { isCoolingDown, formattedTime } = useCooldown(config?.last_usage || 0);
  const [jobData, setJobData] = useState<FileData | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  if (!config) return <div className="flex h-screen items-center justify-center bg-[#0f172a] text-slate-400 font-mono">BOOTING SYSTEM...</div>;

  const hasCustomKey = config.api_key_user.trim().length > 0;
  const canGenerate = !isGenerating && (!isCoolingDown || hasCustomKey) && jobData !== null;

  // Fase 1: Ingesta del CV Base (Opcional si ya existe texto)
  const handleCVBaseSelected = async (data: FileData) => {
    const prompt = "Extrae todo el texto de mi currículum de forma limpia y estructurada. Ignora diseños, solo quiero el contenido técnico y profesional.";
    const extracted = await generateCV(prompt, data);
    if (extracted) {
      saveConfig({ ...config, cv_base_text: extracted });
    }
  };

  // Fase 2: Generación Final
  const handleGenerateClick = async () => {
    if (!jobData) return;
    const prompt = `
      Actúa como experto en reclutamiento ATS.
      MI CV BASE: ${config.cv_base_text}
      REQUISITOS DEL PUESTO: (Ver documento adjunto)
      
      TAREA: Genera un currículum adaptado usando esta plantilla: ${config.cv_template}
      REGLA: Devuelve solo código HTML, sin markdown ni explicaciones.
    `;
    const result = await generateCV(prompt, jobData);
    if (result) {
      console.log("CV Generado:", result);
      // Próximamente: Renderizado del resultado
    }
  };

  return (
    <main className="flex h-screen flex-col bg-[#0f172a] text-white p-6 overflow-hidden">
      <Header isCoolingDown={isCoolingDown} formattedTime={formattedTime} hasCustomKey={hasCustomKey} />

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
          extractedText={jobData ? "✅ Vacante lista" : undefined}
        />
      </div>

      <footer className="mt-6 flex justify-between items-center bg-slate-900/30 p-4 rounded-xl border border-slate-800">
        <p className="text-red-400 text-xs italic">{error || ""}</p>
        <button
          disabled={!canGenerate}
          onClick={handleGenerateClick}
          className={`px-8 py-3 rounded-lg font-black tracking-widest uppercase text-xs transition-all ${canGenerate ? "bg-indigo-600 hover:scale-105 shadow-indigo-500/20 shadow-xl" : "bg-slate-800 text-slate-500"
            }`}
        >
          {isGenerating ? "Generando..." : "Optimizar Ahora"}
        </button>
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