# ADR-001：六端分发采用 Tauri 2（否决 Electron / Capacitor）

- **状态**：PROPOSED（随阶段 1 选型验收确认后 ACCEPTED）
- **日期**：2026-10-17
- **决策者**：开发者（拍板人）/ opencode（评估）
- **关联**：FEAT-011 六端分发；`_03_architecture_design/_01_technology_selection/tech_select_overview.md` §2-A

## 背景
产品承诺「一套 Web 代码覆盖 Web/Windows/Linux/macOS/iOS/Android」（FEAT-011），纯本地、离线、阅读优先。

## 决策
采用 **Tauri 2**（Rust 壳 + 系统 WebView）承载同一 Web 前端。

## 理由
1. 六端同代码库：桌面 3 + 移动 2 全由 Tauri 壳覆盖，Web 端即同一构建。
2. 体积与资源占用极低（~5–15MB，复用系统 WebView），契合「纯本地轻量知识产品」。
3. 本地存储/文件能力强（Rust API + Store 插件），支撑 FEAT-008 本地档案。
4. 许可开源（MIT/Apache-2.0），无商业费用。

## 否决备选
- **Electron**：仅桌面、体积 ~150MB+（内置 Chromium），与六端承诺冲突。
- **Capacitor**：仅移动、无桌面壳。

## 后果
- 正面：产物小、一致性好、离线天然。
- 代价：需要 Rust/Xcode/Android 工具链方可产出桌面/移动安装包（本机未装，登记为打包期环境约束，不阻断 Web 开发）。
