---
version: 7.0.0
name: 星图册 · Star Atlas（台灯下 / Under the Lamp）
description: AI 知识星图（全景/图谱/时间线/路线/搜索/详情/本地档案）的六端视觉契约。世界观「星图册·台灯下」：深夜书桌前翻开《AI 知识星图册》，一盏台灯照着；日/夜 = 灯关/灯开。玻璃只做「灯罩 / 透镜 / 展柜」三件有用途的事；图形为星图册线条；强调色为台灯暖金。
colors:
  day-canvas: "#F7F3EA"
  day-canvas-deep: "#EFE9DC"
  day-surface: "rgba(255,252,246,0.94)"
  day-g-hi: "rgba(255,251,240,0.72)"
  day-g-mid: "rgba(255,248,230,0.50)"
  day-g-lo: "rgba(255,244,214,0.34)"
  day-rim: "rgba(255,255,255,0.90)"
  day-ring: "rgba(255,255,255,0.55)"
  day-line: "rgba(40,34,24,0.14)"
  day-ink: "#23201A"
  day-ink-2: "#5E574A"
  day-ink-3: "#948A78"
  day-accent: "#A96812"
  day-accent-soft: "rgba(169,104,18,0.12)"
  day-accent-ink: "#FFFFFF"
  day-hover: "rgba(40,34,24,0.05)"
  day-lamplight: "rgba(255,200,120,0.55)"
  day-bloom1: "rgba(255,214,160,0.5)"
  day-bloom2: "rgba(210,232,214,0.4)"
  day-bloom3: "rgba(214,206,238,0.32)"
  day-shadow: "rgba(70,52,20,0.25)"
  night-canvas: "#12100B"
  night-canvas-deep: "#0D0B08"
  night-surface: "rgba(28,25,19,0.94)"
  night-g-hi: "rgba(48,42,30,0.60)"
  night-g-mid: "rgba(32,28,20,0.48)"
  night-g-lo: "rgba(20,18,13,0.40)"
  night-rim: "rgba(255,220,160,0.18)"
  night-ring: "rgba(255,220,160,0.10)"
  night-line: "rgba(255,230,180,0.10)"
  night-ink: "#EFE9DA"
  night-ink-2: "#B3AA97"
  night-ink-3: "#7D7464"
  night-accent: "#F2B64B"
  night-accent-soft: "rgba(242,182,75,0.14)"
  night-accent-ink: "#241A08"
  night-hover: "rgba(255,230,180,0.06)"
  night-lamplight: "rgba(255,190,110,0.42)"
  night-bloom1: "rgba(120,80,30,0.4)"
  night-bloom2: "rgba(40,36,64,0.5)"
  night-bloom3: "rgba(58,32,60,0.4)"
  night-shadow: "rgba(0,0,0,0.8)"
  domain-1: "#4C8DF5"
  domain-2: "#24A98F"
  domain-3: "#E1755A"
  domain-4: "#9B7BE6"
  domain-5: "#D9A441"
  domain-6: "#D2659A"
typography:
  display: "'Space Grotesk','Noto Sans CJK SC','PingFang SC',sans-serif"
  text: "'Inter','Noto Sans CJK SC','PingFang SC','Microsoft YaHei',sans-serif"
  reading: "'Source Serif 4','Noto Serif CJK SC','Songti SC',Georgia,serif"
  mono: "'JetBrains Mono',ui-monospace,Consolas,'Noto Sans Mono CJK SC',monospace"
  display-size: 44px
  h1-size: 30px
  reading-size: 17.5px
  reading-lineheight: 1.95
  reading-measure: 68ch
spacing:
  base: 4px
  reading-gutter: 34px
rounded:
  chip: 999px
  control: 10px
  panel: 14px
  case: 18px
glass:
  use: ["lamp-shade (顶栏/浮层)", "lens (悬停/选中聚焦)", "display-case (大面板/阅读面)"]
  blur: 24px
  saturate: 180%
  brightness: 1.08
  lamp-top-glow: "radial-gradient(70% 42% at 50% -8%, var(--lamplight), transparent 70%)"
---

# DESIGN.md — AI 知识星图（AiIsAllYouNeed）

