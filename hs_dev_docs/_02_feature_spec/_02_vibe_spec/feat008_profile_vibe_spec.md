# VIBECODING EXECUTION SPEC — FEAT-008 本地档案
# Source PRD: .../features/feat008_profile_prd.md · Prototype: .../feat008_profile_prototype.md
# Macro Taste Charter: Inherits /DESIGN.md

meta: { feature_id: "FEAT-008", feature_name: "profile", route: "/profile", density: "balanced", primary_anchor_cta: "建立本地档案" }
design_tokens: { inherit: "/DESIGN.md" }

component_tree:
  - component: "ProfilePage"
    children:
      - { component: "ProfileHeader", props: { avatarColor: true, nicknameEditable: true, privacyNote: "数据仅存本机" } }
      - { component: "ProfileTabs", props: { tabs: ["favorites","progress","notes"] } }
      - { component: "EntryList", props: { clickToDetail: true, emptyCta: "去图谱探索" } }
  - component: "CreateProfileSheet"
    props: { nickname: "1..20", colors: "preset[]", skippable: true }

state_machine:
  profile:
    initial: "UNKNOWN"
    states:
      UNKNOWN:   { on: { LOADED_HAS: "HAS_PROFILE", LOADED_NONE: "NO_PROFILE", STORAGE_DENIED: "MEMORY_ONLY" } }
      NO_PROFILE:{ on: { FAVORITE: "CREATE_SHEET", SKIP: "DEFAULT_PROFILE" } }
      CREATE_SHEET: { on: { SAVE: "HAS_PROFILE", CANCEL: "DEFAULT_PROFILE" } }
      DEFAULT_PROFILE: { on: { ANY: "HAS_PROFILE" } }
      HAS_PROFILE: { on: { EDIT_NICK: "HAS_PROFILE", FAVORITE: "HAS_PROFILE", NOTE: "HAS_PROFILE" } }
      MEMORY_ONLY: { note: "会话内存态，重启丢失；给出提示" }

field_constraints:
  - field: "nickname"  type: "string"; min: 1; max: 20
  - field: "avatarColor" type: "enum(preset palette)"
  - field: "note"      type: "string"; max: 2000
  - field: "storage"   type: "localStorage|indexedDB"; fallback: "memory"

executable_tests_gherkin:
  - id: "T008-01-CREATE"  # 首次收藏 → 建档浮层，可跳过落默认
  - id: "T008-02-PERSIST" # 收藏/已读/笔记刷新后保留
  - id: "T008-03-EMPTY"   # 空态引导
  - id: "T008-04-NONET"   # 无外部网络请求（隐私）

hard_guardrails:
  - "STRICTLY FORBIDDEN: 强制注册才能使用收藏/笔记"
  - "STRICTLY FORBIDDEN: 将用户数据上传网络"
  - "STRICTLY FORBIDDEN: 存储不可用时静默失败（须降级+提示）"
