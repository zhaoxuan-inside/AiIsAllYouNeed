// FEAT-001 首页全景：星图页 + 统计 + 领域索引 + 知识流
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { repo } from '../../data/repo';
import { IconArrow } from '../../components/icons';

const DOMAIN_COLORS = ['var(--d1)', 'var(--d2)', 'var(--d3)', 'var(--d4)', 'var(--d5)', 'var(--d6)'];

function Constellation() {
  const domains = repo.getDomains();
  return (
    <svg viewBox="0 0 1000 200" width="100%" height="200" aria-hidden="true" style={{ overflow: 'visible' }}>
      <g className="al" style={{ stroke: 'color-mix(in srgb, var(--ink) 20%, transparent)', fill: 'none', strokeWidth: 1 }}>
        <path d="M96 124 L232 66 L372 120 L494 52 L636 114 L774 58 L914 118" />
        <path d="M96 124 L300 150 L372 120 L560 154 L636 114 L914 118" opacity=".5" />
        <path d="M232 66 L494 52 L774 58" />
      </g>
      <g fill="color-mix(in srgb, var(--ink) 32%, transparent)">
        {[
          [150, 44], [418, 28], [700, 38], [250, 176], [602, 182], [862, 164], [70, 80], [958, 76], [540, 96],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.2" />
        ))}
      </g>
      {domains.map((d, i) => {
        const pts = [
          [96, 124], [232, 66], [372, 120], [494, 52], [774, 58], [914, 118],
        ];
        const [x, y] = pts[i % pts.length];
        return (
          <g key={d.key} className="astar" style={{ transformBox: 'fill-box', transformOrigin: 'center', cursor: 'pointer' }}>
            <circle cx={x} cy={y} r="11" fill="none" stroke={DOMAIN_COLORS[d.colorIndex % 6]} opacity=".45" strokeWidth="1" />
            <circle cx={x} cy={y} r="4.5" fill={DOMAIN_COLORS[d.colorIndex % 6]} />
            <title>{d.name}</title>
          </g>
        );
      })}
    </svg>
  );
}

export default function HomePage() {
  const [tab, setTab] = useState<'最新' | '重要'>('最新');
  const domains = repo.getDomains();
  const points = repo.getTimeline();
  const flow = useMemo(
    () => (tab === '重要' ? [...points].sort((a, b) => b.importance - a.importance) : [...points].reverse()),
    [tab, points],
  );
  const domainCount = (key: string) => points.filter((p) => p.domain === key).length;
  const yearSpan = points.length ? `${points[0].year} — ${points[points.length - 1].year}` : '—';

  return (
    <main className="screen">
      <Constellation />
      <div className="eyebrow">{yearSpan}</div>
      <h1 className="hero">
        一份 AI 知识的<span style={{ whiteSpace: 'nowrap' }}>全景星图</span>
      </h1>
      <p className="lede">以知识点为核心，展示依赖脉络、编年时间线与领域路线——像翻一本星图册，安静地读，随时漫游。</p>
      <div className="stats mono">
        <span>
          <b>{points.length}</b> 知识点
        </span>
        <span>
          <b>{domains.length}</b> 领域
        </span>
        <span>
          <b>{points.reduce((n, p) => n + p.papers.length, 0)}</b> 论文
        </span>
        <span>
          <b>{yearSpan.split(' — ')[0]}</b> 年起
        </span>
      </div>

      <div style={{ marginTop: 12 }}>
        {domains.map((d) => (
          <Link key={d.key} to={`/domain/${d.key}`} className="drow" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="dot" style={{ background: DOMAIN_COLORS[d.colorIndex % 6] }} />
            <span>{d.name}</span>
            <span className="bar">
              <span className="faint mono caption">{domainCount(d.key)}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="sec-head">
        <h2>知识流</h2>
        <div className="seg">
          {(['最新', '重要'] as const).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} className="opt" onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div>
        {flow.slice(0, 6).map((p) => (
          <Link key={p.id} to={`/point/${p.id}`} className="row" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="dot" style={{ background: DOMAIN_COLORS[p.domain.length % 6] }} />
            <span className="name">{p.title}</span>
            <span className="desc">{p.summary}</span>
            <span className="yr mono">{p.year}</span>
          </Link>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        <Link className="btn btn-ghost" to="/point/transformer">
          从 Transformer 读起 <IconArrow size={15} />
        </Link>
      </div>
    </main>
  );
}