> 视觉契约 **v7** · 代号 **「星图册 · 台灯下 / Star Atlas Under the Lamp」** · 设计哲学 **W1**（Q13 拍板，此后不换方向）。
> 本文是全局唯一视觉单一真实源；实现任何界面前必读；特性 PRD / 原型必须声明 `Inherits: /DESIGN.md`。

## 0. 风格总原则

历史：… v4 iA Writer（退役）→ v5 极光玻璃（被否）→ v6 琉璃·液态玻璃（三轮迭代被否，**整代退役**）→ **v7 星图册·台灯下（本版，哲学重开）**。

**为什么 v6 被否（反例教训，v7 必须规避）：**
1. 玻璃作为"全站外壳"→ 廉价 / 过满。→ v7 玻璃只做**灯罩 / 透镜 / 展柜**三件有用途的事。
2. 在旧骨架上调色无解（三轮已证）。→ v7 **先定世界观再写码**，配色一次到位。
3. 衬线与玻璃叠加强行拼合不适配。→ v7 标题用**粗重黑体**，衬线只留给"读书"。

**世界观（W1，唯一依据）：** 深夜书桌前翻开一本《AI 知识星图册》，一盏台灯照着它；**日 / 夜 = 灯关 / 灯开**。

五条不可让渡的准则：

1. **玻璃有用途（GUP）**：玻璃不是装饰。全站只允许三种玻璃：**灯罩**（顶栏/浮层/悬浮条的柔光）、**透镜**（悬停/选中节点的光学聚焦）、**展柜**（图谱画布与阅读大面板，近不透明）。列表、卡片、chip 一律用**纸面 + 发丝线**，不贴玻璃。
2. **台灯即光源**：页面顶部有一盏"台灯"——暖金/琥珀的柔光从上方洒下；夜间它是主光源（更亮更暖），日间是书页上的暖意。任何界面不得在别处再画一束"光"。
3. **星图册是母题**：图谱 = 星图册线条（细曲线 + 星点 + 纸感噪点）；每领域 = 一个星座；首页 = 摊开的星图页。禁止"通用力导向图"式的花哨。
4. **阅读优先 + 日/夜一等公民**：长文用**衬线**（读书感）、近不透明展柜面、WCAG AA；日/夜 = 灯关/灯开，两套令牌同为基线。
5. **图标自绘 · 天文制图语汇**：罗盘（搜索）、台灯（主题）、书（档案）、透镜（图谱）、星（知识点）、书签（收藏）…线宽 1.6px、圆角端点；禁图标库 / emoji / 字体图标。

## 1. Visual Theme & Atmosphere

- **Audience**：以中文为主的 AI 学习者 / 研究者 / 工程师。
- **Primary job**：一页安静、可漫游的知识星图；「像翻一本漂亮的图册」。
- **Mood**：深夜书桌的专注与温暖；安静、克制、有一点宇宙感。**不是**赛博、不是企业蓝、不是玻璃炫技。
- **签名**：① 顶部台灯光；② 星图册线条图谱；③ 台灯暖金强调；④ 日/夜 = 灯关/灯开。

## 2. Color Palette & Roles

令牌成对定义，主题经根节点 `[data-theme="day"|"night"]` 切换。

| 令牌（日） | 值 | 角色 |
|---|---|---|
| `--canvas` | `#F7F3EA` | 灯下白纸 |
| `--surface` | `rgba(255,252,246,.94)` | 展柜 / 阅读面 |
| `--g-hi/mid/lo` | `rgba(255,251,240,.72)/.50/.34` | 灯罩玻璃渐变 |
| `--rim` / `--ring` | `rgba(255,255,255,.90)` / `.55` | 玻璃光边 |
| `--line` | `rgba(40,34,24,.14)` | 发丝线（纸面分隔） |
| `--ink` / `--ink-2` / `--ink-3` | `#23201A` / `#5E574A` / `#948A78` | 主/次/元文字 |
| `--accent` | `#A96812` | 琥珀台灯（唯一强调） |
| `--lamplight` | `rgba(255,200,120,.55)` | 顶部台灯光 |

