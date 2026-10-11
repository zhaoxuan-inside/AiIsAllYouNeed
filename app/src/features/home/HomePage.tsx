import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getKnowledgeBase, getFullTimeline } from '@/data/knowledge-context'
import { KnowledgeCard } from '@/components/ui'

/** 星域主视觉：唯一的大胆之处。漂移星点 + 少量领域色亮星，尊重 reduced-motion。 */
function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let w = 0
    let h = 0

    const COLORS = ['#5B8DEF', '#3FBEA8', '#E0705A', '#9D7BE8', '#E5B85C', '#D46A9E']
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const stars = Array.from({ length: 140 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2 + 0.3,
      speed: Math.random() * 0.00004 + 0.00001,
      color: Math.random() < 0.14 ? COLORS[Math.floor(Math.random() * COLORS.length)] : undefined,
      phase: Math.random() * Math.PI * 2,
    }))

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      for (const s of stars) {
        const x = ((s.x + t * s.speed) % 1) * w
        const y = s.y * h
        const twinkle = reduced ? 0.7 : 0.55 + 0.45 * Math.sin(t * 0.001 + s.phase)
        ctx.globalAlpha = twinkle
        ctx.fillStyle = s.color ?? '#E9EDF8'
        ctx.beginPath()
        ctx.arc(x, y, s.r, 0, Math.PI * 2)
        ctx.fill()
        if (s.color) {
          ctx.globalAlpha = twinkle * 0.25
          ctx.beginPath()
          ctx.arc(x, y, s.r * 3.2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
      if (!reduced) raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
}

export function HomePage() {
  const kb = getKnowledgeBase()
  const timeline = getFullTimeline()
  const years = timeline.map((t) => t.year)
  const latest = [...kb.points].sort((a, b) => b.year - a.year).slice(0, 6)
  const top = [...kb.points].sort((a, b) => b.importance - a.importance || b.year - a.year).slice(0, 6)

  return (
    <div className="rise-in">
      {/* 主视觉区（占首屏 55vh） */}
      <section className="relative -mx-4 -mt-6 flex h-[55vh] min-h-[320px] items-center overflow-hidden lg:-mx-8">
        <Starfield />
        <div className="relative z-10 mx-auto w-full max-w-[1120px] px-6">
          <p className="text-xs tracking-[0.3em] text-dim">AIS ALL YOU NEED · 知识即星空</p>
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
              className="rounded-lg bg-gold px-5 py-2.5 text-sm text-gold-ink transition-transform active:scale-[0.98]"
            >
              进入知识图谱
            </Link>
            <Link to="/roadmap" className="rounded-lg border border-edge px-5 py-2.5 text-sm text-star hover:border-gold/60">
              查看发展路线
            </Link>
          </div>
        </div>
      </section>

      {/* 统计条 */}
      <section className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-edge bg-edge sm:grid-cols-4">
        {[
          { label: '知识点', value: kb.points.length },
          { label: '领域', value: kb.categories.length },
          { label: '关键论文', value: kb.papers.length },
          { label: '年份跨度', value: `${years[0]}–${years.at(-1)}` },
        ].map((item) => (
          <div key={item.label} className="bg-panel px-5 py-4">
            <div className="font-mono text-xl text-star">{item.value}</div>
            <div className="mt-0.5 text-xs text-dim">{item.label}</div>
          </div>
        ))}
      </section>

      {/* 领域入口 */}
      <section className="mt-10">
        <h2 className="font-display text-xl">六大领域</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kb.categories.map((c) => {
            const count = kb.points.filter((p) => p.categoryId === c.id).length
            return (
              <Link
                key={c.id}
                to={`/domain/${c.id}`}
                className="group rounded-[var(--radius-card)] border border-edge bg-panel p-5 transition-all hover:-translate-y-px"
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${c.color}66`)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '')}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm" style={{ color: c.color }}>
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </span>
                  <span className="font-mono text-xs text-dim">{count}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-dim">{c.description}</p>
                <p className="mt-1 text-[11px] text-dim/60">{c.nameEn}</p>
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
            <Link to="/timeline" className="text-xs text-dim hover:text-gold">
              全部时间线 →
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            {latest.map((p) => (
              <KnowledgeCard key={p.id} point={p} category={kb.categoryById.get(p.categoryId)!} />
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl">高影响力</h2>
            <Link to="/graph" className="text-xs text-dim hover:text-gold">
              图谱视角 →
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            {top.map((p) => (
              <KnowledgeCard key={p.id} point={p} category={kb.categoryById.get(p.categoryId)!} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
