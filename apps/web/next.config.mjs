/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@workspace/ui', '@workspace/api', '@workspace/firebase'],
};

export default nextConfig;
