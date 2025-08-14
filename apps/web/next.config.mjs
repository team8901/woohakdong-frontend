/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@workspace/ui',
    '@workspace/api',
    '@workspace/firebase',
    '@workspace/store',
    '@workspace/react-query',
  ],
};

export default nextConfig;
