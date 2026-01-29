/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  output: 'export',
  
  images: {
    unoptimized: true, 
    domains: ['images.unsplash.com'],
  },
  
  trailingSlash: true,
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig