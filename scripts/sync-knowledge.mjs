#!/usr/bin/env node
/**
 * 构建期知识数据同步与校验门：
 * 1. 读取 knowledge/ 全部数据源
 * 2. 结构与引用完整性校验（与 domain 层校验互为纵深，本脚本负责在构建期拦截坏数据）
 * 3. 编译为 app/src/data/compiled/knowledge-base.json 供应用打包
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const knowledgeDir = join(root, 'knowledge')
const outDir = join(root, 'app', 'src', 'data', 'compiled')

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

const errors = []
const fail = (msg) => errors.push(msg)

// 1. 读取
const categories = readJson(join(knowledgeDir, 'categories.json'))
const papers = readJson(join(knowledgeDir, 'papers.json'))
const trends = readJson(join(knowledgeDir, 'trends.json'))
const roadmap = readJson(join(knowledgeDir, 'roadmap.json'))
const points = []
for (const file of readdirSync(join(knowledgeDir, 'points')).filter((f) => f.endsWith('.json'))) {
  const list = readJson(join(knowledgeDir, 'points', file))
  if (!Array.isArray(list)) fail(`points/${file} 不是数组`)
  points.push(...list)
}

// 2. 校验
const checkUnique = (items, label) => {
  const seen = new Set()
  for (const item of items) {
    if (!item.id || typeof item.id !== 'string') fail(`${label} 存在缺失/非法 id`)
    else if (seen.has(item.id)) fail(`${label} id 重复：${item.id}`)
    seen.add(item.id)
  }
  return seen
}
const categoryIds = checkUnique(categories, '领域')
const paperIds = checkUnique(papers, '论文')
const pointIds = checkUnique(points, '知识点')

const COLOR_RE = /^#[0-9a-fA-F]{6}$/
for (const c of categories) {
  if (!c.name || !c.nameEn || !c.description) fail(`领域 ${c.id} 缺少必填字段`)
  if (!COLOR_RE.test(c.color ?? '')) fail(`领域 ${c.id} 颜色非法：${c.color}`)
}
for (const p of points) {
  for (const field of ['title', 'summary', 'detail', 'categoryId', 'year', 'importance']) {
    if (p[field] === undefined) fail(`知识点 ${p.id ?? '?'} 缺少 ${field}`)
  }
  if (!categoryIds.has(p.categoryId)) fail(`知识点 ${p.id} 引用不存在领域：${p.categoryId}`)
  if (typeof p.importance !== 'number' || p.importance < 1 || p.importance > 5) fail(`知识点 ${p.id} importance 非法`)
  for (const pid of p.paperIds ?? []) if (!paperIds.has(pid)) fail(`知识点 ${p.id} 引用不存在论文：${pid}`)
  for (const pre of p.prerequisites ?? []) if (!pointIds.has(pre)) fail(`知识点 ${p.id} 前置依赖不存在：${pre}`)
  for (const rel of p.related ?? []) if (!pointIds.has(rel)) fail(`知识点 ${p.id} 相关知识点不存在：${rel}`)
  for (const tag of p.tags ?? []) if (typeof tag !== 'string' || !tag) fail(`知识点 ${p.id} 存在空标签`)
}

// 依赖环检测（DFS 三色标记）
const byId = new Map(points.map((p) => [p.id, p]))
const color = new Map()
const detectCycle = (id, stack) => {
  color.set(id, 'gray')
  stack.push(id)
  for (const pre of byId.get(id)?.prerequisites ?? []) {
    if (!byId.has(pre)) continue
    if (color.get(pre) === 'gray') return [...stack.slice(stack.indexOf(pre)), pre]
    if (!color.has(pre)) {
      const found = detectCycle(pre, stack)
      if (found) return found
    }
  }
  stack.pop()
  color.set(id, 'black')
  return null
}
for (const p of points) {
  if (!color.has(p.id)) {
    const cycle = detectCycle(p.id, [])
    if (cycle) fail(`前置依赖成环：${cycle.join(' → ')}`)
  }
}

for (const t of trends) {
  if (!categoryIds.has(t.categoryId)) fail(`趋势引用不存在领域：${t.categoryId}`)
  if (!t.headline || !Array.isArray(t.directions) || t.directions.length === 0) fail(`领域 ${t.categoryId} 趋势数据不完整`)
  for (const d of t.directions ?? []) {
    for (const pid of d.relatedPointIds ?? []) if (!pointIds.has(pid)) fail(`趋势 ${t.categoryId} 引用不存在知识点：${pid}`)
  }
}
const trendCats = new Set(trends.map((t) => t.categoryId))
for (const c of categories) if (!trendCats.has(c.id)) fail(`领域 ${c.id} 缺少趋势数据`)

const roadmapCats = new Set()
for (const doc of roadmap) {
  if (!categoryIds.has(doc.categoryId)) fail(`路线引用不存在领域：${doc.categoryId}`)
  if (roadmapCats.has(doc.categoryId)) fail(`领域路线重复：${doc.categoryId}`)
  roadmapCats.add(doc.categoryId)
  const seenInDoc = new Set()
  for (const stage of doc.stages ?? []) {
    for (const pid of stage.pointIds ?? []) {
      if (!pointIds.has(pid)) fail(`路线 ${doc.categoryId} 引用不存在知识点：${pid}`)
      const pt = byId.get(pid)
      if (pt && pt.categoryId !== doc.categoryId) fail(`路线 ${doc.categoryId} 引用其他领域知识点：${pid}（属 ${pt.categoryId}）`)
      if (seenInDoc.has(pid)) fail(`路线 ${doc.categoryId} 知识点重复：${pid}`)
      seenInDoc.add(pid)
    }
  }
  const assigned = seenInDoc.size
  const total = points.filter((p) => p.categoryId === doc.categoryId).length
  if (assigned < total) console.log(`[warn] 路线 ${doc.categoryId}：${total - assigned} 个知识点未编入路线（unassigned）`)
}
for (const c of categories) if (!roadmapCats.has(c.id)) fail(`领域 ${c.id} 缺少路线数据`)

if (errors.length > 0) {
  console.error(`[sync-knowledge] 校验失败，共 ${errors.length} 个问题：`)
  for (const e of errors) console.error(`  ✗ ${e}`)
  process.exit(1)
}

// 3. 编译输出
mkdirSync(outDir, { recursive: true })
const compiled = { schemaVersion: 1, categories, papers, points, trends, roadmap }
const outPath = join(outDir, 'knowledge-base.json')
writeFileSync(outPath, JSON.stringify(compiled, null, 2))
const byCategory = {}
for (const p of points) byCategory[p.categoryId] = (byCategory[p.categoryId] ?? 0) + 1
console.log(`[sync-knowledge] 编译完成 → ${outPath}`)
console.log(`[sync-knowledge] 知识点 ${points.length}（${JSON.stringify(byCategory)}）· 领域 ${categories.length} · 论文 ${papers.length} · 趋势 ${trends.length} · 路线 ${roadmap.length}`)
