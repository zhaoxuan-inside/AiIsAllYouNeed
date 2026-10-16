# VIBECODING EXECUTION SPEC — FEAT-011 六端分发
# Source PRD: .../features/feat011_distribution_prd.md · Prototype: .../feat011_distribution_prototype.md
# Macro Taste Charter: Inherits /DESIGN.md (§10 响应式)

meta: { feature_id: "FEAT-011", feature_name: "distribution", route: "platform-shell", density: "balanced" }
design_tokens: { inherit: "/DESIGN.md" }

component_tree:
  - component: "AppShell"
    props: { breakpoints: [640,1024], themes: ["day","night"], safeArea: "env(safe-area-inset-*)" }
    children:
      - { component: "TopBar", props: { desktop: "56px", mobile: "48px", glass: true } }
      - { component: "MainColumn", props: { maxWidth: "1120px" } }
      - { component: "MobileTabBar", props: { items: 5, glass: true, safeArea: true } }
  - component: "TauriShell"
    targets: ["windows","linux","macos","ios","android"]

state_machine:
  shell:
    initial: "BOOT"
    states:
      BOOT: { on: { WEB: "WEB_READY", TAURI: "NATIVE_READY" } }
      WEB_READY: { on: { RESIZE: "WEB_READY" } }
      NATIVE_READY: { on: { RESIZE: "NATIVE_READY" } }

field_constraints:
  - field: "breakpoint"  type: "enum(<=640|641..1023|>=1024)"
  - field: "touchTarget" invariant: ">=44px"
  - field: "offline"     invariant: "data embedded; full browse without network"

executable_tests_gherkin:
  - id: "T011-01-WEB"     # 构建 dist 可离线打开
  - id: "T011-02-CONFIG"  # 六端构建配置齐备
  - id: "T011-03-CONSIST" # 跨端体验与主题一致
  - id: "T011-04-SAFE"    # 安全区与触控
  - id: "T011-05-OFFLINE" # 断网可用

hard_guardrails:
  - "STRICTLY FORBIDDEN: 为不同端写两套界面代码"
  - "STRICTLY FORBIDDEN: 移动端底部 Tab 被手势条遮挡"
  - "STRICTLY FORBIDDEN: 离线时功能受限（数据须内嵌）"
