import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getPointDetailView } from '@/backend/knowledge-service'
import { useProfileStore } from '@/backend/profile-store'
import { CategoryBadge, EmptyState, ImportanceStars } from '@/components/ui'

/** 依赖小图：前置 ← 本知识点 → 衍生（同屏三列微缩图谱） */
function DepMiniGraph({ color, prereqs, derived }: { color: string; prereqs: { id: string; title: string }[]; derived: { id: string; title: string }[] }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
      <div className="flex flex-col items-end gap-1.5">
        {prereqs.length === 0 && <span className="text-xs text-dim/60">（无前置）</span>}
        {prereqs.map((p) => (
          <Link key={p.id} to={`/point/${p.id}`} className="max-w-full truncate text-xs text-dim underline-offset-2 hover:text-accent hover:underline">
            {p.title}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-0 text-dim" aria-hidden>
        <span>→</span>
        <span className="mx-2 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span>→</span>
      </div>
      <div className="flex flex-col items-start gap-1.5">
        {derived.length === 0 && <span className="text-xs text-dim/60">（暂无衍生）</span>}
        {derived.map((p) => (
          <Link key={p.id} to={`/point/${p.id}`} className="max-w-full truncate text-xs text-dim underline-offset-2 hover:text-accent hover:underline">
            {p.title}
          </Link>
        ))}
      </div>
    </div>
  )
}

/**
 * Focus Mode（iA Writer 招牌）：开启后除「当前段」外全部退灰。
 * 当前段 = 视口中点最近的段落，随滚动移动；hover 也可临时点亮。
 */
function useFocusMode(enabled: boolean, containerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!enabled) return
    const container = containerRef.current
    if (!container) return
    const paragraphs = Array.from(container.querySelectorAll<HTMLElement>('p'))
    const markActive = () => {
      const center = window.innerHeight / 2
      let best: HTMLElement | null = null
      let bestDist = Number.POSITIVE_INFINITY
      for (const p of paragraphs) {
        const r = p.getBoundingClientRect()
        if (r.bottom < 0 || r.top > window.innerHeight) continue
        const dist = Math.abs((r.top + r.bottom) / 2 - center)
        if (dist < bestDist) {
          bestDist = dist
          best = p
        }
      }
      for (const p of paragraphs) p.classList.toggle('prose-active', p === best)
    }
    markActive()
    window.addEventListener('scroll', markActive, { passive: true })
    window.addEventListener('resize', markActive)
    return () => {
      window.removeEventListener('scroll', markActive)
      window.removeEventListener('resize', markActive)
      for (const p of paragraphs) p.classList.remove('prose-active')
    }
  }, [enabled, containerRef])
}

