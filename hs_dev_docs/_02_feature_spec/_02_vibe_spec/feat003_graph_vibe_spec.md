# VIBECODING EXECUTION SPEC — FEAT-003 知识图谱
# Source PRD: .../features/feat003_graph_prd.md · Prototype: .../feat003_graph_prototype.md
# Macro Taste Charter: Inherits /DESIGN.md

meta: { feature_id: "FEAT-003", feature_name: "graph", route: "/graph", density: "compact", primary_anchor_cta: "查看完整详情" }
design_tokens: { inherit: "/DESIGN.md" }

component_tree:
  - component: "GraphPage"
    children:
      - { component: "GraphFilterBar", props: { categories: "multi-chip", edgeToggle: ["prereq","related"] } }
      - { component: "GraphCanvas", props: { render: "svg", nodeSize: "indegree", nodeFill: "kmeansCluster(5)", hitArea: ">=14u" } }
      - { component: "NodeInspector", props: { responsive: ">=1024 right-rail | <1024 bottom-sheet", cta: "查看完整详情" } }

state_machine:
  graph:
    initial: "LOADING"
    states:
      LOADING:     { on: { READY: "POPULATED", EMPTY: "EMPTY_FILTER", ERROR: "ERROR" } }
      POPULATED:   { on: { SELECT_NODE: "INSPECT", FILTER_CHANGE: "RELAYOUT", HOVER_NODE: "FOCUS_NEIGHBORHOOD" } }
      FOCUS_NEIGHBORHOOD: { on: { BLUR: "POPULATED" } }
      INSPECT:     { on: { CLOSE: "POPULATED", OPEN_DETAIL: "NAV_DETAIL" } }
      EMPTY_FILTER:{ on: { RESET_FILTER: "RELAYOUT" } }
      RELAYOUT:    { on: { DONE: "POPULATED", NONE: "EMPTY_FILTER" } }
      ERROR:       { on: { RETRY: "LOADING" } }

field_constraints:
  - field: "filters.categories"  type: "string[]"; default: []
  - field: "filters.edges"       type: "enum[,] (prereq|related)"; default: ["prereq","related"]
  - field: "layout"              type: "deterministic(seed)"; note: "同输入同结果，可测试"

executable_tests_gherkin:
  - id: "T003-01-STRUCT"   # 节点数/边数与数据一致；依赖/相关可区分
  - id: "T003-02-FILTER"   # 选领域 chip → 画布更新
  - id: "T003-03-INSPECT"  # 点节点 → 抽屉/底部表，可跳详情
  - id: "T003-04-EMPTY"    # 筛选无结果 → 空态+重置
  - id: "T003-05-DETERM"   # 相同输入布局确定（seed）

hard_guardrails:
  - "STRICTLY FORBIDDEN: 领域色作正文文字色（仅 chip/徽章圆点）"
  - "STRICTLY FORBIDDEN: 非确定性布局（不可测）"
  - "STRICTLY FORBIDDEN: 概览渲染箭头导致视觉噪声"
  - "STRICTLY FORBIDDEN: prefers-reduced-motion 下仍在跑力学动画"
