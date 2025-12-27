import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  // Add more production optimizations as needed
};

export default nextConfig;
