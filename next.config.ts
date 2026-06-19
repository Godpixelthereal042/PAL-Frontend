import type { NextConfig } from "next";

const nextConfig = {
  devIndicators: false,
  serverExternalPackages: ["sqlite3", "sqlite"],
} as any;

export default nextConfig;
