// FEAT-005 路线：领域分阶段路径 + 趋势（主呈现唯一）
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { repo } from '../../data/repo';

const COLORS = ['var(--d1)', 'var(--d2)', 'var(--d3)', 'var(--d4)', 'var(--d5)', 'var(--d6)'];

export default function RoadmapPage() {
  const domains = repo.getDomains();
  const [key, setKey] = useState(domains[0]?.key ?? 'llm-gen');
  const roadmap = repo.getRoadmap(key);
  const d = domains.find((x) => x.key === key);

  return (
    <main>
      <div className="filter-row" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <div className="seg">
          {domains.map((x) => (
            <button key={x.key} className="opt" aria-selected={key === x.key} onClick={() => setKey(x.key)}>
              <span className="dot" style={{ background: COLORS[x.colorIndex % 6] }} />
              {x.name}
            </button>
          ))}
        </div>
      </div>
      {d && <p className="lede" style={{ fontSize: 15, marginBottom: 8 }}>{d.summary}</p>}
      {!roadmap ? (
        <p className="muted">该领域暂无路线。</p>
      ) : (
        roadmap.stages.map((s) => (
          <div key={s.key} className="lane" style={{ borderRadius: 'var(--r-panel)', padding: '19px 22px', marginBottom: 14, background: 'var(--hover)' }}>
            <h4 style={{ margin: '0 0 4px', fontSize: 11.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{s.name}</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px 18px', color: 'var(--ink-2)', fontSize: 14.5 }}>
              {s.pointIds.map((id, i) => {
                const p = repo.getPoint(id);
                if (!p) return null;
                return (
                  <Link key={id} to={`/point/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', fontSize: 12, marginRight: 6 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {p.title}
                  </Link>
                );
              })}
            </div>
          </div>
        ))
      )}
      {roadmap?.trend && (
        <div className="lane trend" style={{ borderRadius: 'var(--r-panel)', padding: '19px 22px', background: 'var(--accent-soft)', boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--accent) 30%, transparent)' }}>
          <h4 style={{ margin: '0 0 4px', fontSize: 11.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>领域趋势</h4>
          <div className="muted" style={{ fontSize: 14.5 }}>{roadmap.trend}</div>
        </div>
      )}
    </main>
  );
}
