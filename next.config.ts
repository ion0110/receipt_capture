import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // 静的エクスポート（GitHub Pages対応）
  images: {
    unoptimized: true, // 静的エクスポート時は画像最適化を無効化
  },
  // GitHub Pagesでリポジトリ名をサブパスにする場合は以下を設定
  // basePath: '/repository-name',
  // assetPrefix: '/repository-name/',
};

export default nextConfig;
