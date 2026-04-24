// debug_models.js
// Toma la API Key de los argumentos de la consola para no hardcodearla
const apiKey = process.argv[2];

if (!apiKey) {
    console.log("❌ ERROR: Te faltó poner la API Key al ejecutar el script.");
    console.log("👉 Uso correcto: node debug_models.js AIzaSyTuClaveAqui...");
    process.exit(1);
}

// Usamos v1beta que es el endpoint más permisivo para listar todo lo que tienes
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log("🔍 Consultando a Google AI Studio...");

fetch(url)
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            console.error("\n❌ Error de Google:", data.error.message);
            return;
        }

        console.log("\n✅ MODELOS DISPONIBLES PARA TU CLAVE:\n");

        // Filtramos solo los que sirven para generar texto/chat
        const validModels = data.models.filter(m =>
            m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")
        );

        validModels.forEach(m => {
            // Limpiamos el prefijo 'models/' para que veas exactamente qué poner en React
            const cleanName = m.name.replace('models/', '');
            console.log(`📌 Alias para usar: ${cleanName}`);
            console.log(`   Descripción:     ${m.displayName}`);
            console.log("--------------------------------------------------");
        });

        console.log("\n⚠️ POR FAVOR, PEGA LA LISTA DE ALIAS AQUÍ. ¡NO PEGES TU API KEY! ⚠️\n");
    })
    .catch(err => console.error("Error de red:", err));