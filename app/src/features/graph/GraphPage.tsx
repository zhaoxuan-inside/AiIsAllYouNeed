import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type Simulation,
  type SimulationLinkDatum,
} from 'd3-force'
import { getGraphView, getPointDetailView } from '@/backend/knowledge-service'
import { useFilterStore } from '@/backend/filter-store'
import { CategoryFilter, EmptyState } from '@/components/ui'
import type { GraphEdge, GraphNode } from '@/backend'

interface PositionedNode extends GraphNode {
  x: number
  y: number
  vx?: number
  vy?: number
  fx?: number | null
  fy?: number | null
}

type SimEdge = GraphEdge & SimulationLinkDatum<PositionedNode>

const VIEW = { w: 960, h: 640 }

/** 力导向知识图谱：领域着色、依赖实线箭头、相关虚线；支持拖拽与缩放 */
export function GraphPage() {
  const navigate = useNavigate()
  const selected = useFilterStore((s) => s.selectedCategories)
  const toggleCategory = useFilterStore((s) => s.toggleCategory)
  const clearCategories = useFilterStore((s) => s.clearCategories)
  const [edgeKind, setEdgeKind] = useState<'prerequisite' | 'related' | 'all'>('prerequisite')
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  const { categories, graph } = useMemo(() => getGraphView(selected), [selected])
  const categoryColorById = useMemo(
    () => new Map(categories.map((c) => [c.id, c.color])),
    [categories],
  )

  const containerRef = useRef<HTMLDivElement>(null)
  const [nodes, setNodes] = useState<PositionedNode[]>([])
  const simRef = useRef<Simulation<PositionedNode, undefined> | null>(null)
  const [zoom, setZoom] = useState(1)
  const dragRef = useRef<{ id: string | null; moved: boolean }>({ id: null, moved: false })

  useEffect(() => {
    const initial: PositionedNode[] = graph.nodes.map((n, i) => ({
      ...n,
      x: VIEW.w / 2 + 220 * Math.cos((i / graph.nodes.length) * Math.PI * 2),
      y: VIEW.h / 2 + 220 * Math.sin((i / graph.nodes.length) * Math.PI * 2),
    }))
    const sim = forceSimulation<PositionedNode, SimEdge>(initial)
      .force(
        'charge',
        forceManyBody<PositionedNode>().strength((n: PositionedNode) => -60 - n.importance * 14),
      )
      .force('center', forceCenter(VIEW.w / 2, VIEW.h / 2))
      .force('collide', forceCollide<PositionedNode>((n: PositionedNode) => n.importance * 2.4 + 8))
      .force(
        'link',
        forceLink<PositionedNode, SimEdge>(
          // d3-force 以 source/target 字段读写端点（并会原地改写为节点引用）
          graph.edges.map((e) => ({ ...e, source: e.from, target: e.to })) as unknown as SimEdge[],
        )
          .id((n: PositionedNode) => n.id)
          .distance(72)
          .strength(0.35),
      )
      .stop()
    sim.velocityDecay(0.4)
    // 预热 500 步，静态呈现（无持续动画，符合动效克制原则）
    for (let i = 0; i < 500; i++) sim.tick()
    setNodes([...initial])
    simRef.current = sim
    return () => {
      sim.stop()
    }
  }, [graph])

  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes])
  const visibleEdges = useMemo(
    () => graph.edges.filter((e) => edgeKind === 'all' || e.kind === edgeKind),
    [graph.edges, edgeKind],
  )

  const toSvg = (e: React.PointerEvent) => {
    const rect = containerRef.current!.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * VIEW.w / zoom,
      y: ((e.clientY - rect.top) / rect.height) * VIEW.h / zoom,
    }
  }

  const onNodePointerDown = (id: string) => (e: React.PointerEvent) => {
    e.stopPropagation()
    dragRef.current = { id, moved: false }
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const { id } = dragRef.current
    if (!id) return
    const p = toSvg(e)
    dragRef.current.moved = true
    setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, fx: p.x, fy: p.y, x: p.x, y: p.y } : n)))
  }
  const onPointerUp = () => {
    dragRef.current = { id: null, moved: false }
    setNodes((ns) => ns.map((n) => ({ ...n, fx: null, fy: null })))
  }

  const selectedPoint = selectedNode ? getPointDetailView(selectedNode) : null
  const selectedDetail = selectedPoint?.point ?? null

  // 邻域聚焦（Obsidian 式）：hover 或选中时，焦点+直接邻居保持可见，其余退灰
  const neighborIds = useMemo(() => {
    const m = new Map<string, Set<string>>()
    const add = (a: string, b: string) => {
      let s = m.get(a)
      if (!s) {
        s = new Set()
        m.set(a, s)
      }
      s.add(b)
    }
    for (const e of graph.edges) {
      add(e.from, e.to)
      add(e.to, e.from)
    }
    return m
  }, [graph.edges])
  const focusId = hoveredNode ?? selectedNode
  const neighbors = focusId ? neighborIds.get(focusId) : undefined
  const mutedColor = (hex: string) => `color-mix(in srgb, ${hex} 55%, var(--void))`

  return (
    <div className="rise-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">知识图谱</h1>
          <p className="mt-1 text-sm text-dim">
            实线箭头 = 依赖（先学前置）· 虚线 = 相关 · 节点大小 = 影响力 · 拖拽节点、滚轮缩放
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          {(
            [
              ['prerequisite', '依赖'],
              ['related', '相关'],
              ['all', '全部'],
            ] as const
          ).map(([kind, label]) => (
            <button
              key={kind}
              onClick={() => setEdgeKind(kind)}
              className={`transition-colors ${edgeKind === kind ? 'font-bold text-star' : 'text-dim hover:text-star'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <CategoryFilter categories={categories} selected={selected} onToggle={toggleCategory} onClear={clearCategories} />
      </div>

      {nodes.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="当前筛选下没有知识点" hint="调整领域筛选以查看图谱。" action={{ to: '/graph', label: '重置筛选' }} />
        </div>
      ) : (
        <div
          ref={containerRef}
          className="relative mt-6"
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onWheel={(e) => {
            e.preventDefault()
            setZoom((z) => Math.min(2.4, Math.max(0.5, z * (e.deltaY > 0 ? 0.92 : 1.08))))
          }}
        >
          <div className="pointer-events-none absolute left-3 top-3 font-mono text-[11px] text-faint">
            {nodes.length} nodes · {visibleEdges.length} edges
          </div>
          <div className="absolute bottom-3 right-3 flex items-center gap-3 rounded-[2px] border border-edge bg-void/85 px-3 py-1.5 text-xs text-dim">
            <button onClick={() => setZoom((z) => Math.max(0.5, z * 0.85))} aria-label="缩小" className="hover:text-star">−</button>
            <span className="w-10 text-center font-mono text-[11px] text-faint">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.min(2.4, z * 1.15))} aria-label="放大" className="hover:text-star">＋</button>
            <button onClick={() => setZoom(1)} aria-label="重置缩放" className="hover:text-star">⤢</button>
          </div>
          <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className="h-[70vh] max-h-[640px] w-full touch-none" role="img" aria-label="知识依赖图谱">
            <g transform={`translate(${(VIEW.w * (1 - zoom)) / 2} ${(VIEW.h * (1 - zoom)) / 2}) scale(${zoom})`}>
              {visibleEdges.map((e, i) => {
                const a = nodeMap.get(e.from)
                const b = nodeMap.get(e.to)
                if (!a || !b) return null
                const related = e.kind === 'related'
                const touchesFocus = focusId != null && (e.from === focusId || e.to === focusId)
                return (
                  <line
                    key={`${e.from}-${e.to}-${e.kind}-${i}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={touchesFocus ? 'var(--star)' : 'var(--star-dim)'}
                    strokeWidth={touchesFocus ? 1.1 : related ? 0.6 : 0.8}
                    strokeDasharray={related ? '3 4' : undefined}
                    opacity={focusId ? (touchesFocus ? 0.9 : 0.04) : related ? 0.08 : 0.16}
                    markerEnd={touchesFocus ? 'url(#arrow)' : undefined}
                  />
                )
              })}
              {nodes.map((n) => {
                const color = categoryColorById.get(n.categoryId)!
                const r = 2.5 + n.importance * 1.2
                const active = selectedNode === n.id
                const inFocus = !focusId || n.id === focusId || neighbors?.has(n.id)
                const showLabel = focusId != null ? n.id === focusId || neighbors?.has(n.id) : false
                return (
                  <g
                    key={n.id}
                    transform={`translate(${n.x} ${n.y})`}
                    onPointerDown={onNodePointerDown(n.id)}
                    onPointerEnter={() => setHoveredNode(n.id)}
                    onPointerLeave={() => setHoveredNode((h) => (h === n.id ? null : h))}
                    onClick={() => {
                      if (!dragRef.current.moved) setSelectedNode(active ? null : n.id)
                    }}
                    className="cursor-pointer"
                  >
                    {active && <circle r={r + 3.5} fill="none" stroke="var(--accent)" strokeWidth={1} />}
                    <circle r={r} fill={mutedColor(color)} opacity={inFocus ? 1 : 0.12} />
                    {showLabel && (
                      <text y={r + 11} textAnchor="middle" fontSize={10} fill="var(--star)" opacity={0.9}>
                        {n.title}
                      </text>
                    )}
                  </g>
                )
              })}
              <defs>
                <marker id="arrow" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={5} markerHeight={5} orient="auto-start-reverse">
                  <path d="M0,0 L8,4 L0,8 z" fill="var(--star-dim)" />
                </marker>
              </defs>
            </g>
          </svg>

          {/* 详情侧栏（桌面）/ 底部抽屉（移动，样式简化为同组件） */}
          {selectedDetail && selectedPoint && (
            <aside className="absolute right-0 top-0 h-full w-full max-w-xs overflow-y-auto border-l border-edge bg-panel p-5">
              <button onClick={() => setSelectedNode(null)} className="float-right text-dim hover:text-star" aria-label="关闭">
                ✕
              </button>
              <span className="text-xs text-dim">
                <span style={{ color: selectedPoint.category.color }}>●</span> {selectedPoint.category.name}
              </span>
              <h2 className="font-display mt-2 text-lg">{selectedDetail.title}</h2>
              <p className="mt-1 font-mono text-xs text-dim">
                {selectedDetail.year} · 影响力 {selectedDetail.importance}/5
              </p>
              <p className="mt-3 text-sm leading-relaxed text-dim">{selectedDetail.summary}</p>
              {selectedPoint.prerequisites.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-dim">前置依赖</p>
                  <p className="mt-1 leading-loose">
                    {selectedPoint.prerequisites.map((p) => (
                      <Link key={p.id} to={`/point/${p.id}`} className="text-xs text-star underline-offset-2 hover:text-accent hover:underline">
                        {p.title}
                      </Link>
                    )).reduce((acc, el, i) => (i === 0 ? [el] : [...acc, <span key={`s${i}`} className="text-faint"> · </span>, el]), [] as React.ReactNode[])}
                  </p>
                </div>
              )}
              {selectedPoint.derived.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-dim">衍生 / 相关</p>
                  <p className="mt-1 leading-loose">
                    {selectedPoint.derived.map((p) => (
                      <Link key={p.id} to={`/point/${p.id}`} className="text-xs text-star underline-offset-2 hover:text-accent hover:underline">
                        {p.title}
                      </Link>
                    )).reduce((acc, el, i) => (i === 0 ? [el] : [...acc, <span key={`s${i}`} className="text-faint"> · </span>, el]), [] as React.ReactNode[])}
                  </p>
                </div>
              )}
              <button
                onClick={() => navigate(`/point/${selectedDetail.id}`)}
                className="mt-5 text-sm text-accent underline underline-offset-4"
              >
                查看完整详情 →
              </button>
            </aside>
          )}
        </div>
      )}

      {/* 图例 */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-dim">
        {categories.map((c) => (
          <span key={c.id} className="inline-flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: `color-mix(in srgb, ${c.color} 55%, var(--void))` }}
            />
            {c.name}
          </span>
        ))}
        <Link to="/timeline" className="ml-auto text-dim hover:text-accent">
          按时间轴查看 →
        </Link>
      </div>
    </div>
  )
}
