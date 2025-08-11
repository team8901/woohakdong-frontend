/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@workspace/ui', '@workspace/api', '@workspace/store'],
};

export default nextConfig;
