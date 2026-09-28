import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Brand fonts read from disk when rendering visuals and carousels.
  outputFileTracingIncludes: {
    '/**': ['./lib/studio/media/fonts/**'],
  },
  experimental: {
    ppr: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
};

export default nextConfig;
