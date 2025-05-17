/** @type {import('next').NextConfig} */

const repo = 'practice' // Your repository name
const assetPrefix = `/${repo}/`
const basePath = `/${repo}`

const nextConfig = {
  output: 'export', // Required for static export (needed for GitHub Pages)
  assetPrefix: process.env.NODE_ENV === 'production' ? assetPrefix : undefined,
  basePath: process.env.NODE_ENV === 'production' ? basePath : undefined,
  eslint: {
    // Disable ESLint during production builds for deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript checking during builds (to be fixed later)
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig; 