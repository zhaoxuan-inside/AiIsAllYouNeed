import type { KnowledgeBase, KnowledgePoint } from './load'

export interface TimelineEntry {
  year: number
  points: KnowledgePoint[]
}

export interface TimelineOptions {
  categoryIds?: string[]
}

/** 知识库 → 按年份升序的时间线；同年内重要性降序、标题次序稳定。 */
export function buildTimeline(kb: KnowledgeBase, options: TimelineOptions = {}): TimelineEntry[] {
  const filter = options.categoryIds ? new Set(options.categoryIds) : null
  const points = kb.points.filter((p) => !filter || filter.has(p.categoryId))
  const byYear = new Map<number, KnowledgePoint[]>()
  for (const p of points) {
    const list = byYear.get(p.year) ?? []
    list.push(p)
    byYear.set(p.year, list)
  }
  return [...byYear.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([year, pts]) => ({
      year,
      points: pts.sort((a, b) => b.importance - a.importance || a.title.localeCompare(b.title, 'zh')),
    }))
}
