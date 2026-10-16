---
version: alpha
name: 极光玻璃 · Aurora Glass
description: AI 知识星图（知识点图谱/时间线/路线/搜索/本地档案）的六端视觉契约；面向中文 AI 学习者与研究者，页面主职是「安静地阅读，随时可漫游知识网络」。
colors:
  # 日间 (Day) —— 冷白雾光
  day-canvas: "#E9EDF4"
  day-glass: "rgba(255,255,255,0.58)"
  day-glass-strong: "rgba(255,255,255,0.80)"
  day-glass-border: "rgba(255,255,255,0.70)"
  day-ink: "#10131A"
  day-ink-2: "#4A5160"
  day-ink-3: "#79818F"
  day-accent: "#2F6BFF"
  # 夜间 (Night) —— 深空辉光
  night-canvas: "#0A0D13"
  night-glass: "rgba(24,28,38,0.56)"
  night-glass-strong: "rgba(19,23,31,0.84)"
  night-glass-border: "rgba(255,255,255,0.10)"
  night-ink: "#E8EBF1"
  night-ink-2: "#9AA3B2"
  night-ink-3: "#6B7484"
  night-accent: "#6E9BFF"
  # 领域色（仅用于节点/圆点/书脊条，永不作正文文字色）
  domain-1: "#5B8DEF"
  domain-2: "#3FBEA8"
  domain-3: "#E0705A"
  domain-4: "#9D7BE8"
  domain-5: "#E5B85C"
  domain-6: "#D46A9E"
typography:
  sans: "'Inter', -apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
  mono: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', Consolas, monospace"
  hero:
    fontSize: 44px
    fontWeight: 650
    lineHeight: 1.08
    letterSpacing: -0.02em
  h1:
    fontSize: 30px
    fontWeight: 640
    lineHeight: 1.2
    letterSpacing: -0.015em
  h2:
    fontSize: 21px
    fontWeight: 600
    lineHeight: 1.3
  h3:
    fontSize: 16px
    fontWeight: 620
    lineHeight: 1.4
  body:
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.7
  reading:
    fontSize: 16.5px
    fontWeight: 400
    lineHeight: 1.85
  caption:
    fontSize: 12.5px
    fontWeight: 450
    lineHeight: 1.5
spacing:
  "2xs": 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  "2xl": 48px
  "3xl": 72px
rounded:
  chip: 999px
  control: 12px
  panel: 18px
  overlay: 24px
glass:
  blur-panel: 20px
  blur-overlay: 28px
  blur-chip: 12px
  saturate: 140%
components:
  button-primary:
    backgroundColor: "{colors.day-accent}"
    textColor: "#FFFFFF"
    rounded: "{rounded.control}"
    padding: 10px 18px
  button-ghost:
    backgroundColor: "{colors.day-glass}"
    textColor: "{colors.day-ink}"
    rounded: "{rounded.control}"
    padding: 10px 16px
  panel:
    backgroundColor: "{colors.day-glass}"
    textColor: "{colors.day-ink}"
    rounded: "{rounded.panel}"
    padding: 20px
---

# DESIGN.md — AI 知识星图（AiIsAllYouNeed）

> 视觉契约 v2 · 代号 **「极光玻璃 / Aurora Glass」** · 双主题（日间 / 夜间）一等公民
> 实现任何界面（含原型与组件）前必读本文件；本文件与项目根目录绑定，是全局唯一视觉单一真实源。
> 特性级 PRD / 原型必须显式声明 `Inherits: /DESIGN.md`，**禁止各自重新发明色彩、字体或调性**。

## 0. 风格总原则

历史：v1 星图 → v2 像素（退役）→ v3 纸墨文库 → v4 iA Writer 极简（退役）→ **v5 极光玻璃（本次重建）**。

