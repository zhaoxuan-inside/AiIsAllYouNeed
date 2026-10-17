# Tauri 2 接入备忘（TS-10 · 六端壳）

- **状态**：PLANNED（本机无 Rust/Xcode/Android 工具链，**尚未编译验证**；不阻断 Web 交付）
- **依据**：FEAT-011、ADR-001、`tech_select_overview.md` §4 环境约束
- **目标**：同一 Web 构建（`dist/`）经 Tauri 2 壳覆盖 Windows/Linux/macOS/iOS/Android。

## 接入步骤（工具链就绪后执行）

1. 安装 Rust stable + 各平台依赖（Linux: `libwebkit2gtk-4.1-dev` 等；macOS: Xcode；iOS/Android: Xcode/Android SDK）。
2. 在项目根初始化 Tauri 壳：
   ```bash
   npm i -D @tauri-apps/cli
   npx tauri init --app-name ai-is-all-you-need --window-title "AI 知识星图" \
     --frontend-dist ../dist --dev-url http://localhost:5173 --before-dev-command "npm run dev" \
     --before-build-command "npm run build"
   ```
3. `src-tauri/tauri.conf.json` 关键项：
   - `build.frontendDist: "../dist"`（构建产物）；`beforeBuildCommand: "npm run build"`。
   - `app.windows[0]`：title「AI 知识星图」、width 1200、height 800、`minWidth 360`。
   - 档案持久化：启用 `tauri-plugin-store`（对应 Web 的 localStorage 语义），见 `module_contracts.md` §1.3。
4. 打包：`npx tauri build`（桌面）；移动端 `npx tauri build --target universal-apple-darwin` / Android 按官方流程。
5. 平台冒烟清单：日/夜主题、灯罩顶栏、⌘K 检索、图谱悬停透镜、档案读写、安全区适配（`env(safe-area-inset-*)`）。

## 已确认约束
- 运行时代码零网络（CSP 禁外联）——WebView 内天然离线。
- 哈希路由（`react-router` HashRouter）兼容 `file://`/`tauri://` 加载，无需改动路由。
- 本机工具链缺失仅影响桌面/移动产物产出，**不阻塞 Web 验证与交付**。
