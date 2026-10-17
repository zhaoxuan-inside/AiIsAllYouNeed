// app_shell：顶栏（灯罩）/ 主题唯一控件 / 搜索入口 / 路由出口（DESIGN.md v7）
import { useMemo, useEffect, useState, type ReactNode } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useTheme } from './theme';
import { IconCompass, IconLamp, IconBook } from '../components/icons';
import { repo } from '../data/repo';
import { searchIndex, type SearchHit } from '../search';
import type { ThemeMode } from '../data/types';
import HomePage from '../features/home/HomePage';
import DetailPage from '../features/detail/DetailPage';
import GraphPage from '../features/graph/GraphPage';
import TimelinePage from '../features/timeline/TimelinePage';
import RoadmapPage from '../features/roadmap/RoadmapPage';
import ProfilePage from '../features/profile/ProfilePage';

const NAV = [
  { to: '/', label: '首页' },
  { to: '/graph', label: '图谱' },
  { to: '/timeline', label: '时间线' },
  { to: '/roadmap', label: '路线' },
  { to: '/profile', label: '档案' },
];

function NavRow() {
  return (
    <nav aria-label="主导航" style={{ display: 'flex', gap: 6, margin: '-26px 0 34px' }}>
      {NAV.map((n) => (
        <Link
          key={n.to}
          to={n.to}
          className="chip"
          style={{ textDecoration: 'none', padding: '7px 14px' }}
          onClick={() => undefined}
        >
          {n.label}
        </Link>
      ))}
    </nav>
  );
}

function ThemeControl() {
  const { mode, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const options: Array<{ value: ThemeMode; label: string }> = [
    { value: 'system', label: '跟随系统' },
    { value: 'day', label: '日间 · 灯关' },
    { value: 'night', label: '夜间 · 灯开' },
  ];
  return (
    <div className="pop-wrap">
      <button
        className="icon-btn"
        aria-haspopup="true"
        aria-expanded={open}
        title="主题（台灯）"
        aria-label="主题（台灯）"
        onClick={() => setOpen((v) => !v)}
      >
        <IconLamp size={20} />
      </button>
      {open && (
        <div className="popover glass" role="radiogroup" aria-label="主题模式">
          <div className="pop-title">台灯状态</div>
          {options.map((o) => (
            <button
              key={o.value}
              role="radio"
              aria-checked={mode === o.value}
              className="pop-item"
              style={{ width: '100%', border: 0, background: 'transparent', font: 'inherit', textAlign: 'left' }}
              onClick={() => {
                setTheme(o.value);
                setOpen(false);
              }}
            >
              <span>{o.label}</span>
              <span className="tick">✓</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchTrigger() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const hits: SearchHit[] = useMemo(() => (q.trim() ? searchIndex.search(q, repo.getTimeline()) : []), [q]);

  // 全局快捷键：⌘K/Ctrl+K 打开，Esc 关闭（FEAT-006）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <button
        className="search"
        onClick={() => setOpen(true)}
        onKeyDown={(e) => e.key === 'Enter' && setOpen(true)}
        aria-label="搜索知识点"
      >
        <IconCompass size={16} />
        <span className="lbl">搜索知识点…</span>
        <span className="kbd">⌘K</span>
      </button>
      {open && (
        <div className="overlay on" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className="searchbox glass">
            <div className="field">
              <IconCompass size={18} />
              <input autoFocus placeholder="搜索知识点、别名或标签…" value={q} onChange={(e) => setQ(e.target.value)} />
              <button className="kbd" style={{ border: 0, cursor: 'pointer' }} onClick={() => setOpen(false)}>
                Esc
              </button>
            </div>
            <div style={{ paddingTop: 6 }}>
              {!q.trim() &&
                repo.searchSuggestion().map((s) => (
                  <button key={s} className="hit" style={{ width: '100%', border: 0, background: 'transparent', font: 'inherit', textAlign: 'left' }} onClick={() => setQ(s)}>
                    <IconCompass size={14} /> <span>{s}</span>
                  </button>
                ))}
              {hits.map((h) => (
                <button
                  key={h.id}
                  className="hit"
                  style={{ width: '100%', border: 0, background: 'transparent', font: 'inherit', textAlign: 'left' }}
                  onClick={() => {
                    setOpen(false);
                    setQ('');
                    navigate(`/point/${h.id}`);
                  }}
                >
                  <div>
                    <div>{h.title}</div>
                    <div className="faint caption">{h.snippet}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="faint caption" style={{ padding: 10, borderTop: '1px solid var(--line)' }}>
              ↑↓ 选择 · Enter 打开 · Esc 关闭
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="topbar glass">
        <Link className="brand" to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          星图册<span className="en">Star Atlas</span>
        </Link>
        <SearchTrigger />
        <ThemeControl />
        <Link className="icon-btn" to="/profile" title="本地档案" aria-label="本地档案">
          <IconBook size={21} />
        </Link>
      </header>
      {children}
    </>
  );
}

export default function App() {
  return (
    <HashRouter>
      <div className="shell">
        <Shell>
          <NavRow />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/graph" element={<GraphPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/point/:id" element={<DetailPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Shell>
      </div>
    </HashRouter>
  );
}
