import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getHomeView } from '@/backend/knowledge-service'
import { KnowledgeRow } from '@/components/ui'
import type { Category } from '@/backend'

// ---- 星图几何（静态，模块级）：墨点为网，六大领域彩点为锚 ----
const NODES: { x: number; y: number; r: number; o: number; domain?: string }[] = [
  { x: 36, y: 126, r: 2, o: 0.3 },
  { x: 108, y: 76, r: 2.4, o: 0.3 },
  { x: 188, y: 98, r: 4, o: 0.8, domain: 'ml-foundation' },
  { x: 258, y: 134, r: 2, o: 0.3 },
  { x: 332, y: 86, r: 2.4, o: 0.3 },
  { x: 398, y: 56, r: 4, o: 0.8, domain: 'nlp' },
  { x: 468, y: 102, r: 2.4, o: 0.3 },
  { x: 520, y: 42, r: 1.8, o: 0.3 },
  { x: 566, y: 130, r: 4, o: 0.8, domain: 'cv' },
  { x: 648, y: 96, r: 2.4, o: 0.3 },
  { x: 704, y: 148, r: 1.8, o: 0.3 },
  { x: 738, y: 50, r: 4, o: 0.8, domain: 'rl' },
  { x: 806, y: 142, r: 2, o: 0.3 },
  { x: 864, y: 108, r: 4, o: 0.8, domain: 'llm' },
  { x: 934, y: 28, r: 1.8, o: 0.3 },
  { x: 988, y: 68, r: 4, o: 0.8, domain: 'math-theory' },
  { x: 1014, y: 128, r: 1.8, o: 0.3 },
]
const LINKS = [
  [0, 1], [1, 2], [2, 3], [2, 4], [3, 4], [4, 5], [5, 6], [6, 7], [6, 8],
  [8, 9], [9, 10], [9, 11], [10, 12], [11, 13], [12, 13], [13, 14], [14, 15], [15, 16],
]
const MARKS = [[76, 34], [296, 22], [452, 152], [618, 20], [902, 158], [98, 158]]
const DUST = [[222, 26], [410, 142], [556, 10], [668, 12], [782, 18], [956, 146], [16, 62]]

/** 自由涨落参数：确定性伪随机（按序号散开的相位/频率），amp 为主振幅（SVG 用户单位） */
function drift(i: number, amp: number) {
  return {
    ax: amp * (0.5 + ((i * 0.31) % 0.5)),
    ay: amp * (0.8 + ((i * 0.53) % 0.6)),
    wx: 0.45 + ((i * 0.37) % 0.45),
    wy: 0.55 + ((i * 0.23) % 0.55),
    px: i * 2.4,
    py: i * 1.7,
  }
}
const NODE_DRIFT = NODES.map((_, i) => drift(i, 4.5))
const DUST_DRIFT = DUST.map((_, i) => drift(i + 11, 2.4))
const MARK_DRIFT = MARKS.map((_, i) => drift(i + 5, 1.8))

/**
 * iA 式细线星座 v4：整张星图自主呼吸——每个节点按各自相位/振幅缓慢涨落，
 * 连线端点逐帧跟随（不脱节），星尘缓闪；无任何鼠标耦合。
 * 入场仍为一次性「线条描绘 → 星点浮现」；系统减动效时全部静止。
 * 彩点是可漫游入口：hover 浮出领域名（标签按需，同图谱页惯例），点击进入领域页。
 */
