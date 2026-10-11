import { describe, expect, it } from 'vitest'
import { loadKnowledge } from '@/domain/load'
import { autolinkKnowledge, getPointDetailView } from '@/backend/knowledge-service'
import { buildGraph } from '@/domain/graph'
import { buildTimeline } from '@/domain/timeline'
import { buildRoadmap } from '@/domain/roadmap'
import { buildIndex, query } from '@/domain/search'
import { rawKnowledge } from '@/data/source'

/**
 * 集成回归：真实种子数据必须通过完整领域校验与派生管线。
 * 数据更新（Git 提交）后跑本测试即知道内容区是否健康。
 */
const kb = loadKnowledge(rawKnowledge)

describe('种子知识数据（集成）', () => {
  it('通过完整校验且规模符合 PRD（≈100 知识点 / 6 领域）', () => {
    expect(kb.schemaVersion).toBe(1)
    expect(kb.categories).toHaveLength(6)
    expect(kb.points.length).toBeGreaterThanOrEqual(90)
    expect(kb.points.length).toBeLessThanOrEqual(120)
    expect(kb.trends).toHaveLength(6)
    expect(kb.roadmap).toHaveLength(6)
  })

  it('每个知识点内容完整（解读 ≥40 字，摘要 ≥10 字）', () => {
    for (const p of kb.points) {
      expect(p.detail.length, `${p.id} detail 过短`).toBeGreaterThanOrEqual(40)
      expect(p.summary.length, `${p.id} summary 过短`).toBeGreaterThanOrEqual(10)
      expect(p.tags.length, `${p.id} 缺少标签`).toBeGreaterThan(0)
    }
  })

  it('每个领域都有路线与趋势，路线覆盖全部知识点', () => {
    for (const category of kb.categories) {
      const roadmap = buildRoadmap(kb, category.id)
      expect(roadmap, `${category.id} 无路线`).not.toBeNull()
      expect(roadmap!.orderViolations, `${category.id} 路线顺序违反依赖：${roadmap!.orderViolations.join('；')}`).toEqual([])
      expect(roadmap!.unassigned, `${category.id} 有未编入路线的知识点：${roadmap!.unassigned.map((p) => p.id).join(', ')}`).toEqual([])
      expect(kb.trendByCategory.has(category.id), `${category.id} 无趋势`).toBe(true)
    }
  })

  it('图谱连通可用：节点数等于知识点数，依赖边 ≥ 60', () => {
    const graph = buildGraph(kb)
    expect(graph.nodes).toHaveLength(kb.points.length)
    const depEdges = graph.edges.filter((e) => e.kind === 'prerequisite')
    expect(depEdges.length).toBeGreaterThanOrEqual(60)
  })

  it('时间线覆盖 1650-2026，每格非空', () => {
    const timeline = buildTimeline(kb)
    expect(timeline[0]!.year).toBeLessThanOrEqual(1700)
    expect(timeline.at(-1)!.year).toBeGreaterThanOrEqual(2020)
    for (const entry of timeline) expect(entry.points.length).toBeGreaterThan(0)
  })

  it('PointDetailView：应用（反向依赖）正确解析', () => {
    const detail = getPointDetailView('transformer')!
    const ids = detail.appliedBy.map((p) => p.id)
    expect(ids).toContain('bert')
    expect(ids).toContain('gpt-1')
    expect(ids).toContain('vision-transformer')
  })

  it('autolinkKnowledge：正文中的知识点标题转为站内链接', () => {
    const linked = autolinkKnowledge('Transformer 依赖注意力机制，RNN 是它的前身。', 'attention')
    expect(linked).toContain('[注意力机制](#/point/attention-mechanism)')
    expect(linked).toContain('[RNN](#/point/rnn)')
    const protectedText = autolinkKnowledge('`transformer` 与 [注意力](#/point/x) 不应被改写。')
    expect(protectedText).toContain('`transformer`')
    expect(protectedText).toContain('[注意力](#/point/x)')
  })

  it('搜索能命中核心知识点（中文与英文别名）', () => {
    const docs = kb.points.map((p) => ({
      id: p.id,
      title: p.title,
      aliases: p.aliases,
      subtitle: p.summary,
      text: p.detail,
      keywords: p.tags,
    }))
    const index = buildIndex(docs)
    for (const q of ['注意力', 'Transformer', '梯度下降', '强化学习', '扩散模型']) {
      const hits = query(index, q)
      expect(hits.length, `查询「${q}」无结果`).toBeGreaterThan(0)
    }
  })
})
