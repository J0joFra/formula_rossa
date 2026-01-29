/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  // NIENTE 'output: export', NIENTE 'trailingSlash'
}

module.exports = nextConfig
