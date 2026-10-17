# 跨文档映射矩阵：REQ ↔ 接口 ↔ 数据 ↔ 方法 ↔ 验收场景（阶段 3 · DETAIL-05/06）

- **输入基线**：`data_schema.md`、`module_contracts.md`、`overview_prd.md`、FEAT-001..011
- **验收状态**：SUBMITTED

## 1. 需求 → 数据/接口/方法 → 验收场景 映射

| REQ（能力） | 数据 | 接口/方法 | 验收场景（Gherkin 摘要） |
|-------------|------|-----------|--------------------------|
| FEAT-001 首页 | Domain[]、points（最新/重要） | getDomains / getPointsByDomain / getTimeline | Given 打开首页 When 加载 Then 见星图、统计、领域入口、知识流 |
| FEAT-002 领域页 | Domain、points by domain | getPointsByDomain / getRoadmap 入口 | 领域定义/规模/关键点；趋势仅入口 |
| FEAT-003 图谱 | points、deps/related/backlinks | 自绘 SVG + d3-force 布局 + 透镜聚焦 | 点节点 → 聚焦 + 详情栏；筛选；空态重置 |
| FEAT-004 时间线 | points(year) | getTimeline | 按年排布 + 时代分段锚点 + 领域筛选 |
| FEAT-005 路线 | Roadmap | getRoadmap | 基础→进阶→前沿；趋势主呈现 |
| FEAT-006 搜索 | search-index.json | SearchIndex.search（<100ms） | 输入即出 + 高亮 + ⌘K/Esc |
| FEAT-007 详情 | point + body 块 | getPoint / getRelated / getBacklinks | 正文 wiki 链接、公式、媒体、反向链接、收藏/已读/笔记 |
| FEAT-008 档案 | Profile | ProfileStore | 首次建档浮层；收藏/进度/笔记持久；数据不出本机 |
| FEAT-009 主题 | themeMode | ThemeProvider（唯一控件） | 跟随/日/夜；无闪烁；全站唯一入口 |
| FEAT-010 内容管线 | points/domains/roadmap/index | KnowledgeSource.generate + zod | 标题→生成→校验（fail-fast）→产物；可插拔源 |
| FEAT-011 六端 | — | Tauri 2 壳 / 静态 Web | 同一代码库各端一致（Web 必达；桌面/移动按工具链） |

## 2. 一致性护栏（单位/精度/时间/枚举/权限）

- `year` 整数年、时间线升序；`learnTime` 分钟 1..1440；`importance` 1..5；`difficulty` 三档枚举；`domain` 以 `domains.key` 为准。
- 引用完整性：`deps/related/backlinks/wiki` 目标必须存在（管线强制）；领域色只经 tokens/色板映射，组件不硬编码。
- 权限：无登录；唯一可写=档案；无网络。

## 3. 实现准备度（DETAIL-06 自检）

- [ ] 数据 schema 已落盘 → **待开发者决策（`data_schema.md` §4 D1–D5）**
- [ ] 模块接口/方法/失败语义齐备，编码者无需猜测（`module_contracts.md`）
- [ ] 测试规格可区分正确/错误实现：zod 校验失败样例、搜索命中/未命中、引用完整性违规、档案写失败
- [ ] 检索性能已实测（<100ms）满足契约
- [ ] 待开发者确认：数据 schema（D1–D5）与关键契约（DETAIL-06）

> **结论**：`[ ] APPROVED（进入阶段 4 任务拆解）` / `[ ] REJECTED`
> **开发者确认**：__________ **日期**：__________
