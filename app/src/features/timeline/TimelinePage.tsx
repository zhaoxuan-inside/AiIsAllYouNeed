import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getKnowledgeBase, getFullTimeline, useFilterStore } from '@/data/knowledge-context'
import { buildTimeline } from '@/domain/timeline'
import { CategoryFilter, ImportanceStars } from '@/components/ui'

const ERA_ANCHORS = [
  { year: 1950, label: '奠基时代' },
  { year: 1986, label: '连接主义复兴' },
  { year: 2012, label: '深度学习革命' },
  { year: 2017, label: 'Transformer 纪元' },
  { year: 2022, label: '大模型时代' },
]

/** 编年时间线：纵向轨道 + 时代锚点，按领域筛选 */
export function TimelinePage() {
  const kb = getKnowledgeBase()
  const selected = useFilterStore((s) => s.selectedCategories)
  const toggleCategory = useFilterStore((s) => s.toggleCategory)
  const clearCategories = useFilterStore((s) => s.clearCategories)

  const timeline = useMemo(
    () => (selected.length === 0 ? getFullTimeline() : buildTimeline(kb, { categoryIds: selected })),
    [kb, selected],
  )

  return (
    <div className="rise-in">
      <h1 className="font-display text-2xl">时间线</h1>
      <p className="mt-1 text-sm text-dim">AI 知识的编年长河：每个节点是一个知识点的诞生时刻。</p>

      <div className="mt-4">
        <CategoryFilter categories={kb.categories} selected={selected} onToggle={toggleCategory} onClear={clearCategories} />
      </div>

      <div className="relative mt-8">
        {/* 轨道线 */}
        <div className="absolute bottom-0 left-[52px] top-0 w-px bg-edge sm:left-[72px]" aria-hidden />

        {timeline.map((entry) => {
          const anchor = ERA_ANCHORS.find((a) => a.year === entry.year)
          return (
            <section key={entry.year} className="relative pb-10">
              <div className="flex items-center gap-4">
                <span className="w-[40px] shrink-0 text-right font-mono text-sm text-star sm:w-[52px] sm:text-base">{entry.year}</span>
                <span
                  className="relative z-10 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-void"
                  style={{ backgroundColor: 'var(--accent)' }}
                  aria-hidden
                />
                {anchor && <span className="text-xs text-accent">「{anchor.label}」</span>}
              </div>

              <div className="ml-[64px] mt-3 grid gap-2 sm:ml-[84px]">
                {entry.points.map((p) => {
                  const category = kb.categoryById.get(p.categoryId)!
                  return (
                    <Link
                      key={p.id}
                      to={`/point/${p.id}`}
                      className="group flex items-baseline gap-3 rounded-lg border border-transparent px-3 py-2 transition-colors hover:bg-wash"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: category.color }} aria-hidden />
                      <span className="text-sm text-star group-hover:text-accent">{p.title}</span>
                      <span className="hidden truncate text-xs text-dim sm:inline">{p.summary}</span>
                      <span className="ml-auto shrink-0">
                        <ImportanceStars value={p.importance} />
                      </span>
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        })}

        {timeline.length === 0 && <p className="py-12 text-center text-sm text-dim">当前筛选下没有知识点，试试重置筛选。</p>}
      </div>
    </div>
  )
}