/** 知识点详情：定义、解读、论文、依赖、相关、趋势、笔记与进度 */
export function KnowledgePointPage() {
  const { pointId } = useParams()
  const detail = pointId ? getPointDetailView(pointId) : null
  const [focusMode, setFocusMode] = useState(false)
  const proseRef = useRef<HTMLDivElement>(null)
  useFocusMode(focusMode, proseRef)

  const profile = useProfileStore((s) => s.profile)
  const toggleFavorite = useProfileStore((s) => s.toggleFavorite)
  const setProgress = useProfileStore((s) => s.setProgress)
  const setNote = useProfileStore((s) => s.setNote)

  if (!detail) {
    return <EmptyState title="未找到该知识点" action={{ to: '/graph', label: '去图谱探索' }} />
  }

  const { point, category, trend, papers, prerequisites, relatedPoints, derived } = detail
  const favorited = profile.favorites.includes(point.id)
  const read = profile.progress[point.id] === true

  return (
    <article className="rise-in mx-auto max-w-[42rem]">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <Link to={`/domain/${category.id}`}>
            <CategoryBadge category={category} />
          </Link>
          <span className="font-mono text-xs text-dim">{point.year}</span>
          <ImportanceStars value={point.importance} />
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setFocusMode(!focusMode)}
              aria-pressed={focusMode}
              className={`px-1 py-1.5 text-xs transition-colors ${
                focusMode ? 'font-bold text-star underline underline-offset-4 decoration-accent' : 'text-dim hover:text-star'
              }`}
            >
              专注
            </button>
            <button
              onClick={() => setProgress(point.id, !read)}
              className={`px-1 py-1.5 text-xs transition-colors ${
                read ? 'font-bold text-star' : 'text-dim hover:text-star'
              }`}
            >
              {read ? '✓ 已读' : '标记已读'}
            </button>
            <button
              onClick={() => toggleFavorite(point.id)}
              aria-label={favorited ? '取消收藏' : '收藏'}
              className={`px-1 py-1.5 text-xs transition-colors ${
                favorited ? 'font-bold text-star' : 'text-dim hover:text-star'
              }`}
            >
              {favorited ? '★ 已收藏' : '☆ 收藏'}
            </button>
          </div>
        </div>
        <h1 className="font-display mt-3 text-3xl leading-snug">{point.title}</h1>
        {point.aliases.length > 0 && <p className="mt-1 text-xs text-dim">别名：{point.aliases.join(' · ')}</p>}
        <p className="mt-5 text-lg leading-relaxed text-star">{point.summary}</p>
      </header>

      <section ref={proseRef} className={`prose-knowledge mt-6 text-sm ${focusMode ? 'prose-focus' : ''}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{point.detail}</ReactMarkdown>
      </section>

      {papers.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-base">关键论文</h2>
          <ul className="mt-2">
            {papers.map((paper) => (
              <li key={paper.id} className="py-2 text-sm">
                <span className="text-star">{paper.title}</span>
                <span className="ml-2 font-mono text-xs text-dim">
                  {paper.authors.slice(0, 2).join(', ')}
                  {paper.authors.length > 2 ? ' et al.' : ''} · {paper.year}
                  {paper.venue ? ` · ${paper.venue}` : ''}
                </span>
                {paper.url && (
                  <a href={paper.url} target="_blank" rel="noreferrer" className="ml-2 text-xs text-accent underline underline-offset-2">
                    原文 ↗
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-12">
        <h2 className="font-display text-base">依赖关系</h2>
        <p className="mb-4 mt-1 text-xs text-dim">左：需要先懂的前置 · 右：建立在其上的衍生/相关</p>
        <DepMiniGraph color={category.color} prereqs={prerequisites} derived={derived} />
        <Link to="/graph" className="mt-4 inline-block text-xs text-accent underline underline-offset-2">
          在全景图谱中查看 →
        </Link>
      </section>

      {point.related.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-base">相关知识点</h2>
          <p className="mt-2 leading-loose">
            {relatedPoints.map((rel, i) => (
              <span key={rel.id}>
                {i > 0 && <span className="text-faint"> · </span>}
                <Link to={`/point/${rel.id}`} className="text-sm text-star underline-offset-4 hover:text-accent hover:underline">
                  {rel.title}
                </Link>
              </span>
            ))}
          </p>
        </section>
      )}

      {point.trend && (
        <section className="mt-12">
          <p className="text-xs text-accent">发展方向（编辑标注）</p>
          <p className="mt-1 text-sm leading-relaxed text-star">{point.trend}</p>
          {trend && (
            <Link to="/roadmap" className="mt-3 inline-block text-xs text-accent underline underline-offset-2">
              领域整体趋势：{trend.headline} →
            </Link>
          )}
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-display text-base">我的笔记</h2>
        <p className="mt-1 text-xs text-dim">仅保存在本机浏览器中</p>
        <textarea
          defaultValue={profile.notes[point.id] ?? ''}
          onBlur={(e) => setNote(point.id, e.target.value)}
          rows={3}
          placeholder="写下你的理解、疑问或联想…（失焦即保存）"
          className="mt-2 w-full resize-y rounded-lg border border-edge bg-panel px-3 py-2 text-sm text-star outline-none placeholder:text-dim/50 focus:border-accent/60"
        />
      </section>
    </article>
  )
}
