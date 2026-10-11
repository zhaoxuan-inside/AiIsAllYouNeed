# 原型 — AiIsAllYouNeed v1（Mermaid 线框）

> 覆盖屏：首页 / 知识图谱 / 时间线 / 发展路线 / 领域页 / 知识点详情 / 搜索 / 本地档案。
> 非目标：登录注册屏（本地档案即用即建）、云端同步状态。
> 用例交叉引用：PRD §4 S1–S8。

## 1. 主路径

```mermaid
flowchart LR
  Home[首页] -->|领域入口| Domain[领域页]
  Home -->|导航| Graph[知识图谱]
  Home -->|导航| Timeline[时间线]
  Home -->|导航| Roadmap[发展路线]
  Graph -->|点节点| Detail[知识点详情]
  Timeline -->|点事件| Detail
  Roadmap -->|点节点| Detail
  Domain -->|点知识点| Detail
  Search[全局搜索] -->|选结果| Detail
  Detail -->|收藏/笔记| Profile[本地档案]
```

## 2. 全局框架（六端响应式）

```mermaid
flowchart TB
  subgraph Shell["应用框架（桌面：顶栏+侧栏+主区 / 移动：顶栏+主区+底部标签）"]
    TopBar["顶栏：Logo『AI知识星图』 | 全局搜索框 | 档案头像"]
    SideNav["侧栏（桌面）/ 底部Tab（移动）：首页 · 图谱 · 时间线 · 路线 · 档案"]
    Main["主内容区（路由出口）"]
    TopBar --> Main
    SideNav --> Main
  end
```

## 3. 首页（S1）

```mermaid
flowchart TB
  subgraph ScreenHome["首页"]
    Hero["主视觉：标题 + 一句话定位 + 快速搜索"]
    Stats["统计条：知识点数 · 领域数 · 论文引用数 · 年份跨度"]
    Domains["领域卡片×6：图标+名称+知识点数（主题色）"]
    Recent["两列：最新收录知识点 | 高影响力知识点（Top5）"]
    Hero --> Stats --> Domains --> Recent
  end
```

## 4. 知识图谱（S2）

```mermaid
flowchart TB
  subgraph ScreenGraph["知识图谱页"]
    FilterBar["筛选栏：领域多选 chips + 边类型切换（依赖/相关）"]
    GraphCanvas["力导向图画布：节点=知识点（领域着色，大小=重要性）｜边=依赖(实线箭头)/相关(虚线)"]
    SidePanel["右侧详情侧栏（点节点滑出）：名称/定义/重要性/→查看完整详情"]
    Legend["图例：领域颜色 + 边类型"]
    FilterBar --> GraphCanvas --> SidePanel
    GraphCanvas --> Legend
  end
```

## 5. 时间线（S3）

```mermaid
flowchart TB
  subgraph ScreenTimeline["时间线页"]
    TFilter["领域筛选 + 时代分段锚点（1943萌芽→2006深度学习→2017 Transformer→2022大模型）"]
    TBody["纵向时间轴：年份节点 + 知识点卡片（领域色点 + 名称 + 一句话）"]
    TFilter --> TBody
  end
```

## 6. 发展路线（S4）

```mermaid
flowchart TB
  subgraph ScreenRoadmap["发展路线页"]
    RTabs["领域 Tab 切换（6 领域）"]
    RStages["阶段泳道：基础→进阶→前沿；每阶段知识点链（依赖顺序编号），节点可点"]
    RTrend["领域趋势卡：该领域发展方向（编辑趋势标注 A3）"]
    RTabs --> RStages --> RTrend
  end
```

## 7. 知识点详情（S6）

```mermaid
flowchart TB
  subgraph ScreenDetail["知识点详情页"]
    DHead["标题 + 别名 + 领域徽章 + 年份 + 重要性星 + 收藏按钮"]
    DBody["一句话定义（大字）→ 详细解读（Markdown）→ 关键论文列表（英文原题+链接）"]
    DDep["依赖关系小图：前置依赖 ← 本知识点 → 衍生发展（迷你图谱）"]
    DRel["相关知识点 chips + 发展趋势标注卡"]
    DHead --> DBody --> DDep --> DRel
  end
```

## 8. 本地档案（S7）

```mermaid
flowchart TB
  subgraph ScreenProfile["本地档案页"]
    PHead["档案头：头像色块 + 昵称（可改）+『数据仅存本地』提示"]
    PTabs["Tab：我的收藏 | 阅读进度 | 我的笔记"]
    PList["对应列表（空态引导去图谱/时间线探索）"]
    PHead --> PTabs --> PList
  end
```

## 9. 异常态

| 态 | 入口/表现 |
|----|-----------|
| 搜索无结果 | 搜索下拉显示『未找到，试试：Transformer / 注意力机制』推荐词 |
| 图谱数据为空（筛选后） | 画布中央空态文案 + 重置筛选按钮 |
| 档案未创建 | 点收藏时弹出轻量建档浮层（昵称+选色），可跳过（收藏仍存本地默认档案） |
| 移动端图谱 | 画布支持拖拽/缩放，详情侧栏改为底部抽屉 |
