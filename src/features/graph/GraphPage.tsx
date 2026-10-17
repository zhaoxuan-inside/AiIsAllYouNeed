// FEAT-003 图谱：星图册线条 + d3-force 布局 + 透镜聚焦 + 详情栏（DESIGN.md §7）
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide,
  type SimulationNodeDatum, type SimulationLinkDatum,
} from 'd3-force';
import { repo } from '../../data/repo';
import { IconArrow } from '../../components/icons';

const COLORS = ['var(--d1)', 'var(--d2)', 'var(--d3)', 'var(--d4)', 'var(--d5)', 'var(--d6)'];

interface N extends SimulationNodeDatum {
  id: string; title: string; domain: string; year: number; importance: number; r: number;
  x?: number; y?: number;
}
interface L extends SimulationLinkDatum<N> {
  rel: boolean;
}

export default function GraphPage() {
  const all = repo.getTimeline();
  const domains = repo.getDomains();
  const [filter, setFilter] = useState<string>('all');
  const [sel, setSel] = useState<string | null>('transformer');
  const [hover, setHover] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [pos, setPos] = useState<Map<string, { x: number; y: number }>>(new Map());

  const points = useMemo(
    () => (filter === 'all' ? all : all.filter((p) => p.domain === filter)),
    [all, filter],
  );
  const pointSet = useMemo(() => new Set(points.map((p) => p.id)), [points]);

  const { nodes, links } = useMemo(() => {
    const nodes: N[] = points.map((p) => ({
      id: p.id, title: p.title, domain: p.domain, year: p.year, importance: p.importance, r: 6 + p.importance * 2,
    }));
    const links: L[] = [];
    for (const p of points) {
      for (const d of p.deps) if (pointSet.has(d)) links.push({ source: p.id, target: d, rel: false });
      for (const r of p.related) if (pointSet.has(r)) links.push({ source: p.id, target: r, rel: true });
    }
    return { nodes, links };
  }, [points, pointSet]);

  // 布局只跑一次（force 定位；渲染自绘，不重引重库）
  useEffect(() => {
    const W = 760, H = 560;
    const sim = forceSimulation<N>(nodes)
      .force('link', forceLink<N, L>(links).id((d) => d.id).distance(110).strength(0.4))
      .force('charge', forceManyBody().strength(-220))
      .force('center', forceCenter(W / 2, H / 2))
      .force('collide', forceCollide<N>().radius((d) => d.r + 16))
      .stop();
    for (let i = 0; i < 240; i++) sim.tick();
    setPos(new Map(nodes.map((n) => [n.id, { x: n.x ?? W / 2, y: n.y ?? H / 2 }])));
    return () => {
      sim.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const selected = sel ? repo.getPoint(sel) : null;
  const byId = new Map(points.map((p) => [p.id, p]));
  const domainColor = (key: string) => COLORS[key.length % 6];

  return (
    <main>
      <div className="filter-row" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        <div className="seg">
          <button className="opt" aria-selected={filter === 'all'} onClick={() => setFilter('all')}>
            全部
          </button>
          {domains.map((d) => (
            <button key={d.key} className="opt" aria-selected={filter === d.key} onClick={() => setFilter(d.key)}>
              <span className="dot" style={{ background: COLORS[d.colorIndex % 6] }} />
              {d.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 18 }}>
        <div className="graph-canvas paper" style={{ position: 'relative', minHeight: 560, overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute', inset: 0, opacity: 0.5,
              backgroundImage: 'radial-gradient(color-mix(in srgb, var(--ink) 24%, transparent) 0.6px, transparent 0.6px)',
              backgroundSize: '26px 26px',
              maskImage: 'radial-gradient(120% 100% at 50% 45%, #000 30%, transparent 78%)',
            }}
          />
          <svg ref={svgRef} viewBox="0 0 760 560" width="100%" height="560" style={{ position: 'relative', zIndex: 1 }}>
            <g stroke="color-mix(in srgb, var(--ink) 20%, transparent)" fill="none" strokeWidth="1">
              {links.map((l, i) => {
                const sid = typeof l.source === 'string' ? l.source : (l.source as N).id;
                const tid = typeof l.target === 'string' ? l.target : (l.target as N).id;
                const s = pos.get(sid);
                const t = pos.get(tid);
                if (!s || !t) return null;
                const mx = (s.x + t.x) / 2, my = (s.y + t.y) / 2;
                const hot = sel === (l.source as N).id || sel === (l.target as N).id;
                return (
                  <path
                    key={i}
                    d={`M${s.x} ${s.y} Q${mx} ${my} ${t.x} ${t.y}`}
                    strokeDasharray={l.rel ? '2 5' : undefined}
                    style={{ transition: 'stroke .25s' }}
                    stroke={hot ? 'color-mix(in srgb, var(--accent) 65%, transparent)' : undefined}
                  />
                );
              })}
            </g>
            {nodes.map((n) => {
              const p = pos.get(n.id);
              if (!p) return null;
              const c = domainColor(n.domain);
              const active = sel === n.id || hover === n.id;
              return (
                <g
                  key={n.id}
                  transform={`translate(${p.x} ${p.y})`}
                  style={{ cursor: 'pointer', transition: 'transform .2s' }}
                  onClick={() => setSel(n.id)}
                  onMouseEnter={() => setHover(n.id)}
                  onMouseLeave={() => setHover(null)}
                >
                  {active && (
                    <circle r={n.r + 14} fill="none" stroke={c} strokeWidth="1.4" opacity=".6" className="halo" />
                  )}
                  <circle r={n.r} fill={c} />
                  <circle r={n.r * 0.55} fill="url(#nShadow)" />
                  <circle r={n.r * 0.42} fill="rgba(255,255,255,.45)" transform={`translate(${-n.r * 0.22} ${-n.r * 0.22})`} />
                  {(active || n.importance >= 5) && (
                    <text
                      y={-n.r - 6}
                      textAnchor="middle"
                      style={{ fontFamily: 'var(--font-text)', fontWeight: 600, fontSize: 12, fill: 'var(--ink)', paintOrder: 'stroke', stroke: 'var(--canvas)', strokeWidth: 3 }}
                    >
                      {n.title}
                    </text>
                  )}
                </g>
              );
            })}
            <defs>
              <radialGradient id="nShadow" cx="50%" cy="72%" r="58%">
                <stop offset="0%" stopColor="#000" stopOpacity=".22" />
                <stop offset="100%" stopColor="#000" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
          <div className="glegend" style={{ position: 'absolute', left: 16, bottom: 16, zIndex: 4, display: 'flex', gap: 12, fontSize: 12, color: 'var(--ink-2)' }}>
            <span>
              <svg width="20" height="6"><line x1="0" y1="3" x2="20" y2="3" stroke="color-mix(in srgb, var(--ink) 30%, transparent)" strokeWidth="1.2" /></svg>
              依赖
            </span>
            <span>
              <svg width="20" height="6"><line x1="0" y1="3" x2="20" y2="3" stroke="color-mix(in srgb, var(--ink) 20%, transparent)" strokeWidth="1.2" strokeDasharray="2 4" /></svg>
              相关
            </span>
            <span className="faint">星越大 = 被依赖越多</span>
          </div>
        </div>

        <aside className="rail glass" style={{ padding: '26px 24px', alignSelf: 'start' }}>
          {selected ? (
            <>
              <span className="dot" style={{ background: domainColor(selected.domain), width: 10, height: 10 }} />
              <h3 style={{ fontFamily: 'var(--font-disp)', fontWeight: 700, fontSize: 22, margin: '.5em 0 .15em' }}>{selected.title}</h3>
              <div className="faint mono caption">{selected.domain} · {selected.year}</div>
              <p className="muted" style={{ fontSize: 14.5, marginTop: '.7em' }}>{selected.summary}</p>
              <div className="sec" style={{ fontFamily: 'var(--font-text)', fontSize: 11.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-3)', margin: '22px 0 9px' }}>依赖</div>
              <div className="muted" style={{ fontSize: 14 }}>
                {selected.deps.map((d) => byId.get(d)?.title ?? d).join(' · ') || '无'}
              </div>
              <div className="sec" style={{ fontFamily: 'var(--font-text)', fontSize: 11.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-3)', margin: '22px 0 9px' }}>相关</div>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {repo.getRelated(selected.id).map((r) => (
                  <span key={r.id} className="chip">{r.title}</span>
                ))}
              </div>
              <p style={{ marginTop: 22 }}>
                <Link className="btn btn-ghost" to={`/point/${selected.id}`}>
                  查看完整详情 <IconArrow size={15} />
                </Link>
              </p>
            </>
          ) : (
            <p className="muted">点击任意星点查看详情。</p>
          )}
        </aside>
      </div>
    </main>
  );
}
