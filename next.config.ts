import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 移除这里的 headers 配置，改用 middleware.ts 统一管理
  // 避免多处配置导致冲突或覆盖问题
};

export default nextConfig;