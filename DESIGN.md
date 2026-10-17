---
version: 6.1.0
name: 琉璃 · Liuli Glass
description: AI 知识星图（全景/图谱/时间线/路线/搜索/详情/本地档案）的六端视觉契约。面向中文 AI 学习者与研究者，页面的主职是「安静地阅读，随时可漫游知识网络」。高保真液态玻璃（Liquid Glass：厚玻璃 + 悬浮光效），布局哲学取自 iA Writer（克制的框架、文字优先、大量留白），日间/夜间双主题为一等公民。
colors:
  # ── 日间 · 晨琉璃（暖纸 + 清透玻璃）──
  day-canvas: "#EFEBE3"
  day-canvas-deep: "#E8E2D7"
  day-surface: "rgba(255,253,250,0.90)"      # 阅读面（近不透明）
  day-g-hi: "rgba(255,255,255,0.70)"         # 玻璃渐变：上
  day-g-mid: "rgba(255,255,255,0.42)"        # 玻璃渐变：中
  day-g-lo: "rgba(255,255,255,0.28)"         # 玻璃渐变：下
  day-rim: "rgba(255,255,255,0.98)"          # 玻璃上缘高光
  day-ring: "rgba(255,255,255,0.55)"         # 发丝内环（光边，非实描边）
  day-ring-d: "rgba(120,108,86,0.07)"        # 下缘厚度暗部
  day-line: "rgba(28,24,18,0.13)"            # 发丝分隔线（非控件边框）
  day-ink: "#191814"
  day-ink-2: "#57534A"
  day-ink-3: "#8A8377"
  day-accent: "#0E7C7B"                      # 琉璃青（唯一强调）
  day-accent-ink: "#FFFFFF"
  # ── 夜间 · 夜琉璃（深墨 + 微光玻璃）──
  night-canvas: "#090B10"
  night-canvas-deep: "#0E1119"
  night-surface: "rgba(20,23,30,0.92)"
  night-g-hi: "rgba(66,74,92,0.66)"
  night-g-mid: "rgba(26,30,40,0.50)"
  night-g-lo: "rgba(14,16,22,0.42)"
  night-rim: "rgba(255,255,255,0.30)"
  night-ring: "rgba(255,255,255,0.13)"
  night-ring-d: "rgba(0,0,0,0.35)"
  night-line: "rgba(255,255,255,0.10)"
  night-ink: "#EDEAE3"
  night-ink-2: "#A8A69D"
  night-ink-3: "#75726A"
  night-accent: "#63F0D8"
  night-accent-ink: "#04211E"
  # ── 领域色（仅作节点/圆点/书脊条填充，永不作正文文字色）──
  domain-1: "#4C8DF5"
  domain-2: "#24A98F"
  domain-3: "#E1755A"
  domain-4: "#9B7BE6"
  domain-5: "#D9A441"
  domain-6: "#D2659A"
typography:
  serif: "'Source Serif 4','Noto Serif CJK SC','Songti SC','SimSun',Georgia,serif"
  sans: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Noto Sans CJK SC','Microsoft YaHei',sans-serif"
  mono: "'JetBrains Mono',ui-monospace,SFMono-Regular,Consolas,'Noto Sans Mono CJK SC',monospace"
  display:
    fontFamily: "{typography.serif}"
    fontSize: 46px
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: -0.02em
  h1:
    fontFamily: "{typography.serif}"
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.18
    letterSpacing: -0.015em
  h2:
    fontFamily: "{typography.sans}"
    fontSize: 19px
    fontWeight: 600
    lineHeight: 1.35
  h3:
    fontFamily: "{typography.sans}"
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.45
  body:
    fontFamily: "{typography.sans}"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.6
  reading:
    fontFamily: "{typography.serif}"
    fontSize: 17.5px
    fontWeight: 400
    lineHeight: 1.95
  caption:
    fontFamily: "{typography.sans}"
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
  control: 10px
  panel: 16px
  overlay: 22px
