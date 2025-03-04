// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001, // Use a different port than your backend
    proxy: {
      "/api": {
        target: "http://localhost:3000", // Your backend URL
        changeOrigin: true,
      },
    },
  },
});
