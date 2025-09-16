/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ["localhost", "og-playground.vercel.app"],
  },
};

module.exports = nextConfig;
