import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/prefectures",
        permanent: false,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.slokasukun.com" }],
        destination: "https://slokasukun.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
