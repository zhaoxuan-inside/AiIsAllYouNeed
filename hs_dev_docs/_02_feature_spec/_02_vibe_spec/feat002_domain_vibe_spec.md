# VIBECODING EXECUTION SPEC — FEAT-002 领域浏览
# Source PRD: .../features/feat002_domain_prd.md · Prototype: .../feat002_domain_prototype.md
# Macro Taste Charter: Inherits /DESIGN.md

meta: { feature_id: "FEAT-002", feature_name: "domain", route: "/domain/:categoryId", density: "balanced", primary_anchor_cta: "在图谱中查看" }
design_tokens: { inherit: "/DESIGN.md" }

component_tree:
  - component: "DomainPage"
    children:
      - { component: "DomainHeader", props: { dotColor: true, summary: true, count: true } }
      - { component: "ViewLinks", props: { targets: ["graph","timeline","roadmap"], carryFilter: "categoryId" } }
      - { component: "KnowledgeList", props: { sort: ["importance","year"], rowState: ["read","fav"] } }
      - { component: "TrendSummary", props: { collapsible: true } }

state_machine:
  domain:
    initial: "LOADING"
    states:
      LOADING:   { on: { READY: "POPULATED", EMPTY: "EMPTY", INVALID_ID: "NOT_FOUND", ERROR: "ERROR" } }
      POPULATED: { on: { OPEN_POINT: "NAV_DETAIL", GOTO_VIEW: "NAV_VIEW_FILTERED" } }
      EMPTY:     { on: { GOTO_GRAPH: "NAV_GRAPH" } }
      NOT_FOUND: { on: { BACK_HOME: "NAV_HOME" } }
      ERROR:     { on: { RETRY: "LOADING" } }

field_constraints:
  - field: "categoryId"
    type: "string(enum in categories)"; required: true; on_invalid: "NOT_FOUND"

executable_tests_gherkin:
  - id: "T002-01-HAPPY"  # 有知识点 → 头/列表/三视图入口渲染
  - id: "T002-02-CARRY"  # 点三视图 → 目标页预置该领域筛选
  - id: "T002-03-404"    # 非法 categoryId → NOT_FOUND 空态

hard_guardrails:
  - "STRICTLY FORBIDDEN: 领域色作正文文字色"
  - "STRICTLY FORBIDDEN: 进入三视图时丢失领域筛选上下文"
