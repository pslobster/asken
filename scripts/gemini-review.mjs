import { GoogleGenerativeAI } from "@google/generative-ai";
import { Octokit } from "@octokit/rest";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function main() {
  const context = JSON.parse(process.env.GITHUB_CONTEXT);
  const owner = context.repository.owner.login;
  const repo = context.repository.name;
  const pull_number = context.event.number;

  // PRの差分を取得
  const { data: diff } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number,
    mediaType: { format: "diff" },
  });

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
あなたはシニアソフトウェアエンジニアです。以下のGitHub PRの差分（diff）をレビューしてください。

## レビューのガイドライン
1. バグ、セキュリティ脆弱性、パフォーマンスの問題、可読性の改善点を指摘してください。
2. 修正が必要な場合は、必ず GitHub の "Suggested Changes" 形式（以下の形式）で回答してください。
   \`\`\`suggestion
   [修正後のコード]
   \`\`\`
3. 修正案は、diffのコンテキスト（前後の行）に適合するように、対象の行を完全に置き換える形式で記述してください。
4. 具体的かつ簡潔に説明してください。

## PR Diff:
${diff}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const reviewText = response.text();

  // レビューコメントとして投稿
  // 簡易化のため、全体レビューとして投稿するが、
  // 本来は diff をパースして特定の path/position に紐付けるのが理想。
  // ここでは全体的なアドバイスと suggestion を含むコメントを投稿。
  await octokit.rest.pulls.createReview({
    owner,
    repo,
    pull_number,
    body: reviewText,
    event: "COMMENT",
  });

  console.log("Review submitted successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
