---
kind: external_dependency
name: Vite 开发服务器与构建
slug: vite
category: external_dependency
category_hints:
    - framework_behavior
scope:
    - '**'
source_files:
    - server.ts
    - package.json
---

### 角色
- 生产模式下跳过 Vite，直接 serve dist 静态资源并将所有路由回退到 index.html。

### 构建流程
- npm run build 先执行 vite build，再用 esbuild 对 server.ts 进行 Node 端打包（CJS、sourcemap、packages=external），输出 dist/server.cjs。
- npm run dev 通过 tsx server.ts 直接运行 TypeScript 源码。

### 行为要点
- 开发/生产两种路径在同一 Express 应用中切换，前端 SPA 路由由 Vite 或静态文件服务处理。