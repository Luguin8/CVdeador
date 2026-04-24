// Archivo: debug_gemini.js
const API_KEY = "AIzaSyCUgfTeXXhQiobYJmAGFrdeQTt-jPieVeM";

// Probamos primero con v1beta que suele tener la lista más completa
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

console.log("Consultando a Google AI Studio los modelos disponibles...");

fetch(url)
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            console.error("❌ Error con tu API Key:", data.error.message);
            return;
        }

        console.log("\n✅ Modelos disponibles para tu cuenta y región:\n");

        // Filtramos solo los modelos que sirven para generar texto (generateContent)
        const validModels = data.models.filter(m =>
            m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")
        );

        validModels.forEach(m => {
            console.log(`📌 Nombre exacto: ${m.name}`);
            console.log(`   Descripción: ${m.displayName}`);
            console.log(`   Versión API sugerida: ${m.version || 'N/A'}`);
            console.log("--------------------------------------------------");
        });

        console.log(`\n💡 INSTRUCCIÓN: Copiá el que diga "models/gemini-1.5-flash..." y ponelo en tu código de Rust.\n`);
    })
    .catch(err => console.error("Error de red:", err));