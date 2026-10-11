import { z } from 'zod'

/** 知识数据契约（schemaVersion 前向兼容 v2 服务器化） */

export const CategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  nameEn: z.string().min(1),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, '颜色须为 #RRGGBB'),
  description: z.string().min(1),
  order: z.number().int(),
})

export const PaperSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  authors: z.array(z.string().min(1)),
  year: z.number().int().min(1900).max(2100),
  venue: z.string().optional(),
  url: z.string().url().optional(),
  doi: z.string().optional(),
  abstract: z.string().optional(),
})

export const KnowledgePointSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  aliases: z.array(z.string().min(1)).default([]),
  categoryId: z.string().min(1),
  summary: z.string().min(1),
  detail: z.string().min(1),
  year: z.number().int().min(1600).max(2100),
  importance: z.number().int().min(1).max(5),
  paperIds: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
  related: z.array(z.string()).default([]),
  tags: z.array(z.string().min(1)).default([]),
  trend: z.string().optional(),
})

export const TrendDirectionSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  relatedPointIds: z.array(z.string()).default([]),
})

export const TrendSchema = z.object({
  categoryId: z.string().min(1),
  headline: z.string().min(1),
  directions: z.array(TrendDirectionSchema).min(1),
})

export const RoadmapStageSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  pointIds: z.array(z.string().min(1)).min(1),
})

export const RoadmapDocSchema = z.object({
  categoryId: z.string().min(1),
  stages: z.array(RoadmapStageSchema).min(1),
})

export const RawKnowledgeSchema = z.object({
  schemaVersion: z.number().int().min(1),
  categories: z.array(CategorySchema).min(1),
  papers: z.array(PaperSchema),
  points: z.array(KnowledgePointSchema).min(1),
  trends: z.array(TrendSchema),
  roadmap: z.array(RoadmapDocSchema),
})

export type Category = z.infer<typeof CategorySchema>
export type Paper = z.infer<typeof PaperSchema>
export type KnowledgePoint = z.infer<typeof KnowledgePointSchema>
export type Trend = z.infer<typeof TrendSchema>
export type RoadmapDoc = z.infer<typeof RoadmapDocSchema>
export type RawKnowledge = z.infer<typeof RawKnowledgeSchema>
/** 原始输入形态（default 字段可省略）——测试夹具与手写数据用 */
export type RawKnowledgeInput = z.input<typeof RawKnowledgeSchema>
