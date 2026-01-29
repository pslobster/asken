# Viteプロジェクトの初期化 (既存ディレクトリへの展開を許可)
npm create vite@latest . --yes -- --template react-ts

# 依存関係のインストール
npm install --yes

# App.tsx を "Hello World" に書き換え
cat <<EOF > src/App.tsx
import './App.css'

function App() {
  return (
    <div className="App">
      <h1>Hello World</h1>
    </div>
  )
}

export default App
EOF

# vite.config.ts の修正 (GitHub Pages デプロイ用に base パスを設定)
# デフォルトではルートパスになりますが、GitHub Pages のサブディレクトリ構成に対応するため './' に設定します
cat <<EOF > vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
})
EOF