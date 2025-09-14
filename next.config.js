/**
 * Next.js 配置文件
 * 说明：保持最小化配置，方便后续扩展（如导出静态、实验特性等）
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  }
};

module.exports = nextConfig;

