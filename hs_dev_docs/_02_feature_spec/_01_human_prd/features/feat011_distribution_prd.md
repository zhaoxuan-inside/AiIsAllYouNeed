# 子特性需求与功能规格说明书 (Feature PRD)：六端分发

- **文档版本/内容摘要**：v2.0.0 · 一套 Web 代码经 Tauri 2 覆盖 Web/Windows/Linux/macOS/iOS/Android
- **DISC / PROD 阶段验收记录**：`_06_dev_process/_03_qa_log/rebuild_v2_qa_log.md`
- **确认范围及来源**：MVP 全量（Q3）；六端为产品承诺。

- **特性ID (Feature ID)**：`FEAT-011`
- **特性名称**：六端分发
- **所属模块**：`distribution`
- **优先级**：P1
- **状态**：active
- **宏观品味宪章继承**：`Inherits: /DESIGN.md`（§10 响应式与安全区）
- **上级总览索引**：`_02_feature_spec/_01_human_prd/overview_prd.md`
- **关联界面原型**：`_02_feature_spec/_04_prototype_wireframe/feat011_distribution_prototype.md`
- **面向 VibeCoding 契约**：`_02_feature_spec/_02_vibe_spec/feat011_distribution_vibe_spec.md`

> [!NOTE]
> 本特性为**分发与运行形态契约**；桌面/移动真机构建依赖对应平台工具链（Rust/Xcode/Android SDK），属环境约束，非产品逻辑。

---

## 1. 特性洞察与核心价值界定 (Framing & Discovery)

- **现状与摩擦**：纯网页无法离线安装、无原生窗口；为每个平台各写一套成本极高。
- **用户雇佣任务 (JTBD)**：`When` 我想在桌面或手机离线使用，`I want to` 从同一产品获得原生安装包，`so I can` 随地读书而无需联网。
- **惊喜时刻**：Web、桌面、移动体验一致（含日/夜、玻璃视觉、响应式）。
- **冷启动**：Web 端零安装即可用；桌面/移动按平台安装。

---

## 2. 交互形态比选与取舍 (Approaches & Trade-offs)

| 维度 | 方案 A（推荐） | 方案 B（弃用） | 取舍理由 |
|---|---|---|---|
| **跨端方案** | 一套 Web 代码 + Tauri 2 壳（六端） | Electron（无移动）/ 各端原生 | Tauri 2 是唯一用同一套 Web 代码同时产出桌面+移动安装包的开源方案；系统 WebView 包体小 |
| **移动真机构建** | 交付完整配置 + 文档，按平台执行 | 无 | 依赖平台工具链；v1 交付可构建配置 |

---

## 3. 详细字段与业务规则约束矩阵 (Specifications & Constraints)

| 端 | 前置依赖 | 产物 | 规则 |
|---|---|---|---|
| Web | Node 18+ | `dist/` 静态站点 | 必达；可部署任意静态托管 |
| Windows | Rust + MSVC | `.msi` / `.exe` | 按平台执行 |
| Linux | Rust + webkit2gtk | `.deb` / `.AppImage` | 按平台执行 |
| macOS | Rust + Xcode CLT | `.app` / `.dmg` | 需 macOS |
| iOS | macOS + Xcode + Rust iOS targets | Xcode 工程 → App Store | 需 macOS |
| Android | Android Studio + NDK | `.apk` / `.aab` | 按平台执行 |

- **响应式**：桌面/移动共用同一套断点（640/1024）；移动底部 Tab + 安全区；图谱抽屉移动化。
- **数据**：知识数据打包在前端资源中，无后端依赖。

---

## 4. 需求原子分解与行为驱动验收标准 (Requirements & Functional DoD)

### 4.1 原子需求

| 需求编号 | 简述 | 关联动作 | 验收证据 | 优先级 |
|---|---|---|---|---|
| `REQ-001` | Web 端构建为可部署静态站点 | `build` | 产出 `dist/` 且本地可打开 | P0 |
| `REQ-002` | 提供六端构建配置与命令 | 构建配置 | 桌面/移动配置齐备并可执行 | P0 |
| `REQ-003` | 桌面/移动共用同一响应式与主题 | 走查 | 各端体验一致 | P0 |
| `REQ-004` | 移动端安全区与触控目标适配 | 走查 | 底部 Tab 不被手势条遮挡；触控 ≥44px | P0 |
| `REQ-005` | 离线可用（数据内嵌） | 断网走查 | 断网仍可完整浏览 | P1 |

### 4.2 Gherkin

```gherkin
Feature: 六端分发

  Scenario: REQ-001/005 Web 与离线
    Given 已完成生产构建
    When 在离线环境打开 dist 站点
    Then 完整浏览全部知识点，无需网络

  Scenario: REQ-003/004 移动端一致性
    Given 在移动端（或 390px 视口）打开
    When 浏览首页/图谱/详情
    Then 使用移动布局（底部 Tab、底部抽屉）、安全区正确、日/夜主题一致
```
