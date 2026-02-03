import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, join } from 'path'
import { existsSync, copyFileSync, rmSync, readFileSync, writeFileSync } from 'fs'

export default defineConfig({
    plugins: [
        react(),
        {
            name: 'fix-popup-html',
            writeBundle(options) {
                const srcPath = join(options.dir, 'src/popup/index.html')
                const destPath = join(options.dir, 'popup/index.html')

                if (existsSync(srcPath)) {
                    // Read the HTML and fix the paths
                    let html = readFileSync(srcPath, 'utf-8')
                    // Fix paths from ../../popup/ or /popup/ to ./
                    html = html.replace(/src="[^"]*popup\//g, 'src="./')
                    html = html.replace(/href="[^"]*popup\//g, 'href="./')

                    writeFileSync(destPath, html)
                    rmSync(join(options.dir, 'src'), { recursive: true })
                }
            }
        }
    ],
    base: '',
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
