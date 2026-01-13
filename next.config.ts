import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "slokasukun.com" }],
        destination: "https://www.slokasukun.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
