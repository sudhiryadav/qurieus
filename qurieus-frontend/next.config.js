/** @type {import('next').NextConfig} */
const nextConfig = {
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
  webpack: (config, { isServer }) => {
    // Suppress "Critical dependency: the request of a dependency is an expression"
    // from @sentry/node -> @opentelemetry/instrumentation (dynamic require)
    config.ignoreWarnings = [
      { module: /node_modules\/@opentelemetry\/instrumentation/ },
    ];
    return config;
  },
}

module.exports = nextConfig
