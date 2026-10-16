import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
    publicDir: "assets",
    plugins: [
        react(),
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: ["favicon.png", "icon.png"],
            manifest: {
                name: "THAI STRICKER",
                short_name: "THAI STRICKER",
                description: "Personal Muay Thai training journal",
                theme_color: "#131315",
                background_color: "#131315",
                display: "standalone",
                orientation: "portrait",
                start_url: "/",
                icons: [
                    { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
                    { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
                ]
            },
            workbox: {
                navigateFallback: "/index.html",
                globPatterns: ["**/*.{js,css,html,png,svg,woff2}"],
                cleanupOutdatedCaches: true
            }
        })
    ]
});
