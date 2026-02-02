# scripts/gemini-review.mjs を修正し、リトライロジックとサイズ制限を追加します
cat << 'EOF' > scripts/gemini-review.mjs
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import { Octokit } from "@octokit/rest";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function run() {
  const diffPath = process.argv[2];
  if (!diffPath) {
    console.error("No diff file provided");
    process.exit(1);
  }

  let diff = fs.readFileSync(diffPath, "utf8");

  // 1. diffのサイズ制限 (250,000トークンの制限を考慮し、文字数で安全策をとる)
  const MAX_DIFF_LENGTH = 80000; 
  if (diff.length > MAX_DIFF_LENGTH) {
    console.warn(`Diff size (${diff.length}) exceeds limit. Truncating...`);
    diff = diff.substring(0, MAX_DIFF_LENGTH) + "\n\n...(diff truncated for token limits)...";
  }

  // 2. モデルの指定 (安定版の gemini-1.5-flash を推奨)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `あなたはシニアエンジニアです。以下のプルリクエストの差分（diff）をレビューし、
改善点、バグの可能性、セキュリティ上の懸念を日本語で簡潔に指摘してください。

${diff}`;

  let result;
  let retries = 3;
  let delay = 60000; // 429時は1分待機（Free Tierの制限回復を待つ）

  while (retries > 0) {
    try {
      result = await model.generateContent(prompt);
      break;
    } catch (error) {
      if (error.status === 429 && retries > 1) {
        console.warn(`Quota exceeded (429). Retrying in ${delay/1000}s... (Retries left: ${retries - 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        retries--;
      } else {
        console.error("Error during Gemini review:", error);
        process.exit(1);
      }
    }
  }

  const reviewText = result.response.text();

  // 3. GitHubへのコメント投稿
  try {
    await octokit.issues.createComment({
      owner: process.env.REPO_OWNER,
      repo: process.env.REPO_NAME,
      issue_number: parseInt(process.env.PR_NUMBER),
      body: `### 🤖 Gemini Code Review\n\n${reviewText}`,
    });
    console.log("Review posted successfully.");
  } catch (error) {
    console.error("Error posting to GitHub:", error);
    process.exit(1);
  }
}

run();
EOF

# 必要な依存関係の確認とインストール
npm install --yes @octokit/rest @google/generative-ai