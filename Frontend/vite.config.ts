import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  return {
    server: {
      host: "::",
      port: 8080,
      open: true,
      strictPort: true,
      proxy: mode === "development"
        ? {
            "/health": {
              target: "https://api.cors.syrins.tech",
              changeOrigin: true,
            },
          }
        : undefined,
    },
    plugins: [
      react(),
      ...(mode === "development" ? [componentTagger()] : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    esbuild: {
      jsx: "automatic",
    },
  };
});
