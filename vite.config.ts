import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'ખેડૂત ખર્ચ નોંધ',
        short_name: 'ખર્ચ નોંધ',
        description: 'ખેડૂતો માટે પાક ખર્ચ અને નફો-ખોટ નોંધવાની ઓફલાઇન એપ્લિકેશન',
        lang: 'gu',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F7F4EC',
        theme_color: '#2F6B4F',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        // ── PWA App Shortcuts (Android long-press on home screen icon) ──
        shortcuts: [
          {
            name: 'ઝડપી ખર્ચ ઉમેરો',
            short_name: 'ખર્ચ ઉમેરો',
            description: 'સૌથી છેલ્લી ચાલુ ખેતીમાં ખર્ચ ઝડપથી ઉમેરો',
            url: '/quick-add',
            icons: [{ src: '/icons/shortcut-add-96.png', sizes: '96x96', type: 'image/png' }],
          },
          {
            name: 'વૉઇસ એન્ટ્રી',
            short_name: 'વૉઇસ',
            description: 'બોલીને ખર્ચ ઉમેરો — ઝડપથી!',
            url: '/quick-add?voice=1',
            icons: [{ src: '/icons/shortcut-voice-96.png', sizes: '96x96', type: 'image/png' }],
          },
        ],

      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,ttf,woff,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
})
