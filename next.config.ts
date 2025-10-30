import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // During CI/build we don't want non-critical lint rules to block production builds
    // Adjust or remove this if you prefer strict linting during build.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
