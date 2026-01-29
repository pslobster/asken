シニアエンジニアとして回答します。

「ビルドを挟まない」という方針、承知いたしました。
Node.js環境であれば、**ES Modules（.mjs）** を直接使用するか、**`tsx` (TypeScript Execute)** を利用することで、コンパイル（tsc）やバンドル（Vite/Webpack）の手順をスキップして直接スクリプトを実行可能です。

今回は最も軽量で、環境構築の手間が少ない **Node.jsのES Modules (.mjs)** を使った構成を提案します。

### 修正内容の提案

1.  `@google/generative-ai` のインストール
2.  ビルド不要で即実行可能な `gemini-tool.mjs` の作成