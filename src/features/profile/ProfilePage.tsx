// FEAT-008 档案：本地唯一写方（收藏/进度/笔记；数据不出本机）
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { repo } from '../../data/repo';
import { profileStore } from '../../data/profileStore';
import { IconBookmark } from '../../components/icons';

export default function ProfilePage() {
  const [profile, setProfile] = useState(profileStore.get());
  const [tab, setTab] = useState<'收藏' | '进度' | '笔记'>('收藏');

  useEffect(() => profileStore.subscribe(setProfile), []);

  const favs = profile.favorites.map((id) => repo.getPoint(id)).filter((x) => x);
  const read = Object.entries(profile.readStates).map(([id, ts]) => ({ p: repo.getPoint(id), ts })).filter((x) => x.p);
  const notes = Object.entries(profile.notes).map(([id, text]) => ({ p: repo.getPoint(id), text })).filter((x) => x.p);

  return (
    <main>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          className="avatar"
          style={{
            width: 58, height: 58, borderRadius: '50%',
            background: `conic-gradient(from 210deg, var(--d1), var(--d2), var(--d5), var(--d4), var(--d3), var(--d1))`,
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.45), 0 10px 26px -14px var(--shadow)',
          }}
        />
        <div>
          <div style={{ fontFamily: 'var(--font-disp)', fontWeight: 700, fontSize: 21 }}>{profile.nickname}</div>
          <div className="faint caption">数据仅存本机 · 无账号 · 无上传</div>
        </div>
      </div>

      <div className="sec-head" style={{ marginTop: 26 }}>
        <div className="seg">
          {(['收藏', '进度', '笔记'] as const).map((t) => (
            <button key={t} className="opt" aria-selected={tab === t} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === '收藏' &&
        (favs.length ? (
          favs.map((p) => (
            <Link key={p!.id} to={`/point/${p!.id}`} className="row" style={{ textDecoration: 'none', color: 'inherit' }}>
              <IconBookmark size={15} />
              <span className="name">{p!.title}</span>
              <span className="yr mono">{p!.year}</span>
            </Link>
          ))
        ) : (
          <p className="muted">还没有收藏。在详情页点「收藏」即用即建。</p>
        ))}
      {tab === '进度' &&
        (read.length ? (
          read.map(({ p, ts }) => (
            <Link key={p!.id} to={`/point/${p!.id}`} className="row" style={{ textDecoration: 'none', color: 'inherit' }}>
              <span className="name">{p!.title}</span>
              <span className="faint caption mono">已读 {new Date(ts).toLocaleDateString()}</span>
            </Link>
          ))
        ) : (
          <p className="muted">还没有阅读进度。</p>
        ))}
      {tab === '笔记' &&
        (notes.length ? (
          notes.map(({ p, text }) => (
            <div key={p!.id} className="row" style={{ cursor: 'default' }}>
              <span className="name">{p!.title}</span>
              <span className="desc" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</span>
            </div>
          ))
        ) : (
          <p className="muted">还没有笔记。在详情页点「笔记」随手记一句。</p>
        ))}
    </main>
  );
}
