# 模块契约设计：接口 / 方法 / 状态与失败语义（阶段 3 · DETAIL-02/03/04）

- **输入基线**：`data_schema.md`（数据契约）、`arch_design_overview.md` §5/§6
- **验收状态**：SUBMITTED
- **关联**：前端 Feature 模块 + 构建期管线；类型为 TypeScript 接口（非 HTTP API；运行时代码零网络）

> 本文定义**模块间接口**、**关键方法行为**（前置/后置/不变量/边界/副作用）与**状态/失败语义**；跨文档映射见 `mapping_matrix.md`。

## 1. 核心接口

### 1.1 KnowledgeRepo（data）
```ts
interface KnowledgeRepo {
  getPoint(id: string): KnowledgePoint | null;          // 不存在返回 null（路由降级）
  getDomains(): Domain[];                                // 按 order 排序
  getPointsByDomain(key: string): KnowledgePoint[];
  getTimeline(): KnowledgePoint[];                       // 按 year 升序（时间线）
  getRoadmap(domainKey: string): Roadmap | null;
  getRelated(id: string): KnowledgePoint[];              // related ∪ 反解 backlinks 的去重并集
  getBacklinks(id: string): KnowledgePoint[];            // 由 index 预计算
  searchSuggestion(): string[];                          // 冷启动推荐词
}
```

### 1.2 SearchIndex（search）
```ts
interface SearchIndex {
  build(points: KnowledgePoint[]): void;      // bigram 倒排（构建期预生成索引 JSON，运行时可跳过 build）
  search(q: string, opts?): SearchHit[];      // 交集检索 + 高亮段
}
interface SearchHit { id: string; title: string; snippet: string; highlights: Array<[number, number]>; }
```
行为：查询 <100ms（已实测 ≤0.03ms）；命中按 title 前缀 > 摘要相关 > 年份降序。

### 1.3 ProfileStore（profile，本机唯一写方）
```ts
interface ProfileStore {
  get(): Profile;
  update(patch: Partial<Profile>): void;      // 写后广播
  subscribe(cb: (p: Profile) => void): () => void;
}
interface Profile { nickname: string; avatarColor: string; favorites: string[];
  readStates: Record<string, number>; notes: Record<string, string>; themeMode: 'system'|'day'|'night'; }
```

### 1.4 KnowledgeSource（content 构建期 · 可插拔）
```ts
interface KnowledgeSource {
  id: string;                                  // 如 'opencode-llm' | 'static-fixture'
  generate(titles: TitleItem[]): Promise<GeneratedPoint[]>;
}
interface TitleItem { title: string; domain?: string; aliases?: string[]; year?: number; }
```
行为：管线对每个标题调用源生成 → zod 校验（`data_schema.md` §3）→ 校验失败**阻断构建**；产出 `points/domains/roadmap/search-index.json`。源可替换（FEAT-010 预留）。

### 1.5 ThemeProvider（app_shell）
```ts
interface ThemeProvider { apply(mode: Profile['themeMode']): void; }  // [data-theme] + 首屏内联防闪烁
```
唯一控件：顶栏台灯图标 → 三选一浮层（跟随/日/夜）。

## 2. 关键方法行为（前置 / 后置 / 不变量 / 边界 / 副作用）

| 方法 | 前置 | 后置/不变量 | 边界与副作用 |
|------|------|-------------|--------------|
| `getPoint(id)` | id 为 slug | 返回点或 null | 不抛错；null 由路由 404/回首页 |
| `SearchIndex.search(q)` | 索引已构建 | 返回命中；query 空格/全角归一化 | 空串返回 `[]`；<100ms；无副作用 |
| `ProfileStore.update(patch)` | store 已初始化 | 广播新值；写失败回退内存 | 存储配额满 → 内存态 + 一次性提示（不静默丢数据） |
| `ProfileStore` 首次建档 | 未建档 | 弹出轻量建档浮层（昵称+色），可跳过用默认 | 数据不出本机 |
| 图谱聚焦节点 | 节点 id 有效 | 邻域高亮 + 详情栏联动 + 透镜 | 未命中 → 重置视图 + 引导 |
| 主题切换 | 唯一控件 | 写 themeMode → apply | 系统模式跟随 `prefers-color-scheme` 变化 |

## 3. 状态与失败语义（页面四态）

| 场景 | 状态/表现 |
|------|-----------|
| 数据缺失字段（详情） | **降级**：对应区块不渲染（如无论文则不显示「关键论文」），不出现空框 |
| 搜索无结果 | 空态 + 推荐词（可点击直接检索） |
| 路由 pointId 不存在 | 404 视图 + 「返回星图」入口 |
| 图谱筛选后为空 | 引导文案 + 「重置」 |
| 档案存储写入失败 | 内存态继续 + 一次性提示（数据不出本机，不静默） |
| 主题首屏 | 内联引导脚本（首帧前注入，无「先亮后暗」） |
| 内容构建校验失败 | **阻断构建**（fail-fast），输出违规清单；绝不产出坏数据 |
| 加载数据损坏（前端二次校验） | 「数据损坏」空态，禁用跳转，不崩溃 |

## 4. 权限 / 归属 / 安全（对齐阶段 0 反目标）

- 无账号、无服务器、无运行时网络请求（CSP 禁连外部）；唯一可写 = 本机档案。
- 知识数据来自 Git 静态仓库 + 构建期生成，引用完整性由管线强制（`data_schema.md` D4）。
