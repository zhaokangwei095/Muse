---
kind: frontend_style
name: Tailwind CSS + Glassmorphism 风格系统
category: frontend_style
scope:
    - '**'
source_files:
    - src/index.css
    - vite.config.ts
    - package.json
    - index.html
    - src/App.tsx
---

本项目采用 Tailwind CSS v4（通过 `@tailwindcss/vite` 插件）作为核心样式方案，结合自定义 CSS 类实现统一的玻璃拟态（Glassmorphism）视觉风格。样式体系由以下层次构成：

**样式架构与工具链**
- Vite 构建时通过 `@tailwindcss/vite` 插件启用 Tailwind v4 的 CSS-first 配置模式，无需传统 `tailwind.config.js` 文件。
- `src/index.css` 使用 `@import "tailwindcss"` 引入框架，并通过 `@layer base` 定义全局字体（Inter 正文、Quicksand 标题）。
- 深色模式通过 React 状态同步 `<html>` 元素的 `dark` 类实现，组件内使用 `dark:` 前缀切换样式。
- Google Fonts 在 `index.html` 中预加载 Inter、Quicksand 和 Material Symbols Outlined 字体。

**设计令牌与视觉规范**
- 颜色：主背景 `#f8f9ff`（浅）、`#0b1c30`（深），强调色 `#2170e4`，文本色 `#0b1c30` / `gray-100`。
- 玻璃拟态组件族：`.glass-panel`、`.glass-card`、`.glass-button`，统一使用半透明背景 + `backdrop-filter: blur()` + 细边框 + 柔和阴影，并提供 `.dark` 变体。
- 输入控件：`.ghost-input` 采用无背景、底部边框的幽灵风格，聚焦时显示蓝色下划线与阴影。
- 布局网格：`.bento-grid`（Bento 网格）与 `.waterfall-container`（瀑布流）提供响应式内容排布，断点为 768px 和 1024px。
- 动效：`.shimmer-bg` 渐变闪烁动画用于骨架屏；按钮 hover 使用 `cubic-bezier(0.16, 1, 0.3, 1)` 缓动曲线。
- 滚动条：`.no-scrollbar` / `.scrollbar-hide` 隐藏滚动条以适配移动端体验。

**组件级样式约定**
- 所有视图组件位于 `src/views/`，组件样式直接以内联 className 形式使用 Tailwind 原子类，未使用 CSS Modules 或 styled-components。
- 图标统一通过 `lucide-react` 库与 Material Symbols Outlined 字体图标混用。
- 深色模式切换由 `App.tsx` 中的 `isDarkMode` 状态驱动，通过 `document.documentElement.classList` 控制。

**约束与限制**
- 未使用独立的主题配置文件（如 `tailwind.config.*`），所有扩展通过 CSS `@layer` 和原子类完成。
- 无 SCSS/Sass 预处理，纯 CSS 编写。
- 无 CSS-in-JS 方案，样式完全基于 Tailwind 原子类与少量全局 CSS 类。
- 移动端优先：基础样式针对移动设备优化，通过 `@media (min-width: 768px)` 和 `1024px` 断点增强桌面端布局。