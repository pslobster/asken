シニアエンジニアとして、Geminiによる自動コードレビューを強化し、GitHubの「Suggested Changes（修正案の提示）」機能を活用して、PR上から直接修正案を取り込めるようにする改善案を提示します。

### 実現方法の提案

GitHubには、プルリクエストのコメント内に ` ```suggestion ` ブロックを含めると、その場で「Commit suggestion」ボタンを表示する機能があります。これを利用するために、以下の2点を変更します。

1.  **プロンプトの改善**: Geminiに対し、修正が必要な場合は必ず ` ```suggestion ` 形式でコードを出力するよう指示します。
2.  **GitHub API呼び出しの変更**: 単なるPRコメントではなく、`pulls.createReview` (Review Comment) を使用して、ファイル内の特定の行（diffのコンテキスト）に対してコメントを紐付けます。

### 制限事項と代替案
Geminiが正確な行番号を特定できない場合、GitHub APIがエラーを返す可能性があります。その場合の代替案として、現在の「PR全体へのコメント」として修正案を表示しつつ、開発者が手動で適用する形式を維持します。しかし、今回は「Suggested Changes」の実現を目指してスクリプトを更新します。

---

### `.github/workflows/deploy.yml` 等の設定変更について（相談）

GitHub Actionsの定義ファイルを直接編集することは禁止されているため、以下のように設定を変更することを推奨します。

**変更意図:**
- `permissions` に `pull-requests: write` を追加する必要があります（レビューコメントを投稿するため）。
- 実行タイミングを `pull_request` イベントに限定し、`types: [opened, synchronize]` で動作するようにします。

作成してよろしければ、別途指示をいただけますでしょうか。

---

### scripts/gemini-review.mjs の修正

既存の `scripts/gemini-review.mjs` を、Suggested Changes に対応させるためのスクリプトです。