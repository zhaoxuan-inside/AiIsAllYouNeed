import rawKnowledge from './compiled/knowledge-base.json'
import { loadKnowledge, type KnowledgeBase } from '@/domain/load'

let cached: KnowledgeBase | null = null

/**
 * 种子数据 Adapter（seam：loadKnowledgeSource）。
 * v1 唯一 Adapter = 打包进应用的编译 JSON；v2 服务器拉取时在此旁边新增 Adapter。
 */
export function loadKnowledgeSource(): KnowledgeBase {
  if (!cached) cached = loadKnowledge(rawKnowledge)
  return cached
}

export { rawKnowledge }
