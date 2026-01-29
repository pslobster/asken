# appディレクトリの作成
mkdir -p app
cd app

# Viteプロジェクトの初期化（React + TypeScript）
# 既存ディレクトリへの展開のため --yes を使用
npm create vite@latest . --yes -- --template react-ts

# 依存関係のインストール
npm install --yes