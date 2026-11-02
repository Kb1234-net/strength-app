import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Phones pick up new versions automatically when you deploy
      registerType: 'autoUpdate',

      // The "manifest" is what makes the phone treat this site as an installable app
      manifest: {
        name: 'Strength Tracker',
        short_name: 'Tracker',
        description: 'Workouts, macros, and reminders for me and my family',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone', // full screen, no browser address bar
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
