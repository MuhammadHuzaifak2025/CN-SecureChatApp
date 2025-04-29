import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['placehold.co', 'image.tmdb.org'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
