import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'  // এই লাইন যোগ করো

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // এই লাইন যোগ করো
  ],
})