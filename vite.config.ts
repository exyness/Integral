import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
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
        manualChunks(id) {
          // React core - must be checked first and separate
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/")
          ) {
            return "react-vendor";
          }
          // React Router
          if (id.includes("node_modules/react-router")) {
            return "router-vendor";
          }
          // Radix UI components
          if (id.includes("node_modules/@radix-ui")) {
            return "ui-vendor";
          }
          // Tanstack Query
          if (id.includes("node_modules/@tanstack")) {
            return "query-vendor";
          }
          // Supabase
          if (id.includes("node_modules/@supabase")) {
            return "supabase-vendor";
          }
          // Lexical editor - keep with React to avoid dependency issues
          if (
            id.includes("node_modules/lexical") ||
            id.includes("node_modules/@lexical")
          ) {
            return "react-vendor";
          }
          // Framer Motion
          if (id.includes("node_modules/framer-motion")) {
            return "animation-vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
}));
