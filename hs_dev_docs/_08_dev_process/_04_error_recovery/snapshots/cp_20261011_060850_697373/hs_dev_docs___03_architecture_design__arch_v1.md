# 架构设计 — AiIsAllYouNeed v1

> 阶段 2 产物 · 2026-10-11 · 范式：无后端（B0 数据管线）+ F2 轻量 Feature 模块 · 词汇：深模块（deep_modules）

## 1. 模块图

```text
knowledge/  （数据仓库区，Git 更新）
   │  categories.json / knowledge-points.json / papers.json / trends.json / roadmap-annotations.json
   ▼
┌────────────────────────── app/ (React + Tauri 2) ──────────────────────────┐
│                                                                            │
│  domain   ←—— 知识核心：Zod schema + 校验 + 派生（图数据/时间线/路线拓扑）      │
│    ▲                                                                      │
│    │ 加载                                                    ┌──────────┐  │
│  data     —— 种子数据 Adapter（打包 JSON → domain 输入）        │ search   │  │
│    (seam: loadSource()，v1 唯一 Adapter=打包 JSON；           │ (bigram  │  │
│     v2 服务器拉取为未来第二 Adapter，v1 不预建端口)              │  倒排)   │  │
│                                                              └──────────┘  │
│  store    —— Zustand：档案/收藏/进度/主题/筛选   (Adapter: localStorage)      │
│                                                                            │
│  features/ home · graph · timeline · roadmap · domain · knowledge-point ·  │
│            profile · search    （公共入口 = seam，禁止互挖内部）               │
│                                                                            │
│  app/     —— 路由 + 响应式 Shell（桌面侧栏 / 移动底部 Tab）+ 主题令牌         │
└────────────────────────────────────────────────────────────────────────────┘
```

## 2. 关键模块的 Interface / Depth / Seam

| 模块 | Interface（小） | Depth（藏什么） | Seam / Adapter |
|------|----------------|-----------------|----------------|
| `domain` | `loadKnowledge(raw): KnowledgeBase`（校验失败抛 `KnowledgeValidationError`）；派生纯函数 `buildGraph(kb)` / `buildTimeline(kb)` / `buildRoadmap(kb, categoryId)` | Zod 校验、引用完整性、拓扑排序、力导向图数据结构、去重别名 | 测试面 = 接口本身；数据源在 `data` 层可替换 |
| `domain/search` | `buildIndex(docs): SearchIndex` / `query(index, q): Hit[]` | 中文 bigram 分词、倒排、TF 评分、高亮切片、拼音?（v1 不做） | 纯函数，无 Adapter；索引对象不透明 |
| `data` | `loadKnowledgeSource(): RawKnowledge` | 打包 JSON 的 import、schemaVersion 检查 | v1 唯一 Adapter；v2 HTTP 拉取时新增第二 Adapter（届时才立端口） |
| `store` | `useProfileStore` / `usePreferenceStore`（方法 ≤6 个/店） | localStorage 读写、默认档案降级、主题持久化 | Adapter = localStorage（Tauri/Web 同一 API） |
| `features/graph` | `GraphPage`（props: 无，自取 domain/store） | 力学仿真循环、缩放拖拽、边类型切换、详情侧栏状态 | 对外仅路由级组件 + 领域色令牌 |

**浅模块检查（删除测试）**：`data` 层看似薄，但它承担 schemaVersion 门槛与打包细节（删掉它，构建路径知识散到每个 feature → 在赚深度）；禁止出现纯透传的 `api/` 或 `utils/` 大杂烩。

## 3. 数据流（单向）

```text
knowledge/*.json ──构建期──▶ schema+引用校验 ──▶ 打包
运行时：data.loadKnowledgeSource() → domain.loadKnowledge() → KnowledgeBase
        → buildGraph/Timeline/Roadmap（useMemo 派生）
        → features 渲染；用户交互 → store（本地持久化）→ 视图
```

## 4. 目录结构（app/）

```text
app/
├── src/
│   ├── domain/          # schema.ts · load.ts · graph.ts · timeline.ts · roadmap.ts · search/
│   ├── data/            # source.ts（打包 Adapter）· knowledge/（构建产物 JSON）
│   ├── store/           # profile.ts · preference.ts
│   ├── features/        # home/ graph/ timeline/ roadmap/ domain/ knowledge-point/ profile/
│   ├── components/      # 跨 feature 展示件（KnowledgeCard、Badge、EmptyState…）
│   ├── app/             # routes.tsx · Shell.tsx · theme.css
│   └── main.tsx
├── src-tauri/           # Tauri 2 壳（desktop + mobile 配置）
└── tests/               # Vitest（domain/search/store 优先，组件其次）
scripts/validate-knowledge.mjs   # 构建期校验（Node，知识区 → 应用区）
knowledge/               # 知识数据源（Git 更新入口）
```

## 5.5 应用后端边界（v1.1 分层收敛，2026-10-11）

**规则**：`src/backend/` = 应用后端（数据管理的唯一所有者）；`features/ components/ app/` = 展示层。

- 展示层**只允许** `import { … } from '@/backend'`（公共出口 index.ts = seam）。
- `backend/` 内部：`knowledge-service`（加载/校验缓存/派生/搜索/视图模型装配）、`filter-store`（查询参数）、
  `profile-store`/`preference-store`（本地持久化）、`types`（视图契约）；`domain/*` 与 `data/*` 是 backend 内部实现，视图不可见。
- 视图拿到的是**渲染就绪的视图模型**（HomeView/GraphView/TimelineView/RoadmapView/DomainView/PointDetailView/SearchHitView），
  不再做排序、过滤、ID 解析、索引构建。
- 深模块自检：knowledge-service 接口 9 个函数，背后藏校验+缓存+派生+检索；删除它，这些逻辑会散回 7 个视图（在赚深度）。
- **v2 服务器化通道**：knowledge-service 的函数签名即未来服务 API 的镜像；届时仅替换 backend 内部实现为 HTTP Adapter（+离线快照回退），展示层零改动。

## 5.9 测试面（阶段 5 seam）

1. `domain`：schema 校验（合法/非法样例）、引用完整性报错、roadmap 拓扑排序（含环检测）、timeline 排序分组。
2. `domain/search`：中文 bigram 命中、别名/标签命中、空查询、评分排序、高亮切片。
3. `store`：收藏/进度/建档持久化（localStorage mock）。
4. 组件冒烟：Shell 导航、首页渲染统计、详情页依赖小图存在性。
