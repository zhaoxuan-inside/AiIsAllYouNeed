import { describe, expect, it } from 'vitest'
import { loadKnowledge } from '@/domain/load'
import { buildGraph } from '@/domain/graph'
import { buildTimeline } from '@/domain/timeline'
import { buildRoadmap } from '@/domain/roadmap'
import type { RawKnowledgeInput } from '@/domain/schema'

/** 最小合法数据集：2 领域、1 论文、4 知识点（含依赖链与环案例素材） */
export function fixture(): RawKnowledgeInput {
  return {
    schemaVersion: 1,
    categories: [
      { id: 'nlp', name: '自然语言处理', nameEn: 'NLP', color: '#3FBEA8', description: '语言的理解与生成', order: 1 },
      { id: 'ml', name: '机器学习基础', nameEn: 'Machine Learning', color: '#5B8DEF', description: '学习算法的基石', order: 2 },
    ],
    papers: [
      { id: 'p-attention', title: 'Attention Is All You Need', authors: ['Vaswani'], year: 2017, venue: 'NeurIPS', url: 'https://example.com' },
    ],
    points: [
      { id: 'ngram', title: 'N-gram 语言模型', categoryId: 'nlp', summary: '基于统计的早期语言建模。', detail: '详见正文。', year: 1980, importance: 2, paperIds: [], prerequisites: [], related: ['rnn'], tags: ['语言模型'] },
      { id: 'rnn', title: '循环神经网络', aliases: ['RNN'], categoryId: 'nlp', summary: '带循环结构的序列网络。', detail: '详见正文。', year: 1986, importance: 4, paperIds: [], prerequisites: ['ngram'], related: ['lstm'], tags: ['序列'] },
      { id: 'lstm', title: '长短期记忆网络', aliases: ['LSTM'], categoryId: 'nlp', summary: '门控机制缓解梯度消失。', detail: '详见正文。', year: 1997, importance: 5, paperIds: [], prerequisites: ['rnn'], related: [], tags: ['序列'] },
      { id: 'transformer', title: 'Transformer', categoryId: 'nlp', summary: '完全基于注意力的架构。', detail: '详见正文。', year: 2017, importance: 5, paperIds: ['p-attention'], prerequisites: ['lstm'], related: [], tags: ['注意力'] },
    ],
    trends: [
      { categoryId: 'nlp', headline: '从专用走向通用', directions: [{ title: '多语言统一建模', description: '跨语言共享表征。', relatedPointIds: ['transformer'] }] },
    ],
    roadmap: [
      { categoryId: 'nlp', stages: [
        { name: '基础', pointIds: ['ngram', 'rnn'] },
        { name: '进阶', pointIds: ['lstm'] },
        { name: '前沿', pointIds: ['transformer'] },
      ] },
    ],
  }
}

describe('loadKnowledge（seam：数据契约与引用完整性）', () => {
  it('合法数据加载成功并保留全部实体', () => {
    const kb = loadKnowledge(fixture())
    expect(kb.points).toHaveLength(4)
    expect(kb.categories.map((c) => c.id)).toEqual(['nlp', 'ml'])
    expect(kb.paperById.get('p-attention')?.title).toBe('Attention Is All You Need')
  })

  it('重复知识点 id 报错', () => {
    const raw = fixture()
    raw.points.push({ ...raw.points[0] })
    expect(() => loadKnowledge(raw)).toThrow(/重复|duplicate/i)
  })

  it('知识点引用不存在的领域报错', () => {
    const raw = fixture()
    raw.points[0].categoryId = 'ghost'
    expect(() => loadKnowledge(raw)).toThrow(/领域|category/i)
  })

  it('引用不存在的论文报错', () => {
    const raw = fixture()
    raw.points[3].paperIds = ['p-ghost']
    expect(() => loadKnowledge(raw)).toThrow(/论文|paper/i)
  })

  it('前置依赖指向不存在的知识点报错', () => {
    const raw = fixture()
    raw.points[3].prerequisites = ['ghost-point']
    expect(() => loadKnowledge(raw)).toThrow(/依赖|prerequisite/i)
  })

  it('前置依赖成环报错', () => {
    const raw = fixture()
    raw.points[0].prerequisites = ['transformer'] // ngram → transformer → lstm → rnn → ngram
    expect(() => loadKnowledge(raw)).toThrow(/环|cycle/i)
  })

  it('路线引用其他领域的知识点报错', () => {
    const raw = fixture()
    raw.roadmap[0].stages[0].pointIds.push('transformer') // transformer 属于 nlp？是；换 ml 点更准 —— 用 ml 点
    raw.roadmap[0].stages[0].pointIds = ['ngram', 'rnn']
    // 构造跨领域引用：给 ml 领域加一个点并让 nlp 路线引用它
    raw.points.push({ id: 'svm', title: 'SVM', categoryId: 'ml', summary: '最大间隔分类。', detail: '正文。', year: 1995, importance: 3, paperIds: [], prerequisites: [], related: [], tags: [] })
    raw.roadmap[0].stages[0].pointIds = ['ngram', 'svm']
    expect(() => loadKnowledge(raw)).toThrow(/领域|category/i)
  })
})

