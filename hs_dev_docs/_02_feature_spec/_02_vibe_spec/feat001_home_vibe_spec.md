# VIBECODING EXECUTION SPEC — FEAT-001 首页全景
# Source PRD: _02_feature_spec/_01_human_prd/features/feat001_home_prd.md
# Source Prototype: _02_feature_spec/_04_prototype_wireframe/feat001_home_prototype.md
# Macro Taste Charter: Inherits /DESIGN.md (Aurora Glass · 日/夜双主题)
# 读写约定：高信息密度、可直接映射代码与测试。

meta:
  feature_id: "FEAT-001"
  feature_name: "home"
  inherits_design_md: "/DESIGN.md"
  density: "balanced"
  max_container_width: "1120px"
  primary_anchor_cta: "打开搜索(⌘K)"
  route: "/"

design_tokens:
  inherit: "/DESIGN.md"
  css_variables:
    --canvas: "var(--canvas)"          # 日 #E9EDF4 / 夜 #0A0D13
    --glass: "var(--glass)"
    --glass-strong: "var(--glass-strong)"
    --ink: "var(--ink)"; --ink-2: "var(--ink-2)"; --ink-3: "var(--ink-3)"
    --accent: "var(--accent)"          # 首屏强调 ≤3 处
  tailwind_shorthands:
    glass_panel: "rounded-[18px] border border-[var(--glass-border)] bg-[var(--glass)] backdrop-blur-[20px]"
    stat_line: "font-mono tabular-nums text-[var(--ink-3)] text-[12.5px]"
    domain_row: "flex items-center gap-3 h-11 hover:bg-[var(--hover)] rounded-[12px] px-2"

component_tree:
  - component: "HomePage"
    layout: "mx-auto max-w-[1120px] px-4 pb-24"
    children:
      - { component: "ConstellationHero", props: { interactive: true, reduceMotion: "media" } }
      - { component: "StatsLine", props: { metrics: ["points","categories","papers","yearSpan"], mono: true } }
      - { component: "DomainList", props: { maxItems: 8, dotOnlyColor: true } }
      - { component: "KnowledgeFlow", props: { tabs: ["latest","top"], pageSize: 6 } }

state_machine:
  home:
    initial: "LOADING"
    states:
      LOADING:   { on: { DATA_READY: "POPULATED", DATA_EMPTY: "EMPTY", DATA_ERROR: "ERROR" } }
      POPULATED: { on: { TAB_LATEST: "POPULATED", TAB_TOP: "POPULATED", OPEN_SEARCH: "SEARCH_OVERLAY" } }
      EMPTY:     { on: { GOTO_GRAPH: "NAVIGATE_GRAPH", OPEN_SEARCH: "SEARCH_OVERLAY" } }
      ERROR:     { on: { RETRY: "LOADING" } }

field_constraints:
  - field: "stats.counts"      # 展示层只消费聚合结果，不自行统计
    type: "integer >= 0"; default: 0; display_fallback: "—"
  - field: "flow.tab"
    type: "enum(latest|top)"; default: "latest"

executable_tests_gherkin:
  - id: "T001-01-HAPPY"   # Given 数据就绪 When 打开首页 Then 统计/领域/知识流渲染，2 次点击可到详情
  - id: "T001-02-EMPTY"   # Given 数据为空 When 渲染 Then 隐藏星图，展示去图谱/搜索入口
  - id: "T001-03-RM"      # Given prefers-reduced-motion When 打开 Then 星图静止，可点击
  - id: "T001-04-A11Y"    # Given 键盘 When Tab/Enter Then 领域与知识流可达，触控 ≥44px

hard_guardrails:
  - "STRICTLY FORBIDDEN: 首屏强调色 > 3 处"
  - "STRICTLY FORBIDDEN: 领域色用作正文文字色（仅圆点/节点）"
  - "STRICTLY FORBIDDEN: 首页做成双列卡片仪表盘"
  - "STRICTLY FORBIDDEN: 星图随鼠标/滚动运动或每节入场动画"
