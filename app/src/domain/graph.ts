import type { KnowledgeBase } from './load'

export interface GraphNode {
  id: string
  title: string
  categoryId: string
  importance: number
  /** 入度 = 被多少个知识点依赖（作为前置）——节点尺寸的依据 */
  inDegree: number
  year: number
}

export interface GraphEdge {
  from: string
  to: string
  kind: 'prerequisite' | 'related'
  fromCategory: string
  toCategory: string
}

export interface KnowledgeGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface GraphOptions {
  categoryIds?: string[]
}

/** 知识库 → 力导向图数据。依赖边方向：前置 → 本点；相关边去重为一条。 */
export function buildGraph(kb: KnowledgeBase, options: GraphOptions = {}): KnowledgeGraph {
  const filter = options.categoryIds ? new Set(options.categoryIds) : null
  const inDegree = new Map<string, number>()
  for (const p of kb.points) {
    for (const pre of p.prerequisites) {
      inDegree.set(pre, (inDegree.get(pre) ?? 0) + 1)
    }
  }
  const nodes = kb.points
    .filter((p) => !filter || filter.has(p.categoryId))
    .map((p) => ({
      id: p.id,
      title: p.title,
      categoryId: p.categoryId,
      importance: p.importance,
      inDegree: inDegree.get(p.id) ?? 0,
      year: p.year,
    }))
  const nodeIds = new Set(nodes.map((n) => n.id))

  const edges: GraphEdge[] = []
  const seenRelated = new Set<string>()
  for (const point of kb.points) {
    if (!nodeIds.has(point.id)) continue
    for (const pre of point.prerequisites) {
      if (!nodeIds.has(pre)) continue
      edges.push({
        from: pre,
        to: point.id,
        kind: 'prerequisite',
        fromCategory: kb.pointById.get(pre)!.categoryId,
        toCategory: point.categoryId,
      })
    }
    for (const rel of point.related) {
      if (!nodeIds.has(rel)) continue
      const key = [point.id, rel].sort().join('~')
      if (seenRelated.has(key)) continue
      seenRelated.add(key)
      edges.push({
        from: point.id,
        to: rel,
        kind: 'related',
        fromCategory: point.categoryId,
        toCategory: kb.pointById.get(rel)!.categoryId,
      })
    }
  }
  return { nodes, edges }
}
