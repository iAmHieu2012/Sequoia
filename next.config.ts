import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets `next dev` accept requests from this LAN address (testing on a phone).
  allowedDevOrigins: ['192.168.1.11'],
};

export default nextConfig;