glass:
  blur-1: 14px
  blur-2: 24px
  blur-3: 34px
  saturate: 200%
  brightness: 1.10
  top-rim: "inset 0 1px 1px var(--rim)"
  thickness: "inset 0 -14px 26px -20px var(--ring-d)"
  ring: "inset 0 0 0 1px var(--ring)"
  dispersion: "inset -1px -1px 0 rgba(255,170,130,.05), inset 1px 1px 0 rgba(130,200,255,.06)"
  hover-specular: "radial-gradient(240px 240px at var(--mx,26%) var(--my,-6%), rgba(255,255,255,.55), transparent 62%)"
  ambient: "0 2px 4px rgba(0,0,0,.05), 0 28px 64px -34px var(--shadow)"
components:
  button-primary:
    backgroundColor: "{colors.day-accent}"
    textColor: "{colors.day-accent-ink}"
    rounded: "{rounded.control}"
    padding: 9px 18px
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.day-ink}"
    rounded: "{rounded.control}"
    padding: 9px 16px
  panel:
    backgroundColor: "{colors.day-g-mid}"
    textColor: "{colors.day-ink}"
    rounded: "{rounded.panel}"
    padding: 22px 24px
---

# DESIGN.md — AI 知识星图（AiIsAllYouNeed）

> 视觉契约 **v6.1** · 代号 **「琉璃 / Liuli Glass」** · 高保真液态玻璃（Liquid Glass：厚玻璃 + 悬浮光效）· 布局哲学取自 **iA Writer** · 日间 / 夜间双主题一等公民。
> 实现任何界面（含原型与组件）前必读本文件；本文件绑定项目根目录，是全局唯一视觉单一真实源。
> 特性级 PRD / 原型必须显式声明 `Inherits: /DESIGN.md`，**禁止各自重新发明色彩、字体或调性**。

## 0. 风格总原则

历史：v1 星图 → v2 像素（退役）→ v3 纸墨文库 → v4 iA Writer 极简（退役）→ v5 极光玻璃（**被否，退役**）→ v6 琉璃 → **v6.1 琉璃·液态（本次重建）**。

v5 被否的原因，是 v6 的硬性设计目标；v6.1 进一步回应「玻璃不够液态 / 不够高级 / 细节不够 / 图谱丑 / 无悬浮光效」：
1. **字体与排版平庸** → 建立**四角色字体系统**（Display / Text / Reading / Mono），知识正文改用**衬线（Serif）阅读体**，让「读知识」与「用界面」是两种声音。
2. **配色缺乏记忆点** → 采用**暖纸 × 深墨**的冷暖对位（日间暖米白 + 琉璃青；夜间深墨蓝 + 薄荷青），一眼可辨、非通用 SaaS 蓝。
3. **不够有辨识度** → 签名：**星图主视觉**（自绘星座线 + 领域节点）+ **自绘「线·节点」图标族** + 液态玻璃厚玻璃质感。
4. **玻璃过满 / 边框廉价 / 功能重复** → 用**玻璃分级（1/2/3 级）+ 近不透明阅读面**收敛玻璃；控件一律用**光边（inset ring）与面**表达，**禁止** 1px 实描边；并确立**功能唯一性**铁律。
5. **不够液态 / 无悬浮光效 / 图谱丑 / 细节糙** → 玻璃升级为**厚玻璃**（上缘高光 + 底部厚度 + 色散暗示 + **跟随光标的折射光泽**）；图谱重做为曲线边 + 节点高光/光环 + 点阵网格 + 图例；布局哲学对齐 **iA Writer**（克制的框架、文字优先、居中阅读列、大量留白）。

五条不可让渡的准则：

