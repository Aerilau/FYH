import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('.', import.meta.url)));

export default defineConfig({ plugins: [react()], build: { outDir: 'dist', rollupOptions: { input: { newtab: resolve(projectRoot, 'index.html') } } } });
