// 数据契约类型 + zod 校验（对齐 _03_detailed_design/data_schema.md）
import { z } from 'zod';

export const difficultySchema = z.enum(['入门', '进阶', '高']);
export type Difficulty = z.infer<typeof difficultySchema>;

export const bodyBlockSchema = z.discriminatedUnion('t', [
  z.object({ t: z.literal('p'), text: z.string() }),
  z.object({ t: z.literal('formula'), tex: z.string() }),
  z.object({ t: z.literal('list'), items: z.array(z.string()) }),
  z.object({ t: z.literal('media'), src: z.string(), caption: z.string().optional(), alt: z.string().optional() }),
]);
export type BodyBlock = z.infer<typeof bodyBlockSchema>;

export const mediaBlockSchema = z.object({
  type: z.enum(['image', 'diagram', 'audio']),
  src: z.string(),
  caption: z.string().optional(),
  alt: z.string().optional(),
});
export type MediaBlock = z.infer<typeof mediaBlockSchema>;

export const paperSchema = z.object({
  title: z.string(),
  authors: z.array(z.string()).default([]),
  year: z.number().int().min(1900),
  venue: z.string().optional(),
  url: z.string().optional(),
});
export type Paper = z.infer<typeof paperSchema>;

const slug = /^[a-z0-9][a-z0-9-]*$/;

export const knowledgePointSchema = z.object({
  id: z.string().regex(slug),
  title: z.string().min(1),
  aliases: z.array(z.string()).default([]),
  domain: z.string().min(1),
  year: z.number().int().min(1800).max(2100),
  importance: z.number().int().min(1).max(5),
  difficulty: difficultySchema,
  learnTime: z.number().int().min(1).max(1440),
  tags: z.array(z.string()).default([]),
  media: z.array(mediaBlockSchema).default([]),
  summary: z.string().min(1),
  body: z.array(bodyBlockSchema).min(1),
  papers: z.array(paperSchema).default([]),
  deps: z.array(z.string()).default([]),
  related: z.array(z.string()).default([]),
  backlinks: z.array(z.string()).default([]),
});
export type KnowledgePoint = z.infer<typeof knowledgePointSchema>;

export const domainSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  colorIndex: z.number().int().min(0),
  order: z.number().int().min(0),
  summary: z.string(),
});
export type Domain = z.infer<typeof domainSchema>;

export const roadmapStageSchema = z.object({
  key: z.enum(['basic', 'intermediate', 'frontier']),
  name: z.string(),
  pointIds: z.array(z.string()),
});
export const roadmapSchema = z.object({
  domainKey: z.string().min(1),
  trend: z.string(),
  stages: z.array(roadmapStageSchema),
});
export type Roadmap = z.infer<typeof roadmapSchema>;

export type ThemeMode = 'system' | 'day' | 'night';
export interface Profile {
  nickname: string;
  avatarColor: string;
  favorites: string[];
  readStates: Record<string, number>;
  notes: Record<string, string>;
  themeMode: ThemeMode;
}
export const defaultProfile: Profile = {
  nickname: '学习者',
  avatarColor: '#4C8DF5',
  favorites: [],
  readStates: {},
  notes: {},
  themeMode: 'system',
};

// 内容管线输入/产出
export interface TitleItem {
  title: string;
  domain?: string;
  aliases?: string[];
  year?: number;
}
export interface GeneratedPoint {
  id: string;
  title: string;
  aliases?: string[];
  domain: string;
  year: number;
  importance: number;
  difficulty: Difficulty;
  learnTime: number;
  tags?: string[];
  media?: MediaBlock[];
  summary: string;
  body: BodyBlock[];
  papers?: Paper[];
  deps?: string[];
  related?: string[];
}

export interface KnowledgeBundle {
  points: KnowledgePoint[];
  domains: Domain[];
  roadmap: Roadmap[];
}
