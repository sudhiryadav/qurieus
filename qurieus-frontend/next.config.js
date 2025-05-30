/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    turbo: {
      rules: {
        // Configure Turbopack rules here
        '*.{js,jsx,ts,tsx}': ['eslint'],
      },
    },
  },
  // Ensure proper handling of route groups
  trailingSlash: false,
  basePath: '',
  async rewrites() {
    return [
      {
        source: '/signup',
        destination: '/signup',
      },
      {
        source: '/login',
        destination: '/login',
      },
    ];
  },
}

module.exports = nextConfig