| 令牌（夜） | 值 | 角色 |
|---|---|---|
| `--canvas` | `#12100B` | 深墨书房 |
| `--surface` | `rgba(28,25,19,.94)` | 展柜 / 阅读面 |
| `--g-hi/mid/lo` | `rgba(48,42,30,.60)/.48/.40` | 灯罩玻璃渐变（暖） |
| `--rim` / `--ring` | `rgba(255,220,160,.18)` / `.10` | 玻璃光边（暖） |
| `--line` | `rgba(255,230,180,.10)` | 发丝线 |
| `--ink` / `--ink-2` / `--ink-3` | `#EFE9DA` / `#B3AA97` / `#7D7464` | 主/次/元文字（暖白） |
| `--accent` | `#F2B64B` | 台灯暖金（唯一强调） |
| `--lamplight` | `rgba(255,190,110,.42)` | 台灯是主光源 |

**语义色**：success `#3E8E4E`/`#5FC96E` · warning `#B0791F`/`#E8B84C` · error `#C0443E`/`#F07B6A` · info 复用 `--accent`。
**领域色（星座色）**：`#4C8DF5` `#24A98F` `#E1755A` `#9B7BE6` `#D9A441` `#D2659A`——只用于星点 / 节点 / 徽章圆点 / 书脊条。
**对比度护栏**：展柜与纸面上常规文字 ≥ 4.5:1；禁止 `--ink-3` 作正文。

## 3. Typography Rules（四角色 · 黑体标题 / 衬线读书）

| 角色 | 字体 | 用于 |
|---|---|---|
| Display | **Space Grotesk**（拉丁）＋ **粗重 CJK 黑体** | 首页题 / H1 / 数字标题——星图册的"图注"感 |
| Text | **Inter** ＋ 系统黑体 | 导航 / 标签 / 按钮 / 列表 / 说明 |
| Reading | **衬线**（Source Serif 4 / Noto Serif CJK SC） | 知识点长文——"读书" |
| Mono | **JetBrains Mono** | 年份 / 统计 / 公式 / 编号（tabular-nums） |

- 层级：`Display 44/600/1.08/-0.02em` → `H1 30/600/1.18` → `H2 18/600/1.35` → `H3 15/600/1.45`；`Body 15/1.6`；`Reading 17.5/1.95`；`Caption 12.5`。
- 标题字重用粗、字距收紧；正文默认 `0`；长文 `≤68ch`。

## 4. 玻璃：三用途（GUP）

- **灯罩 Lamp-shade**（`blur 24`，暖渐变 + 上缘高光）：顶栏、悬浮操作条、搜索浮层、抽屉。**视觉上是一盏暖光下的玻璃片**。
- **透镜 Lens**：悬停 / 选中图谱节点时出现**圆形放大环 + 柔光 + 轻微缩放**（光学聚焦感）；搜索结果聚焦同理。透镜只出现在"正在看"的地方。
- **展柜 Display-case**（近不透明 `--surface`，`blur 24` + 光边）：图谱画布、详情阅读面板——像玻璃罩住标本。
- **禁用**：列表行、chip、卡片、按钮一律纸面 + 发丝线，不贴玻璃；同一屏不得出现第四种模糊。
- 台灯光：`body::before` 顶部径向暖光（`--lamplight`）＋ 2–3 团极淡纸感光晕 + 细噪点（纸感）。
- **全页面鼠标光效（硬性，Q14/Q16 定为 B 形）**：一盏**弱化小台灯** `#cursorlight`（≤240px、active ≤0.55、静止 1.1s 缓慢降至 0.10；日 `soft-light` / 夜 `screen`）常驻跟随光标；**同时**被扫到的元素**自亮**——暖光点 + 强调色柔和描边环 + 标题微暖（行/领域行/lane/chip/分段选项/图标按钮/玻璃透镜全覆盖）。**任何页面、任何元素：鼠标所到之处必有光回应，但光始终克制、不抢读。**

