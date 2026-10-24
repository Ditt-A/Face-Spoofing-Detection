import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "FSD_");
  const target =
    process.env.FSD_API_URL || env.FSD_API_URL || "http://127.0.0.1:8301";
  const proxy = {
    "/api": { target, changeOrigin: true, proxyTimeout: 30_000 },
  };
  return {
    plugins: [react()],
    base: "./",
    server: { proxy },
    preview: { proxy },
  };
});
