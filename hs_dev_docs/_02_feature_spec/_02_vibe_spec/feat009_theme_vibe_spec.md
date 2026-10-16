# VIBECODING EXECUTION SPEC — FEAT-009 主题与阅读偏好
# Source PRD: .../features/feat009_theme_prd.md · Prototype: .../feat009_theme_prototype.md
# Macro Taste Charter: Inherits /DESIGN.md (§2 色表 / §4 主题切换)

meta: { feature_id: "FEAT-009", feature_name: "theme", route: "global", density: "balanced" }
design_tokens:
  inherit: "/DESIGN.md"
  themes: { day: "[data-theme=day]", night: "[data-theme=night]", default: "system(prefers-color-scheme)" }

component_tree:
  - component: "ThemeToggle"
    props: { icon: "custom-svg", menu: ["system","day","night"], persist: "profile-store" }
  - component: "ThemeProvider"
    props: { apply: "root [data-theme]", inline_bootstrap: true, prevent_flash: true }

state_machine:
  theme:
    initial: "SYSTEM"
    states:
      SYSTEM: { on: { OS_CHANGE: "SYSTEM", SET_DAY: "DAY", SET_NIGHT: "NIGHT" } }
      DAY:    { on: { SET_NIGHT: "NIGHT", SET_SYSTEM: "SYSTEM" } }
      NIGHT:  { on: { SET_DAY: "DAY", SET_SYSTEM: "SYSTEM" } }

field_constraints:
  - field: "theme"  type: "enum(system|day|night)"; default: "system"
  - field: "contrast" invariant: "text vs glass >= 4.5:1"

executable_tests_gherkin:
  - id: "T009-01-SYSTEM"  # 未设置 → 跟随系统
  - id: "T009-02-PERSIST" # 手动切换 → 刷新保留
  - id: "T009-03-FLASH"   # 首屏无主题闪变（内联注入）
  - id: "T009-04-CONTRAST"# 两主题 ≥4.5:1

hard_guardrails:
  - "STRICTLY FORBIDDEN: 首屏先亮后暗闪烁"
  - "STRICTLY FORBIDDEN: 任一主题正文对比度 < 4.5:1"
  - "STRICTLY FORBIDDEN: 为某主题额外堆叠装饰"
