// FEAT-004 时间线：按提出年份纵向排布 + 时代分段 + 领域筛选
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { repo } from '../../data/repo';

const COLORS = ['var(--d1)', 'var(--d2)', 'var(--d3)', 'var(--d4)', 'var(--d5)', 'var(--d6)'];
const ERAS: Array<{ from: number; to: number; name: string }> = [
  { from: 1800, to: 2005, name: '经典与奠基' },
  { from: 2006, to: 2013, name: '表示学习时代' },
  { from: 2014, to: 2021, name: '深度学习时代' },
  { from: 2022, to: 2100, name: '大模型时代' },
];

export default function TimelinePage() {
  const domains = repo.getDomains();
  const [filter, setFilter] = useState<string>('all');
  const points = useMemo(
    () => (filter === 'all' ? repo.getTimeline() : repo.getTimeline().filter((p) => p.domain === filter)),
    [filter],
  );
  const grouped = useMemo(() => {
    return ERAS.map((era) => ({ ...era, items: points.filter((p) => p.year >= era.from && p.year <= era.to) })).filter(
      (g) => g.items.length,
    );
  }, [points]);

  return (
    <main>
      <div className="filter-row" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <div className="seg">
          <button className="opt" aria-selected={filter === 'all'} onClick={() => setFilter('all')}>全部</button>
          {domains.map((d) => (
            <button key={d.key} className="opt" aria-selected={filter === d.key} onClick={() => setFilter(d.key)}>
              <span className="dot" style={{ background: COLORS[d.colorIndex % 6] }} />
              {d.name}
            </button>
          ))}
        </div>
      </div>
      {grouped.map((g) => (
        <section key={g.name}>
          <div className="era" style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '30px 0 8px', fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', color: 'var(--ink-3)' }}>
            <span style={{ width: 20, height: 1, background: 'var(--accent)' }} />
            {g.name}
          </div>
          {g.items.map((p) => (
            <Link key={p.id} to={`/point/${p.id}`} className="row" style={{ textDecoration: 'none', color: 'inherit' }}>
              <span className="yr mono">{p.year}</span>
              <span className="dot" style={{ background: COLORS[p.domain.length % 6] }} />
              <span className="name">{p.title}</span>
              <span className="desc">{p.summary}</span>
            </Link>
          ))}
        </section>
      ))}
    </main>
  );
}
