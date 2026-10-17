// 核心单测：repo 反向链接派生 + 检索（对齐 module_contracts 测试 seam）
import { describe, it, expect, beforeEach } from 'vitest';
import { KnowledgeRepo } from './data/repo';
import { SearchIndex, tokenize } from './search';
import type { KnowledgeBundle } from './data/types';

const bundle: KnowledgeBundle = {
  domains: [{ key: 'ml', name: '机器学习基础', colorIndex: 0, order: 0, summary: '' }],
  roadmap: [],
  points: [
    {
      id: 'transformer', title: 'Transformer', aliases: [], domain: 'ml', year: 2017,
      importance: 5, difficulty: '高', learnTime: 45, tags: ['注意力'], media: [],
      summary: '基于注意力的架构', body: [{ t: 'p', text: '正文' }], papers: [],
      deps: ['attention-mechanism'], related: ['bert'], backlinks: [],
    },
    {
      id: 'attention-mechanism', title: '注意力机制', aliases: ['Attention'], domain: 'ml', year: 2014,
      importance: 5, difficulty: '进阶', learnTime: 30, tags: [], media: [],
      summary: '关注输入的相关部分', body: [{ t: 'p', text: '正文' }], papers: [],
      deps: [], related: [], backlinks: [],
    },
    {
      id: 'bert', title: 'BERT', aliases: [], domain: 'ml', year: 2018,
      importance: 4, difficulty: '高', learnTime: 40, tags: [], media: [],
      summary: '双向预训练', body: [{ t: 'p', text: '正文' }], papers: [],
      deps: ['transformer'], related: [], backlinks: [],
    },
  ],
};

let repo: KnowledgeRepo;
beforeEach(() => {
  repo = new KnowledgeRepo();
  repo.load(bundle);
});

describe('KnowledgeRepo', () => {
  it('由引用反解 backlinks（不手填）', () => {
    expect(repo.getPoint('transformer')!.backlinks).toEqual(['bert']);
    expect(repo.getBacklinks('transformer').map((p) => p.id)).toEqual(['bert']);
  });

  it('getRelated = related ∪ backlinks 去重（不含 deps）', () => {
    const ids = repo.getRelated('transformer').map((p) => p.id);
    expect(ids).toEqual(['bert']);
    expect(ids).not.toContain('attention-mechanism');
  });

  it('getPoint 不存在返回 null（路由降级）', () => {
    expect(repo.getPoint('nope')).toBeNull();
  });

  it('getTimeline 按年份升序', () => {
    const years = repo.getTimeline().map((p) => p.year);
    expect(years).toEqual([2014, 2017, 2018]);
  });
});

describe('SearchIndex', () => {
  it('bigram 分词含单字与相邻二元', () => {
    expect(tokenize('注意力')).toContain('注意');
    expect(tokenize('注意力')).toContain('意');
  });

  it('中文查询命中', () => {
    const idx = new SearchIndex();
    idx.build(bundle.points);
    const hits = idx.search('注意力', bundle.points);
    expect(hits.map((h) => h.id)).toContain('attention-mechanism');
  });

  it('空查询返回空', () => {
    const idx = new SearchIndex();
    idx.build(bundle.points);
    expect(idx.search('  ', bundle.points)).toEqual([]);
  });

  it('无命中返回空', () => {
    const idx = new SearchIndex();
    idx.build(bundle.points);
    expect(idx.search('不存在词', bundle.points)).toEqual([]);
  });
});
