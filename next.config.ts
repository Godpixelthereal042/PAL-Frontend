import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  serverExternalPackages: ["sqlite3", "sqlite"],
  turbopack: {},
};

export default nextConfig;
