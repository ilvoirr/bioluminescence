import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove output: 'export' for development mode
  // output: 'export',
  trailingSlash: true,
  // distDir: 'out', // Only needed for static export
  images: {
    unoptimized: true, // Disable image optimization for compatibility
  },
};

export default nextConfig;
