import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
    plugins: [react()],
    publicDir: false,
    build: {
        outDir: 'dist/content',
        emptyOutDir: false,
        cssCodeSplit: false,
        lib: {
            entry: resolve(__dirname, 'src/content/content.jsx'),
            name: 'CorgiContent',
            formats: ['iife'],
            fileName: () => 'content.js'
        },
        rollupOptions: {
            output: {
                assetFileNames: 'content.[ext]',
                inlineDynamicImports: true
            }
        }
    },
    css: {
        postcss: './postcss.config.js'
    },
    define: {
        'process.env.NODE_ENV': '"production"'
    }
})
