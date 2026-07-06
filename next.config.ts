import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite ships its own WASM assets — keep it out of the bundler.
  serverExternalPackages: ["@electric-sql/pglite"],

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // No one may embed this site in a frame (clickjacking protection —
          // matters most for the signed-in owner's Edit/Delete buttons).
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
