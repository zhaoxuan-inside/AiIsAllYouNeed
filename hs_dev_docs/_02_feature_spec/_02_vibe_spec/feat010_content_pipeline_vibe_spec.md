# VIBECODING EXECUTION SPEC — FEAT-010 知识内容生产管线
# Source PRD: .../features/feat010_content_pipeline_prd.md · Prototype: .../feat010_content_pipeline_prototype.md
# Macro Taste Charter: Inherits /DESIGN.md

meta: { feature_id: "FEAT-010", feature_name: "content_pipeline", route: "build-time", density: "compact" }
design_tokens: { inherit: "/DESIGN.md" }

component_tree:
  - component: "ContentPipeline"
    children:
      - { component: "TitleListLoader", props: { input: "titles+category", validates: ["unique-title","known-category"] } }
      - { component: "ContentGenerator", props: { sources: "traceable", forbid: ["fabricated-doi","false-link"] } }
      - { component: "ContractValidator", props: { checks: ["schema","id-unique","ref-integrity","dependency-cycle","roadmap-order","wikilink"] } }
      - { component: "Compiler", props: { output: "knowledge repo", versionField: "schemaVersion" } }
  - component: "KnowledgeSource"   # 运行时数据访问 seam
    adapters: ["BuildTimeJSON (MVP)", "ServerFetch (预留)", "InAppAI (预留)"]

state_machine:
  pipeline:
    initial: "NO_TITLES"
    states:
      NO_TITLES: { on: { PROVIDE_TITLES: "GENERATE" } }
      GENERATE:  { on: { DONE: "VALIDATE", FAIL: "FAILED" } }
      VALIDATE:  { on: { PASS: "COMPILE", FAIL: "FAILED" } }
      COMPILE:   { on: { DONE: "READY" } }
      FAILED:    { on: { FIX: "GENERATE" }, note: "输出精确失败清单(条目/字段/原因/环路径)" }
      READY:     { note: "打包进应用" }

field_constraints:
  - field: "title"       type: "string"; unique: true; required: true
  - field: "category"    type: "enum(categories)"; required: true
  - field: "prerequisites[]" type: "id[]"; each must exist; acyclic
  - field: "papers[]"    type: "paper-ref[]"; each must exist or be marked unverified
  - field: "wikiLinks"   invariant: "resolve to existing point or degrade+warn"
  - field: "schemaVersion" required: true

executable_tests_gherkin:
  - id: "T010-01-GEN"      # 仅凭标题生成完整内容
  - id: "T010-02-SCHEMA"   # 非法 schema 被拦截
  - id: "T010-03-REF"      # 悬空引用被拦截
  - id: "T010-04-CYCLE"    # 依赖环被拦截并给路径
  - id: "T010-05-SEAM"     # 应用经 KnowledgeSource 读取，不直接绑文件
  - id: "T010-06-BLOCK"    # 任一失败阻断打包

hard_guardrails:
  - "STRICTLY FORBIDDEN: 编造论文 DOI/链接/作者"
  - "STRICTLY FORBIDDEN: 坏数据（schema/悬空引用/依赖环）进入打包产物"
  - "STRICTLY FORBIDDEN: 应用层直接 import 具体 JSON 文件（必须经 seam）"
