import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/RBOAS-System/' : '/',
  build: { outDir: 'dist', sourcemap: false },
})
