import type { KnowledgeBase } from './load'

export interface RoadmapStage {
  name: string
  description?: string
  points: KnowledgeBase['points']
}

export interface Roadmap {
  category: KnowledgeBase['categoryById'] extends Map<string, infer V> ? V : never
  categoryId: string
  stages: RoadmapStage[]
  /** 同领域内未编入路线的知识点（编辑补齐的提示面） */
  unassigned: KnowledgeBase['points']
  /** 展平后违反前置先于本点的清单（soft warning） */
  orderViolations: string[]
}

/** 知识库 + 领域 → 阶段化发展路线（基础→进阶→前沿）。 */
export function buildRoadmap(kb: KnowledgeBase, categoryId: string): Roadmap | null {
  const category = kb.categoryById.get(categoryId)
  const doc = kb.roadmap.find((r) => r.categoryId === categoryId)
  if (!category || !doc) return null

  const stages: RoadmapStage[] = doc.stages.map((s) => ({
    name: s.name,
    description: s.description,
    points: s.pointIds.map((id) => kb.pointById.get(id)!).filter(Boolean),
  }))

  const assigned = new Set(doc.stages.flatMap((s) => s.pointIds))
  const unassigned = kb.points
    .filter((p) => p.categoryId === categoryId && !assigned.has(p.id))
    .sort((a, b) => a.year - b.year)

  const flat = doc.stages.flatMap((s) => s.pointIds)
  const orderIndex = new Map(flat.map((id, i) => [id, i]))
  const orderViolations: string[] = []
  for (const id of flat) {
    const point = kb.pointById.get(id)
    if (!point) continue
    for (const pre of point.prerequisites) {
      const prePoint = kb.pointById.get(pre)
      if (!prePoint || prePoint.categoryId !== categoryId) continue
      const preIdx = orderIndex.get(pre)
      if (preIdx !== undefined && preIdx > orderIndex.get(id)!) {
        orderViolations.push(`「${prePoint.title}」应排在「${point.title}」之前`)
      }
    }
  }

  return { category, categoryId, stages, unassigned, orderViolations }
}
