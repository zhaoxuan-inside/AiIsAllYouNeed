# 子特性需求与功能规格说明书 (Feature PRD)：主题与阅读偏好

- **文档版本/内容摘要**：v2.0.0 · 日/夜双主题（默认跟随系统）+ 阅读偏好
- **DISC / PROD 阶段验收记录**：`_06_dev_process/_03_qa_log/rebuild_v2_qa_log.md`（Q4）
- **确认范围及来源**：开发者要求日/夜双模式（Q4）。

- **特性ID (Feature ID)**：`FEAT-009`
- **特性名称**：主题与阅读偏好
- **所属模块**：`personal`
- **优先级**：P0
- **状态**：active
- **宏观品味宪章继承**：`Inherits: /DESIGN.md`（§4 主题切换、§2 色表）
- **上级总览索引**：`_02_feature_spec/_01_human_prd/overview_prd.md`
- **关联界面原型**：`_02_feature_spec/_04_prototype_wireframe/feat009_theme_prototype.md`
- **面向 VibeCoding 契约**：`_02_feature_spec/_02_vibe_spec/feat009_theme_vibe_spec.md`

---

## 1. 特性洞察与核心价值界定 (Framing & Discovery)

- **现状与摩擦**：单一主题在夜间刺眼/白天发灰；阅读类产品必须跟随使用场景。
- **用户雇佣任务 (JTBD)**：`When` 我在夜间或白天不同环境阅读，`I want to` 一键切换日/夜主题（并默认跟随系统），`so I can` 始终保持舒适阅读。
- **惊喜时刻**：首次打开即自动匹配系统主题；切换即时、无闪烁。
- **冷启动**：无用户设置时跟随系统 `prefers-color-scheme`。

---

## 2. 交互形态比选与取舍 (Approaches & Trade-offs)

| 维度 | 方案 A（推荐） | 方案 B（弃用） | 取舍理由 |
|---|---|---|---|
| **默认** | 跟随系统 + 用户可覆盖（日/夜/跟随） | 固定日间 | 双主题为视觉基线，跟随系统最省心 |
| **切换控件** | 顶栏一个图标按钮（循环/菜单） | 设置页下拉 | 功能按需、少文字（图标表达），符合 Q4 |

---

## 3. 详细字段与业务规则约束矩阵 (Specifications & Constraints)

| 项 | 规则 |
|---|---|
| 模式取值 | `system`（默认）/ `day` / `night` |
| 应用方式 | 根节点 `[data-theme]` 切换令牌；无闪烁（首屏前内联注入） |
| 持久化 | 偏好存本地档案（FEAT-008） |
| 阅读偏好 | （可选）正文字号档、行宽；MVP 至少提供主题，字号档可 Phase 2 |
| 无障碍 | 两主题均满足 WCAG AA |

### 业务分支规则矩阵
1. 无设置 → system。
2. 用户设为 day/night → 覆盖并持久化。
3. 系统主题变化且模式为 system → 实时跟随。

---

## 4. 需求原子分解与行为驱动验收标准 (Requirements & Functional DoD)

### 4.1 原子需求

| 需求编号 | 简述 | 关联动作 | 验收证据 | 优先级 |
|---|---|---|---|---|
| `REQ-001` | 默认跟随系统主题 | 首次打开 | 主题=系统主题 | P0 |
| `REQ-002` | 手动切换日/夜并持久化 | 点击切换 | 刷新后保留所选主题 | P0 |
| `REQ-003` | 切换无闪烁 | 首屏加载 | 无「先亮后暗」闪变 | P1 |
| `REQ-004` | 两主题对比度达标 | 走查 | 正文对比度 ≥ 4.5:1 | P0 |

### 4.2 Gherkin

```gherkin
Feature: 主题与阅读偏好

  Scenario: REQ-001 跟随系统
    Given 系统处于夜间模式且用户未设置主题
    When 用户首次打开应用
    Then 应用以夜间主题渲染

  Scenario: REQ-002 手动切换持久化
    Given 用户处于日间主题
    When 用户切换为夜间并刷新
    Then 仍为夜间主题

  Scenario: REQ-004 对比度
    Given 日间或夜间主题
    When 审查正文文字与玻璃底
    Then 有效对比度 ≥ 4.5:1（AA）
```
