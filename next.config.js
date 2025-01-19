/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude Firebase Functions from Next.js compilation
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.externals.push({
      'firebase-functions': 'firebase-functions',
    });
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60,
  },
}

module.exports = nextConfig 