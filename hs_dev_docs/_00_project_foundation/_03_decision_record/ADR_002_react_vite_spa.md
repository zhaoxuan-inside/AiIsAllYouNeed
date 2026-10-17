# ADR-002：前端采用 React 18 + Vite 5 SPA（否决 Next.js SSR）

- **状态**：PROPOSED（随阶段 1 选型验收确认后 ACCEPTED）
- **日期**：2026-10-17
- **决策者**：开发者（拍板人）/ opencode（评估）
- **关联**：六端分发（FEAT-011）、静态离线（FEAT-010）；`tech_select_overview.md` §2-B

## 背景
产品为纯本地静态知识应用：内容构建期生成、运行时零网络请求、六端同一 Web 代码库、阅读优先。

## 决策
采用 **React 18.3 + TypeScript(strict) + Vite 5** 构建纯静态 SPA（hash 路由，兼容 Tauri file:// 加载）。

## 理由
1. 产物为纯静态 `dist/`，可直接被 Tauri 壳加载，天然离线、无服务器依赖。
2. 生态成熟、团队契合度高；CSS 变量 + `[data-theme]` 便于实现日/夜（/DESIGN.md §8）。
3. 自绘 SVG 图标与「星图册」图谱（/DESIGN.md）需要组件级高可控渲染，React 组件树契合。

## 否决备选
- **Next.js SSR**：服务端依赖与「纯本地、离线、静态打包」冲突；六端一致性与静态分发均变差。
- **Vue 3 + Vite**：能力相近，但按团队/生态契合度与既有技术共识（v1 亦为 React 系）选 React。

## 后果
- 正面：静态、轻量、一致、可被任何静态主机/Tauri 直接承载。
- 代价：无 SSR SEO（本产品为本地阅读工具，SEO 非目标）。
