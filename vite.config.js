process.env.CSS_TRANSFORMER_WASM = process.env.CSS_TRANSFORMER_WASM ?? '1'

const { defineConfig } = await import('vite')
const react = (await import('@vitejs/plugin-react')).default
const tailwindcss = (await import('@tailwindcss/vite')).default

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },
  base: import.meta.VITE_BASE_PATH || '/'
})
