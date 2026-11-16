import { defineConfig, loadEnv } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { VitePWA } from 'vite-plugin-pwa'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.BACKEND_BASE_URL || 'http://localhost:8000'

  return {
    resolve: { tsconfigPaths: true },
    server: {
      proxy: {
        // Dev-only proxy: /api/* -> http://localhost:8000/api/*
        // Avoids CORS issues when the backend runs on another port.
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [
      devtools(),
      tailwindcss(),
      tanstackStart(),
      viteReact(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: false,
        outDir: 'dist/client',
        includeAssets: ['icons/*.png'],
        manifest: {
          id: '/',
          name: '7B Coffee POS',
          short_name: '7B POS',
          description:
            'Aplikasi kasir (POS) 7B Coffee - katalog, pesanan, dan pembayaran.',
          lang: 'id',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'any',
          background_color: '#f7f5f0',
          theme_color: '#2f6b4f',
          categories: ['business', 'productivity'],
          icons: [
            {
              src: '/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/icons/maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          // Authenticated API calls must never be served from the precache.
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              // SSR app: cache document navigations so the app still opens offline.
              urlPattern: ({ request }) => request.mode === 'navigate',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'pages',
                networkTimeoutSeconds: 3,
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24,
                },
              },
            },
            {
              urlPattern: /\.(?:js|css|woff2?)$/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'assets',
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|webp|ico)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images',
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
          ],
        },
        devOptions: {
          // Enable the manifest + dev service worker so the browser install
          // prompt/icon also shows while running `npm run dev`.
          enabled: true,
          type: 'module',
          navigateFallback: '/',
          suppressWarnings: true,
        },
      }),
    ],
  }
})

export default config
