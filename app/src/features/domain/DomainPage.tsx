import { Link, useParams } from 'react-router-dom'
import { getDomainView } from '@/backend/knowledge-service'
import { KnowledgeRow, EmptyState, HelpHint } from '@/components/ui'

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
      <header>
        <h1 className="font-display flex items-center gap-2.5 text-2xl">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: category.color }} />
          {category.name}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-dim">{category.description}</p>
        <div className="mt-3 flex gap-5 font-mono text-xs text-dim">
          <span>{points.length} 个知识点</span>
          <span>{roadmap?.stages.length ?? 0} 段发展路线</span>
        </div>
      </header>

      {trend && (
      <section className="mt-12">
        <p className="flex items-center gap-1 text-xs text-dim">
          趋势预测
          <HelpHint label="趋势预测说明" text="由编辑整理的方向判断，非算法生成。" />
        </p>
        <h2 className="font-display mt-1 text-xl">{trend.headline}</h2>
        <ul className="mt-3 space-y-2">
          {trend.directions.map((d) => (
            <li key={d.title} className="text-sm leading-relaxed">
              <span className="font-bold text-star">{d.title}</span>
              <span className="text-dim"> — {d.description}</span>
            </li>
          ))}
        </ul>
        <Link to="/roadmap" className="mt-4 inline-block text-xs text-accent underline underline-offset-2">
          查看完整发展路线 →
        </Link>
      </section>
      )}

      <section className="mt-8">
        <h2 className="font-display text-xl">知识脉络</h2>
        <div className="mt-4 space-y-5">
          {points.map((p) => (
            <KnowledgeRow key={p.id} point={p} category={category} showCategory={false} />
          ))}
        </div>
      </section>
    </div>
  )
}
