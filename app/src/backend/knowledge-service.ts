/**
 * 知识服务 —— 应用后端的核心模块（深模块）：
 * 小接口（下方导出函数）背后藏起：数据加载、Zod 校验、缓存、
 * 图谱/时间线/路线派生、搜索索引构建与查询、视图模型装配。
 *
 * 展示层只允许通过本文件访问知识数据；domain/* 与 data/* 是内部实现。
 * v2 服务器化：本文件的实现换成 HTTP 拉取 + 服务端检索，签名不变。
 */
import type {
  Category,
  DomainView,
  GraphView,
  HomeView,
  PointDetailView,
  PointSummaryView,
  RoadmapView,
  SearchHitView,
  TimelineView,
  TrendView,
} from './types'
import { loadKnowledgeSource } from '@/data/source'
import { buildGraph } from '@/domain/graph'
import { buildTimeline } from '@/domain/timeline'
import { buildRoadmap } from '@/domain/roadmap'
import { buildIndex, query, snippet, type SearchDoc } from '@/domain/search'

let kbCache: ReturnType<typeof loadKnowledgeSource> | null = null
let graphCache: ReturnType<typeof buildGraph> | null = null
let timelineCache: ReturnType<typeof buildTimeline> | null = null
let searchIndexCache: ReturnType<typeof buildIndex> | null = null

function kb() {
  if (!kbCache) kbCache = loadKnowledgeSource()
  return kbCache
}

// ---- 基础查询 ----

export function getCategories(): Category[] {
  return kb().categories
}

export function getCategoryById(id: string): Category | undefined {
  return kb().categoryById.get(id)
}

// ---- 视图模型装配 ----

export function getHomeView(): HomeView {
  const base = kb()
  const years = base.points.map((p) => p.year).sort((a, b) => a - b)
  const latest = [...base.points]
    .sort((a, b) => b.year - a.year)
    .slice(0, 6)
    .map((point) => ({ point, category: base.categoryById.get(point.categoryId)! }))
  const top = [...base.points]
    .sort((a, b) => b.importance - a.importance || b.year - a.year)
    .slice(0, 6)
    .map((point) => ({ point, category: base.categoryById.get(point.categoryId)! }))
  return {
    stats: {
      points: base.points.length,
      categories: base.categories.length,
      papers: base.papers.length,
      yearSpan: `${years[0]}–${years.at(-1)}`,
    },
    domainRows: base.categories.map((category) => ({
      category,
      count: base.points.filter((p) => p.categoryId === category.id).length,
    })),
    latest,
    top,
  }
}

export function getGraphView(categoryIds?: string[]): GraphView {
  const base = kb()
  const graph =
    !categoryIds || categoryIds.length === 0
      ? (graphCache ??= buildGraph(base))
      : buildGraph(base, { categoryIds })
  return { categories: base.categories, graph }
}

export function getTimelineView(categoryIds?: string[]): TimelineView {
  const base = kb()
  const entries =
    !categoryIds || categoryIds.length === 0
      ? (timelineCache ??= buildTimeline(base))
      : buildTimeline(base, { categoryIds })
  return { categories: base.categories, entries }
}

export function getRoadmapView(categoryId: string): RoadmapView | null {
  const base = kb()
  const roadmap = buildRoadmap(base, categoryId)
  if (!roadmap) return null
  return { categories: base.categories, roadmap, trend: getTrendView(categoryId) }
}

export function getDomainView(categoryId: string): DomainView | null {
  const base = kb()
  const category = base.categoryById.get(categoryId)
  const roadmap = buildRoadmap(base, categoryId)
  if (!category || !roadmap) return null
  return {
    category,
    points: base.points.filter((p) => p.categoryId === categoryId).sort((a, b) => a.year - b.year),
    trend: getTrendView(categoryId),
    roadmap,
  }
}

