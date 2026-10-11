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
import { getFullGraph, getKnowledgeBase, useFilterStore } from '@/data/knowledge-context'
import { buildGraph } from '@/domain/graph'
import { CategoryFilter, EmptyState } from '@/components/ui'
import type { GraphEdge, GraphNode } from '@/domain/graph'

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
  const kb = getKnowledgeBase()
  const navigate = useNavigate()
  const selected = useFilterStore((s) => s.selectedCategories)
  const toggleCategory = useFilterStore((s) => s.toggleCategory)
  const clearCategories = useFilterStore((s) => s.clearCategories)
  const [edgeKind, setEdgeKind] = useState<'prerequisite' | 'related' | 'all'>('prerequisite')
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const graph = useMemo(
    () => (selected.length === 0 ? getFullGraph() : buildGraph(kb, { categoryIds: selected })),
    [kb, selected],
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
    // 预热 300 步，静态呈现（无持续动画，符合动效克制原则）
    for (let i = 0; i < 300; i++) sim.tick()
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

  const selectedPoint = selectedNode ? kb.pointById.get(selectedNode) : null

  return (
    <div className="rise-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">知识图谱</h1>
          <p className="mt-1 text-sm text-dim">
            实线箭头 = 依赖（先学前置）· 虚线 = 相关 · 节点大小 = 影响力 · 拖拽节点、滚轮缩放
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-edge p-1 text-xs">
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
              className={`rounded px-3 py-1.5 transition-colors ${edgeKind === kind ? 'bg-gold text-gold-ink' : 'text-dim hover:text-star'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <CategoryFilter categories={kb.categories} selected={selected} onToggle={toggleCategory} onClear={clearCategories} />
      </div>

      {nodes.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="当前筛选下没有知识点" hint="调整领域筛选以查看图谱。" action={{ to: '/graph', label: '重置筛选' }} />
        </div>
      ) : (
        <div
          ref={containerRef}
          className="relative mt-4 overflow-hidden rounded-[var(--radius-card)] border border-edge bg-panel"
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onWheel={(e) => {
            e.preventDefault()
            setZoom((z) => Math.min(2.4, Math.max(0.5, z * (e.deltaY > 0 ? 0.92 : 1.08))))
          }}
        >
          <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className="h-[70vh] max-h-[640px] w-full touch-none" role="img" aria-label="知识依赖图谱">
            <g transform={`translate(${(VIEW.w * (1 - zoom)) / 2} ${(VIEW.h * (1 - zoom)) / 2}) scale(${zoom})`}>
              {visibleEdges.map((e, i) => {
                const a = nodeMap.get(e.from)
                const b = nodeMap.get(e.to)
                if (!a || !b) return null
                const related = e.kind === 'related'
                return (
                  <line
                    key={`${e.from}-${e.to}-${e.kind}-${i}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={related ? 'var(--star-dim)' : 'var(--star-dim)'}
                    strokeWidth={related ? 0.7 : 1.1}
                    strokeDasharray={related ? '3 4' : undefined}
                    opacity={related ? 0.35 : 0.55}
                    markerEnd={related ? undefined : 'url(#arrow)'}
                  />
                )
              })}
              {nodes.map((n) => {
                const color = kb.categoryById.get(n.categoryId)!.color
                const r = 4 + n.importance * 2
                const active = selectedNode === n.id
                return (
                  <g
                    key={n.id}
                    transform={`translate(${n.x} ${n.y})`}
                    onPointerDown={onNodePointerDown(n.id)}
                    onClick={() => {
                      if (!dragRef.current.moved) setSelectedNode(active ? null : n.id)
                    }}
                    className="cursor-pointer"
                  >
                    <circle r={r} fill={color} opacity={active ? 1 : 0.85} className={active ? 'node-glow' : undefined} style={{ color }} />
                    {(active || n.importance >= 4 || zoom > 1.4) && (
                      <text y={r + 12} textAnchor="middle" fontSize={10} fill="var(--star)" opacity={0.85}>
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
          {selectedPoint && (
            <aside className="absolute right-0 top-0 h-full w-full max-w-xs overflow-y-auto border-l border-edge bg-panel p-5">
              <button onClick={() => setSelectedNode(null)} className="float-right text-dim hover:text-star" aria-label="关闭">
                ✕
              </button>
              <span
                className="text-xs"
                style={{ color: kb.categoryById.get(selectedPoint.categoryId)!.color }}
              >
                ● {kb.categoryById.get(selectedPoint.categoryId)!.name}
              </span>
              <h2 className="font-display mt-2 text-lg">{selectedPoint.title}</h2>
              <p className="mt-1 font-mono text-xs text-dim">
                {selectedPoint.year} · 影响力 {selectedPoint.importance}/5
              </p>
              <p className="mt-3 text-sm leading-relaxed text-dim">{selectedPoint.summary}</p>
              <div className="mt-4 text-xs text-dim">
                前置依赖 {selectedPoint.prerequisites.length} · 衍生/相关 {selectedPoint.related.length + kb.points.filter((p) => p.prerequisites.includes(selectedPoint.id)).length}
              </div>
              <button
                onClick={() => navigate(`/point/${selectedPoint.id}`)}
                className="mt-4 w-full rounded-lg border border-gold/60 px-4 py-2 text-sm text-gold hover:bg-gold/10"
              >
                查看完整详情 →
              </button>
            </aside>
          )}
        </div>
      )}

      {/* 图例 */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-dim">
        {kb.categories.map((c) => (
          <span key={c.id} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
            {c.name}
          </span>
        ))}
        <Link to="/timeline" className="ml-auto text-dim hover:text-gold">
          按时间轴查看 →
        </Link>
      </div>
    </div>
  )
}
