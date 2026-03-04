import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/api/superadmin/:path*',
        destination: 'http://127.0.0.1:5217/api/superadmin/:path*',
      },
      {
        source: '/api/chat/:path*',
        destination: 'http://127.0.0.1:5217/api/chat/:path*',
      },
      {
        source: '/api/admin/:path*',
        destination: 'http://127.0.0.1:5217/api/admin/:path*',
      },
      {
        source: '/api/register/:path*',
        destination: 'http://127.0.0.1:5217/api/register/:path*',
      },
    ];
  },
};

export default nextConfig;