1. **液态玻璃，但有分级**：玻璃是"材料"而非"装饰贴纸"。全站只使用 **3 级玻璃**（`blur 14 / 24 / 34`），每级有固定的用途；同一视图内不得出现第 4 种模糊值。玻璃成品由**渐变填充 + 背板模糊/提饱和 + 上缘高光 + 底部厚度 + 色散暗示 + 悬浮折射光泽**构成，缺一即「廉价 / 不够液态」。
2. **阅读优先（Read-first）**：玻璃是外壳；**长文阅读面使用 `--surface`（近不透明）**，正文对比度 **WCAG AA**（常规文本 ≥ 4.5:1、大字 ≥ 3:1）。阅读页正文收进**居中列（≤68ch）**、框架退后。任何为「更玻璃」而牺牲阅读清晰度的做法一律禁止。
3. **单一强调色 + 功能唯一性**：全站只有一个强调色（日 `#0E7C7B` / 夜 `#63F0D8`），用在链接、当前项、唯一主操作；首屏强调色预算 **≤ 3 处**。**同一份信息全站只在唯一一处作为"主呈现"**（Single Source of Presentation），其它页面只给**入口**，不复制实体内容（详见 §12）。
4. **功能按需 + 图标自绘**：非必要控件默认隐藏，在 `hover / focus / 需要时`浮现；界面只保留功能性文字。所有界面图标来自**项目自绘 SVG 图标族**（语汇：线 + 节点 + 微光点；1.6px 线宽、圆角端点），禁止第三方图标库、emoji、字体图标。
5. **光要有回应**：任何玻璃面 / 阅读面 / 图谱节点在 hover 时必须有明确的光反馈（跟随光标的 specular、光环、提亮），让界面"活"起来。

## 1. Visual Theme & Atmosphere

具象参照物：**「实验室里的琉璃标本柜」**——清晨是暖米的纸与清透的玻璃，入夜是深墨的底与微光的玻璃；知识像被安放在玻璃层之间。

- **Audience**：以中文为主的 AI 学习者 / 研究者 / 工程师 / 爱好者。
- **Primary job of the UI**：一页安静的知识星图，让访客 10 秒看懂「AI 知识全景」，并随时点开任一节点阅读。
- **Density**：`balanced`（导航与列表克制；正文宽松）。阅读正文列宽 ≤ 68ch、行高 1.95，置于居中列。
- **Mood**：安静、通透、专注、有微弱的宇宙感——玻璃让界面「退后」，让知识「上前」（iA Writer 式克制）。
- **明确不是**：Web2.0 高光拟物、赛博霓虹、紫粉万能渐变、廉价 SaaS 仪表盘、通用「图标三列卡片」。

## 2. Color Palette & Roles

> **候选配色方向（对比裁定中）**：基线为**暖纸·琉璃青**；另有**冷白·苹果蓝**与**纯白·单色（iA 式）**两套候选，经 DEV 演示壳一键对比，待开发者敲定后唯一保留（`CR-rebuild_v2-06`）。三套均遵守「单一强调色 + 领域色仅点/线」约束。

令牌**成对**定义；主题通过根节点 `[data-theme="day"|"night"]` 切换（见 §8）。

### 日间 · 晨琉璃（暖纸 + 清透玻璃）

| 令牌 | 值 | 角色 |
|------|-----|------|
| `--canvas` | `#EFEBE3` | 页面底（叠 4 团低饱和光晕，见 §4） |
| `--surface` | `rgba(255,253,250,.90)` | 阅读面 / 大内容面板（近不透明） |
| `--g-hi` / `--g-mid` / `--g-lo` | `rgba(255,255,255,.70)` / `.42` / `.28` | 玻璃填充渐变（厚玻璃三段） |
| `--rim` | `rgba(255,255,255,.98)` | 玻璃上缘高光 |
| `--ring` | `rgba(255,255,255,.55)` | 发丝内环（光边，非实描边） |
| `--ring-d` | `rgba(120,108,86,.07)` | 下缘厚度暗部 |
| `--line` | `rgba(28,24,18,.13)` | 发丝分隔线（**只用于分隔内容**，不用于控件描边） |
| `--ink` | `#191814` | 主文字 |
| `--ink-2` | `#57534A` | 次级文字 |
| `--ink-3` | `#8A8377` | 三级 / 元信息 |
| `--accent` | `#0E7C7B` | 唯一强调（链接 / 当前项 / 主操作） |
| `--accent-ink` | `#FFFFFF` | 强调色上的文字 |
| `--hover` | `rgba(28,24,18,.05)` | 行 / 控件 hover 底 |

