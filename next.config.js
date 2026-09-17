/** @type {import('next').NextConfig} */

const repo = 'practice' // Your repository name
const assetPrefix = `/${repo}/`
const basePath = `/${repo}`

const nextConfig = {
  output: 'export', // Required for static export (needed for GitHub Pages)
  assetPrefix: process.env.NODE_ENV === 'production' ? assetPrefix : undefined,
  basePath: process.env.NODE_ENV === 'production' ? basePath : undefined,
  env: {
    NEXT_PUBLIC_GOOGLE_TTS_API_KEY: process.env.GOOGLE_TTS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY || '',
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    NEXT_PUBLIC_BUILD_VERSION: process.env.NEXT_PUBLIC_BUILD_VERSION || 'dev-local',
  },
};

module.exports = nextConfig;
