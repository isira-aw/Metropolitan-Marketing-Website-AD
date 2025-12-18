/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Local backend
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/uploads/**',
      },

      // Railway deployed backend
      {
        protocol: 'https',
        hostname: 'metropolitan-marketing-website-b-production-4c0a.up.railway.app',
        pathname: '/uploads/**',
      },
    ],
  },
};

module.exports = nextConfig;
