# 任务计划账本：rebuild_v2

- **task_id**：`rebuild_v2`
- **标题**：用 hs-dev-skill 从阶段 0 满配重建 AiIsAllYouNeed（AI 知识星图）
- **change_size**：`L`
- **work_mode**：`DESIGN`（阶段 0～4）；阶段 5 起 `IMPLEMENT`
- **当前阶段**：`0` — 产品与需求对齐（discovery + product）
- **断点**：`S0-13` — v6.1 视觉二轮重设计已重提，冻结确认单待开发者签署
- **更新时间**：2026-10-17T00:00:00Z

---

## 步骤

| step_id | 描述 | 状态 | 备注 |
|---------|------|------|------|
| S0-00 | 开场确认 O1–O4（复述/假设/约束/分级） | done | `_03_qa_log/opening_alignment.md` |
| S0-01 | 审讯：重建口径 / MVP 范围 / 数据契约 / 视觉（Q1–Q8） | done | `_03_qa_log/rebuild_v2_qa_log.md` |
| S0-02 | 落盘宏观品味宪章 `/DESIGN.md` | done | v6 琉璃（v5 极光玻璃已退役，见 S0-10） |
| S0-03 | 落盘 Overview PRD（模块矩阵 + 特性索引 + 功能树 + 角色） | done | `_02_feature_spec/_01_human_prd/overview_prd.md` |
| S0-04 | 落盘各子特性 PRD（11 项，仅 MVP 范围） | done | `_02_feature_spec/_01_human_prd/features/` |
| S0-05 | 落盘双轨原型（Mermaid 拓扑 + ASCII 四态线框） | done | `_02_feature_spec/_04_prototype_wireframe/` |
| S0-06 | 落盘 Vibe Spec（机器执行契约） | done | `_02_feature_spec/_02_vibe_spec/` |
| S0-07 | 落盘《产品开发分阶段规划书》（MVP 裁定源自审讯） | done | `_01_product_vision/_02_phased_roadmap/rebuild_v2_phased_plan.md` |
| S0-08 | Agent 10 维自审 + 提交冻结确认单 | doing | `freeze_signoff.md` |
| S0-09 | 开发者业务语义 + 视觉签收 → 阶段 0 冻结 | rejected | **REJECTED（v5 视觉不通过 + 业务语义需调整）**，见 Q9 |
| S0-10 | v6 重设计：琉璃液态玻璃（字体/配色/材质/边框）+ 业务语义收敛（单一呈现铁律） | done | `/DESIGN.md`(v6)、`overview_prototype.html`(v6)、`overview_prd.md` §6、FEAT-001/002/009 |
| S0-11 | v6 重提冻结确认单 | rejected | **REJECTED（Q10：玻璃不够液态/不够惊艳/图谱丑/无悬浮光效）** |\n| S0-12 | v6.1 二次重设计：厚液态玻璃 + 悬浮光效 + 图谱重做 + iA Writer 布局哲学 | done | `/DESIGN.md`(v6.1)、`overview_prototype.html`(v6.1)、`design_charter.md` |\n| S0-13 | v6.1 重提冻结确认单 | doing | `freeze_signoff.md` |
| S1 | 阶段 1：技术选型（架构范式 + ADR） | pending | 冻结后开始 |
| S2 | 阶段 2：系统架构设计 | pending | |
| S3 | 阶段 3：工程四要素详设（数据/接口/方法/调用链） | pending | 含数据 schema 开发者决策 |
| S4 | 阶段 4：任务拆解与上下文装配 | pending | |
| S5 | 阶段 5：实现切片（垂直曳光弹 → 全量） | pending | 含内容生产管线 |
| S6 | 阶段 6：验收与交付 | pending | |

状态：`pending` 未做 · `doing` 进行中 · `done` 完成 · `skipped` 合法跳过（须备注原因）

---

## 阶段 0 输入登记

- 知识点标题清单：**待开发者提供**（开发者已于 Q9 表示「现在提供」，实际清单尚未送达；不阻断设计冻结，进入阶段 5 前给出）。
- 领域划分与数量：**待标题清单确定**；本阶段以「6 领域占位 + 可扩展」设计。
