import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Category, KnowledgePoint } from '@/backend'

/**
 * HelpHint：补充说明角标（?）。不影响直接使用的说明文字收进这里，
 * hover / 键盘 focus / 点击（触屏）唤出，纯边框 tooltip。
 */
export function HelpHint({ text, label = '说明' }: { text: string; label?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <span
      className="relative inline-flex align-middle"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="grid h-4 w-4 place-items-center rounded-full border border-edge text-[10px] leading-none text-faint transition-colors hover:border-accent hover:text-accent"
      >
        ?
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 top-6 z-50 w-64 -translate-x-1/2 border border-edge bg-void px-3 py-2 text-xs leading-relaxed text-dim"
        >
          {text}
        </span>
      )}
    </span>
  )
}

/** 领域徽章（iA 式）：彩色圆点承担领域标识，文字一律墨色，1px 发丝边 */
export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-dim">
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: category.color }} />
      {category.name}
    </span>
  )
}

/** 重要性（等宽数字 + 星形，强调蓝） */
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
    <div className="flex flex-col items-center gap-3 px-8 py-14 text-center">
      <p className="text-sm text-dim">{title}</p>
      {hint && <p className="max-w-sm text-xs text-faint">{hint}</p>}
      {action && (
        <Link to={action.to} className="mt-1 text-sm text-accent underline underline-offset-4">
          {action.label}
        </Link>
      )}
    </div>
  )
}

/** 知识点条目（iA 式列表行：留白分隔）。showCategory=false 用于领域页（上下文已含领域，免冗余） */
export function KnowledgeCard({
  point,
  category,
  showCategory = true,
}: {
  point: KnowledgePoint
  category: Category
  showCategory?: boolean
}) {
  return (
    <Link
      to={`/point/${point.id}`}
      className="group block py-3 transition-colors hover:bg-wash"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-base font-bold text-star group-hover:text-accent">{point.title}</h3>
        <span className="shrink-0 font-mono text-xs text-faint">{point.year}</span>
      </div>
      <div className="mt-1 flex items-center gap-3">
        {showCategory && (
          <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-dim">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: category.color }} />
            {category.name}
          </span>
        )}
        <span className="truncate text-sm text-dim">{point.summary}</span>
      </div>
    </Link>
  )
}

/** 领域筛选（iA 式文字 chips：彩点标识，选中加粗） */
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
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {categories.map((c) => {
        const active = selected.includes(c.id)
        return (
          <button
            key={c.id}
            onClick={() => onToggle(c.id)}
            className={`inline-flex items-center gap-1.5 text-xs transition-colors ${
              active ? 'font-bold text-star' : 'text-dim hover:text-star'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.color }} />
            {c.name}
          </button>
        )
      })}
      {selected.length > 0 && (
        <button onClick={onClear} className="text-xs text-accent underline underline-offset-2">
          重置
        </button>
      )}
    </div>
  )
}
