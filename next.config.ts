import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            // 允许 unsafe-eval 以解决部分依赖或环境导致的 CSP 问题
            // 注意：生产环境建议根据实际情况收紧策略
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; connect-src 'self' https:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;