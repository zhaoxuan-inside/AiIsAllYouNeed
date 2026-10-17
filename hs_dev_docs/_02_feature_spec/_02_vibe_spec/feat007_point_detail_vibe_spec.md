# VIBECODING EXECUTION SPEC — FEAT-007 知识点详情与交叉链接
# Source PRD: .../features/feat007_point_detail_prd.md · Prototype: .../feat007_point_detail_prototype.md
# Macro Taste Charter: Inherits /DESIGN.md

meta: { feature_id: "FEAT-007", feature_name: "point_detail", route: "/point/:pointId", density: "balanced", primary_anchor_cta: "收藏" }
design_tokens:
  inherit: "/DESIGN.md"
  overrides: { reading_surface: "--surface (>=0.86 alpha)", reading_font: "serif", reading_measure: "<=66ch", reading_line_height: 1.9 }

component_tree:
  - component: "PointDetailPage"
    children:
      - { component: "PointHeader", props: { aliases: true, meta: ["category","year","importance","difficulty","learnTime","tags"] } }
      - { component: "SummaryLead", props: { links: true } }
      - { component: "BodyMarkdown", props: { container: "surface", wikiLinks: true, math: true, media: true } }
      - { component: "PapersList", props: { collapsible: true, externalLink: true } }
      - { component: "MiniDependencyGraph", props: { prereq: true, derivatives: true, clickable: true } }
      - { component: "RelatedChips", props: { clickable: true } }
      - { component: "Backlinks", props: { sources: ["wikiLink","structured"] } }
      - { component: "TrendNote" }
      - { component: "LocalActionBar", props: { actions: ["fav","read","note"], float: true, touch: ">=44px" } }

state_machine:
  detail:
    initial: "LOADING"
    states:
      LOADING:   { on: { READY: "READING", MISSING: "EMPTY_BODY", NOT_FOUND: "NOT_FOUND", ERROR: "ERROR" } }
      READING:   { on: { FOLLOW_WIKILINK: "LOADING", TOGGLE_FAV: "READING", TOGGLE_READ: "READING", EDIT_NOTE: "NOTE" } }
      NOTE:      { on: { SAVE: "READING", CANCEL: "READING" } }
      EMPTY_BODY:{ on: { GOTO_GRAPH: "NAV_GRAPH" } }
      NOT_FOUND: { on: { BACK_HOME: "NAV_HOME" } }
      ERROR:     { on: { RETRY: "LOADING" } }

field_constraints:
  - field: "body"      type: "markdown"; wiki_links: "[[title]] -> resolve; dangling -> plain text + warn"
  - field: "media[]"   type: "{type:image|video|formula, ref}"; lazy: true
  - field: "note"      type: "string"; max: 2000
  - field: "tags[]"    type: "string[]"; clickable: true

executable_tests_gherkin:
  - id: "T007-01-RENDER"   # 字段齐全 → 各区块渲染
  - id: "T007-02-WIKILINK" # [[B]] → 跳 B，B 反向链接含 A
  - id: "T007-03-STRUCT"   # 标签/依赖/相关/论文跳转正确
  - id: "T007-04-BACKLINK" # 反向链接完整
  - id: "T007-05-LOCAL"    # 收藏/已读/笔记持久化
  - id: "T007-06-DEGRADE"  # 缺字段不渲染空区块

hard_guardrails:
  - "STRICTLY FORBIDDEN: 正文压在低不透明玻璃上（必须 --surface）"
  - "STRICTLY FORBIDDEN: 悬空 WikiLink 产生死链"
  - "STRICTLY FORBIDDEN: 缺字段渲染『暂无』空占位导致破版"
  - "STRICTLY FORBIDDEN: 阅读行宽 > 66ch 或行高 < 1.8"
