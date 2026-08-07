---
kind: dependency_management
name: Node.js 依赖管理（npm + lockfile）
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - package-lock.json
    - tsconfig.json
    - vite.config.ts
---

本仓库使用 npm 作为包管理器，通过 `package.json` 声明依赖，并通过 `package-lock.json` 锁定确切版本，确保构建可重现。

**使用的系统与工具**
- 包管理器：npm（由 `package-lock.json` 的 lockfileVersion 3 确认）
- 前端构建：Vite 6.x，配合 `@vitejs/plugin-react`、`@tailwindcss/vite`、`esbuild` 进行打包
- 后端运行：Express 4.x，通过 `tsx` 在开发期直接执行 TypeScript 服务端代码
- 类型检查：TypeScript 5.8.x，`tsc --noEmit` 作为 lint 脚本

**关键文件与位置**
- `package.json`：集中声明运行时依赖（`dependencies`）与开发依赖（`devDependencies`），并提供 `dev`、`build`、`start`、`clean`、`lint` 等脚本
- `package-lock.json`：npm v3 lockfile，记录所有依赖树的精确版本、resolved URL 与 integrity hash
- `tsconfig.json`：通过 `moduleResolution: "bundler"` 和 `paths` 别名 `@/*` 影响模块解析行为
- `vite.config.ts`：配置 Vite 插件与别名，间接影响前端依赖加载方式

**架构与约定**
- 单一根级 `package.json`，无子包或 monorepo 结构，所有依赖集中在一个清单中
- 依赖版本策略：生产依赖普遍使用 `^` 前缀（如 `react ^19.0.1`、`express ^4.21.2`、`@google/genai ^2.4.0`），允许次版本/补丁版本自动升级；TypeScript 使用 `~5.8.2` 仅允许补丁升级，体现对编译器稳定性的严格要求
- 构建流程：`vite build` 生成前端静态资源，`esbuild server.ts --bundle --platform=node --format=cjs --packages=external` 将服务端代码打包为 CommonJS，并将第三方包标记为 external 以便运行时从 `node_modules` 加载
- 开发体验：`tsx server.ts` 直接运行 TypeScript 服务端，无需预编译；Vite 提供 HMR（可通过 `DISABLE_HMR` 环境变量关闭）
- 无 vendoring 策略：未使用 `--frozen-lockfile`、`--package-lock-only` 等强制锁定标志，也未见私有 npm registry 配置（`.npmrc`）或 `GOPRIVATE` 等私有源设置
- 环境配置：通过 `dotenv` 加载 `.env` 文件，`server.ts` 中读取环境变量（如 `DISABLE_HMR`）控制行为

**约束与规范**
- `skipLibCheck: true` 跳过第三方库的类型检查，加快编译速度但可能掩盖类型不兼容问题
- `isolatedModules: true` 与 `moduleDetection: force` 要求每个文件独立可编译，限制某些跨文件 TS 特性
- `allowImportingTsExtensions: true` 允许导入 `.ts` 扩展名（需配合 bundler 使用）
- 未发现 CI 中的依赖更新自动化或安全扫描脚本