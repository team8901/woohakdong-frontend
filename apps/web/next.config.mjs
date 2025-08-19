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
};

export default nextConfig;
