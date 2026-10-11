import { describe, expect, it } from 'vitest'
import { buildIndex, query, snippet } from '@/domain/search'

const docs = [
  { id: 'transformer', title: 'Transformer', aliases: ['变换器'], subtitle: '注意力架构', text: '完全基于自注意力机制的序列建模架构，抛弃了循环结构。', keywords: ['注意力', 'attention'] },
  { id: 'lstm', title: '长短期记忆网络', aliases: ['LSTM'], subtitle: '', text: '通过门控机制缓解循环神经网络的梯度消失问题。', keywords: ['门控'] },
  { id: 'cnn', title: '卷积神经网络', aliases: ['CNN'], subtitle: '视觉基石', text: '利用卷积核提取空间局部特征的神经网络。', keywords: ['视觉'] },
]

describe('buildIndex + query（seam：中文检索）', () => {
  const index = buildIndex(docs)

  it('中文标题命中并按相关度排序', () => {
    const hits = query(index, '卷积神经')
    expect(hits[0]?.id).toBe('cnn')
    expect(hits[0]!.score).toBeGreaterThan(0)
  })

  it('别名命中（英文缩写）', () => {
    expect(query(index, 'LSTM').map((h) => h.id)).toContain('lstm')
  })

  it('正文字段命中', () => {
    expect(query(index, '梯度消失').map((h) => h.id)).toContain('lstm')
  })

  it('关键词命中', () => {
    expect(query(index, '注意力').map((h) => h.id)).toContain('transformer')
  })

  it('标题命中权重高于正文命中', () => {
    const byTitle = query(buildIndex([{ id: 'a', title: '注意力机制', text: '' }]), '注意力')
    const byText = query(buildIndex([{ id: 'b', title: '无关标题', text: '注意力是一种机制' }]), '注意力')
    expect(byTitle[0]!.score).toBeGreaterThan(byText[0]!.score)
  })

  it('无命中返回空数组；空查询返回空数组', () => {
    expect(query(index, '量子纠缠')).toEqual([])
    expect(query(index, '')).toEqual([])
    expect(query(index, '   ')).toEqual([])
  })

  it('limit 生效', () => {
    const wide = buildIndex([
      { id: '1', title: '神经网络基础' },
      { id: '2', title: '神经网络进阶' },
      { id: '3', title: '神经网络实战' },
    ])
    expect(query(wide, '神经网络', 2)).toHaveLength(2)
  })

  it('多词查询（空格分隔）取交集文档', () => {
    const hits = query(index, 'Transformer 注意力')
    expect(hits[0]?.id).toBe('transformer')
  })
})

describe('snippet（高亮切片）', () => {
  it('切出含命中词的上下文窗口', () => {
    const s = snippet('循环神经网络通过门控机制缓解梯度消失问题。', '梯度消失', 8)
    expect(s).toContain('梯度消失')
    expect(s.length).toBeLessThanOrEqual(8 * 2 + 4 + 2) // 半径*2 + 词长 + 省略号余量
  })

  it('无命中返回开头片段', () => {
    const s = snippet('完全基于注意力的架构。', '量子', 6)
    expect(s.startsWith('完全基于')).toBe(true)
  })
})
