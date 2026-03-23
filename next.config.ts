import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse touches test fixtures when bundled; load from node_modules at runtime
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
