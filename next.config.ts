import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite ships its own WASM assets — keep it out of the bundler.
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
