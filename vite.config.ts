// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Allow targeting different deploy platforms via NITRO_PRESET.
// - On Lovable / Cloudflare (default): cloudflare-module preset -> dist/server + dist/client
// - On Vercel: set NITRO_PRESET=vercel to emit the Build Output API v3 layout in .vercel/output
const isVercel = process.env.VERCEL === "1" || process.env.NITRO_PRESET === "vercel";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // When building on Vercel, produce the standard Vercel Build Output API v3
  // structure so Vercel auto-detects the SSR function + static assets.
  ...(isVercel
    ? {
        nitro: {
          preset: "vercel",
          output: {
            dir: ".vercel/output",
            serverDir: ".vercel/output/functions/__server.func",
            publicDir: ".vercel/output/static",
          },
        },
      }
    : {}),
});
