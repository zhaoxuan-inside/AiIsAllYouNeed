# VIBECODING EXECUTION SPEC — FEAT-006 全局中文搜索
# Source PRD: .../features/feat006_search_prd.md · Prototype: .../feat006_search_prototype.md
# Macro Taste Charter: Inherits /DESIGN.md

meta: { feature_id: "FEAT-006", feature_name: "search", route: "overlay(global)", density: "compact", primary_anchor_cta: "打开" }
design_tokens: { inherit: "/DESIGN.md" }

component_tree:
  - component: "SearchOverlay"
    props: { shortcut: "cmd+k", debounceMs: 120, overlay: "blur28" }
    children:
      - { component: "SearchInput", props: { autofocus: true, placeholder: "输入以搜索…" } }
      - { component: "HitList", props: { highlight: true, item: ["title","dot","summary"] } }
      - { component: "Suggestions", props: { emptyQuery: ["Transformer","注意力机制"], recent: "local" } }

state_machine:
  search:
    initial: "CLOSED"
    states:
      CLOSED:      { on: { OPEN: "OPEN_EMPTY" } }
      OPEN_EMPTY:  { on: { INPUT: "PENDING", ESC: "CLOSED" } }
      PENDING:     { on: { RESULT: "RESULTS", NONE: "NO_RESULT", ESC: "CLOSED" } }
      RESULTS:     { on: { SELECT: "NAV_DETAIL", INPUT: "PENDING", ESC: "CLOSED" } }
      NO_RESULT:   { on: { INPUT: "PENDING", ESC: "CLOSED" } }

field_constraints:
  - field: "query"  type: "string"; max: 100; normalize: "casefold(EN) + bigram(CJK)"
  - field: "latency" invariant: "query < 100ms"

executable_tests_gherkin:
  - id: "T006-01-HIT"     # 中文/别名/标签命中 + 高亮
  - id: "T006-02-KEYS"    # ↑↓/Enter/Esc
  - id: "T006-03-EMPTY"   # 空查询 → 推荐词
  - id: "T006-04-NONE"    # 无结果 → 提示 + 推荐
  - id: "T006-05-PERF"    # < 100ms 断言

hard_guardrails:
  - "STRICTLY FORBIDDEN: 搜索阻塞主线程 > 100ms"
  - "STRICTLY FORBIDDEN: 引入重型第三方全文库（自研 bigram）"
