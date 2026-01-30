承知いたしました。シニアエンジニアとして、Geminiを使用したコードレビューのロジックを実装するためのNode.jsスクリプトの作成と、ワークフローの設定内容を提案します。

まず、ワークフローファイル（`.github/workflows/gemini-review.yml`）については、指示通り自動作成せず、以下に内容と意図を記載します。

### 1. ワークフロー設定案 (.github/workflows/gemini-review.yml)

**作成意図:**
プルリクエストが作成・更新された際に、差分（diff）を取得し、Gemini APIを呼び出すNode.jsスクリプトを実行します。レビュー結果は、そのままプルリクエストのコメントとして投稿されます。

**記載内容案:**
```yaml
name: Gemini Code Review

on:
  pull_request:
    types: [opened, synchronize]

permissions:
  pull-requests: write
  contents: read

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install @google/generative-ai

      - name: Get git diff
        id: diff
        run: |
          # mainブランチとの差分を取得
          git diff origin/${{ github.base_ref }}...origin/${{ github.head_ref }} > pr.diff

      - name: Run Review Script
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          PR_NUMBER: ${{ github.event.pull_request.number }}
          REPO_OWNER: ${{ github.repository_owner }}
          REPO_NAME: ${{ github.event.repository.name }}
        run: node scripts/gemini-review.mjs pr.diff
```

---

### 2. コードレビューロジックの雛形作成

次に、実際にGemini APIを叩いてレビューを行い、GitHubへコメントを投稿するスクリプト（`scripts/gemini-review.mjs`）を作成します。