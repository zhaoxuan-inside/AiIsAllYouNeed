import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getKnowledgeBase, getFullTimeline } from '@/data/knowledge-context'
import { KnowledgeCard, domainTextColor } from '@/components/ui'

/** 纸上星域主视觉：墨色星辰 + 领域色十字星芒，随主题（纸墨/星夜）自适应重绘。 */
const DOMAIN_COLORS = ['#5B8DEF', '#3FBEA8', '#E0705A', '#9D7BE8', '#E5B85C', '#D46A9E']

function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let baseColor = '#1f2a52'
    let alphaScale = 0.4

    const syncTheme = () => {
      const style = getComputedStyle(document.documentElement)
      baseColor = style.getPropertyValue('--star').trim() || '#1f2a52'
      // 暗色主题星辰更亮更明显，纸面主题更淡更安静
      alphaScale = document.documentElement.dataset.theme === 'night' ? 0.55 : 0.32
    }
    syncTheme()

    // 主题切换时重读颜色
    const observer = new MutationObserver(syncTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    let w = 0
    let h = 0
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

    const stars = Array.from({ length: 110 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.1 + 0.5,
      spark: Math.random() < 0.1,
      color: Math.random() < 0.14 ? DOMAIN_COLORS[Math.floor(Math.random() * DOMAIN_COLORS.length)] : null,
      phase: Math.random() * Math.PI * 2,
    }))

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      for (const s of stars) {
        const twinkle = reduced ? 0.7 : 0.55 + 0.45 * Math.sin(t * 0.001 + s.phase)
        const color = s.color ?? baseColor
        ctx.globalAlpha = Math.min(1, twinkle * alphaScale * (s.spark ? 1.6 : 1))
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2)
        ctx.fill()
        if (s.spark) {
          // 细十字星芒
          const x = s.x * w
          const y = s.y * h
          ctx.fillRect(x - s.r * 3, y - 0.5, s.r * 6, 1)
          ctx.fillRect(x - 0.5, y - s.r * 3, 1, s.r * 6)
        }
      }
      ctx.globalAlpha = 1
      if (!reduced) raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
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
            <Link to="/roadmap" className="rounded-lg border border-edge px-5 py-2.5 text-sm text-star hover:border-gold/60">
              查看发展路线
            </Link>
          </div>
        </div>
      </section>

      {/* 统计条 */}
      <section className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] pixel-shadow border border-edge bg-edge sm:grid-cols-4">
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
                className="group rounded-[var(--radius-card)] pixel-shadow border border-edge bg-panel p-5"
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${c.color}66`)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '')}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm" style={{ color: domainTextColor(c.color) }}>
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
