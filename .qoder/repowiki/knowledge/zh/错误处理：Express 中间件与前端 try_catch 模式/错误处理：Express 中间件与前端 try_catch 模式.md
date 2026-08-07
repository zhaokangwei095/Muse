---
kind: error_handling
name: 错误处理：Express 中间件与前端 try/catch 模式
category: error_handling
scope:
    - '**'
source_files:
    - server.ts
    - src/App.tsx
    - src/views/CreatePostView.tsx
---

本仓库是一个基于 React + Express + Gemini AI 的全栈单仓应用，错误处理采用前后端分离的简单模式，未定义统一错误类型或全局错误中间件。

**后端（Express）**
- 所有 API 路由（`/api/ai/generate-inspiration`、`/api/ai/chat-reply`）均使用 `try/catch` 包裹异步调用，捕获异常后通过 `console.error` 记录日志并以 `{ error: string }` JSON 形式返回 500 状态码。
- 配置缺失（如 `GEMINI_API_KEY` 未设置）在请求入口处直接返回 500 + 描述性错误消息，而非抛出异常。
- 没有统一的错误处理中间件、错误类或错误码枚举，错误响应结构为扁平的 `{ error }` 字段。

**前端（React）**
- 网络请求（`fetch('/api/ai/chat-reply'`, `/api/ai/generate-inspiration`）使用 `try/catch` 捕获异常，仅通过 `console.error` 输出到控制台，无用户可见的错误提示或重试逻辑。
- 组件内部的状态更新失败未被显式处理，依赖 React 默认行为。
- 未发现 `throw new Error`、自定义错误类、错误边界（Error Boundary）或全局错误上下文。

**架构约定**
- 错误传播路径：前端 `catch` → 仅日志 → UI 静默失败；后端 `catch` → `console.error` → 返回 500 + 文本错误。
- 无 panic/recover、无全局错误处理器、无 HTTP 状态码映射表，属于轻量级原型阶段的错误处理方式。