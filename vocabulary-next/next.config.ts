import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Static export for GitHub Pages */
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
