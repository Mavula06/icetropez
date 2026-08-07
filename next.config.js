/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  staticPageGenerationTimeout: 300,
  output: 'standalone',
};

module.exports = nextConfig;
