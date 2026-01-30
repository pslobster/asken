import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // 静的エクスポートを有効化
  images: {
    unoptimized: true, // GitHub Pages では画像最適化がサポートされないため無効化
  },
  // リポジトリ名が 'username.github.io' でない場合は、以下のコメントアウトを解除してリポジトリ名を設定してください
  // basePath: '/repository-name',
};

export default nextConfig;
