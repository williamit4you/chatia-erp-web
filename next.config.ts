import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5217';
    return [
      {
        source: '/api/superadmin/:path*',
        destination: `${apiUrl}/api/superadmin/:path*`,
      },
      {
        source: '/api/chat/:path*',
        destination: `${apiUrl}/api/chat/:path*`,
      },
      {
        source: '/api/admin/:path*',
        destination: `${apiUrl}/api/admin/:path*`,
      },
      {
        source: '/api/register/:path*',
        destination: `${apiUrl}/api/register/:path*`,
      },
    ];
  },
};

export default nextConfig;
