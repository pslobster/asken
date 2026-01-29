import { GoogleGenerativeAI } from "@google/generative-ai";

// 環境変数からAPIキーを取得
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("エラー: GEMINI_API_KEY が設定されていません。");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function run(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log(response.text());
  } catch (error) {
    console.error("Gemini APIエラー:", error.message);
  }
}

// コマンドライン引数からプロンプトを受け取る
const inputPrompt = process.argv[2] || "Hello, Gemini!";
run(inputPrompt);
