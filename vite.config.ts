import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

// Tailwind v4 is processed through PostCSS (@tailwindcss/postcss in
// postcss.config.mjs). The @tailwindcss/vite plugin silently no-ops on
// Vite 8.x (its transform errors are swallowed, leaving raw @theme/@apply
// directives in the built CSS), so it must not be used here.
export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.tsx'],
            refresh: true,
        }),
        react(),
    ],
});
