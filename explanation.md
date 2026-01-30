エラーの原因は、`scripts/gemini-review.mjs` が依存している `@octokit/rest` パッケージがプロジェクトにインストールされていないためです。また、Gemini API を使用していることから、`@google/generative-ai` も必要である可能性が高いです。

以下のスクリプトを実行して、必要な依存パッケージを `package.json` に追加してください。