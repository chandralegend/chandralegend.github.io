import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site — deployable to GitHub Pages or any static host.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
