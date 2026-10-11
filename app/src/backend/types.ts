/**
 * 应用后端 · 对外契约（types only）
 *
 * 分层边界（见 hs_dev_docs/_03_architecture_design/arch_v1.md §6）：
 * - backend/ = 应用后端：数据加载、校验、组织、派生、搜索、持久化的唯一所有者
 * - features/ components/ app/ = 展示层：只允许 import 本目录，禁止触碰 domain/* 与 data/*
 * - domain/*、data/* 是 backend 的内部实现，视图不可见
 *
 * v2 服务器化时：knowledge-service 的函数签名即服务 API 的镜像，
 * 届时仅替换 backend 内部实现（HTTP Adapter），展示层零改动。
 */
import type { Category, KnowledgePoint } from '@/domain/schema'
import type { KnowledgeGraph, GraphEdge, GraphNode } from '@/domain/graph'
import type { TimelineEntry } from '@/domain/timeline'
import type { Roadmap } from '@/domain/roadmap'

export type { Category, KnowledgePoint, KnowledgeGraph, GraphEdge, GraphNode, TimelineEntry, Roadmap }

export interface StatsView {
  points: number
  categories: number
  papers: number
  yearSpan: string
}

export interface HomeView {
  stats: StatsView
  /** 领域入口行（含知识点数） */
  domainRows: { category: Category; count: number }[]
  latest: { point: KnowledgePoint; category: Category }[]
  top: { point: KnowledgePoint; category: Category }[]
}

export interface GraphView {
  categories: Category[]
  graph: KnowledgeGraph
}

export interface TimelineView {
  categories: Category[]
  entries: TimelineEntry[]
}

export interface RoadmapView {
  categories: Category[]
  roadmap: Roadmap
  trend: TrendView | null
}

export interface DomainView {
  category: Category
  /** 按诞生年份升序 */
  points: KnowledgePoint[]
  trend: TrendView | null
  roadmap: Roadmap
}

export interface TrendView {
  headline: string
  directions: { title: string; description: string; related: KnowledgePoint[] }[]
}

export interface PointDetailView {
  point: KnowledgePoint
  category: Category
  trend: TrendView | null
  papers: PaperView[]
  /** 前置依赖（解析后） */
  prerequisites: KnowledgePoint[]
  /** 相关知识点（解析后） */
  relatedPoints: KnowledgePoint[]
  /** 应用（反向依赖）：把本知识点列为前置的知识点 */
  appliedBy: KnowledgePoint[]
  /** 衍生 + 相关（去重，截断 8 条，供依赖小图） */
  derived: KnowledgePoint[]
}

export interface PaperView {
  id: string
  title: string
  authors: string[]
  year: number
  venue?: string
  url?: string
  doi?: string
}

export interface PointSummaryView {
  point: KnowledgePoint
  category: Category
  prerequisiteCount: number
  relatedCount: number
}

export interface SearchHitView {
  id: string
  title: string
  year: number
  summary: string
  categoryName: string
  categoryColor: string
  /** 命中上下文切片 */
  snippet: string
}
