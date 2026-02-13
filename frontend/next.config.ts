import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone', // Enable for Docker optimization
  typescript: {
    // Skip type checking during build in production (type-check in CI/dev)
    ignoreBuildErrors: process.env.SKIP_TYPE_CHECK === 'true',
  },
  eslint: {
    // Skip ESLint during build in production (lint in CI/dev)
    ignoreDuringBuilds: process.env.SKIP_TYPE_CHECK === 'true',
  },
};

export default nextConfig;
