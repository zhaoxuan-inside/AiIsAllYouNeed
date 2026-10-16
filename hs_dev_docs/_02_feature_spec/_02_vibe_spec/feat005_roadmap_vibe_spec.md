# VIBECODING EXECUTION SPEC — FEAT-005 领域发展路线
# Source PRD: .../features/feat005_roadmap_prd.md · Prototype: .../feat005_roadmap_prototype.md
# Macro Taste Charter: Inherits /DESIGN.md

meta: { feature_id: "FEAT-005", feature_name: "roadmap", route: "/roadmap", density: "balanced" }
design_tokens: { inherit: "/DESIGN.md" }

component_tree:
  - component: "RoadmapPage"
    children:
      - { component: "CategoryTabs", props: { maxItems: 8 } }
      - { component: "StageLane", props: { stages: ["基础","进阶","前沿"], order: "topological", numbered: true } }
      - { component: "TrendCard", props: { collapsible: true } }

state_machine:
  roadmap:
    initial: "LOADING"
    states:
      LOADING:   { on: { READY: "POPULATED", NO_ROUTE: "EMPTY", ERROR: "ERROR" } }
      POPULATED: { on: { SWITCH_CATEGORY: "LOADING", OPEN_POINT: "NAV_DETAIL" } }
      EMPTY:     { on: { GOTO_GRAPH: "NAV_GRAPH" } }
      ERROR:     { on: { RETRY: "LOADING" } }

field_constraints:
  - field: "stage"  type: "enum(基础|进阶|前沿)"; required: true
  - field: "order"  type: "topological"; invariant: "prerequisites appear before dependents"

executable_tests_gherkin:
  - id: "T005-01-STAGES"  # 三阶段 + 拓扑序
  - id: "T005-02-VALID"   # 前置在先；含环在构建期被拦截（校验测试）
  - id: "T005-03-DETAIL"  # 点节点进详情
  - id: "T005-04-TREND"   # 趋势与标注一致

hard_guardrails:
  - "STRICTLY FORBIDDEN: 同一路线内前置依赖排在被依赖者之后"
  - "STRICTLY FORBIDDEN: 运行时才发现依赖环（必须构建期拦截）"