1. **全站玻璃拟态（Glassmorphism）**：所有**外壳**表面——顶栏、导航、面板、卡片、抽屉、浮层、chip——都是半透明毛玻璃：`backdrop-filter: blur() saturate()` + 半透明填充 + 1px 高光边。背景不是纯色，而是一层**极淡的极光/星尘光晕**（多团低饱和径向光斑 + 细噪点），日间为冷白雾光，夜间为深空辉光。
2. **阅读区优先（Read-first）**：玻璃是外壳，文字坐在**更高不透明度的玻璃**上（`--glass-strong`，≥0.80 alpha），保证正文对比度 **WCAG AA**（常规文本 ≥ 4.5:1、大字 ≥ 3:1）。任何为「更玻璃」而牺牲阅读清晰度的做法一律禁止。
3. **单一强调色**：全站只有一个强调色（日 `#2F6BFF` / 夜 `#6E9BFF`），用于链接、当前项、影响力、唯一主操作。首屏强调色预算 **≤ 3 处**。领域色**只**出现在功能性圆点 / 图谱节点 / 时间线色点 / 书脊条上，**永不作为正文文字色**。
4. **功能按需（Progressive Disclosure）**：非必要控件默认隐藏，在 `hover / focus / 需要时`浮现；界面只保留功能性文字，解释性副标题与冗余双语一律删除，必要说明下沉到 `title` / `aria-label` / `?` 角标。
5. **图标自绘（Custom Icon System）**：项目自建一套 SVG 图标族（语汇：**线 + 节点 + 微光点**，1.5px 线宽、圆角端点），禁止引入第三方图标库、禁止 emoji 或字体图标充当界面图标。
6. **动效克制**：只用于状态反馈与「星图」本身；入场一次性、缓动轻、与鼠标无耦合；尊重 `prefers-reduced-motion`（开启时全部静止）。

## 1. Visual Theme & Atmosphere

具象参照物：**「天文台的玻璃控制台」**——安静、冷冽、信息密度克制；像俯身在一台 iPad 上看一张会呼吸的星图，四周是浮动但透明克制的玻璃层。**不是**：Web2.0 拟物、赛博霓虹、iA Writer 纸面、廉价 SaaS 仪表盘。

- **Audience**：以中文为主的 AI 学习者 / 研究者 / 工程师 / 爱好者。
- **Primary job of the UI**：一页安静的知识星图，让访客 10 秒看懂「AI 知识全景」，并随时点开任一节点阅读。
- **Density**：`balanced`（列表与导航克制；正文宽松）。阅读正文行宽 ≤ 66ch、行高 1.85。
- **Mood**：冷静、通透、专注、有微弱的宇宙感——玻璃让界面「退后」，让知识「上前」。

## 2. Color Palette & Roles

令牌**成对**定义，主题通过 `[data-theme="night"]` 切换（见 §4）。

### 日间（Day · 冷白雾光）
| 令牌 | 值 | 角色 |
|------|-----|------|
| `--canvas` | `#E9EDF4` | 页面底（叠极光光斑） |
| `--glass` | `rgba(255,255,255,0.58)` | 一般玻璃面板 / 导航 / 卡片 |
| `--glass-strong` | `rgba(255,255,255,0.80)` | 阅读容器 / 需要高对比的表面 |
| `--glass-border` | `rgba(255,255,255,0.70)` | 玻璃高光边 |
| `--ink` | `#10131A` | 主文字 |
| `--ink-2` | `#4A5160` | 次级文字 |
| `--ink-3` | `#79818F` | 三级 / 元信息 |
| `--accent` | `#2F6BFF` | 唯一强调（链接 / 当前项 / 主操作） |
| `--hover` | `rgba(15,23,42,0.05)` | 行 / 控件 hover 底 |

### 夜间（Night · 深空辉光）
| 令牌 | 值 | 角色 |
|------|-----|------|
| `--canvas` | `#0A0D13` | 页面底（叠深空辉光） |
| `--glass` | `rgba(24,28,38,0.56)` | 一般玻璃面板 |
| `--glass-strong` | `rgba(19,23,31,0.84)` | 阅读容器 |
| `--glass-border` | `rgba(255,255,255,0.10)` | 玻璃高光边 |
| `--ink` | `#E8EBF1` | 主文字 |
| `--ink-2` | `#9AA3B2` | 次级文字 |
| `--ink-3` | `#6B7484` | 三级 / 元信息 |
| `--accent` | `#6E9BFF` | 唯一强调 |
| `--hover` | `rgba(255,255,255,0.06)` | hover 底 |

