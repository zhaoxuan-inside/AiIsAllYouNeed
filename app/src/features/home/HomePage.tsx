import { Link } from 'react-router-dom'
import { getKnowledgeBase, getFullTimeline } from '@/data/knowledge-context'
import { KnowledgeCard } from '@/components/ui'

/** iA 式细线星座：静态 SVG 线稿，墨色极淡，不与文字争夺注意力 */
function Constellation({ className }: { className?: string }) {
  const nodes = [
    [80, 150, '#5B8DEF'], [190, 90, '#1A1A1A'], [300, 160, '#3FBEA8'], [420, 70, '#1A1A1A'],
    [520, 140, '#E0705A'], [640, 60, '#1A1A1A'], [760, 130, '#9D7BE8'], [880, 80, '#1A1A1A'],
    [960, 150, '#D46A9E'],
  ] as const
  const links = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8]]
  return (
    <svg viewBox="0 0 1040 220" className={className} aria-hidden preserveAspectRatio="xMidYMid meet">
      {links.map(([a, b]) => (
        <line key={`${a}-${b}`} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]}
          stroke="var(--panel-edge)" strokeWidth="1" />
      ))}
      {nodes.map(([x, y, c], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 4 : 2.5} fill={c} opacity={i % 3 === 0 ? 0.85 : 0.4} />
      ))}
    </svg>
  )
}

export function HomePage() {
  const kb = getKnowledgeBase()
  const timeline = getFullTimeline()
  const years = timeline.map((t) => t.year)
  const latest = [...kb.points].sort((a, b) => b.year - a.year).slice(0, 6)
  const top = [...kb.points].sort((a, b) => b.importance - a.importance || b.year - a.year).slice(0, 6)

  return (
    <div className="rise-in">
      {/* 主视觉：文字优先，星座线稿收于标题上方 */}
      <section className="relative -mx-4 -mt-6 border-b border-edge px-6 pb-12 pt-14 lg:-mx-8 lg:px-8">
        <Constellation className="mb-10 h-24 w-full max-w-[880px] opacity-70" />
        <div className="mx-auto w-full max-w-[1120px]">
          <p className="text-xs text-dim">AIS ALL YOU NEED · 知识即星空</p>
          <h1 className="font-display mt-3 text-3xl leading-snug text-star sm:text-4xl">
            把人工智能的知识
            <br />
            绘成一张可漫游的星图
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-dim">
            以知识点为星、依赖关系为星线、时间为轨道——浏览 {kb.points.length} 个 AI 核心知识点的发展脉络、
            领域路线与趋势预测。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/graph"
              className="pixel-press rounded-lg bg-star px-5 py-2.5 text-sm text-void hover:opacity-90"
            >
              进入知识图谱
            </Link>
            <Link to="/roadmap" className="inline-flex items-center px-2 py-2.5 text-sm text-dim underline-offset-4 hover:text-star hover:underline">
              查看发展路线
            </Link>
          </div>
        </div>
      </section>

      {/* 统计行：大数字 + 灰标签，发丝线分栏 */}
      <section className="mt-10 grid grid-cols-2 border-b border-edge sm:grid-cols-4">
        {[
          { label: '知识点', value: kb.points.length },
          { label: '领域', value: kb.categories.length },
          { label: '关键论文', value: kb.papers.length },
          { label: '年份跨度', value: `${years[0]}–${years.at(-1)}` },
        ].map((item, i) => (
          <div key={item.label} className={`py-5 pr-6 ${i > 0 ? 'sm:border-l sm:border-edge sm:pl-6' : ''}`}>
            <div className="font-mono text-2xl text-star">{item.value}</div>
            <div className="mt-1 text-xs text-dim">{item.label}</div>
          </div>
        ))}
      </section>

      {/* 领域入口：iA 式列表行 */}
      <section className="mt-12">
        <h2 className="font-display text-xl">六大领域</h2>
        <div className="mt-3">
          {kb.categories.map((c) => {
            const count = kb.points.filter((p) => p.categoryId === c.id).length
            return (
              <Link
                key={c.id}
                to={`/domain/${c.id}`}
                className="group flex items-baseline gap-4 border-b border-edge py-4 transition-colors hover:bg-wash"
              >
                <span className="h-2 w-2 shrink-0 self-center rounded-full" style={{ backgroundColor: c.color }} />
                <span className="shrink-0 text-base font-bold text-star group-hover:text-accent">{c.name}</span>
                <span className="shrink-0 text-xs text-faint">{c.nameEn}</span>
                <span className="truncate text-sm text-dim">{c.description}</span>
                <span className="ml-auto shrink-0 font-mono text-xs text-faint">{count}</span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* 双列：最新 / 高影响力 */}
      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl">最新收录</h2>
            <Link to="/timeline" className="text-xs text-dim hover:text-accent">
              全部时间线 →
            </Link>
          </div>
          <div className="mt-2">
            {latest.map((p) => (
              <KnowledgeCard key={p.id} point={p} category={kb.categoryById.get(p.categoryId)!} />
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl">高影响力</h2>
            <Link to="/graph" className="text-xs text-dim hover:text-accent">
              图谱视角 →
            </Link>
          </div>
          <div className="mt-2">
            {top.map((p) => (
              <KnowledgeCard key={p.id} point={p} category={kb.categoryById.get(p.categoryId)!} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
