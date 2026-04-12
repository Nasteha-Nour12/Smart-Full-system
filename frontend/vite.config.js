import { defineConfig } from 'vite'; 
import react from '@vitejs/plugin-react-swc'; 
import tailwindcss from '@tailwindcss/vite'; 
 
export default defineConfig({ 
  plugins: [react(), tailwindcss()], 
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
  build: { 
    chunkSizeWarningLimit: 1000, 
  }, 
});
