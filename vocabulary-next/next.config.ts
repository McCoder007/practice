import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Static export for GitHub Pages */
  output: 'export',
  env: {
    NEXT_PUBLIC_GOOGLE_TTS_API_KEY: process.env.GOOGLE_TTS_API_KEY || '',
  },
  basePath: '/practice/vocabulary-next-out',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
