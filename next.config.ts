import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 保持你原有的配置不变 */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            // 重点是添加了 'unsafe-eval'
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel.app;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