export function getPointDetailView(id: string): PointDetailView | null {
  const base = kb()
  const point = base.pointById.get(id)
  if (!point) return null
  const derived = base.points
    .filter((p) => p.prerequisites.includes(id) || p.related.includes(id))
    .slice(0, 8)
  return {
    point,
    category: base.categoryById.get(point.categoryId)!,
    trend: getTrendView(point.categoryId),
    papers: point.paperIds.map((pid) => base.paperById.get(pid)!).filter(Boolean),
    prerequisites: point.prerequisites.map((pid) => base.pointById.get(pid)!).filter(Boolean),
    appliedBy: base.points.filter((p) => p.prerequisites.includes(id)),
    relatedPoints: point.related.map((pid) => base.pointById.get(pid)!).filter(Boolean),
    derived,
  }
}

export function getPointSummary(id: string): PointSummaryView | null {
  const base = kb()
  const point = base.pointById.get(id)
  if (!point) return null
  const relatedCount =
    point.related.length + base.points.filter((p) => p.prerequisites.includes(id)).length
  return {
    point,
    category: base.categoryById.get(point.categoryId)!,
    prerequisiteCount: point.prerequisites.length,
    relatedCount,
  }
}

// ---- 搜索 ----

export function searchKnowledge(q: string, limit = 8): SearchHitView[] {
  const base = kb()
  searchIndexCache ??= buildIndex(
    base.points.map((p) => ({
      id: p.id,
      title: p.title,
      aliases: p.aliases,
      subtitle: p.summary,
      text: p.detail,
      keywords: p.tags,
    })) satisfies SearchDoc[],
  )
  return query(searchIndexCache, q, limit).map((hit) => {
    const point = base.pointById.get(hit.id)!
    const category = base.categoryById.get(point.categoryId)!
    return {
      id: point.id,
      title: point.title,
      year: point.year,
      summary: point.summary,
      categoryName: category.name,
      categoryColor: category.color,
      snippet: snippet(point.summary, q, 10),
    }
  })
}

// ---- 正文自动关联 ----

let wikiTerms: { term: string; id: string }[] | null = null

/**
 * 正文自动关联：把文本中出现的其他知识点标题/别名替换为站内链接（Markdown 形态）。
 * 规则：跳过代码段与已有链接；每个词条最多链接一次；单篇最多 8 个链接，避免过度关联。
 * 实现：对未保护片段做「单趟正则交替」替换——生成物不会被再次扫描，
 * 因此重复别名（同一 term 挂多个点时取先注册者）或互为子串的词条不会产生嵌套损坏。
 */
export function autolinkKnowledge(text: string, excludeId?: string): string {
  const base = kb()
  if (!wikiTerms) {
    const byTerm = new Map<string, string>()
    for (const p of base.points) {
      for (const term of [p.title, ...p.aliases]) {
        if (term.length >= 2 && !byTerm.has(term)) byTerm.set(term, p.id)
      }
    }
    wikiTerms = [...byTerm.entries()]
      .map(([term, id]) => ({ term, id }))
      .sort((a, b) => b.term.length - a.term.length)
  }
  const PROTECTED = /(`[^`]*`|\[[^\]]*\]\([^)]*\))/g
  const idByTerm = new Map(wikiTerms.map((t) => [t.term, t.id]))
  const termPattern = new RegExp(
    `${wikiTerms.map((t) => t.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')}`,
    'g',
  )
  let linkBudget = 8
  return text
    .split(PROTECTED)
    .map((part) => {
      if (part.startsWith('`') || part.startsWith('[')) return part
      return part.replace(termPattern, (match) => {
        const id = idByTerm.get(match)
        if (!id || id === excludeId || linkBudget <= 0) return match
        linkBudget -= 1
        return `[${match}](#/point/${id})`
      })
    })
    .join('')
}

// ---- 内部：趋势视图装配 ----

function getTrendView(categoryId: string): TrendView | null {
  const base = kb()
  const trend = base.trendByCategory.get(categoryId)
  if (!trend) return null
  return {
    headline: trend.headline,
    directions: trend.directions.map((d) => ({
      title: d.title,
      description: d.description,
      related: d.relatedPointIds.map((pid) => base.pointById.get(pid)!).filter(Boolean),
    })),
  }
}
