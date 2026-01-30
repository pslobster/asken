import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

async function run() {
  const diffPath = process.argv[2];
  if (!diffPath || !fs.existsSync(diffPath)) {
    console.error("Diff file not found.");
    process.exit(1);
  }

  const diffText = fs.readFileSync(diffPath, "utf-8");
  if (!diffText.trim()) {
    console.log("No changes to review.");
    return;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
あなたはシニアソフトウェアエンジニアとして、プルリクエストのコードレビューを行ってください。
以下のgit diffを解析し、改善点、バグの可能性、セキュリティ上の懸念、またはベストプラクティスに基づいたアドバイスを日本語で提供してください。

レビューのガイドライン:
1. 重要な問題（バグ、セキュリティ、パフォーマンス）を優先してください。
2. 良い点も褒めてください。
3. 簡潔で建設的なコメントを心がけてください。
4. Markdown形式で回答してください。

## git diff
${diffText}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reviewText = response.text();

    // GitHub APIを使用してコメントを投稿
    await postComment(reviewText);
  } catch (error) {
    console.error("Error during Gemini review:", error);
    process.exit(1);
  }
}

async function postComment(body) {
  const { GITHUB_TOKEN, REPO_OWNER, REPO_NAME, PR_NUMBER } = process.env;
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${PR_NUMBER}/comments`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github.v3+json",
    },
    body: JSON.stringify({ body: `### 🤖 Gemini Code Review\n\n${body}` }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to post comment:", errorData);
  } else {
    console.log("Review comment posted successfully.");
  }
}

run();
