import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Static export for GitHub Pages */
  output: 'export',
  env: {
    NEXT_PUBLIC_GOOGLE_TTS_API_KEY: process.env.GOOGLE_TTS_API_KEY || '',
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || '',
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
