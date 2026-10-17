# 技术选型与评估方案：AiIsAllYouNeed 全栈（六端分发 · 纯本地知识星图）

- **输入与产出基线**：阶段 0 冻结基线（`/DESIGN.md` v7、`overview_prd.md` v2.1.0、FEAT-001..011、`rebuild_v2_phased_plan.md`）
- **TECH 验收记录**：`_06_dev_process/_01_plan_log/rebuild_v2_plan.md`（S1）、本文件文末 §7
- **验收状态**：SUBMITTED（待开发者确认 TECH-05）

- **评估领域**：前端架构 / 桌面与移动壳 / 图谱可视化 / 客户端搜索 / 构建期内容管线
- **评估日期**：2026-10-17
- **负责人**：opencode（hs-dev-skill 工程路由）
- **对应 ADR**：`_00_project_foundation/_03_decision_record/ADR_001_tauri2_shell.md`、`ADR_002_react_vite_spa.md`

---

## [VIBE_CONTRACT] 机器执行契约（锁定技术栈）

```yaml
tech_stack_lock:
  target_module: "AiIsAllYouNeed 全站"
  selected_runtime: "Node.js 22 LTS（构建/工具链）；Rust stable（仅 Tauri 壳，产物在打包期）"
  frontend: "React 18.3 + TypeScript(strict) + Vite 5 (SPA 静态构建)"
  routing: "react-router v6（hash 路由，兼容纯静态与 Tauri file 加载）"
  desktop_mobile_shell: "Tauri 2（WebView：macOS WKWebView / Windows WebView2 / Linux WebKitGTK / iOS WKWebView / Android WebView）"
  graph: "自绘 SVG 渲染 + @d3-force v3 仅用于布局（星图册线条/星点/透镜交互均为自绘）"
  search: "自定义 TS bigram 倒排索引（构建期生成，运行时内存检索）"
  math: "KaTeX（详情页公式）"
  data: "静态 JSON 数据仓库（Git 版本化）+ zod 运行时校验"
  content_pipeline: "Node 脚本（构建期生成正文/索引）+ 可插拔 KnowledgeSource 接口"
  profile_store: "localStorage（Web）+ Tauri Store 插件（桌面/移动）"
  theme: "CSS 变量 + [data-theme]，首屏内联引导防闪烁"
  icons: "自绘 React SVG 组件族（天文制图语汇）"
  testing: "Vitest + React Testing Library"
  lint: "ESLint 9 + Prettier + TypeScript strict"
  package_manager: "pnpm"

hard_constraints:
  - "LOCKED: 六端共用同一 Web 代码库；桌面/移动仅由 Tauri 壳承载，禁止另写原生 UI"
  - "LOCKED: 搜索使用自研 bigram 倒排（FEAT-006 <100ms 已实测），严禁引入运行时全文检索重库"
  - "LOCKED: 图谱以自绘 SVG 呈现星图册风格（/DESIGN.md §7），@d3-force 仅取布局，禁止用 G6/sigma 等重可视化库"
  - "LOCKED: 知识数据为 Git 静态 JSON；无服务器 DB、无运行时网络请求（内容均构建期生成）"
  - "FORBIDDEN: 禁止引入落选方案（Electron/Capacitor/Next.js SSR/antv G6/sigma/FlexSearch 运行时）"
```

---

## [HUMAN_RATIONALE] 多方案对比与决策背景

### 1. 业务特征与技术诉求
- **业务特征**：以读为主的静态知识产品；六端（Web/Windows/Linux/macOS/iOS/Android）同代码库；纯本地、离线可用；无账号无服务器。
- **核心约束**：六端分发（FEAT-011）、客户端中文搜索 <100ms（FEAT-006）、图谱为「星图册」定制风格（/DESIGN.md §7）、构建期内容生成 + 可插拔内容源（FEAT-010）、阅读优先与日/夜主题（/DESIGN.md）。

### 2. 备选方案对比矩阵

**A. 桌面/移动壳**

| 评估维度 | 方案 A: Tauri 2（采纳） | 方案 B: Electron（落选） | 方案 C: Capacitor（落选） |
|---|---|---|---|
| 六端覆盖 | 桌面 3 + 移动 2（iOS/Android） | 仅桌面 3 | 仅移动 2（无桌面） |
| 产物体积 | 极低（~5-15MB，复用系统 WebView） | 高（~150MB+，内置 Chromium） | 中（WebView 容器） |
| 本地文件/存储能力 | 强（Rust 侧 API + 插件） | 强 | 中（原生插件链） |
| 与「纯本地/离线」契合 | 高（无额外浏览器内核） | 中 | 高 |
| 工程复杂度 | 中（Rust 壳需工具链） | 低 | 低 |
| 综合评分 | **9.0** | 6.5 | 6.0 |

**B. 前端架构**

| 评估维度 | 方案 A: React18+Vite SPA（采纳） | 方案 B: Next.js SSR（落选） | 方案 C: Vue3+Vite（落选） |
|---|---|---|---|
| 静态离线产物 | 优（纯静态 dist） | 中（SSR/ISR 与离线矛盾） | 优 |
| 六端一致性 | 优 | 差（服务端依赖） | 优 |
| 生态/团队契合 | 高 | 中 | 中 |
| 综合评分 | **9.2** | 6.0 | 8.2 |