function Constellation({ categories, className }: { categories: Category[]; className?: string }) {
  const catById = new Map(categories.map((c) => [c.id, c]))
  const nodeEls = useRef<(SVGElement | null)[]>([])
  const lineEls = useRef<(SVGLineElement | null)[]>([])
  const dustEls = useRef<(SVGElement | null)[]>([])
  const markEls = useRef<(SVGElement | null)[]>([])

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const offX = new Float64Array(NODES.length)
    const offY = new Float64Array(NODES.length)
    const tick = () => {
      const s = performance.now() / 1000
      const sway = (els: (SVGElement | null)[], fs: ReturnType<typeof drift>[]) => {
        for (let k = 0; k < fs.length; k++) {
          const f = fs[k]
          const ox = Math.sin(s * f.wx + f.px) * f.ax
          const oy = Math.sin(s * f.wy + f.py) * f.ay
          els[k]?.setAttribute('transform', `translate(${ox.toFixed(2)} ${oy.toFixed(2)})`)
        }
      }
      for (let i = 0; i < NODES.length; i++) {
        const f = NODE_DRIFT[i]
        offX[i] = Math.sin(s * f.wx + f.px) * f.ax
        offY[i] = Math.sin(s * f.wy + f.py) * f.ay
        nodeEls.current[i]?.setAttribute('transform', `translate(${offX[i].toFixed(2)} ${offY[i].toFixed(2)})`)
      }
      for (let j = 0; j < LINKS.length; j++) {
        const [a, b] = LINKS[j]
        const el = lineEls.current[j]
        if (el) {
          el.setAttribute('x1', (NODES[a].x + offX[a]).toFixed(2))
          el.setAttribute('y1', (NODES[a].y + offY[a]).toFixed(2))
          el.setAttribute('x2', (NODES[b].x + offX[b]).toFixed(2))
          el.setAttribute('y2', (NODES[b].y + offY[b]).toFixed(2))
        }
      }
      sway(dustEls.current, DUST_DRIFT)
      sway(markEls.current, MARK_DRIFT)
    }
    // 定时器驱动（约 30fps，涨落周期 6–11s 足够顺滑）：不依赖 rAF 帧调度，
    // 部分嵌入面板会冻结 rAF 导致纹丝不动
    const timer = window.setInterval(tick, 33)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <svg viewBox="0 0 1040 170" className={`constellation ${className ?? ''}`} preserveAspectRatio="xMinYMid meet">
      {LINKS.map(([a, b], i) => (
        <line key={`${a}-${b}`} ref={(el) => { lineEls.current[i] = el }}
          x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y}
          stroke="var(--panel-edge)" strokeWidth="1" pathLength={1}
          style={{ animationDelay: `${i * 40}ms` }} />
      ))}
      {DUST.map(([x, y], i) => (
        <circle key={`d${i}`} className="const-twinkle" ref={(el) => { dustEls.current[i] = el }}
          cx={x} cy={y} r={1.3} fill="var(--star-faint)" opacity={0.4}
          style={{ animationDelay: `${600 + i * 40}ms, ${2400 + i * 260}ms` }} />
      ))}
      {MARKS.map(([x, y], i) => (
        <path key={`m${i}`} className="const-twinkle" ref={(el) => { markEls.current[i] = el }}
          d={`M ${x - 3.5} ${y} h 7 M ${x} ${y - 3.5} v 7`}
          stroke="var(--star-faint)" strokeWidth="1" opacity={0.55}
          style={{ animationDelay: `${640 + i * 40}ms, ${2800 + i * 300}ms` }} />
      ))}
      {NODES.map((n, i) => {
        const cat = n.domain ? catById.get(n.domain) : undefined
        if (!cat) {
          return <circle key={i} ref={(el) => { nodeEls.current[i] = el }}
            cx={n.x} cy={n.y} r={n.r} fill="var(--star)" opacity={n.o}
            style={{ animationDelay: `${360 + i * 30}ms` }} />
        }
        return (
          <Link key={i} to={`/domain/${cat.id}`} className="const-anchor" aria-label={cat.name}>
            <g ref={(el) => { nodeEls.current[i] = el }}>
              <circle className="const-hit" cx={n.x} cy={n.y} r={12} fill="transparent" />
              <circle className="const-anchor-dot" cx={n.x} cy={n.y} r={n.r} fill={cat.color} opacity={n.o}
                style={{ animationDelay: `${360 + i * 30}ms` }} />
              <text className="const-anchor-label" x={n.x} y={n.y - 14} textAnchor="middle" aria-hidden="true">
                {cat.name}
              </text>
            </g>
          </Link>
        )
      })}
    </svg>
  )
}

export function HomePage() {
  const { stats, domainRows, latest, top } = getHomeView()

  return (
    <div className="rise-in">
      {/* 主视觉：星图线稿 → 等宽日期线 → 大标题（文字优先） */}
      <section className="-mt-6 pb-12 pt-4">
        <Constellation categories={domainRows.map(({ category }) => category)} className="mb-10 w-full max-w-[880px]" />
        <p className="font-mono text-xs tracking-[0.12em] text-faint">{stats.yearSpan}</p>
        <h1 className="mt-5 font-display text-3xl leading-[1.3] text-star">
          把人工智能的知识
          <br />
          绘成一张可漫游的星图
        </h1>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/graph"
            className="pixel-press rounded-lg bg-star px-5 py-2.5 text-sm text-void hover:opacity-90"
          >
            进入知识图谱
          </Link>
          <Link to="/roadmap" className="inline-flex items-center px-2 py-2.5 text-sm text-dim underline-offset-4 hover:text-star hover:underline">
            查看发展路线 →
          </Link>
        </div>
      </section>

      {/* 统计行：顶部发丝线收口，大数字 + 灰标签 */}
      <section className="mt-10 grid grid-cols-2 gap-y-8 border-t border-edge pt-8 sm:grid-cols-3">
        {[
          { label: '知识点', value: stats.points },
          { label: '领域', value: stats.categories },
          { label: '关键论文', value: stats.papers },
        ].map((item) => (
          <div key={item.label} className="pr-6">
            <div className="font-mono text-2xl text-star">{item.value}</div>
            <div className="mt-1 text-xs text-dim">{item.label}</div>
          </div>
        ))}
      </section>

      {/* 领域入口：iA 式列表行 */}
      <section className="mt-12">
        <h2 className="font-display text-xl">六大领域</h2>
        <div className="mt-3">
          {domainRows.map(({ category: c, count }) => {
            return (
              <Link
                key={c.id}
                to={`/domain/${c.id}`}
                className="group flex items-baseline gap-4 rounded-[2px] px-2 py-3 transition-colors hover:bg-wash"
              >
                <span className="h-2 w-2 shrink-0 self-center rounded-full" style={{ backgroundColor: c.color }} />
                <span className="shrink-0 text-base font-bold text-star group-hover:text-accent">{c.name}</span>
                <span className="truncate text-sm text-dim">{c.description}</span>
                <span className="ml-auto shrink-0 font-mono text-xs text-faint">{count}</span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* 最新收录 / 高影响力：单列文字流（iA 式） */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl">最新收录</h2>
          <Link to="/timeline" className="text-xs text-dim hover:text-accent">
            全部时间线 →
          </Link>
        </div>
        <div className="mt-3 space-y-4">
          {latest.map(({ point, category }) => (
            <KnowledgeRow key={point.id} point={point} category={category} />
          ))}
        </div>
      </section>
      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl">高影响力</h2>
          <Link to="/graph" className="text-xs text-dim hover:text-accent">
            图谱视角 →
          </Link>
        </div>
        <div className="mt-3 space-y-4">
          {top.map(({ point, category }) => (
            <KnowledgeRow key={point.id} point={point} category={category} />
          ))}
        </div>
      </section>
    </div>
  )
}
