import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTimelineView } from '@/backend/knowledge-service'
import { useFilterStore } from '@/backend/filter-store'
import { CategoryFilter, ImportanceStars } from '@/components/ui'

const ERA_ANCHORS = [
  { year: 1950, label: '奠基时代' },
  { year: 1986, label: '连接主义复兴' },
  { year: 2012, label: '深度学习革命' },
  { year: 2017, label: 'Transformer 纪元' },
  { year: 2022, label: '大模型时代' },
]

/** 编年时间线：纵向轨道 + 时代锚点；正/倒序切换带 FLIP 位移动效 */
export function TimelinePage() {
  const selected = useFilterStore((s) => s.selectedCategories)
  const toggleCategory = useFilterStore((s) => s.toggleCategory)
  const clearCategories = useFilterStore((s) => s.clearCategories)
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')

  const { categories, entries } = useMemo(() => getTimelineView(selected), [selected])
  const timeline = useMemo(
    () => (order === 'asc' ? entries : [...entries].reverse()),
    [entries, order],
  )
  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  // FLIP：切换顺序时记录各年份块旧位置，渲染后从旧位置平滑滑到新位置
  const rowRefs = useRef(new Map<number, HTMLElement | null>())
  const prevRects = useRef(new Map<number, DOMRect>())
  const toggleOrder = () => {
    for (const [key, el] of rowRefs.current) {
      if (el) prevRects.current.set(key, el.getBoundingClientRect())
    }
    setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
  }
  useLayoutEffect(() => {
    if (prevRects.current.size === 0) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    for (const [key, el] of rowRefs.current) {
      const prev = prevRects.current.get(key)
      if (!el || !prev) continue
      const dy = prev.top - el.getBoundingClientRect().top
      if (Math.abs(dy) < 1 || reduced) continue
      el.style.transition = 'none'
      el.style.transform = `translateY(${dy}px)`
      requestAnimationFrame(() => {
        el.style.transition = 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)'
        el.style.transform = ''
      })
    }
    prevRects.current.clear()
  }, [order])

  return (
    <div className="rise-in">
      <h1 className="font-display text-2xl">时间线</h1>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <CategoryFilter categories={categories} selected={selected} onToggle={toggleCategory} onClear={clearCategories} />
        <button
          onClick={toggleOrder}
          className="text-xs text-dim transition-colors hover:text-star"
          aria-label={order === 'asc' ? '切换为倒序' : '切换为正序'}
        >
          {order === 'asc' ? '最早在前 ↓' : '最新在前 ↑'}
        </button>
      </div>

      <div className="relative mt-8">
        {/* 轨道线 */}
        <div className="absolute bottom-0 left-[52px] top-0 w-px bg-edge sm:left-[72px]" aria-hidden />

        {timeline.map((entry) => {
          const anchor = ERA_ANCHORS.find((a) => a.year === entry.year)
          return (
            <section
              key={entry.year}
              ref={(el) => {
                rowRefs.current.set(entry.year, el)
              }}
              className="relative pb-10"
            >
              <div className="flex items-center gap-4">
                <span className="w-[40px] shrink-0 text-right font-mono text-sm text-star sm:w-[52px] sm:text-base">{entry.year}</span>
                <span
                  className="relative z-10 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-void"
                  style={{ backgroundColor: 'var(--accent)' }}
                  aria-hidden
                />
                {anchor && <span className="text-xs text-dim">「{anchor.label}」</span>}
              </div>

              <div className="ml-[64px] mt-3 grid gap-2 sm:ml-[84px]">
                {entry.points.map((p) => {
                  const category = categoryById.get(p.categoryId)!
                  return (
                    <Link
                      key={p.id}
                      to={`/point/${p.id}`}
                      className="group flex items-baseline gap-3 rounded-[2px] px-3 py-2 transition-colors hover:bg-wash"
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
