import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getKnowledgeBase } from '@/data/knowledge-context'
import { useProfileStore } from '@/store/profile'
import { CategoryBadge, EmptyState, ImportanceStars } from '@/components/ui'

/** 依赖小图：前置 ← 本知识点 → 衍生（同屏三列微缩图谱） */
function DepMiniGraph({ pointId }: { pointId: string }) {
  const kb = getKnowledgeBase()
  const point = kb.pointById.get(pointId)!
  const prereqs = point.prerequisites.map((id) => kb.pointById.get(id)!).filter(Boolean)
  const derived = kb.points.filter((p) => p.prerequisites.includes(pointId) || p.related.includes(pointId)).slice(0, 8)
  const color = kb.categoryById.get(point.categoryId)!.color

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
      <div className="flex flex-col items-end gap-1.5">
        {prereqs.length === 0 && <span className="text-xs text-dim/60">（无前置）</span>}
        {prereqs.map((p) => (
          <Link key={p.id} to={`/point/${p.id}`} className="max-w-full truncate text-xs text-dim underline-offset-2 hover:text-gold hover:underline">
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
          <Link key={p.id} to={`/point/${p.id}`} className="max-w-full truncate text-xs text-dim underline-offset-2 hover:text-gold hover:underline">
            {p.title}
          </Link>
        ))}
      </div>
    </div>
  )
}

/** 知识点详情：定义、解读、论文、依赖、相关、趋势、笔记与进度 */
export function KnowledgePointPage() {
  const { pointId } = useParams()
  const kb = getKnowledgeBase()
  const point = pointId ? kb.pointById.get(pointId) : undefined

  const profile = useProfileStore((s) => s.profile)
  const toggleFavorite = useProfileStore((s) => s.toggleFavorite)
  const setProgress = useProfileStore((s) => s.setProgress)
  const setNote = useProfileStore((s) => s.setNote)

  if (!point) {
    return <EmptyState title="未找到该知识点" action={{ to: '/graph', label: '去图谱探索' }} />
  }

  const category = kb.categoryById.get(point.categoryId)!
  const trend = kb.trendByCategory.get(point.categoryId)
  const papers = point.paperIds.map((id) => kb.paperById.get(id)!).filter(Boolean)
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
              onClick={() => setProgress(point.id, !read)}
              className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                read ? 'border-gold bg-gold/10 text-gold' : 'border-edge text-dim hover:text-star'
              }`}
            >
              {read ? '✓ 已读' : '标记已读'}
            </button>
            <button
              onClick={() => toggleFavorite(point.id)}
              aria-label={favorited ? '取消收藏' : '收藏'}
              className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                favorited ? 'border-gold bg-gold/10 text-gold' : 'border-edge text-dim hover:text-star'
              }`}
            >
              {favorited ? '★ 已收藏' : '☆ 收藏'}
            </button>
          </div>
        </div>
        <h1 className="font-display mt-3 text-3xl leading-snug">{point.title}</h1>
        {point.aliases.length > 0 && <p className="mt-1 text-xs text-dim">别名：{point.aliases.join(' · ')}</p>}
        <p className="mt-4 border-l-2 pl-4 text-base leading-relaxed text-star" style={{ borderColor: category.color }}>
          {point.summary}
        </p>
      </header>

      <section className="prose-knowledge mt-6 text-sm">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{point.detail}</ReactMarkdown>
      </section>

      {papers.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-base">关键论文</h2>
          <ul className="mt-3 space-y-2">
            {papers.map((paper) => (
              <li key={paper.id} className="rounded-lg border border-edge bg-panel px-4 py-3 text-sm">
                <span className="text-star">{paper.title}</span>
                <span className="ml-2 font-mono text-xs text-dim">
                  {paper.authors.slice(0, 2).join(', ')}
                  {paper.authors.length > 2 ? ' et al.' : ''} · {paper.year}
                  {paper.venue ? ` · ${paper.venue}` : ''}
                </span>
                {paper.url && (
                  <a href={paper.url} target="_blank" rel="noreferrer" className="ml-2 text-xs text-gold underline underline-offset-2">
                    原文 ↗
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8 rounded-[var(--radius-card)] pixel-shadow border border-edge bg-panel p-5">
        <h2 className="font-display text-base">依赖关系</h2>
        <p className="mb-4 mt-1 text-xs text-dim">左：需要先懂的前置 · 右：建立在其上的衍生/相关</p>
        <DepMiniGraph pointId={point.id} />
        <Link to="/graph" className="mt-4 inline-block text-xs text-gold underline underline-offset-2">
          在全景图谱中查看 →
        </Link>
      </section>

      {point.related.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-base">相关知识点</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {point.related.map((id) => {
              const rel = kb.pointById.get(id)!
              const relColor = kb.categoryById.get(rel.categoryId)!.color
              return (
                <Link
                  key={id}
                  to={`/point/${id}`}
                  className="rounded-full border border-edge px-3 py-1.5 text-xs text-star transition-colors hover:border-gold/60"
                  style={{ borderLeft: `2px solid ${relColor}` }}
                >
                  {rel.title}
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {point.trend && (
        <section className="mt-8 rounded-[var(--radius-card)] pixel-shadow border border-gold/30 bg-gold/5 p-5">
          <p className="text-xs text-gold">发展方向（编辑标注）</p>
          <p className="mt-1 text-sm leading-relaxed text-star">{point.trend}</p>
          {trend && (
            <Link to="/roadmap" className="mt-3 inline-block text-xs text-gold underline underline-offset-2">
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
          className="mt-2 w-full resize-y rounded-lg border border-edge bg-panel px-3 py-2 text-sm text-star outline-none placeholder:text-dim/50 focus:border-gold/60"
        />
      </section>
    </article>
  )
}
