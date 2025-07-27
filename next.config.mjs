/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove 'swcMinify' as it's enabled by default in Next.js 15
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  images: {
    domains: [
      'maps.googleapis.com',
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com', // For Google profile images
    ],
  },
  // Enable PWA features if needed
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;