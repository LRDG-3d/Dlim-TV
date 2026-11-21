import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' = rutas relativas: funciona en GitHub Pages con cualquier nombre de repositorio.
export default defineConfig({ plugins: [react()], base: './',
  // Temporal para diagnóstico: nombres legibles en los errores. Quitar cuando se resuelva.
  build: { minify: false },
})
