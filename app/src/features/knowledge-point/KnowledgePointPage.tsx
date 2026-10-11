import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { autolinkKnowledge, getPointDetailView } from '@/backend/knowledge-service'
import { useProfileStore } from '@/backend/profile-store'
import { CategoryBadge, EmptyState, HelpHint, ImportanceStars } from '@/components/ui'

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

  const { point, category, trend, papers, prerequisites, appliedBy, relatedPoints } = detail
  const favorited = profile.favorites.includes(point.id)
  const read = profile.progress[point.id] === true

  return (
    <article className="rise-in">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <Link to={`/domain/${category.id}`}>
            <CategoryBadge category={category} />
          </Link>
          <span className="font-mono text-xs text-dim">{point.year}</span>
          <ImportanceStars value={point.importance} />
          <div className="ml-auto flex gap-4">
            <button
              onClick={() => setFocusMode(!focusMode)}
              aria-pressed={focusMode}
              className={`relative px-1 py-2 text-xs transition-colors after:absolute after:-inset-1.5 after:content-[''] ${
                focusMode ? 'font-bold text-star underline underline-offset-4 decoration-accent' : 'text-dim hover:text-star'
              }`}
            >
              专注
            </button>
            <button
              onClick={() => setProgress(point.id, !read)}
              className={`relative px-1 py-2 text-xs transition-colors after:absolute after:-inset-1.5 after:content-[''] ${
                read ? 'font-bold text-star' : 'text-dim hover:text-star'
              }`}
            >
              {read ? '✓ 已读' : '标记已读'}
            </button>
            <button
              onClick={() => toggleFavorite(point.id)}
              aria-label={favorited ? '取消收藏' : '收藏'}
              className={`relative px-1 py-2 text-xs transition-colors after:absolute after:-inset-1.5 after:content-[''] ${
                favorited ? 'font-bold text-star' : 'text-dim hover:text-star'
              }`}
            >
              {favorited ? '★ 已收藏' : '☆ 收藏'}
            </button>
          </div>
        </div>
        <h1 className="font-display mt-3 text-3xl leading-snug">{point.title}</h1>
        {point.aliases.length > 0 && <p className="mt-1 text-xs text-dim">别名：{point.aliases.join(' · ')}</p>}
        <p className="mt-5 max-w-[38em] text-lg leading-relaxed text-star">{point.summary}</p>
      </header>

      <section ref={proseRef} className={`prose-knowledge mt-6 ${focusMode ? 'prose-focus' : ''}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{autolinkKnowledge(point.detail, point.id)}</ReactMarkdown>
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
                {(() => {
                  const href = paper.url ?? (paper.doi ? `https://doi.org/${paper.doi}` : undefined)
                  const label = paper.url || paper.doi ? '原文 ↗' : '检索 ↗'
                  const target = href ?? `https://scholar.google.com/scholar?q=${encodeURIComponent(paper.title)}`
                  return (
                    <a href={target} target="_blank" rel="noreferrer" className="ml-2 text-xs text-accent underline underline-offset-2">
                      {label}
                    </a>
                  )
                })()}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-12 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="font-display text-base">依赖</h2>
          <p className="mt-2 leading-loose">
            {prerequisites.length === 0 && <span className="text-xs text-faint">无前置</span>}
            {prerequisites.map((p, i) => (
              <span key={p.id}>
                {i > 0 && <span className="text-faint"> · </span>}
                <Link to={`/point/${p.id}`} className="text-sm text-star underline-offset-4 hover:text-accent hover:underline">
                  {p.title}
                </Link>
              </span>
            ))}
          </p>
        </div>
        <div>
          <h2 className="font-display text-base">应用</h2>
          <p className="mt-2 leading-loose">
            {appliedBy.length === 0 && <span className="text-xs text-faint">暂无应用</span>}
            {appliedBy.map((p, i) => (
              <span key={p.id}>
                {i > 0 && <span className="text-faint"> · </span>}
                <Link to={`/point/${p.id}`} className="text-sm text-star underline-offset-4 hover:text-accent hover:underline">
                  {p.title}
                </Link>
              </span>
            ))}
          </p>
        </div>
        <Link to={`/graph?focus=${point.id}`} className="text-xs text-accent underline underline-offset-2 sm:col-span-2">
          在全景图谱中定位 →
        </Link>
      </section>

      {point.related.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-base">相关</h2>
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
          <p className="flex items-center gap-1 text-xs text-dim">
            发展方向
            <HelpHint label="发展方向说明" text="由编辑整理的方向判断，非算法生成。" />
          </p>
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
