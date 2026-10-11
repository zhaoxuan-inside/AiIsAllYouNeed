import {
  RawKnowledgeSchema,
  type Category,
  type KnowledgePoint,
  type Paper,
  type RoadmapDoc,
  type Trend,
} from './schema'

// 领域类型统一从 load.ts 出口（对调用方为单一入口）
export type { Category, Paper, KnowledgePoint, RoadmapDoc, Trend, RawKnowledge } from './schema'

export class KnowledgeValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'KnowledgeValidationError'
  }
}

export interface KnowledgeBase {
  schemaVersion: number
  categories: Category[]
  papers: Paper[]
  points: KnowledgePoint[]
  trends: Trend[]
  roadmap: RoadmapDoc[]
  categoryById: Map<string, Category>
  paperById: Map<string, Paper>
  pointById: Map<string, KnowledgePoint>
  trendByCategory: Map<string, Trend>
}

function fail(message: string): never {
  throw new KnowledgeValidationError(message)
}

function checkDuplicates<T extends { id: string }>(items: T[], label: string): Set<string> {
  const seen = new Set<string>()
  for (const item of items) {
    if (seen.has(item.id)) fail(`${label} id 重复：${item.id}`)
    seen.add(item.id)
  }
  return seen
}

/** 前置依赖图 DFS 找环（路径栈重建环序列） */
function findPrerequisiteCycle(points: KnowledgePoint[]): string[] | null {
  const WHITE = 0
  const GRAY = 1
  const BLACK = 2
  const color = new Map<string, number>()
  const byId = new Map(points.map((p) => [p.id, p]))
  const stack: string[] = []

  const visit = (id: string): string[] | null => {
    color.set(id, GRAY)
    stack.push(id)
    const point = byId.get(id)
    if (point) {
      for (const pre of point.prerequisites) {
        if (!byId.has(pre)) continue
        const state = color.get(pre) ?? WHITE
        if (state === GRAY) {
          return [...stack.slice(stack.indexOf(pre)), pre]
        }
        if (state === WHITE) {
          const found = visit(pre)
          if (found) return found
        }
      }
    }
    stack.pop()
    color.set(id, BLACK)
    return null
  }

  for (const p of points) {
    if ((color.get(p.id) ?? WHITE) === WHITE) {
      const found = visit(p.id)
      if (found) return found
    }
  }
  return null
}

/**
 * 深模块入口：原始知识数据 → 已校验知识库。
 * 校验失败抛 KnowledgeValidationError（schema / 重复 / 引用完整性 / 依赖环）。
 */
export function loadKnowledge(raw: unknown): KnowledgeBase {
  const parsed = RawKnowledgeSchema.safeParse(raw)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    const path = issue.path.join('.')
    fail(`数据不符合 schema：${path || '(root)'} — ${issue.message}`)
  }
  const data = parsed.data

  checkDuplicates(data.categories, '领域')
  checkDuplicates(data.papers, '论文')
  checkDuplicates(data.points, '知识点')
  const trendCategoryIds = new Set<string>()
  for (const t of data.trends) {
    if (trendCategoryIds.has(t.categoryId)) fail(`领域趋势重复：${t.categoryId}`)
    trendCategoryIds.add(t.categoryId)
  }
  const roadmapCategoryIds = new Set<string>()
  for (const r of data.roadmap) {
    if (roadmapCategoryIds.has(r.categoryId)) fail(`领域路线重复：${r.categoryId}`)
    roadmapCategoryIds.add(r.categoryId)
  }

  const categoryIds = new Set(data.categories.map((c) => c.id))
  const paperIds = new Set(data.papers.map((p) => p.id))
  const pointIds = new Set(data.points.map((p) => p.id))

  for (const point of data.points) {
    if (!categoryIds.has(point.categoryId)) fail(`知识点 ${point.id} 引用了不存在的领域：${point.categoryId}`)
    for (const pid of point.paperIds) {
      if (!paperIds.has(pid)) fail(`知识点 ${point.id} 引用了不存在的论文：${pid}`)
    }
    for (const pre of point.prerequisites) {
      if (!pointIds.has(pre)) fail(`知识点 ${point.id} 的前置依赖不存在：${pre}`)
      if (pre === point.id) fail(`知识点 ${point.id} 依赖自身`)
    }
    for (const rel of point.related) {
      if (!pointIds.has(rel)) fail(`知识点 ${point.id} 的相关知识点不存在：${rel}`)
    }
  }

  for (const trend of data.trends) {
    if (!categoryIds.has(trend.categoryId)) fail(`领域趋势引用了不存在的领域：${trend.categoryId}`)
    for (const d of trend.directions) {
      for (const pid of d.relatedPointIds) {
        if (!pointIds.has(pid)) fail(`领域趋势 ${trend.categoryId} 引用了不存在的知识点：${pid}`)
      }
    }
  }

  for (const doc of data.roadmap) {
    if (!categoryIds.has(doc.categoryId)) fail(`领域路线引用了不存在的领域：${doc.categoryId}`)
    const seenInRoadmap = new Set<string>()
    for (const stage of doc.stages) {
      for (const pid of stage.pointIds) {
        if (!pointIds.has(pid)) fail(`领域路线 ${doc.categoryId} 引用了不存在的知识点：${pid}`)
        const pt = data.points.find((p) => p.id === pid)!
        if (pt.categoryId !== doc.categoryId) {
          fail(`领域路线 ${doc.categoryId} 引用了其他领域（${pt.categoryId}）的知识点：${pid}`)
        }
        if (seenInRoadmap.has(pid)) fail(`领域路线 ${doc.categoryId} 中知识点重复出现：${pid}`)
        seenInRoadmap.add(pid)
      }
    }
  }

  const cycle = findPrerequisiteCycle(data.points)
  if (cycle) fail(`前置依赖成环：${cycle.join(' → ')}`)

  const categoryById = new Map(data.categories.map((c) => [c.id, c]))
  const paperById = new Map(data.papers.map((p) => [p.id, p]))
  const pointById = new Map(data.points.map((p) => [p.id, p]))
  const trendByCategory = new Map(data.trends.map((t) => [t.categoryId, t]))

  return { ...data, categoryById, paperById, pointById, trendByCategory }
}