### 夜间 · 夜琉璃（深墨 + 微光玻璃）

| 令牌 | 值 | 角色 |
|------|-----|------|
| `--canvas` | `#090B10` | 页面底（叠深空微光） |
| `--surface` | `rgba(20,23,30,.92)` | 阅读面 / 大内容面板 |
| `--g-hi` / `--g-mid` / `--g-lo` | `rgba(66,74,92,.66)` / `rgba(26,30,40,.50)` / `rgba(14,16,22,.42)` | 玻璃填充渐变 |
| `--rim` | `rgba(255,255,255,.30)` | 玻璃上缘高光 |
| `--ring` | `rgba(255,255,255,.13)` | 发丝内环 |
| `--ring-d` | `rgba(0,0,0,.35)` | 下缘厚度暗部 |
| `--line` | `rgba(255,255,255,.10)` | 发丝分隔线 |
| `--ink` | `#EDEAE3` | 主文字（暖白） |
| `--ink-2` | `#A8A69D` | 次级文字 |
| `--ink-3` | `#75726A` | 三级 / 元信息 |
| `--accent` | `#63F0D8` | 唯一强调 |
| `--accent-ink` | `#04211E` | 强调色上的文字 |
| `--hover` | `rgba(255,255,255,.06)` | hover 底 |

### 语义色（双主题各自微调）
- success `#1F8A5B` / `#4ADE80` · warning `#B6791F` / `#F0C05A` · error `#C63B3B` / `#FF7A7A` · info 复用 `--accent`。

### 领域色（仅功能性圆点 / 节点 / 色点 / 书脊条）
六组低饱和、在两种玻璃上均可辨识：`#4C8DF5` `#24A98F` `#E1755A` `#9B7BE6` `#D9A441` `#D2659A`。
> 领域数量由知识数据决定；超出 6 个时按同一亮度/饱和度带扩展（`domain/N`），**仍只作点/线填充**。

**对比度护栏**：玻璃上任何文字，其有效对比度按「玻璃底色 × 合成后」计算，常规文本必须 ≥ 4.5:1。**禁止**在玻璃上用 `--ink-3` 作正文，只作元信息。

## 3. Typography Rules（四角色字体系统）

v6 用**四种声音**对应四种内容职责——这是「字体与排版问题」的正解：

| 角色 | 字体令牌 | 用于 | 说明 |
|------|---------|------|------|
| **Display** | `--font-serif` | 首页 Hero、页面主标题（H1）、文章题、品牌字 | **衬线**给"知识"以分量与记忆点；中文回退 `Noto Serif CJK SC / Songti SC` |
| **Text** | `--font-sans` | 导航、标签、按钮、列表、说明、Caption | Inter 为拉丁主字体（OFL，构建期内置）；中文回退系统黑体 |
| **Reading** | `--font-serif` | 知识点正文长文 | 与 Display 同族、降字号增行距（17 / 1.9）；**长文一律衬线** |
| **Mono** | `--font-mono` | 年份、统计、代码/公式、编号 | 数字强制 `font-variant-numeric: tabular-nums` |

- 层级：`Display 46/600/1.06` → `H1 32/600/1.18` → `H2 19/600/1.35`（无衬线小节题）→ `H3 15/600/1.45`；`Body 15/1.6`（无衬线）；`Reading 17/1.9`（衬线）；`Caption 12.5`。
- 标题 `letter-spacing` 收紧（-0.015 ~ -0.02em）；正文默认 `0`。
- **禁止**：同角色混用字族、斜体正文、< 12px 正文、彩色正文文字、标题字距装饰、字体图标。

## 4. Glass & Elevation（液态玻璃与层次）

### 玻璃分级（全站只此三级）

| 级别 | blur | 用途 | 填充令牌 |
|------|------|------|---------|
| `L1` | `14px` | 内联 chip、输入框、胶囊控件 | `--g-*` 三段渐变 |
| `L2` | `24px` | 顶栏、列表容器、卡片面板、导航 | `--g-*` |
| `L3` | `34px` | 遮罩浮层、抽屉、模态、底部表 | `--g-*` |

