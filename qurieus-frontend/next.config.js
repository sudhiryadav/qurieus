/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  webpack: (config, { isServer, dev }) => {
    if (dev && !isServer) {
      config.devtool = 'source-map';
    }
    return config;
  },
}

module.exports = nextConfig