### 语义色（双主题各自微调）
- success `#1B873F` / `#3FBF6E` · warning `#B7791F` / `#E5B85C` · error `#D9383A` / `#FF6B6B` · info 复用 `--accent`。

### 领域色（仅功能性圆点 / 节点 / 色点 / 书脊条）
6 组低饱和、在玻璃上都可辨识的色：`#5B8DEF` `#3FBEA8` `#E0705A` `#9D7BE8` `#E5B85C` `#D46A9E`。
> 领域数量由知识数据决定；超出 6 个时按同一亮度/饱和度带扩展（`domain/N`），**仍只作点/线填充**。

**对比度护栏**：玻璃上任何文字，其有效对比度按「玻璃底色 × 合成后」计算，必须 ≥ 4.5:1（正文）。禁止在玻璃上用 `--ink-3` 作正文，只作元信息。

## 3. Typography Rules

| 角色 | 族 | 说明 |
|------|-----|------|
| 全站 UI / 标题 / 正文 | `'Inter', -apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif` | Inter 为拉丁主字体（OFL，构建期内置）；中文回退系统黑体（PingFang SC / 微软雅黑 / Noto Sans SC） |
| 代码 / 年份 / 统计 | `'JetBrains Mono', ui-monospace, Consolas, monospace` | 数字列强制 `font-variant-numeric: tabular-nums` 等宽对齐 |

- 层级：`Hero 44/650`（首页主标题）→ `H1 30/640`（子页 / 文章题）→ `H2 21/600`（区块题）→ `H3 16/620`（小节题）；正文 `16/1.7`；阅读正文 `16.5/1.85`；`Caption 12.5`。
- 标题 `letter-spacing` 收紧（-0.015 ~ -0.02em）；正文默认 `0`。
- **禁止**：> 2 个字体族、斜体正文、< 12px 正文、彩色正文文字、标题字距装饰。

## 4. Glass & Elevation（玻璃与层次）

```css
.glass {
  background: var(--glass);
  backdrop-filter: blur(var(--blur)) saturate(140%);
  -webkit-backdrop-filter: blur(var(--blur)) saturate(140%);
  border: 1px solid var(--glass-border);
}
```
- **模糊阶梯**：`chip 12px` → `panel 20px` → `overlay 28px`。模糊半径随层级上升，避免「到处一样糊」。
- **层次** = 玻璃不透明度 + 模糊半径 + 1px 高光边，**不是**重投影。允许的极浅投影（仅用于浮层与右键/抽屉，日间）：`0 1px 2px rgba(16,19,26,.06), 0 16px 40px -20px rgba(16,19,26,.28)`；夜间改用纯黑、更低不透明度。**禁止**彩色 glow（星图本体除外）。
- **背景光晕**：`--canvas` 之上叠 2–3 团 `radial-gradient` 低饱和光斑（日间冷蓝/冷青，夜间深蓝/暗紫）+ 极细噪点；**静态**，不随滚动或鼠标移动（星图页例外）。

## 5. Shapes（圆角级差）

`chip 999px`（标签/筛选）· `control 12px`（按钮/输入）· `panel 18px`（卡片/分节容器）· `overlay 24px`（抽屉/模态/底部表）。
**同一半径不得通用于所有层级**；输入 / 卡片 / 浮层必须可辨。

## 6. Layout Principles

- **全站唯一内容列**：`max-width: 1120px`，由 Shell `main` 统一设定；任何页面**不得**自设窄列、额外横向内边距或 `-mx` 出血，保证各页内容左右缘一致。阅读正文列 ≤ 66ch，左缘与内容列对齐。
- 间距基阶：`4 / 8 / 12 / 16 / 24 / 32 / 48 / 72`；区块之间用留白而非分隔线分层（需要时用 1px `--glass-border` 发丝线）。
- **桌面 ≥ 1024px**：顶栏 `56px`（玻璃，悬浮于画布，圆角 18px，左右留边）+ 主区（无侧栏）。**移动 < 1024px**：顶栏 + 主区 + 玻璃底部 Tab（`env(safe-area-inset-bottom)` 适配）。
- 首页：星图主视觉（自绘 SVG，可漫游）→ 等宽统计行 → 领域入口 → 单列知识流。装饰只此一处。

