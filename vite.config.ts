import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: "::",
    port: 5180,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api-nvidia": {
        target: "https://integrate.api.nvidia.com",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api-nvidia/, ""),
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react', 'date-fns', 'clsx', 'tailwind-merge'],
          supabase: ['@supabase/supabase-js'],
          query: ['@tanstack/react-query'],
        }
      }
    }
  }
}));
