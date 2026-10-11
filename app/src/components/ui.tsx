import { Link } from 'react-router-dom'
import type { Category, KnowledgePoint } from '@/domain/schema'

/** 领域徽章：领域色 12% 透明底 + 领域色文字 + 圆点 */
export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-none px-2.5 py-0.5 text-xs"
      style={{ backgroundColor: `${category.color}1f`, color: category.color }}
    >
      <span className="h-1.5 w-1.5 rounded-none" style={{ backgroundColor: category.color }} />
      {category.name}
    </span>
  )
}

/** 重要性星标（等宽数字 + 星形） */
export function ImportanceStars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-dim" title={`影响力 ${value}/5`}>
      <span className="font-mono">{value}</span>
      <span aria-hidden>★</span>
    </span>
  )
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: { to: string; label: string } }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] pixel-shadow border-2 border-edge bg-panel px-8 py-14 text-center">
      <span className="text-2xl" aria-hidden>
        ✦
      </span>
      <p className="text-sm text-dim">{title}</p>
      {hint && <p className="max-w-sm text-xs text-dim/70">{hint}</p>}
      {action && (
        <Link to={action.to} className="mt-1 rounded-lg border-2 border-edge px-4 py-2 text-sm text-gold transition-colors hover:border-gold">
          {action.label}
        </Link>
      )}
    </div>
  )
}

/** 知识点卡片（列表通用） */
export function KnowledgeCard({ point, category }: { point: KnowledgePoint; category: Category }) {
  return (
    <Link
      to={`/point/${point.id}`}
      className="group block rounded-[var(--radius-card)] pixel-shadow border-2 border-edge bg-panel p-4"
      style={{ ['--hover-c' as string]: category.color }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${category.color}55`)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '')}
    >
      <div className="flex items-center justify-between gap-3">
        <CategoryBadge category={category} />
        <span className="font-mono text-xs text-dim">{point.year}</span>
      </div>
      <h3 className="font-display mt-2 text-base text-star group-hover:text-gold">{point.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-dim">{point.summary}</p>
    </Link>
  )
}

/** 领域筛选 chips（图谱/时间线共用） */
export function CategoryFilter({
  categories,
  selected,
  onToggle,
  onClear,
}: {
  categories: Category[]
  selected: string[]
  onToggle: (id: string) => void
  onClear: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {categories.map((c) => {
        const active = selected.includes(c.id)
        return (
          <button
            key={c.id}
            onClick={() => onToggle(c.id)}
            className="inline-flex items-center gap-1.5 rounded-none border px-3 py-1 text-xs transition-colors"
            style={{
              borderColor: active ? c.color : 'var(--panel-edge)',
              color: active ? c.color : 'var(--star-dim)',
              backgroundColor: active ? `${c.color}1a` : 'transparent',
            }}
          >
            <span className="h-1.5 w-1.5 rounded-none" style={{ backgroundColor: c.color }} />
            {c.name}
          </button>
        )
      })}
      {selected.length > 0 && (
        <button onClick={onClear} className="px-2 text-xs text-dim underline underline-offset-2 hover:text-star">
          重置
        </button>
      )}
    </div>
  )
}