**同一视图内不得出现第 4 种模糊值**；模糊半径随层级上升，杜绝「到处一样糊」。

### 玻璃成品配方（厚玻璃 · 缺一即廉价）

「液态玻璃」= **渐变填充 + 背板模糊/提饱和 + 上缘高光 + 底部厚度 + 色散暗示 + 悬浮折射光泽**。六者齐备才「液态」。

```css
.glass {
  position: relative; border-radius: var(--radius); isolation: isolate;
  background: linear-gradient(176deg, var(--g-hi) 0%, var(--g-mid) 44%, var(--g-lo) 100%);
  backdrop-filter: blur(var(--blur)) saturate(200%) brightness(1.10);
  -webkit-backdrop-filter: blur(var(--blur)) saturate(200%) brightness(1.10);
  box-shadow:
    inset 0 1px 1px var(--rim),               /* ① 上缘高光（光边，代替 border） */
    inset 0 -14px 26px -20px var(--ring-d),   /* ② 底部厚度（厚玻璃的关键） */
    inset 0 0 0 1px var(--ring),              /* ③ 发丝级内环（半透明，非实描边） */
    inset -1px -1px 0 rgba(255,170,130,.05),  /* ④ 色散暗示（暖/冷各一线 = 真实玻璃边缘） */
    inset 1px 1px 0 rgba(130,200,255,.06),
    0 2px 4px rgba(0,0,0,.05),                /* ⑤ 接触阴影 */
    0 28px 64px -34px var(--shadow);          /* ⑥ 环境投影（极浅） */
}
.glass::before {   /* ⑦ 悬浮折射光泽：跟随光标的 specular（鼠标悬浮光效） */
  content:""; position:absolute; inset:0; border-radius:inherit; pointer-events:none; z-index:3;
  background: radial-gradient(240px 240px at var(--mx,26%) var(--my,-6%), rgba(255,255,255,.55), transparent 62%);
  opacity:0; transition:opacity .4s ease;
}
.glass:hover::before{ opacity:1; }
.glass::after {    /* ⑧ 静态边缘掠光（斜向高光带） */
  content:""; position:absolute; inset:0; border-radius:inherit; pointer-events:none; z-index:2;
  background: radial-gradient(140% 100% at 16% -18%, rgba(255,255,255,.55), transparent 52%);
  opacity:.5; mix-blend-mode:screen;
}
```

- **悬浮光效（硬性）**：所有玻璃面/阅读面必须**跟随光标**产生 specular 高光；页面另有一层极淡的全局「光标光」（`mix-blend-mode: soft-light`）。缺失即视为不合格。
- **光边代替描边**：控件与容器**不用** `border: 1px solid`；一律用 `inset` 光边（`--rim` / `--ring`）与面来表达边界（这是「边框廉价」的正解）。
- **读数**：阅读面 `--surface` 用同一套光边，但填充近不透明（≥ .90），保证长文清晰；**中文正文禁用首字下沉**（如 `::first-letter` 放大），只用于拉丁文。
- **背景光晕**：`--canvas` 之上叠 **3–4 团**低饱和 `radial-gradient`（日：蜜桃/薄荷/浅紫；夜：青/靛/梅）+ 极细噪点 + 顶部提亮径向渐变；**静态**，不随滚动或鼠标移动（星图页例外）。
- **动效**：只用于状态反馈、光标光与星图本身；入场一次性、缓动轻；尊重 `prefers-reduced-motion`（开启时全部静止）。

## 5. Shapes（圆角级差 · 同心圆角）

`chip 999px`（标签/筛选）· `control 10px`（按钮/输入/胶囊段）· `panel 16px`（卡片/分节容器）· `overlay 22px`（抽屉/模态/底部表）。
- **同一半径不得通用于所有层级**；输入 / 卡片 / 浮层必须可辨。
- **同心圆角**：内层圆角 = 外层圆角 − 内边距，避免"角的错位"（Liquid Glass 的关键细节）。

## 6. Layout Principles

