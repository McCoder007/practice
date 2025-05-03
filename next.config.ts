import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Static export for GitHub Pages */
  output: 'export',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '/practice',
  env: {
    NEXT_PUBLIC_GOOGLE_TTS_API_KEY: process.env.GOOGLE_TTS_API_KEY || '',
    NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH || '/practice',
  },
  basePath: '/practice',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
