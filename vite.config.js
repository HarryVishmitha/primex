import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
    ],
    // Ensure Vite is accessible from the host when running inside Sail (Docker)
    server: {
        host: '0.0.0.0',
        port: parseInt(process.env.VITE_PORT || '5173'),
        strictPort: true,
        hmr: {
            host: 'localhost',
            port: parseInt(process.env.VITE_PORT || '5173'),
        },
        // Docker file watching can be finicky on some hosts
        watch: {
            usePolling: true,
        },
    },
});
