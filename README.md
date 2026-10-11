# AI 知识星图 · AiIsAllYouNeed

以「知识点」为核心单元，美观优雅地展示 AI 领域全景知识：**知识图谱（依赖关系）· 编年时间线 · 领域发展路线 · 趋势预测 · 中文全文搜索 · 本地档案**。

一套 React 代码，覆盖 **Web / Windows / Linux / macOS / iOS / Android** 六端（Tauri 2）。

当前种子内容：**94 个知识点 · 6 大领域 · 72 篇关键论文**（随 Git 仓库持续更新）。

## 快速开始

```bash
cd app
npm install
npm run dev          # 开发（自动先执行知识数据校验）
npm test             # 全量测试（领域/搜索/档案/组件/种子数据集成）
npm run build        # 生产构建 → dist/
```

打开浏览器访问 http://localhost:5173 ，或直接部署 `dist/` 到任意静态托管（GitHub Pages / Vercel）。

## 六端构建（Tauri 2）

```bash
cd app
npm run tauri dev           # 桌面开发预览
npm run tauri build         # Windows/Linux/macOS 安装包（需 Rust 工具链）
npm run tauri ios init      # iOS 工程（需 macOS + Xcode）
npm run tauri android init  # Android 工程（需 Android Studio/SDK）
```

| 端 | 前置依赖 | 产物 |
|----|---------|------|
| Web | Node 18+ | `dist/` 静态站点 |
| Windows | Rust + MSVC | `.msi` / `.exe` |
| Linux | Rust + webkit2gtk | `.deb` / `.AppImage` |
| macOS | Rust + Xcode CLT | `.app` / `.dmg` |
| iOS | macOS + Xcode + Rust iOS targets | Xcode 工程 → App Store |
| Android | Android Studio + NDK | `.apk` / `.aab` |

> 应用为纯本地知识展示（无后端依赖），Tauri 壳只负责分发与窗口；数据打包在前端资源中。

## 知识数据更新（Git 仓库即数据源）

知识内容与代码分离，全部在 `knowledge/` 目录：

```text
knowledge/
├── categories.json   # 领域定义（名称/主题色/排序）
├── papers.json       # 关键论文元数据
├── trends.json       # 领域趋势预测（编辑标注）
├── roadmap.json      # 领域发展路线编排（基础→进阶→前沿）
└── points/*.json     # 知识点（按领域分文件）
```

**新增/修改知识点**：编辑对应 JSON → 提交 Git → `npm run sync:knowledge` 校验并编译 → 重新构建发版。
校验覆盖：schema 合法性、id 唯一、引用完整性（领域/论文/依赖/相关）、**依赖环检测**、路线阶段与前置依赖的顺序一致性。坏数据会在构建期被拦截（测试里另有一层运行时契约校验）。

知识点字段说明见 `app/src/domain/schema.ts`（Zod 契约，v2 自建服务器拉取更新时前向兼容）。

## 架构速览

```text
knowledge/ (数据仓库) ──构建期校验──▶ app/src/backend（应用后端 · 数据管理唯一入口）
                                      ├─ knowledge-service  加载/校验缓存/派生/搜索/视图模型
                                      ├─ filter-store  查询参数；profile/preference-store  本地持久化
                                      └─ domain/* data/*  内部实现（视图不可见）
app/src/features  home · graph · timeline · roadmap · domain · knowledge-point · profile（纯展示）
app/src-tauri     六端壳（desktop + mobile）
```

**分层边界**：展示层只允许 `import from '@/backend'`；数据管理的加载、校验、派生、检索全部在应用后端内。
v2 服务器化时仅替换 backend 内部实现为 HTTP Adapter，视图层零改动（详见 `hs_dev_docs/_03_architecture_design/arch_v1.md` §5.5）。

- 设计契约：根目录 [DESIGN.md](DESIGN.md)（星夜/纸面双主题、领域色环、衬线标题）
- 开发过程文档：`hs_dev_docs/`（PRD、原型、ADR、架构、任务）

## 路线图

- **v1（当前）**：知识点全景 + 六端壳 + Git 更新流程
- **v2**：自建服务器提供知识更新拉取（schema 已前向兼容）、PWA 离线缓存
- **v3**：AI 辅助的趋势预测与知识脉络生成、跨端云同步（可选）

## License

MIT