**C. 图谱可视化**

| 评估维度 | 方案 A: 自绘 SVG + d3-force 布局（采纳） | 方案 B: antv G6（落选） | 方案 C: sigma.js/WebGL（落选） |
|---|---|---|---|
| 星图册定制风格（/DESIGN.md §7） | 完全可控 | 受限（需重写大量皮肤） | 受限 |
| 体积/复杂度 | 轻（仅布局算法） | 重 | 重 |
| 交互（透镜/光环/标签） | 自由 | 中 | 中 |
| 综合评分 | **9.4** | 7.0 | 7.5 |

**D. 客户端中文搜索**

| 评估维度 | 方案 A: 自研 bigram 倒排（采纳） | 方案 B: FlexSearch | 方案 C: MiniSearch/lunr |
|---|---|---|---|
| 中文效果（bigram） | 完全可控 | 需自定义 tokenizer 同等工作量 | 中文需额外分词 |
| 性能（94 条实测） | 构建 16.75ms / 查询 ≤0.03ms | 相近 | 相近 |
| 可插拔/透明 | 高（FEAT-010 适配器可替换） | 中 | 中 |
| 综合评分 | **9.3** | 8.0 | 7.6 |

### 3. 选型结论与决策理由

采纳 **React 18 + Vite SPA + Tauri 2 + 自绘 SVG 图谱（d3-force 布局）+ 自研 bigram 检索 + 静态 JSON + Node 构建管线**：
1. 六端 = 同一 Web 代码库，桌面/移动只换 Tauri 壳，与 FEAT-011「一套代码六端」强一致。
2. 纯静态、无服务器、离线可用，天然匹配「纯本地知识星图」与构建期内容生成（FEAT-010）。
3. 「星图册」定制视觉（/DESIGN.md）要求高可控渲染，自绘 SVG 而非重库是唯一不妥协路径。
4. 中文搜索性能已实测远优于 100ms 目标（TECH-03 证据，见 §6）。
5. 落选方案 Electron（体积/单端限制）、Next.js（SSR 与离线冲突）、G6/sigma（定制受限）均有明确否决理由。

---

### 4. 锁定实施约束（TECH-04）
- runtime：Node.js **22 LTS**（构建）；Rust **stable**（仅 Tauri 壳，打包期编译）；目标 WebView：WKWebView / WebView2 / WebKitGTK / Android WebView（系统级）。
- 版本范围：`react@18.3.x`、`vite@5.x`、`react-router@6.x`、`tauri@2.x`、`@d3-force@3.x`、`katex@0.16.x`、`zod@3.x`、`vitest@2.x`。
- 许可：全部开源兼容（MIT/Apache2）；无商业 SDK 费用（KaTeX MIT、d3 ISC、Tauri MIT/Apache2）。
- 环境前提：桌面/移动产物需对应平台工具链（Rust/Xcode/Android SDK），**本机当前未安装 cargo/rustc**，已登记为环境约束（打包期处理，不阻断 Web 开发）。

### 5. 风险登记
| 风险 | 影响 | 处理人/时点 |
|---|---|---|
| 移动端（iOS/Android）真机构建需 Xcode/Android SDK，本机未装 | 移动产物验证延后 | 打包期配置 CI/本地工具链；Web/桌面先行 |
| d3-force 在极大量节点（>2000）性能 | 图谱卡顿 | 阶段 5 加 LOD（按入度分级渲染）；当前 94 条规模无虞 |
| 构建期 LLM 生成内容质量/成本 | 内容质量风险 | FEAT-010 契约校验 + 人工抽查；生成脚本可重跑 |
| 系统 WebView 差异（WebKitGTK/WebView2）导致 CSS 细节偏差 | 视觉一致性 | 阶段 5/6 分平台走查清单 |

### 6. TECH-03 验证证据：客户端中文检索
- 实验：`/tmp/opencode/bigram_bench.cjs`（Node 22.22.2，Linux）
- 数据：现有 `knowledge/points/*.json`（94 条占位，正式内容构建期生成）
- 结果：索引构建 **16.75ms**；查询平均 **0.001–0.027ms**（各 200 次）；10 倍数据规模预计仍 <0.5ms，**远低于 FEAT-006 的 100ms 目标**。

### 7. TECH-05 验收清单（待开发者确认）
| ID | 待确认项 | 证据 |
|---|---|---|
| TECH-05a | 六端壳 = Tauri 2（否决 Electron/Capacitor） | §2-A、ADR-001 |
| TECH-05b | 前端 = React18+Vite SPA（否决 Next.js SSR） | §2-B、ADR-002 |
| TECH-05c | 图谱 = 自绘 SVG + d3-force 布局（否决 G6/sigma） | §2-C |
| TECH-05d | 搜索 = 自研 bigram 倒排（否决运行时全文库） | §2-D、§6 实测 |
| TECH-05e | 数据 = 静态 JSON + 构建期管线；本机无 Rust 工具链的环境约束 | §4、§5 |

> **选型结论**：`[ ] APPROVED（进入阶段 2 架构设计）` / `[ ] REJECTED`
> **开发者确认**：__________ **日期**：__________
