/**
 * 领域搜索引擎：中文 bigram + 英文词元的倒排索引。
 * 纯函数 seam：buildIndex(docs) / query(index, q, limit?) / snippet(text, q, radius)。
 */

export interface SearchDoc {
  id: string
  title: string
  aliases?: string[]
  subtitle?: string
  text?: string
  keywords?: string[]
}

export interface SearchHit {
  id: string
  score: number
}

/** 字段权重：标题 > 别名/关键词 > 副标题 > 正文 */
const FIELD_WEIGHTS = { title: 3, alias: 2.5, keyword: 2, subtitle: 1.5, text: 1 } as const
type FieldName = keyof typeof FIELD_WEIGHTS

interface DocTermEntry {
  title: number
  alias: number
  keyword: number
  subtitle: number
  text: number
}

export interface SearchIndex {
  /** token → 文档 → 各字段词频 */
  postings: Map<string, Map<string, DocTermEntry>>
}

const CJK_RE = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/

export function isCJK(text: string): boolean {
  return CJK_RE.test(text)
}

/** 查询/文档分词：CJK 连续段切 bigram（单字保留），ASCII 段按词小写 */
export function tokenize(input: string): string[] {
  const tokens: string[] = []
  const segments = input.match(/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]+|[a-zA-Z0-9][a-zA-Z0-9+#.\-]*/g) ?? []
  for (const seg of segments) {
    if (CJK_RE.test(seg)) {
      if (seg.length === 1) {
        tokens.push(seg)
      } else {
        for (let i = 0; i < seg.length - 1; i++) tokens.push(seg.slice(i, i + 2))
      }
    } else {
      tokens.push(seg.toLowerCase())
    }
  }
  return tokens
}

function addField(postings: Map<string, Map<string, DocTermEntry>>, docId: string, field: FieldName, raw: string) {
  for (const token of tokenize(raw)) {
    let docMap = postings.get(token)
    if (!docMap) {
      docMap = new Map()
      postings.set(token, docMap)
    }
    let entry = docMap.get(docId)
    if (!entry) {
      entry = { title: 0, alias: 0, keyword: 0, subtitle: 0, text: 0 }
      docMap.set(docId, entry)
    }
    entry[field] += 1
  }
}

export function buildIndex(docs: SearchDoc[]): SearchIndex {
  const postings = new Map<string, Map<string, DocTermEntry>>()
  for (const doc of docs) {
    addField(postings, doc.id, 'title', doc.title)
    for (const alias of doc.aliases ?? []) addField(postings, doc.id, 'alias', alias)
    for (const kw of doc.keywords ?? []) addField(postings, doc.id, 'keyword', kw)
    if (doc.subtitle) addField(postings, doc.id, 'subtitle', doc.subtitle)
    if (doc.text) addField(postings, doc.id, 'text', doc.text)
  }
  return { postings }
}

export function query(index: SearchIndex, q: string, limit = 20): SearchHit[] {
  const terms = q.trim().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return []

  // 每个查询词的 token 集
  const termTokens = terms.map((t) => new Set(tokenize(t)))
  if (termTokens.some((tokens) => tokens.size === 0)) return []

  // 候选文档：对每个词至少命中一个 token（词间 AND，词内 token OR）
  let candidates: Map<string, Set<string>> | null = null // docId → 命中的 token
  for (const tokens of termTokens) {
    const termHits = new Map<string, Set<string>>()
    for (const token of tokens) {
      const docMap = index.postings.get(token)
      if (!docMap) continue
      for (const docId of docMap.keys()) {
        const set = termHits.get(docId) ?? new Set<string>()
        set.add(token)
        termHits.set(docId, set)
      }
    }
    if (termHits.size === 0) return []
    if (candidates === null) {
      candidates = termHits
    } else {
      const merged = new Map<string, Set<string>>()
      for (const [docId, hitTokens] of termHits) {
        const prev = candidates.get(docId)
        if (prev) merged.set(docId, new Set([...prev, ...hitTokens]))
      }
      candidates = merged
      if (candidates.size === 0) return []
    }
  }
  const totalQueryTokens = termTokens.reduce((sum, t) => sum + t.size, 0)

  const hits: SearchHit[] = []
  for (const [docId, matchedTokens] of candidates!) {
    let score = 0
    for (const token of matchedTokens) {
      const entry = index.postings.get(token)!.get(docId)!
      score +=
        entry.title * FIELD_WEIGHTS.title +
        entry.alias * FIELD_WEIGHTS.alias +
        entry.keyword * FIELD_WEIGHTS.keyword +
        entry.subtitle * FIELD_WEIGHTS.subtitle +
        entry.text * FIELD_WEIGHTS.text
    }
    // 覆盖率奖励：命中的查询 token 越全排名越高
    score *= matchedTokens.size / totalQueryTokens
    hits.push({ id: docId, score })
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit)
}

/** 高亮切片：取第一个命中词的上下文窗口；无命中退回首段。 */
export function snippet(text: string, q: string, radius = 8): string {
  const terms = q.trim().split(/\s+/).filter(Boolean)
  let matchIndex = -1
  let matchLength = 0
  for (const term of terms) {
    const idx = text.indexOf(term)
    if (idx >= 0) {
      matchIndex = idx
      matchLength = term.length
      break
    }
  }
  if (matchIndex < 0) {
    for (const token of tokenize(q)) {
      const idx = text.indexOf(token)
      if (idx >= 0) {
        matchIndex = idx
        matchLength = token.length
        break
      }
    }
  }
  if (matchIndex < 0) {
    const head = text.slice(0, radius * 2)
    return text.length > radius * 2 ? `${head}…` : head
  }
  const start = Math.max(0, matchIndex - radius)
  const end = Math.min(text.length, matchIndex + matchLength + radius)
  const body = text.slice(start, end)
  return `${start > 0 ? '…' : ''}${body}${end < text.length ? '…' : ''}`
}
