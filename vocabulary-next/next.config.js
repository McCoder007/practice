/** @type {import('next').NextConfig} */

const repo = 'practice' // Your repository name
const assetPrefix = `/${repo}/`
const basePath = `/${repo}`

// Support for staging environment
const stagingRepo = 'practice-staging' // Staging repository name
const stagingAssetPrefix = `/${stagingRepo}/`
const stagingBasePath = `/${stagingRepo}`

// Determine which configuration to use based on environment
const isProduction = process.env.NODE_ENV === 'production'
const isStaging = process.env.NEXT_PUBLIC_DEPLOY_ENV === 'staging'

const nextConfig = {
  output: 'export', // Required for static export (needed for GitHub Pages)
  assetPrefix: isProduction 
    ? (isStaging ? stagingAssetPrefix : assetPrefix) 
    : undefined,
  basePath: isProduction 
    ? (isStaging ? stagingBasePath : basePath) 
    : undefined,
};

module.exports = nextConfig; 