// FEAT-002 领域页：领域聚合 + 规模 + 关键点 + 三视图入口 + 趋势仅入口（单一呈现）
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { repo } from '../../data/repo';
import { IconArrow } from '../../components/icons';

const COLORS = ['var(--d1)', 'var(--d2)', 'var(--d3)', 'var(--d4)', 'var(--d5)', 'var(--d6)'];

export default function DomainPage() {
  const { key } = useParams<{ key: string }>();
  const domain = repo.getDomains().find((d) => d.key === key);
  const points = useMemo(() => (key ? repo.getPointsByDomain(key) : []), [key]);
  const roadmap = key ? repo.getRoadmap(key) : null;
  const hasTrend = Boolean(roadmap?.trend);

  if (!domain) {
    return (
      <main>
        <h1 className="hero" style={{ fontSize: 30 }}>未找到该领域</h1>
        <Link className="btn btn-primary" to="/">返回星图</Link>
      </main>
    );
  }

  const important = [...points].sort((a, b) => b.importance - a.importance).slice(0, 6);
  const color = COLORS[domain.colorIndex % 6];

  return (
    <main>
      <div className="eyebrow">领域</div>
      <h1 className="hero" style={{ fontSize: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="dot" style={{ background: color, width: 14, height: 14 }} />
        {domain.name}
      </h1>
      <p className="lede" style={{ fontSize: 15 }}>{domain.summary}</p>

      <div className="stats mono" style={{ marginTop: 10 }}>
        <span><b>{points.length}</b> 知识点</span>
        <span><b>{points.reduce((n, p) => n + p.papers.length, 0)}</b> 论文</span>
        <span><b>{points[0]?.year ?? '—'} — {points[points.length - 1]?.year ?? ''}</b> 年份跨度</span>
      </div>

      <div className="sec-head"><h2>关键知识点</h2></div>
      <div>
        {important.map((p) => (
          <Link key={p.id} to={`/point/${p.id}`} className="row" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="dot" style={{ background: color }} />
            <span className="name">{p.title}</span>
            <span className="desc">{p.summary}</span>
            <span className="yr mono">{p.year}</span>
          </Link>
        ))}
      </div>

      <div className="sec-head"><h2>进入视图</h2></div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link className="btn btn-ghost" to="/graph">在图谱中查看 <IconArrow size={15} /></Link>
        <Link className="btn btn-ghost" to="/timeline">在时间线中查看 <IconArrow size={15} /></Link>
        <Link className="btn btn-ghost" to="/roadmap">查看该领域路线 <IconArrow size={15} /></Link>
      </div>

      {/* 单一呈现铁律：趋势只在此给入口，正文主呈现在路线页（overview_prd §6 / DESIGN.md §12） */}
      {hasTrend && (
        <div className="sec-head" style={{ marginTop: 34 }}>
          <h2>领域趋势</h2>
          <Link className="btn btn-ghost" to="/roadmap" style={{ fontSize: 13 }}>查看完整路线 <IconArrow size={13} /></Link>
        </div>
      )}
    </main>
  );
}
