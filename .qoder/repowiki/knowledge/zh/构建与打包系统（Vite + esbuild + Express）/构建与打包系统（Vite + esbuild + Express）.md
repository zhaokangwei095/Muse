---
kind: build_system
name: 构建与打包系统（Vite + esbuild + Express）
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - vite.config.ts
    - tsconfig.json
    - server.ts
---

该仓库采用 Node/Express 作为统一入口的全栈单仓架构，前端基于 Vite 构建 React SPA，后端通过 esbuild 将 TypeScript 服务端代码编译为可执行的 CommonJS 包，形成“开发期 Vite HMR + 生产期静态托管”的完整构建流程。

**1. 使用的系统与工具**
- 前端构建：Vite 6（React + Tailwind CSS v4），提供开发热更新与生产优化打包。
- 后端打包：esbuild 0.25，将 `server.ts` 打包为 `dist/server.cjs`（Node CJS 格式，依赖 externalized）。
- 运行时：Node.js 直接执行 `dist/server.cjs`；开发阶段使用 `tsx server.ts` 以 TS 直跑。
- 类型检查：TypeScript 5.8，`tsc --noEmit` 仅做类型校验，不生成 JS。
- 环境变量：dotenv 加载 `.env`，支持 `DISABLE_HMR`、`GEMINI_API_KEY`、`NODE_ENV` 等。

**2. 关键文件**
- `package.json`：定义 `dev` / `build` / `start` / `clean` / `lint` 五个脚本，串联 Vite 前端构建与 esbuild 后端打包。
- `vite.config.ts`：配置 React 插件、Tailwind、路径别名 `@/*` → 根目录，以及根据 `DISABLE_HMR` 控制 HMR 与文件监听。
- `tsconfig.json`：ESNext module、bundler 解析模式、`noEmit: true`、`allowImportingTsExtensions: true`。
- `server.ts`：Express 应用，开发态挂载 Vite 中间件，生产态 serve `dist/` 静态资源并回退到 `index.html`，同时暴露 `/api/health`、`/api/ai/generate-inspiration`、`/api/ai/chat-reply` 三个 Gemini API 路由。

**3. 架构与约定**
- 单仓全栈：前端 `src/`（React 组件 + Views）与后端 `server.ts` 同仓库，通过 `npm run dev` 一次性启动开发服务。
- 构建产物统一输出到 `dist/`：`vite build` 产出前端静态资源，`esbuild` 产出 `dist/server.cjs`，`npm start` 直接运行该文件。
- 开发/生产环境切换由 `NODE_ENV` 驱动：非 production 时启用 Vite 中间件进行 HMR；production 时 serve 静态文件并以 SPA 方式回退路由。
- 路径别名：`@/*` 映射到项目根目录，前后端共享同一套相对路径约定。

**4. 约定与约束**
- 必须通过 `npm run build` 而非直接调用 vite/esbuild，以确保前后端产物同步生成。
- 运行前需准备 `.env`（至少包含 `GEMINI_API_KEY`），否则 AI 接口返回 500。
- 在 AI Studio 环境中，`DISABLE_HMR=true` 会禁用 HMR 与文件监听以避免编辑闪烁，此行为硬编码于 `vite.config.ts`。
- TypeScript 仅做类型检查（`--noEmit`），实际编译由 Vite 和 esbuild 完成，禁止自行 `tsc` 生成 JS。
- 端口固定为 3000，监听 `0.0.0.0` 以适配容器化部署。