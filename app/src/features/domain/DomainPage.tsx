import { Link, useParams } from 'react-router-dom'
import { getDomainView } from '@/backend/knowledge-service'
import { KnowledgeCard, EmptyState } from '@/components/ui'

/** 领域页：概览 + 路线速览 + 知识点列表 */
export function DomainPage() {
  const { categoryId } = useParams()
  const view = categoryId ? getDomainView(categoryId) : null

  if (!view) {
    return <EmptyState title="未找到该领域" action={{ to: '/', label: '回到首页' }} />
  }

  const { category, points, trend, roadmap } = view

  return (
    <div className="rise-in">
      <header className="pb-2" style={{ borderLeft: `3px solid ${category.color}` }}>

        <h1 className="font-display mt-1 text-2xl">{category.name}</h1>
        <p className="mt-2 max-w-xl text-sm text-dim">{category.description}</p>
        <div className="mt-3 flex gap-5 font-mono text-xs text-dim">
          <span>{points.length} 个知识点</span>
          <span>{roadmap?.stages.length ?? 0} 段发展路线</span>
        </div>
      </header>

      {trend && (
      <section className="mt-10">
        <p className="text-xs text-dim">发展趋势预测（编辑标注）</p>
        <h2 className="font-display mt-1 text-lg">{trend.headline}</h2>
        <ul className="mt-3 space-y-2">
          {trend.directions.map((d) => (
            <li key={d.title} className="text-sm leading-relaxed">
              <span className="text-star">↗ {d.title}</span>
              <span className="text-dim"> — {d.description}</span>
            </li>
          ))}
        </ul>
        <Link to="/roadmap" className="mt-3 inline-block text-xs text-accent underline underline-offset-2">
          查看完整发展路线 →
        </Link>
      </section>
      )}

      <section className="mt-8">
        <h2 className="font-display text-xl">知识脉络</h2>
        <div className="mt-4 space-y-5">
          {points.map((p) => (
            <KnowledgeCard key={p.id} point={p} category={category} />
          ))}
        </div>
      </section>
    </div>
  )
}
