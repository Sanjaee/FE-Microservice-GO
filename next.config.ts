import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: ["lh3.googleusercontent.com", "images.unsplash.com", "assets.adidas.com", "static.nike.com"],
  },
};

export default nextConfig;
