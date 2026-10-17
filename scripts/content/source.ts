// 内容管线 · 可插拔 KnowledgeSource（FEAT-010）
// Demo 使用内置 fixture 源；正式内容由 opencode 构建期生成后替换本文件。
import type { TitleItem, GeneratedPoint } from '../../src/data/types';

export interface KnowledgeSource {
  id: string;
  generate(titles: TitleItem[]): Promise<GeneratedPoint[]>;
}

function slug(title: string): string {
  const map: Record<string, string> = {
    Transformer: 'transformer',
    注意力机制: 'attention-mechanism',
    自注意力: 'self-attention',
    位置编码: 'positional-encoding',
    BERT: 'bert',
    GPT: 'gpt',
    词向量: 'word-embedding',
    循环神经网络: 'recurrent-neural-network',
    反向传播: 'backpropagation',
    梯度下降: 'gradient-descent',
    卷积神经网络: 'convolutional-neural-network',
    强化学习: 'reinforcement-learning',
  };
  return map[title] ?? title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

const SLUG_TO_TITLE: Record<string, string> = Object.fromEntries(
  Object.entries({
    Transformer: 'transformer',
    注意力机制: 'attention-mechanism',
    自注意力: 'self-attention',
    位置编码: 'positional-encoding',
    BERT: 'bert',
    GPT: 'gpt',
    词向量: 'word-embedding',
    循环神经网络: 'recurrent-neural-network',
    反向传播: 'backpropagation',
    梯度下降: 'gradient-descent',
    卷积神经网络: 'convolutional-neural-network',
    强化学习: 'reinforcement-learning',
  }).map(([title, s]) => [s, title]),
);

// 引用辅助：[[id|text]]
const w = (title: string) => `[[${slug(title)}|${title}]]`;

const CONTENT: Record<string, Omit<GeneratedPoint, 'id' | 'title' | 'domain' | 'year'>> = {
  transformer: {
    aliases: ['Transformer 模型'],
    importance: 5,
    difficulty: '高',
    learnTime: 45,
    tags: ['注意力', 'Seq2Seq'],
    summary: '完全基于注意力机制的序列到序列架构，抛弃循环结构，使训练可充分并行化。',
    body: [
      {
        t: 'p',
        text: `一种完全基于 ${w('注意力机制')} 的序列到序列架构，抛弃了 ${w('循环神经网络')} 的循环结构，使训练可以充分并行化。`,
      },
      { t: 'formula', tex: 'Attention(Q, K, V) = softmax( QKᵀ / √d_k ) · V' },
      {
        t: 'p',
        text: `它把序列建模从「逐步递归」改写为「全局加权」。${w('自注意力')} 与 ${w('位置编码')} 是它的两个核心部件，并成为此后 ${w('BERT')}、${w('GPT')} 等 ${w('大语言模型')} 的骨架。`,
      },
    ],
    papers: [{ title: 'Attention Is All You Need', authors: ['Vaswani', 'Shazeer', 'Parmar'], year: 2017, venue: 'NeurIPS' }],
    deps: ['attention-mechanism', 'recurrent-neural-network', 'positional-encoding'],
    related: ['self-attention', 'bert', 'gpt'],
  },
  'attention-mechanism': {
    aliases: ['Attention'],
    importance: 5,
    difficulty: '进阶',
    learnTime: 30,
    tags: ['注意力'],
    summary: '让模型在生成每一步时关注输入中最相关的部分。',
    body: [
      {
        t: 'p',
        text: `注意力机制让解码器在每个时间步对输入序列做「加权求和」，权重取决于当前查询与各输入的相关度。它是 ${w('Transformer')} 与 ${w('词向量')} 时代连接序列建模的关键。`,
      },
      { t: 'list', items: ['用于机器翻译，替代固定长度语义向量', '注意力权重可解释，常用于可视化'] },
    ],
    deps: ['word-embedding'],
    related: ['self-attention', 'transformer'],
  },
  'self-attention': {
    importance: 4,
    difficulty: '进阶',
    learnTime: 25,
    tags: ['注意力'],
    summary: '序列内部两两计算注意力，让每个位置看到全序列。',
    body: [
      {
        t: 'p',
        text: `${w('注意力机制')} 的变体：查询、键、值都来自同一个序列自身。每个 token 都能直接「看到」序列中任意其他 token，这是 ${w('Transformer')} 并行与长程依赖的根基。`,
      },
    ],
    deps: ['attention-mechanism'],
    related: ['transformer'],
  },
  'positional-encoding': {
    importance: 3,
    difficulty: '进阶',
    learnTime: 20,
    tags: ['注意力'],
    summary: '为不含位置信息的自注意力补充序列顺序。',
    body: [
      {
        t: 'p',
        text: `自注意力对输入的顺序不敏感，因此 ${w('Transformer')} 通过正弦位置编码把位置信息注入表示，使模型能区分词序。`,
      },
    ],
    deps: ['self-attention'],
    related: ['transformer'],
  },
  bert: {
    importance: 5,
    difficulty: '高',
    learnTime: 40,
    tags: ['预训练', 'Transformer'],
    summary: '双向 Transformer 编码器，用掩码语言模型做预训练，刷新多项 NLP 基准。',
    body: [
      {
        t: 'p',
        text: `${w('Transformer')} 编码器的双向变体：通过掩码语言模型（MLM）与下一句预测做自监督预训练，再对下游任务微调，是「预训练 + 微调」范式的代表。`,
      },
    ],
    deps: ['transformer'],
    related: ['gpt'],
  },
  gpt: {
    importance: 5,
    difficulty: '高',
    learnTime: 40,
    tags: ['预训练', '生成'],
    summary: '自回归解码器，以「预测下一个词」为目标预训练，通向大语言模型。',
    body: [
      {
        t: 'p',
        text: `${w('Transformer')} 解码器的自回归变体：只预测下一个词，却在大规模语料下涌现出少样本能力，成为后续大语言模型的直接前身。`,
      },
    ],
    deps: ['transformer'],
    related: ['bert'],
  },
  'word-embedding': {
    aliases: ['Word2Vec'],
    importance: 4,
    difficulty: '入门',
    learnTime: 20,
    tags: ['表示学习'],
    summary: '把词语映射到连续语义向量，相似词距离更近。',
    body: [
      {
        t: 'p',
        text: `把离散词表映射到稠密向量，使语义相近的词在向量空间中邻近。它是 ${w('注意力机制')} 与后续大模型的输入表示基础。`,
      },
    ],
    related: ['attention-mechanism'],
  },
  'recurrent-neural-network': {
    aliases: ['RNN'],
    importance: 4,
    difficulty: '进阶',
    learnTime: 30,
    tags: ['序列模型'],
    summary: '沿时间步共享参数处理序列，但难以并行且易梯度消失。',
    body: [
      {
        t: 'p',
        text: `沿时间步共享参数的序列模型。串行计算限制了并行，长程依赖下的梯度消失促使后续出现 ${w('注意力机制')} 与 ${w('Transformer')}。`,
      },
    ],
    deps: ['backpropagation'],
    related: ['transformer'],
  },
  backpropagation: {
    aliases: ['Backpropagation'],
    importance: 5,
    difficulty: '进阶',
    learnTime: 30,
    tags: ['训练'],
    summary: '用链式法则从损失反向传播梯度，是神经网络训练的核心算法。',
    body: [
      {
        t: 'p',
        text: `通过链式法则逐层计算损失对各参数的梯度，配合 ${w('梯度下降')} 更新权重。一切深度网络训练都依赖它。`,
      },
      { t: 'formula', tex: 'w ← w − η · ∂L / ∂w' },
    ],
    deps: ['gradient-descent'],
    related: ['recurrent-neural-network', 'convolutional-neural-network'],
  },
  'gradient-descent': {
    aliases: ['Gradient Descent'],
    importance: 4,
    difficulty: '入门',
    learnTime: 20,
    tags: ['优化'],
    summary: '沿损失函数负梯度方向迭代更新参数。',
    body: [
      {
        t: 'p',
        text: `沿损失函数负梯度方向迭代更新参数，学习率 η 控制步长。随机与批量变体构成深度学习优化的基础。`,
      },
    ],
    related: ['backpropagation'],
  },
  'convolutional-neural-network': {
    aliases: ['CNN'],
    importance: 4,
    difficulty: '进阶',
    learnTime: 30,
    tags: ['图像'],
    summary: '以卷积核提取局部特征，参数共享、平移等变，是视觉的骨干。',
    body: [
      {
        t: 'p',
        text: `用共享卷积核在局部感受野上提取特征，显著降低参数并保持平移等变，主导了图像识别。`,
      },
    ],
    deps: ['backpropagation'],
    related: [],
  },
  'reinforcement-learning': {
    aliases: ['Reinforcement Learning'],
    importance: 4,
    difficulty: '高',
    learnTime: 45,
    tags: ['决策'],
    summary: '智能体在与环境的交互中依据奖励信号学习最优策略。',
    body: [
      {
        t: 'p',
        text: `智能体通过试错与奖励信号学习决策策略，近年与深度学习结合（如 DQN、策略梯度）在博弈与机器人领域取得突破。`,
      },
    ],
    deps: ['backpropagation'],
    related: [],
  },
};

export const fixtureSource: KnowledgeSource = {
  id: 'fixture',
  async generate(titles: TitleItem[]): Promise<GeneratedPoint[]> {
    return titles.map((t) => {
      const s = slug(t.title);
      const base = CONTENT[s] ?? {
        importance: 3,
        difficulty: '入门' as const,
        learnTime: 15,
        summary: `${t.title}：AI 知识星图中的重要概念。`,
        body: [{ t: 'p' as const, text: t.title }],
      };
      return {
        id: s,
        title: t.title,
        domain: t.domain ?? 'ml',
        year: t.year ?? 2000,
        ...base,
      };
    });
  },
};

export { SLUG_TO_TITLE };