- **全站唯一内容列**：`max-width: 1120px`，由 Shell `main` 统一设定；任何页面**不得**自设窄列或额外横向内边距。
- **阅读聚焦（iA 式）**：详情阅读面的正文与元信息收进**居中列**（`≤ 68ch`、内左对齐）、衬线 `17.5 / 1.95`；框架退后，文字上前。
- 间距基阶：`4 / 8 / 12 / 16 / 24 / 32 / 48 / 72`；区块之间用留白分层，需要时用 1px `--line` 发丝线（仅分隔内容）。
- **桌面 ≥ 1024px**：顶栏 `56px`（`L2` 玻璃，悬浮于画布之上，圆角 `panel`，左右留边）+ 主区（无侧栏）。**移动 < 1024px**：顶栏 + 主区 + `L2` 玻璃底部 Tab（`env(safe-area-inset-bottom)` 适配）。
- 首页：星图主视觉（自绘 SVG，可漫游）→ 等宽统计行 → 领域入口 → 单列知识流。装饰只此一处。

## 7. Component Stylings

- **按钮**：主 = `--accent` 实底 + `--accent-ink` 字，radius `control`；次 = 玻璃/透明面 + 光边。`hover` 提亮 `--hover`，`active` 缩放 0.98，聚焦显示 2px `--accent` 焦点环。触控目标 ≥ 44px。
- **图标按钮**：**默认无边框无底色**；hover 出现柔和面（`--hover`）；`aria-pressed` / 选中态用 `--accent` 染色，**不画方框**。
- **输入 / 搜索**：`L1` 玻璃 + 光边；聚焦时内环转 `--accent` 并加浅色环。
- **chip / 筛选**：pill（999px）玻璃（`L1`）；选中 = `--accent` 浅底 + 强调内环；领域 chip 可带领域色圆点（**点有色、文字无色**）。
- **分段控件 / 分页 / 视图切换**：**单条玻璃轨道（track）+ 内嵌选中"滑块"（thumb）**，滑块自带光边与浅投影；**禁止**每个选项各画一个方框（这是「分页边框廉价」的正解）。
- **面板 / 卡片**：`L2` 玻璃，radius `panel`，光边；**仅作可交互或成组容器**时使用；hover 只提亮玻璃，不上浮。
- **列表行**：容器内的留白分隔行（1px `--line` 或纯留白）；hover 只变 `--hover` 底，不动画位移。
- **导航**：顶栏/底部 Tab 为 `L2` 玻璃；当前项 = 加粗墨字 + `--accent` 指示条（顶栏为底边条，移动底部 Tab 为顶边条）。
- **图谱**：`L2` 玻璃画布 + **极淡点阵网格**（径向遮罩淡出）；边为**曲线**（依赖实线、相关虚线），节点 = 圆点，**尺寸 = 入度、填充 = 领域色/聚类档位**，节点带**上缘高光 + 底部投影 + 悬浮光环（halo）与标签浮出**；节点带 ≥ 14 单位透明热区（移动可点）；画布左下角图例，右侧 `L2` 玻璃详情栏（≥1024px）。
- **悬浮光效（硬性）**：任何玻璃面、阅读面、图谱节点在 hover 时必须有明确的光反馈（specular / halo / 提亮），但**不得**用位移或放大制造跳动（节点 halo 除外）。
- **图标**：全部来自自绘图标族；尺寸档 16 / 20 / 24px，线宽等比缩放到视觉 1.6px。

## 8. Depth & Elevation 之外：主题切换（单一入口）

- 主题令牌通过根节点 `[data-theme="day"|"night"]` 切换；默认跟随系统 `prefers-color-scheme`。
- **全站只有一个主题控件**：顶栏**一个**图标按钮 → 展开小面板（`L3`）三选一 `跟随系统 / 日间 / 夜间`，存本地档案（FEAT-009）。**禁止**在别处再放主题开关（含原型演示壳，见 §12）。
- 两主题共享**同一套结构**，只换令牌值；禁止为某一主题单独堆叠额外装饰。
- 首屏前内联注入主题，避免「先亮后暗」闪烁。

