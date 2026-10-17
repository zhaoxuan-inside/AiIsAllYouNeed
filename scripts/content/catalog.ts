// 内容管线 · 目录数据：标题清单 / 领域 / 路线（FEAT-010）
// Demo 少量数据即可（开发者裁定）；正式内容由构建期生成后替换。
import type { TitleItem, Domain, Roadmap } from '../../src/data/types';

export const TITLES: TitleItem[] = [
  { title: 'Transformer', domain: 'llm-gen', aliases: ['Transformer 模型'], year: 2017 },
  { title: '注意力机制', domain: 'llm-gen', aliases: ['Attention'], year: 2014 },
  { title: '自注意力', domain: 'llm-gen', year: 2017 },
  { title: '位置编码', domain: 'llm-gen', year: 2017 },
  { title: 'BERT', domain: 'nlp', year: 2018 },
  { title: 'GPT', domain: 'llm-gen', year: 2018 },
  { title: '词向量', domain: 'nlp', aliases: ['Word2Vec'], year: 2013 },
  { title: '循环神经网络', domain: 'nlp', aliases: ['RNN'], year: 1986 },
  { title: '反向传播', domain: 'ml', aliases: ['Backpropagation'], year: 1986 },
  { title: '梯度下降', domain: 'ml', aliases: ['Gradient Descent'], year: 1847 },
  { title: '卷积神经网络', domain: 'cv', aliases: ['CNN'], year: 1998 },
  { title: '强化学习', domain: 'rl', aliases: ['Reinforcement Learning'], year: 1992 },
];

export const DOMAINS: Domain[] = [
  { key: 'ml', name: '机器学习基础', colorIndex: 0, order: 0, summary: '模型训练的共同地基：优化、损失与泛化。' },
  { key: 'nlp', name: '自然语言处理', colorIndex: 1, order: 1, summary: '让机器理解与生成语言。' },
  { key: 'cv', name: '计算机视觉', colorIndex: 2, order: 2, summary: '让机器看见并理解图像。' },
  { key: 'rl', name: '强化学习', colorIndex: 3, order: 3, summary: '在交互与奖励中学习决策。' },
  { key: 'llm-gen', name: '大模型与生成', colorIndex: 4, order: 4, summary: 'Transformer 之后的大规模生成模型。' },
];

export const ROADMAP: Roadmap[] = [
  {
    domainKey: 'llm-gen',
    trend: '向自监督与基础模型统一演进；表示学习与规模化仍是主线。',
    stages: [
      { key: 'basic', name: '基础', pointIds: ['attention-mechanism', 'word-embedding', 'recurrent-neural-network'] },
      { key: 'intermediate', name: '进阶', pointIds: ['self-attention', 'positional-encoding'] },
      { key: 'frontier', name: '前沿', pointIds: ['transformer', 'bert', 'gpt'] },
    ],
  },
];
