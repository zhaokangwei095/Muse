---
kind: external_dependency
name: Google Gemini AI 客户端 (@google/genai)
slug: google-genai
category: external_dependency
category_hints:
    - vendor_identity
    - sdk_real_api
scope:
    - '**'
source_files:
    - server.ts
    - package.json
    - .env.example
---

### 身份与角色
- 项目通过 @google/genai SDK 调用 Google Gemini 大模型，用于两个后端接口：灵感生成（/api/ai/generate-inspiration）和聊天回复（/api/ai/chat-reply）。
- 运行时通过环境变量 GEMINI_API_KEY 注入密钥；在 AI Studio 环境中由 Secrets 面板自动注入。

### 集成方式

### 关键约定
- 缺少 GEMINI_API_KEY 时客户端返回 null，接口直接 500 并提示未配置。
- 生产环境通过 esbuild 将 server.ts 打包为 dist/server.cjs，由 node dist/server.cjs 启动。

verify exact API/params against official docs