```css
/* 灯罩 / 展柜共用配方（缺一即"不高级"） */
.glass{ position:relative; border-radius:var(--r);
  background:linear-gradient(176deg,var(--g-hi),var(--g-mid) 44%,var(--g-lo));
  backdrop-filter:blur(24px) saturate(180%) brightness(1.08);
  box-shadow: inset 0 1px 1px var(--rim), inset 0 0 0 1px var(--ring),
              inset 0 -12px 24px -18px var(--ring-d), 0 1px 1px rgba(0,0,0,.04),
              0 24px 56px -30px var(--shadow);
}
.glass::before{ /* 透镜悬浮光泽（跟随光标） */
  content:""; position:absolute; inset:0; border-radius:inherit; pointer-events:none; z-index:3;
  background:radial-gradient(220px 220px at var(--mx,26%) var(--my,-6%), var(--sheen), transparent 62%);
  opacity:0; transition:opacity .4s ease; }
.glass:hover::before{opacity:1;}
```

## 5. Shapes

`chip 999` · `control 10` · `panel 14`（纸面板）· `case 18`（展柜）· 同心圆角（内 = 外 − 内边距）。

## 6. Layout（iA 式克制 · 星图册版式）

- 全站唯一内容列 `1120px`；阅读页内容收进居中列 `≤68ch`（内左对齐）。
- 顶栏 = **灯罩**：sticky 56px，暖玻璃条（日=暖白、夜=暖金微光），含品牌 / 搜索 / 主题（**唯一**） / 档案。
- 首页：星图页（星图线条 + 领域星座）→ 等宽统计 → 领域索引（纸面行）→ 知识流（纸面行）。
- 留白为主，`--line` 发丝线只分隔纸面内容；装饰只此一处（星图页 + 台灯）。

## 7. Component Stylings

- **按钮**：主 = `--accent` 实底 + `--accent-ink`；次 = 纸面/透明 + 光边。hover 提亮，active 0.98，focus 2px 强调环。触控 ≥44px。
- **图标按钮**：默认无框无底；hover 柔和面；选中 `--accent`。**无方框**。
- **chip / 筛选**：pill 纸面（不贴玻璃）；选中 = 强调浅底 + 内环。领域 chip 可带领域色星点。
- **分段控件 / 分页**：单条纸面轨道 + 内嵌滑块（光边），**禁止**每项画方框。
- **图谱（星图册）**：`case` 展柜 + 极淡星点网格（径向淡出）；边 = 细曲线（依赖实线 / 相关虚线）；节点 = 领域色星点（主星带细环 + 上缘高光），尺寸 = 入度；hover = **透镜聚焦**（放大环 + 标签浮出 + 柔光）；左下角图例；右侧 `L2` 玻璃详情栏（≥1024px）。禁止力导向动画堆料。
- **主题**：**全站唯一**顶栏台灯图标 → 三选一（跟随 / 日 / 夜）；日/夜 = 灯关/灯开。

## 8. Do's and Don'ts

**Do**：玻璃只做灯罩/透镜/展柜；台灯是唯一光源；星图册是母题；黑体标题 + 衬线读书；强调色只一个（暖金/琥珀）；图标自绘。
**Don't**：全站贴玻璃；每节 fade-up；紫粉渐变 / 霓虹；企业蓝；`1px solid` 实描边控件；图标库 / emoji 当图标；中文首字下沉；假数据。

## 9. Responsive & Motion

- 断点 `640 / 1024`；图谱 <1024px 详情为底部抽屉；阅读不缩字号。
- 台灯进入时缓缓点亮一次；节点 hover 透镜；尊重 `prefers-reduced-motion`（全部静止）。

## 10. Agent Prompt Guide

```text
Follow /DESIGN.md v7 (Star Atlas Under the Lamp). World: a map book on a night desk lit by one lamp.
Day/night = lamp off/on. Glass ONLY as lamp-shade (topbar/overlay), lens (hover focus), display-case (canvas/reading).
Everything else is flat paper + hairline. One accent: warm amber/gold. Atlas lines + star nodes for the graph.
Bold grotesk headings, serif reading, Inter UI, mono data. Custom cartography SVG icons. No icon libraries, no neon, no solid borders.
```

## 11. 功能唯一性铁律（沿用 v6）

一能力一控件（主题唯一入口）、一信息一主呈现（趋势只在路线页）、演示壳与产品视觉隔离。

## 12. 阶段与验收

- 视觉真理源：`_02_feature_spec/_03_prototype_html/overview_prototype.html`（v7）。
- 冻结：待开发者对 v7 视觉签收后进入阶段 1。

