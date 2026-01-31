import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                popup: resolve(__dirname, 'src/popup/index.html'),
            },
            output: {
                entryFileNames: 'popup/[name].js',
                chunkFileNames: 'assets/[name].js',
                assetFileNames: 'popup/[name].[ext]'
            }
        },
    },
    publicDir: 'public',
})
