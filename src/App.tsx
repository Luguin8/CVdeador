import { useState } from "react";
import { useAppLogic } from "./hooks/useAppLogic";
import { useCooldown } from "./hooks/useCooldown";
import { Dropzone, FileData } from "./components/Dropzone";

function App() {
  // Quitamos generateCV de la destructuración para que TypeScript no se queje
  const { config, isGenerating, error } = useAppLogic();
  const { isCoolingDown, formattedTime } = useCooldown(config?.last_usage || 0);

  const [jobData, setJobData] = useState<FileData | null>(null);

  // ¡NUEVA TRAMPA DE ERRORES!: Si falla el Backend, te lo mostramos visualmente
  if (error && !config) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#0f172a] p-6">
        <div className="bg-red-500/10 border border-red-500 p-6 rounded-xl max-w-lg text-center shadow-lg">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error de conexión con el Backend (Rust)</h2>
          <p className="text-sm text-slate-300 mb-4">{error}</p>
          <p className="text-xs text-slate-500 bg-black/50 p-3 rounded">
            👉 <b>Acción requerida:</b> Haz click derecho aquí, elige "Inspeccionar" (o F12), ve a la pestaña "Consola" y pasame el texto rojo que aparezca ahí.
          </p>
        </div>
      </div>
    );
  }

  if (!config) {
    return <div className="flex h-screen items-center justify-center text-slate-400 bg-[#0f172a]">Cargando configuración...</div>;
  }

  const hasCustomKey = config.api_key_user.trim().length > 0;
  const canGenerate = !isGenerating && (!isCoolingDown || hasCustomKey) && jobData !== null;

  const handleJobDataSelected = (data: FileData) => {
    console.log("Vacante cargada:", data.path ? "Vía archivo" : "Vía portapapeles/drop");
    setJobData(data);
  };

  const handleGenerateClick = async () => {
    if (!jobData) return;

    // Usamos el console.log para validar que el botón funciona sin dejar variables huerfanas
    console.log("Iniciando generación con los datos:", jobData);
    alert("¡Flujo conectado! En el próximo paso unimos esto con Gemini.");
  };

  return (
    <main className="flex h-screen flex-col bg-[#0f172a] text-white p-6">
      <header className="mb-8 flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            ATS-Optimizer Portable
          </h1>
          <p className="text-xs text-slate-500 mt-1">Local-First CV Generator</p>
        </div>

        <div className="flex items-center gap-3">
          {!hasCustomKey && isCoolingDown && (
            <span className="text-sm font-mono text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              Cooldown: {formattedTime}
            </span>
          )}
          {hasCustomKey && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">
              PRO KEY ACTIVA
            </span>
          )}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-6 flex-1">
        <Dropzone
          title="1. Tu CV Base"
          description="Arrastrá tu PDF actual o revisá el texto guardado."
          extractedText={config.cv_base_text || "Aún no hay un CV base guardado."}
          onDataSelected={(data) => console.log("CV Base seleccionado:", data)}
          acceptTextOnly={true}
        />

        <Dropzone
          title="2. La Vacante"
          description="Arrastrá o pegá (Ctrl+V) una captura o PDF de los requisitos."
          onDataSelected={handleJobDataSelected}
          extractedText={jobData ? "✅ Vacante cargada lista para analizar" : undefined}
        />
      </div>

      <footer className="mt-6 flex justify-between items-center">
        {/* Aquí mostramos errores no críticos (ej: falló la IA) */}
        <p className="text-red-400 text-sm max-w-md truncate">{error || ""}</p>

        <div className="ml-auto flex gap-4">
          <button className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
            Ajustes
          </button>

          <button
            disabled={!canGenerate}
            onClick={handleGenerateClick}
            className={`px-6 py-2 rounded-lg font-bold shadow-lg transition-all ${canGenerate
                ? "bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/25 text-white"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
          >
            {isGenerating ? "Procesando..." : "Optimizar CV"}
          </button>
        </div>
      </footer>
    </main>
  );
}

export default App;