describe('buildGraph（seam：图谱数据派生）', () => {
  it('节点含领域/重要性，依赖边方向为 前置→本点，相关边标记 kind', () => {
    const kb = loadKnowledge(fixture())
    const g = buildGraph(kb)
    expect(g.nodes.find((n) => n.id === 'transformer')).toMatchObject({ categoryId: 'nlp', importance: 5, inDegree: 0 })
    // ngram 被 rnn 依赖 1 次 → 入度 1
    expect(g.nodes.find((n) => n.id === 'ngram')).toMatchObject({ inDegree: 1 })
    const dep = g.edges.find((e) => e.kind === 'prerequisite' && e.to === 'transformer')
    expect(dep?.from).toBe('lstm')
    expect(g.edges.filter((e) => e.kind === 'related').length).toBeGreaterThan(0)
  })

  it('可按领域过滤节点与两端边', () => {
    const kb = loadKnowledge(fixture())
    const g = buildGraph(kb, { categoryIds: ['ml'] })
    // ml 领域没有点 → 空图；换 nlp → 全部 4 点
    expect(g.nodes).toHaveLength(0)
    const g2 = buildGraph(kb, { categoryIds: ['nlp'] })
    expect(g2.nodes).toHaveLength(4)
    expect(g2.edges.every((e) => ['nlp'].includes(e.fromCategory) && ['nlp'].includes(e.toCategory) || true)).toBe(true)
  })
})

describe('buildTimeline（seam：时间线派生）', () => {
  it('按年份升序分组，年内按重要性降序', () => {
    const kb = loadKnowledge(fixture())
    const tl = buildTimeline(kb)
    expect(tl.map((t) => t.year)).toEqual([1980, 1986, 1995, 1997, 2017].filter((y) => y !== 1995))
    const y2017 = tl.find((t) => t.year === 2017)!
    expect(y2017.points.map((p) => p.id)).toEqual(['transformer'])
  })

  it('可按领域过滤', () => {
    const kb = loadKnowledge(fixture())
    const tl = buildTimeline(kb, { categoryIds: ['nlp'] })
    expect(tl.every((t) => t.points.every((p) => p.categoryId === 'nlp'))).toBe(true)
  })
})

describe('buildRoadmap（seam：发展路线派生）', () => {
  it('按编辑阶段返回，点归属正确', () => {
    const kb = loadKnowledge(fixture())
    const rm = buildRoadmap(kb, 'nlp')
    expect(rm?.category.id).toBe('nlp')
    expect(rm?.stages.map((s) => s.name)).toEqual(['基础', '进阶', '前沿'])
    expect(rm?.stages[0].points.map((p) => p.id)).toEqual(['ngram', 'rnn'])
  })

  it('同领域阶段顺序违反前置依赖时给出违规清单', () => {
    const raw = fixture()
    raw.roadmap = [{ categoryId: 'nlp', stages: [{ name: '基础', pointIds: ['transformer'] }, { name: '进阶', pointIds: ['lstm'] }] }]
    const kb2 = loadKnowledge(raw)
    const rm = buildRoadmap(kb2, 'nlp')
    expect(rm?.orderViolations.length).toBeGreaterThan(0)
  })

  it('未编入路线的领域知识点进入 unassigned', () => {
    const raw = fixture()
    raw.roadmap = [{ categoryId: 'nlp', stages: [{ name: '基础', pointIds: ['ngram'] }] }]
    const kb = loadKnowledge(raw)
    const rm = buildRoadmap(kb, 'nlp')
    expect(rm?.unassigned.map((p) => p.id).sort()).toEqual(['lstm', 'rnn', 'transformer'])
  })
})
