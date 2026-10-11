import { create } from 'zustand'
import type { KnowledgeBase } from '@/domain/load'
import type { KnowledgeGraph } from '@/domain/graph'
import { buildGraph } from '@/domain/graph'
import { buildTimeline, type TimelineEntry } from '@/domain/timeline'
import { loadKnowledgeSource } from '@/data/source'
import { buildIndex, type SearchIndex, type SearchDoc } from '@/domain/search'

/** 全局知识库上下文：一次性加载 + 派生数据缓存（useMemo 语义由模块级缓存承担） */

let kbCache: KnowledgeBase | null = null
let graphCache: KnowledgeGraph | null = null
let timelineCache: TimelineEntry[] | null = null
let searchIndexCache: SearchIndex | null = null

export function getKnowledgeBase(): KnowledgeBase {
  if (!kbCache) kbCache = loadKnowledgeSource()
  return kbCache
}

export function getFullGraph(): KnowledgeGraph {
  if (!graphCache) graphCache = buildGraph(getKnowledgeBase())
  return graphCache
}

export function getFullTimeline(): TimelineEntry[] {
  if (!timelineCache) timelineCache = buildTimeline(getKnowledgeBase())
  return timelineCache
}

export function getSearchIndex(): SearchIndex {
  if (!searchIndexCache) {
    const kb = getKnowledgeBase()
    const docs: SearchDoc[] = kb.points.map((p) => ({
      id: p.id,
      title: p.title,
      aliases: p.aliases,
      subtitle: p.summary,
      text: p.detail,
      keywords: p.tags,
    }))
    searchIndexCache = buildIndex(docs)
  }
  return searchIndexCache
}

/** 图谱/时间线共用的领域筛选状态（会话内存，不持久化） */
interface FilterState {
  selectedCategories: string[]
  toggleCategory: (id: string) => void
  clearCategories: () => void
}

export const useFilterStore = create<FilterState>((set) => ({
  selectedCategories: [],
  toggleCategory: (id) =>
    set((s) => ({
      selectedCategories: s.selectedCategories.includes(id)
        ? s.selectedCategories.filter((c) => c !== id)
        : [...s.selectedCategories, id],
    })),
  clearCategories: () => set({ selectedCategories: [] }),
}))