## 7. Component Stylings

- **按钮**：主 = `--accent` 实底白字，radius 12px；次 = 玻璃（`--glass` + 高光边）；两者 `hover` 亮度 +6%，`active` 缩放 0.97，聚焦显示 2px `--accent` 焦点环。触控目标 ≥ 44px（小按钮用透明热区扩展）。
- **输入 / 搜索**：玻璃底 + 高光边，聚焦时边转 `--accent` 并加浅色环。
- **chip / 筛选**：pill（999px）玻璃；选中态 = `--accent` 浅底 + 强调边；领域 chip 可带领域色圆点（点有色、文字无色）。
- **面板 / 卡片**：`--glass` 玻璃，radius 18px，1px 高光边；**仅作可交互或成组容器**时使用；hover 只提亮玻璃、不上浮。
- **列表行**：玻璃面板内的留白分隔行；hover 只变 `--hover` 底。
- **导航**：顶栏/底部 Tab 为玻璃；当前项 = 加粗墨字 + `--accent` 指示条（顶栏为底边条，移动底部 Tab 为顶边条）。
- **图谱**：玻璃画布；节点 = 圆点，**尺寸=入度、填充=空间聚类档位**（确定性 K-Means，低饱和色板），领域色用于筛选 chip 与徽章圆点；节点带 ≥14 单位透明热区（移动可点）；hover 聚焦邻域、标签按需显示。
- **图标**：全部来自自绘图标族；尺寸档 16 / 20 / 24px，线宽等比缩放到视觉 1.5px。

## 8. Depth & Elevation 之外：主题切换

- 主题令牌通过根节点 `[data-theme="day"|"night"]` 切换；默认跟随系统 `prefers-color-scheme`，用户可覆盖（存本地档案，见 FEAT-009）。
- 两主题共享**同一套结构**，只换令牌值；禁止为某一主题单独堆叠额外装饰。

## 9. Do's and Don'ts

**Do**
- 玻璃只做「外壳」，阅读面永远比外壳更不透明、对比更高。
- 用 `backdrop-blur` 阶梯 + 高光边表达层次；动效只做状态反馈与星图。
- 彩色只给功能性圆点 / 节点；文字层级只靠字重、字号、灰阶。
- 图标全部自绘，风格统一（线 + 节点）。

**Don't**
- 紫粉万能渐变、赛博霓虹 glow、每节 fade-up 上浮、千篇一律「图标三列卡片」。
- 把正文压在低不透明玻璃上导致读不清；用低对比灰字充当正文。
- 引入第三方图标库 / emoji 当界面图标；> 2 个字族；彩色正文文字。
- 大圆角通用于所有层级；堆叠重投影制造「高级感」。
- 假数据、假证言、未证实口号。

## 10. Responsive Behavior

- 断点：`640 / 1024`。图谱页 < 1024px 详情为**玻璃底部抽屉**（含安全区内边距），≥ 1024px 为右侧玻璃栏；画布拖拽/缩放一致。
- 阅读优先：移动端正文 `16.5px / 1.85` 不缩。
- 触控目标 ≥ 44px；顶栏 / 底栏 / 抽屉以 `env(safe-area-inset-*)` 适配刘海与手势条；Tauri 移动端与 Web 共用同一套响应式行为。
- `prefers-reduced-motion` 开启：星图静止、所有过渡降级为即时。

## 11. Agent Prompt Guide

```text
Follow project-root DESIGN.md tokens (Aurora Glass) and Do's/Don'ts.
Two themes are first-class: implement day + night via [data-theme].
Glass is chrome; reading surfaces use --glass-strong for WCAG AA.
One accent color; domain colors only on dots/nodes; icons are self-drawn SVG.
Build <page> for <audience>: one job above the fold, functions appear only when needed.
No third-party icon font, no emoji-as-icon, no purple-pink gradient, no neon glow, no per-section fade-up.
```
