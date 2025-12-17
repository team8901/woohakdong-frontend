/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@workspace/ui',
    '@workspace/api',
    '@workspace/firebase',
    '@workspace/store',
    '@workspace/react-query',
    '@workspace/msw',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  allowedDevOrigins: ['local.woohakdong.com'],
  async rewrites() {
    const isDev = process.env.NODE_ENV === 'development'; // eslint-disable-line no-undef

    // 로컬 개발환경에서만 프록시 적용 (쿠키 SameSite 이슈 우회)
    if (isDev) {
      return [
        {
          source: '/api/:path*',
          destination: 'https://api.woohakdong.com/:path*',
        },
      ];
    }

    return [];
  },
};

export default nextConfig;
