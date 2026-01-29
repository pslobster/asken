#!/bin/bash

# 対象Issue: Geminiワークフローの確認
# 指示に基づき、返信内容をリポジトリ内に作成します。

cat <<EOF > GEMINI_REPLY.md
# Gemini ワークフロー確認結果

対象Issue: Geminiワークフローの確認
指示内容: @gemini 返事をして

## 返信
はい、承知いたしました。
Geminiワークフローが正常に稼働していることを確認しました。
EOF

echo "GEMINI_REPLY.md has been created/updated."