## 9. Do's and Don'ts

**Do**
- 玻璃只做「外壳」，阅读面永远更高不透明度、更高对比。
- 用**三级模糊阶梯 + 光边 + 底部厚度 + 色散暗示 + 悬浮折射光泽**表达层次；动效只做状态反馈、光标光与星图。
- 彩色只给功能性圆点 / 节点；文字层级只靠字重、字号、灰阶。
- 图标全部自绘，风格统一（线 + 节点）；控件用光边与面，不用实描边。
- 长文用衬线，界面用无衬线，数据用等宽；英文标题可首字下沉，**中文正文严禁**首字下沉。
- 一切玻璃面 / 节点都必须有 **hover 光反馈**。

**Don't**
- 紫粉万能渐变、赛博霓虹 glow、每节 fade-up 上浮、千篇一律「图标三列卡片」。
- 把正文压在低不透明玻璃上导致读不清；用低对比灰字充当正文。
- 给按钮 / 分页 / chip 画 `1px solid` 灰边（廉价感来源）；大圆角通用所有层级；堆叠重投影。
- 玻璃只做「静态毛玻璃」而无上缘高光/厚度/悬浮光泽（「不够液态」的来源）。
- 引入第三方图标库 / emoji 当界面图标；同角色混用字族；彩色正文文字；中文首字下沉。
- 假数据、假证言、未证实口号。

## 10. Responsive Behavior

- 断点：`640 / 1024`。图谱页 < 1024px 详情为 `L3` 玻璃底部抽屉（含安全区内边距），≥ 1024px 为右侧 `L2` 玻璃栏；画布拖拽/缩放一致。
- 阅读优先：移动端正文 `17px / 1.9` 不缩。
- 触控目标 ≥ 44px；顶栏 / 底栏 / 抽屉以 `env(safe-area-inset-*)` 适配刘海与手势条；Tauri 移动端与 Web 共用同一套响应式行为。
- `prefers-reduced-motion` 开启：星图静止、所有过渡降级为即时。

## 11. Agent Prompt Guide

```text
Follow project-root DESIGN.md tokens (Liuli Glass v6.1) and Do's/Don'ts.
Layout philosophy: iA Writer — quiet chrome, text-first, generous whitespace; ONE centered content column, reading measure <=68ch.
Two themes are first-class: implement day + night via [data-theme]; one single theme control only.
Glass = THICK liquid glass, 3 tiers (blur 14/24/34): gradient fill + blur(200% saturate) + top rim + bottom thickness + dispersion hint + hover specular that follows the cursor. No static "flat" frosted glass.
Never use `border: 1px solid` on controls/pagination/chips — use inset light edges and surfaces.
Reading surfaces use --surface (near-opaque, >=.90) for WCAG AA; long-form body is SERIF, UI is SANS, data is MONO.
No drop caps on Chinese text.
One accent color; domain colors only on dots/nodes; icons are self-drawn SVG (line + node).
Graph: curved edges, node halo + label on hover, faint dot grid, legend, side rail.
Build <page> for <audience>: one job above the fold, functions appear only when needed.
No purple-pink gradient, no neon glow, no per-section fade-up, no duplicated controls.
```

## 12. 功能唯一性铁律（Single Source of Presentation）

> v5 被否的直接原因之一是「部分功能重复（如日/夜模式切换）」。v6 以铁律杜绝：

1. **同一能力只有一个控件**：主题、搜索、导航等全局能力在全站各有且仅有**一个**主控件（可有多处**入口**，但入口只触发同一控件，不复制第二个控件状态）。
2. **同一信息只有一个"主呈现"**：某份实体内容（如领域趋势）只在**唯一的页面**作为主体展示；其它页面只提供**跳转入口**（如「查看该领域路线」），**不得**复制其内容卡片。
3. **演示壳不算产品**：原型演示壳（harness）属于开发脚手架，**必须**与产品 UI 视觉隔离（独立条带、等宽字、标注 `DEV`），且**不得**重复产品已具备的控件（如主题开关）。
