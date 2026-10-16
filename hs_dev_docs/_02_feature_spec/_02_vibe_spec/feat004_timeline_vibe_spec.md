# VIBECODING EXECUTION SPEC — FEAT-004 编年时间线
# Source PRD: .../features/feat004_timeline_prd.md · Prototype: .../feat004_timeline_prototype.md
# Macro Taste Charter: Inherits /DESIGN.md

meta: { feature_id: "FEAT-004", feature_name: "timeline", route: "/timeline", density: "balanced" }
design_tokens: { inherit: "/DESIGN.md" }

component_tree:
  - component: "TimelinePage"
    children:
      - { component: "CategoryChips", props: { multi: true, dotColor: true } }
      - { component: "EraAnchor", props: { collapsible: true } }
      - { component: "YearAxis", props: { orientation: "vertical", order: "asc" } }
      - { component: "PointEvent", props: { fields: ["year","title","dot","summary"] } }

state_machine:
  timeline:
    initial: "LOADING"
    states:
      LOADING:   { on: { READY: "POPULATED", EMPTY: "EMPTY_FILTER", ERROR: "ERROR" } }
      POPULATED: { on: { FILTER_CHANGE: "REFILTER", TOGGLE_ERA: "POPULATED", OPEN_POINT: "NAV_DETAIL" } }
      REFILTER:  { on: { HAS_RESULT: "POPULATED", NONE: "EMPTY_FILTER" } }
      EMPTY_FILTER: { on: { RESET: "REFILTER" } }
      ERROR:     { on: { RETRY: "LOADING" } }

field_constraints:
  - field: "point.year"  type: "integer(1943..current)"; required: true
  - field: "filters.categories" type: "string[]"; default: []

executable_tests_gherkin:
  - id: "T004-01-ORDER"   # 年份升序
  - id: "T004-02-FILTER"  # 领域筛选 + 年份轴压缩无空白
  - id: "T004-03-ERA"     # 时代锚点折叠/定位
  - id: "T004-04-DETAIL"  # 点事件进详情

hard_guardrails:
  - "STRICTLY FORBIDDEN: 筛选后时间轴保留空年份大段留白"
  - "STRICTLY FORBIDDEN: 领域色作正文文字色"
