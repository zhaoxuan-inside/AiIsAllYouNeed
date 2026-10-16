# 子特性需求与功能规格说明书 (Feature PRD)：全局中文搜索

- **文档版本/内容摘要**：v2.0.0 · 客户端中文全文搜索（bigram 倒排）+ 高亮 + 快捷入口
- **DISC / PROD 阶段验收记录**：`_06_dev_process/_03_qa_log/rebuild_v2_qa_log.md`
- **确认范围及来源**：MVP 全量（Q3）。

- **特性ID (Feature ID)**：`FEAT-006`
- **特性名称**：全局中文搜索
- **所属模块**：`retrieve`
- **优先级**：P0
- **状态**：active
- **宏观品味宪章继承**：`Inherits: /DESIGN.md`
- **上级总览索引**：`_02_feature_spec/_01_human_prd/overview_prd.md`
- **关联界面原型**：`_02_feature_spec/_04_prototype_wireframe/feat006_search_prototype.md`
- **面向 VibeCoding 契约**：`_02_feature_spec/_02_vibe_spec/feat006_search_vibe_spec.md`

---

## 1. 特性洞察与核心价值界定 (Framing & Discovery)

- **现状与摩擦**：浏览器内查找无法跨视图、无法按别名/标签命中，也无法跳转依赖。
- **用户雇佣任务 (JTBD)**：`When` 我心里有一个概念名（中文/英文/别名），`I want to` 立即搜到对应知识点并跳到详情，`so I can` 不翻菜单直接定位。
- **惊喜时刻**：输入即出结果（<100ms），命中处高亮。
- **冷启动**：搜索框带推荐词（如「Transformer / 注意力机制」），首次可用。

---

## 2. 交互形态比选与取舍 (Approaches & Trade-offs)

| 维度 | 方案 A（推荐） | 方案 B（弃用） | 取舍理由 |
|---|---|---|---|
| **入口** | 全局命令面板（⌘K / 顶栏搜索），浮层呈现 | 独立搜索页 | 浮层不打断当前上下文，跨视图可用 |
| **分词** | 自研 bigram 倒排（CJK 友好、零依赖、可测） | 引入第三方全文库 | 数据量小、中文无空格；bigram 轻量且纯函数易测 |

---

## 3. 详细字段与业务规则约束矩阵 (Specifications & Constraints)

| 规则 | 说明 |
|---|---|
| 可检索字段 | 标题、别名、一句话定义、标签、正文（可选摘录） |
| 大小写 | 英文不区分大小写；中文按 bigram |
| 结果 | 按相关度排序；展示标题 + 命中高亮 + 领域色点 |
| 空查询 | 展示推荐词与最近搜索（本机） |
| 无结果 | 展示「未找到」+ 推荐词 |
| 性能 | 客户端索引，查询 < 100ms |
| 键盘 | ↑↓ 选择、Enter 打开、Esc 关闭 |

---

## 4. 需求原子分解与行为驱动验收标准 (Requirements & Functional DoD)

### 4.1 原子需求

| 需求编号 | 简述 | 关联动作 | 验收证据 | 优先级 |
|---|---|---|---|---|
| `REQ-001` | 输入中文/别名/标签可命中 | 输入关键词 | 命中结果正确且高亮 | P0 |
| `REQ-002` | Enter 打开详情、Esc 关闭 | 键盘操作 | 跳转/关闭正确 | P0 |
| `REQ-003` | 无结果与空查询引导 | 无命中/空输入 | 展示引导与推荐词 | P1 |
| `REQ-004` | 查询 < 100ms | 输入 | 测试断言耗时阈值 | P1 |

### 4.2 Gherkin

```gherkin
Feature: 全局中文搜索

  Scenario: REQ-001/002 中文命中并打开
    Given 数据含知识点「注意力机制」及其别名
    When 访客输入「注意力」并回车
    Then 列表出现命中并高亮，回车进入该知识点详情

  Scenario: REQ-003 无结果引导
    Given 访客输入无匹配的关键词
    When 结果更新
    Then 展示「未找到」与推荐词（Transformer / 注意力机制）

  Scenario: REQ-004 查询性能
    Given 索引已就绪
    When 执行一次查询
    Then 返回耗时 < 100ms（自动化断言）
```
