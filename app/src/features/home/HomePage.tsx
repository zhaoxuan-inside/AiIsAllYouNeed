import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getKnowledgeBase, getFullTimeline } from '@/data/knowledge-context'
import { KnowledgeCard } from '@/components/ui'

/** 像素星域主视觉：低分辨率网格绘制方块星辰，整数倍放大（image-rendering: pixelated）。 */
const PIXEL_SCALE = 6

function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0

    const COLORS = ['#5B8DEF', '#3FBEA8', '#E0705A', '#9D7BE8', '#F0C34E', '#D46A9E']
    const gw = Math.max(1, Math.floor(canvas.clientWidth / PIXEL_SCALE))
    const gh = Math.max(1, Math.floor(canvas.clientHeight / PIXEL_SCALE))
    canvas.width = gw
    canvas.height = gh

    // 星辰落在网格上：稀疏排布保持安静——大部分 1px，少量 2px 亮星，稀少领域色十字星芒
    const stars = Array.from({ length: Math.floor(gw * gh * 0.007) }, () => ({
      x: Math.floor(Math.random() * gw),
      y: Math.floor(Math.random() * gh),
      big: Math.random() < 0.2,
      cross: Math.random() < 0.12,
      color: Math.random() < 0.16 ? COLORS[Math.floor(Math.random() * COLORS.length)] : '#F2F5FF',
      phase: Math.random() * Math.PI * 2,
    }))

    const draw = (t: number) => {
      ctx.clearRect(0, 0, gw, gh)
      for (const s of stars) {
        const twinkle = reduced ? 0.75 : 0.35 + 0.65 * Math.round(Math.sin(t * 0.002 + s.phase) * 0.5 + 0.5)
        ctx.globalAlpha = twinkle
        ctx.fillStyle = s.color
        const size = s.big ? 2 : 1
        ctx.fillRect(s.x, s.y, size, size)
        if (s.cross) {
          ctx.fillRect(s.x - 1, s.y, 1, 1)
          ctx.fillRect(s.x + size, s.y, 1, 1)
          ctx.fillRect(s.x, s.y - 1, size, 1)
          ctx.fillRect(s.x, s.y + size, size, 1)
        }
      }
      ctx.globalAlpha = 1
      if (!reduced) raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  return <canvas ref={canvasRef} className="pixelated absolute inset-0 h-full w-full" aria-hidden />
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
              className="pixel-press pixel-shadow rounded-lg bg-gold px-5 py-2.5 text-sm text-gold-ink"
            >
              进入知识图谱
            </Link>
            <Link to="/roadmap" className="rounded-lg border-2 border-edge px-5 py-2.5 text-sm text-star hover:border-gold/60">
              查看发展路线
            </Link>
          </div>
        </div>
      </section>

      {/* 统计条 */}
      <section className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] pixel-shadow border-2 border-edge bg-edge sm:grid-cols-4">
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
                className="group rounded-[var(--radius-card)] pixel-shadow border-2 border-edge bg-panel p-5"
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${c.color}66`)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '')}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm" style={{ color: c.color }}>
                    <span className="h-2 w-2 rounded-none" style={{ backgroundColor: c.color }} />
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
