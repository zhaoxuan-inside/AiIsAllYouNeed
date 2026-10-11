# ADR — AiIsAllYouNeed v1 技术选型

> 阶段 1 产物 · 2026-10-11 · 状态：已接受

## 范式落盘（阶段 1 门禁）

| 维度 | 取值 |
|------|------|
| 产品规模 | 小（单人 v1） |
| 变更档 | L（首建） |
| 产品类型 | 内容展示站（知识浏览，无交易/复杂状态机） |
| 复杂度信号 | 客户端图可视化 + 客户端搜索；纯读数据；无后端事务；无实时 |
| 后端范式 | **无后端**（v1：数据打包进应用 + 构建期校验管线，B0 性质；v2 服务器化时另立 ADR） |
| 前端范式 | **F2 轻量 Feature 模块**（features/ 按视图分域 + 共享 domain 层） |
| 为何不升级 | 无多域规则密度 → 不上 DDD；无多团队/多端代码库 → 不上 F4/FSD；单体静态分发无微服务议题 |

## ADR-001 跨端框架：Tauri 2

**决定**：一套 React Web 代码 + Tauri 2 壳，覆盖 Windows/Linux/macOS（桌面）+ iOS/Android（移动）+ Web 直接访问，共 6 端。

**理由**：Tauri 2 是目前唯一用同一套 Web 代码同时产出桌面与移动安装包的开源框架；系统 WebView 带来最小包体。
**备选否决**：Electron（无 iOS/Android）；React Native / Flutter（无法与 Web 代码共享，图可视化生态弱于 Web）；仅 PWA（无原生分发与离线安装体验，作为 Web 端渐进能力保留）。
**风险**：移动端构建依赖 Xcode/Android SDK 工具链；v1 交付完整配置与文档，真机构建在各平台按需执行。

## ADR-002 前端栈：React 18 + TypeScript + Vite + Tailwind CSS v4 + Zustand + React Router

**理由**：TypeScript 全程类型化（数据 schema 即契约）；Vite 构建快且被 Tauri 官方模板支持；Tailwind 保证多端一致的设计令牌落地；Zustand（~1KB）管理档案/筛选等跨视图状态；React Router 路由成熟。
**备选否决**：Next.js/SSR（纯本地数据无 SEO/首屏服务端收益，徒增复杂度）；Vue/Svelte（生态与图库兼容性考量，团队熟悉度 React）。

## ADR-003 图可视化：d3-force + SVG 自绘

**理由**：知识全景图核心诉求是力导向依赖网络 + 领域着色 + 交互筛选；d3-force 只提供力学计算，渲染层用 SVG 自绘可获得完全的视觉控制（星图主题）、小包体、可测试性（力学布局为纯函数）。
**备选否决**：React Flow（节点卡片流程图形态，不适合百节点力导向全景）；Cytoscape.js / sigma.js（重，主题定制成本高）；Canvas（v1 规模 ~100 节点 SVG 性能足够且可访问、可用 CSS 主题）。

## ADR-004 搜索：自研 bigram 倒排索引

**决定**：`domain/search` 模块自研二元组（bigram）倒排索引，零运行时依赖。

**理由**：中文无空格分词，bigram 是轻量可靠的 CJK 方案；纯函数接口 `buildIndex(docs)` / `query(index, q)` 极易 TDD；数据量 ~100 条客户端毫秒级；避免 FlexSearch/Lunr 的 CJK 黑盒配置与英文中心偏差。

## ADR-005 数据：knowledge/ JSON + Zod schema + 构建期校验

**决定**：知识数据独立于应用代码存放 `knowledge/`（Git 更新入口）；Zod schema 定义契约（含 `schemaVersion`）；构建脚本校验引用完整性（依赖/领域/论文 ID 必须存在）；校验通过后打包进应用。

**理由**：数据与代码分离匹配「Git 仓库更新知识」愿景；schema 前向兼容 v2 服务器化；引用完整性校验把坏数据挡在构建期。
