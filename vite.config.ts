import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Evita que Vite borre la pantalla de la terminal, ocultando logs de Rust
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // Ignora los cambios en el backend para que Vite no recargue en un loop
      ignored: ["**/src-tauri/**"],
    },
  },
})