import { defineConfig } from 'vite' // Trigger rebuild for env vars
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'prompt',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
            manifest: {
                name: 'Copa Delta',
                short_name: 'Copa Delta',
                description: 'App oficial de la Copa Delta',
                theme_color: '#0a0e1a',
                background_color: '#0a0e1a',
                display: 'standalone',
                icons: [
                    {
                        src: 'pwa-192x192.png?v=2',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png?v=2',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            }
        })
    ],
})
