import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Frames are always emitted as separate files (never inlined as base64),
    // so the browser can cache and stream them individually.
    assetsInlineLimit: 0,
  },
})
