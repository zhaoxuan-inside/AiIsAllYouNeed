import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getRoadmapView } from '@/backend/knowledge-service'
import { ImportanceStars, HelpHint } from '@/components/ui'

/** 发展路线：领域 Tab + 阶段泳道（基础→进阶→前沿），依赖顺序编号 */
export function RoadmapPage() {
  const [activeId, setActiveId] = useState('ml-foundation')
  const view = useMemo(() => getRoadmapView(activeId), [activeId])

  if (!view) return null
  const { categories, roadmap, trend } = view

  return (
    <div className="rise-in">
      <h1 className="font-display text-2xl">发展路线</h1>

      {/* 领域 Tab */}
      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveId(c.id)}
            className={`inline-flex items-center gap-1.5 pb-1 text-sm transition-colors ${
              activeId === c.id ? 'border-b-2 border-accent font-bold text-star' : 'text-dim hover:text-star'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.color }} />
            {c.name}
          </button>
        ))}
      </div>

      {/* 领域趋势（发展轨迹预测）：与领域页同构的行内列表，无卡片 */}
      {trend && (
        <section className="mt-10">
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
        </section>
      )}

      {roadmap.orderViolations.length > 0 && (
        <p className="mt-4 text-xs text-dim">
          编辑提示：{roadmap.orderViolations.join('；')}
        </p>
      )}

      {/* 阶段泳道 */}
      <div className="mt-10 grid gap-x-10 gap-y-8 lg:grid-cols-3">
        {roadmap.stages.map((stage, stageIdx) => (
          <section key={stage.name}>
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-base">
                <span className="mr-2 font-mono text-dim">{stageIdx + 1}</span>
                {stage.name}
              </h2>
              <span className="font-mono text-xs text-dim">{stage.points.length}</span>
            </div>
            {stage.description && <p className="mt-1 text-xs leading-relaxed text-dim">{stage.description}</p>}
            <ol className="mt-3 space-y-2">
              {stage.points.map((p, i) => (
                <li key={p.id}>
                  <Link
                    to={`/point/${p.id}`}
                    className="group flex items-center gap-3 rounded-[2px] px-2.5 py-2 transition-colors hover:bg-wash"
                  >
                    <span className="font-mono text-xs text-dim">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-sm text-star group-hover:text-accent">{p.title}</span>
                    <span className="ml-auto">
                      <ImportanceStars value={p.importance} />
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      {roadmap.unassigned.length > 0 && (
        <p className="mt-4 text-xs text-dim">
          另有 {roadmap.unassigned.length} 个知识点未编入本路线：
          {roadmap.unassigned.map((p, i) => (
            <span key={p.id}>
              {i > 0 && '、'}
              <Link to={`/point/${p.id}`} className="underline underline-offset-2 hover:text-accent">
                {p.title}
              </Link>
            </span>
          ))}
        </p>
      )}
    </div>
  )
}
