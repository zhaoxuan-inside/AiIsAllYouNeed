# 数据契约设计：AI 知识星图（阶段 3 · DETAIL-01/05）

- **输入基线**：FEAT-007（全字段可链接）、FEAT-010（构建期生成 + 可插拔源）、`arch_design_overview.md` §4；v1 旧数据作参考（已退役）
- **验收状态**：SUBMITTED（数据 schema 按冻结单约定**须经开发者决策确认**）
- **关联**：`_03_architecture_design/_02_system_architecture/arch_design_overview.md` §4

> 本文件定义**数据契约**（字段含义/类型/空值/唯一性/关系/生命周期），不含 DDL 与代码签名；运行时校验用 zod（构建期脚本 + 前端加载双校验）。

## 1. 数据资产与生命周期

| 资产 | 位置（构建产物） | 写方 | 读方 | 生命周期 |
|------|------------------|------|------|----------|
| 知识数据 `points/domains/roadmap` | `public/data/*.json` | content 构建期管线（唯一写方） | 全站 | Git 版本化；管线每次全量重建 |
| 倒排索引 `search-index.json` | `public/data/search-index.json` | content 管线 | search feature | 随知识数据同批重建 |
| 本地档案 `profile` | localStorage（Web）/ Tauri Store（桌面/移动） | profile feature（唯一写方） | app_shell + profile | 本机持久；不随构建重置 |
| 主题偏好 | 档案内 `themeMode` | app_shell（唯一控件） | app_shell | 随档案持久 |

## 2. 知识数据 Schema（zod 契约语义）

### KnowledgePoint

| 字段 | 类型 | 必填 | 空值/默认 | 唯一性 | 说明 |
|------|------|------|-----------|--------|------|
| `id` | string(slug) | ✔ | — | **唯一（全局）** | `^[a-z0-9][a-z0-9-]*$` |
| `title` | string | ✔ | — | 语义唯一（允许重复时以 id 区分） | 显示名 |
| `aliases` | string[] | ✘ | `[]` | 别名不得与其他点 id/title/alias 冲突 | 可跳转（FEAT-007） |
| `domain` | enum(domain.key) | ✔ | — | — | 属某领域 |
| `year` | int | ✔ | — | — | 提出年份（时间线轴）；下限 1800（数学/理论基础可早于 AI 学科诞生，如梯度下降 1847） |
| `importance` | 1..5 | ✔ | — | — | 星级（详情 meta） |
| `difficulty` | enum(入门/进阶/高) | ✔ | — | — | — |
| `learnTime` | int(minutes) | ✔ | — | 1..1440 | 阅读时长 |
| `tags` | string[] | ✘ | `[]` | 标签名唯一去重 | 可跳转（FEAT-007） |
| `media` | MediaBlock[] | ✘ | `[]` | — | 图/示意/公式媒体，可展开查看 |
| `summary` | string | ✔ | — | — | 1–2 句，列表/搜索摘要 |
| `body` | BodyBlock[] | ✔ | — | — | 结构化正文（见下） |
| `papers` | Paper[] | ✘ | `[]` | url 唯一 | 关键论文，外链 ↗ |
| `deps` | string[](pointId) | ✘ | `[]` | 引用必存在 | 前置知识（图谱实线） |
| `related` | string[](pointId) | ✘ | `[]` | 引用必存在 | 相关（图谱虚线） |
| `backlinks` | string[](pointId) | **管线推导，不手填** | `[]` | — | 由全量引用反解（FEAT-007） |

**BodyBlock**（结构化正文，保证「全字段可链接 + 公式 + 媒体」）：
| `t` | 载荷 | 说明 |
|-----|------|------|
| `p` | `text`（内可含 `[[id\|text]]` wiki 链接、`$...$` 行内公式） | 段落 |
| `formula` | `tex` | 块级公式（KaTeX 渲染） |
| `list` | `items[]`（同 p 语法） | 列表 |
| `media` | `{src, caption?, alt?}` | 图片/示意图 |

**MediaBlock**：`{type: enum(image/diagram/audio), src, caption?, alt?}`。

**Paper**：`{title, authors[], year, venue?, url?}`。

### Domain
`{key, name, colorIndex(0..5), order(int), summary}` —— `colorIndex` 映射领域色板（/DESIGN.md §2），`order` 决定首页星座位置；领域数量由数据决定，>6 时扩展色板。

### Roadmap
`{domainKey, trend(string), stages[]}` —— `stages[]: {key: enum(basic/intermediate/frontier), name, pointIds[]}`；每点至多属一个阶段；缺分段时降级为单「全部」阶段。

## 3. 校验与不变量（管线 fail-fast + 前端双校验）

- **管线（构建期）**：zod schema 全量校验，任一违规 → **阻断构建**并输出 `id: 字段` 清单。校验项：
  1. `id` 唯一且符合 slug；引用完整性：`deps/related` 指向存在的 `id`；
  2. `backlinks` 必须由管线反解结果覆盖（手填即失败）；
  3. `domain` 必须存在于 domains；`Roadmap.stages.pointIds` 必须在该领域内且不重复；
  4. `year` 在 1800..今年+2；`importance`/`difficulty`/`learnTime` 越界即失败；
  5. wiki 链接 `[[id]]` 目标必须存在（解析 body 校验）。
- **前端（加载）**：加载 JSON 时二次校验，异常则以「数据损坏」空态呈现并禁用跳转（不崩溃）。

## 4. 待开发者决策（冻结单约定：数据 schema 需拍板）

| # | 决策点 | 候选 | 建议 |
|---|--------|------|------|
| D1 | `importance` 语义 | ① 星级 1–5；② 热度/年份加权 | **① 星级（编辑判定，稳定）** |
| D2 | `difficulty` 取值 | ① 入门/进阶/高；② 1–5 | **① 三档（符合中文学习习惯）** |
| D3 | `body` 结构化程度 | ① 块数组（p/formula/list/media）；② 单一 markdown 字符串 | **① 块数组（全字段可链接 + 公式 + 媒体可控）** |
| D4 | 引用完整性策略 | ① 管线强制校验（fail-fast）；② 允许悬空引用（渲染时降级） | **① 强制校验（构建期产物必须自洽）** |
| D5 | 媒体来源 | ① 构建期外链 URL；② 本地打包资产 | **② 本地打包（离线可用，符合零网络约束）** |

> 建议均为默认值；开发者可改任一项（改后同步更新本文件与 zod schema）。
