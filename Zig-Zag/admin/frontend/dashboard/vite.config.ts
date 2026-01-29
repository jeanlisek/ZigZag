import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ command }) => {
  // En production/build, utiliser le base path /admin/
  // En développement, servir depuis la racine pour faciliter l'accès local
  const base = command === 'build' ? '/admin/' : '/'

  return {
    plugins: [react()],
    base,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: '../../../admin-dist',
      emptyOutDir: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            // Séparer React et React-DOM
            'react-vendor': ['react', 'react-dom'],
            // Séparer Recharts (librairie de graphiques lourde)
            'recharts': ['recharts'],
            // Séparer Supabase
            'supabase': ['@supabase/supabase-js'],
          },
        },
      },
    },
    server: {
      port: 5173,
      open: true,
    },
  }
})

