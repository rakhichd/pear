import type { NextConfig } from "next";
import { join } from 'path';

const nextConfig: NextConfig = {
  /* config options here */
  
  // Add static file serving from the data directory
  async rewrites() {
    return [
      {
        source: '/data/:path*',
        destination: '/:path*',
      },
    ]
  },
  
  // Make data directory accessible for PDF viewing
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
