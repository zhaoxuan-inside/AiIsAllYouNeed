// FEAT-007 知识点详情：结构化正文（wiki 链接 / 公式 / 媒体）+ 反向链接 + 收藏/已读/笔记
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { repo } from '../../data/repo';
import { profileStore } from '../../data/profileStore';
import type { BodyBlock, KnowledgePoint } from '../../data/types';
import { IconBookmark, IconCheck, IconPen } from '../../components/icons';

const DOMAIN_COLORS = ['var(--d1)', 'var(--d2)', 'var(--d3)', 'var(--d4)', 'var(--d5)', 'var(--d6)'];

/** 解析 [[id|text]] 与 $math$ */
function WikiText({ text }: { text: string }) {
  const parts = text.split(/(\[\[[^\]]+\]\]|\$[^$]+\$)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^\[\[([^|\]]+)(?:\|([^\]]+))?\]\]$/);
        if (m) {
          const target = repo.getPoint(m[1]);
          if (target) {
            return (
              <Link key={i} to={`/point/${target.id}`} className="wiki">
                {m[2] ?? target.title}
              </Link>
            );
          }
          return <span key={i}>{m[2] ?? m[1]}</span>;
        }
        if (part.startsWith('$') && part.endsWith('$')) {
          return (
            <code key={i} className="formula-inline" style={{ fontFamily: 'var(--font-mono)', fontSize: '.9em' }}>
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function Block({ b }: { b: BodyBlock }) {
  if (b.t === 'formula') {
    return (
      <div className="formula" style={{ fontFamily: 'var(--font-mono)' }}>
        {b.tex}
      </div>
    );
  }
  if (b.t === 'list') {
    return (
      <ul style={{ margin: '.9em 0', paddingLeft: '1.4em' }}>
        {b.items.map((it, i) => (
          <li key={i}>
            <WikiText text={it} />
          </li>
        ))}
      </ul>
    );
  }
  if (b.t === 'media') {
    return (
      <figure style={{ margin: '1.2em 0' }}>
        <img src={b.src} alt={b.alt ?? ''} style={{ maxWidth: '100%', borderRadius: 'var(--r-panel)' }} />
        {b.caption && <figcaption className="faint caption" style={{ textAlign: 'center', marginTop: 8 }}>{b.caption}</figcaption>}
      </figure>
    );
  }
  return (
    <p>
      <WikiText text={b.text} />
    </p>
  );
}

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const p: KnowledgePoint | null = id ? repo.getPoint(id) : null;
  const [fav, setFav] = useState(false);
  const [read, setRead] = useState(false);

  useEffect(() => {
    if (!p) return;
    const apply = (prof: { favorites: string[]; readStates: Record<string, number> }) => {
      setFav(prof.favorites.includes(p.id));
      setRead(p.id in prof.readStates);
    };
    apply(profileStore.get());
    return profileStore.subscribe(apply);
  }, [p]);

  const onNote = () => {
    if (!p) return;
    const cur = profileStore.get().notes[p.id] ?? '';
    const text = window.prompt(`为「${p.title}」记一句笔记：`, cur);
    if (text !== null) profileStore.setNote(p.id, text);
  };
  if (!p) {
    return (
      <main>
        <h1 className="hero" style={{ fontSize: 30 }}>未找到该知识点</h1>
        <p className="muted">它可能已被移除，或链接已失效。</p>
        <Link className="btn btn-primary" to="/">
          返回星图
        </Link>
      </main>
    );
  }
  const deps = p.deps.map((d) => repo.getPoint(d)).filter((x): x is KnowledgePoint => Boolean(x));
  const related = repo.getRelated(p.id);
  const backlinks = repo.getBacklinks(p.id);

  return (
    <main>
      <h1 className="article-title">{p.title}</h1>
      {p.aliases.length > 0 && <div className="alias">别名：{p.aliases.join(' · ')}</div>}
      <div className="meta-line">
        <span className="plain">
          <span className="dot" style={{ background: DOMAIN_COLORS[p.domain.length % 6] }} />
          {p.domain}
        </span>
        <span className="plain mono">{p.year}</span>
        <span className="stars" aria-label={`重要性 ${p.importance}/5`}>
          {'★'.repeat(p.importance)}
          {'☆'.repeat(5 - p.importance)}
        </span>
        <span className="plain">难度 · {p.difficulty}</span>
        <span className="plain mono">~{p.learnTime} min</span>
        {p.tags.map((t) => (
          <span key={t} className="chip">
            #{t}
          </span>
        ))}
      </div>

      <div className="paper" style={{ marginTop: 20, padding: '30px 34px' }}>
        <div className="reading">
          {p.body.map((b, i) => (
            <Block key={i} b={b} />
          ))}
        </div>

        {p.papers.length > 0 && (
          <>
            <div className="block-sec">关键论文</div>
            {p.papers.map((paper) => (
              <div key={paper.title} className="row" style={{ paddingLeft: 0, paddingRight: 0 }}>
                <span className="name">{paper.title}</span>
                <span className="desc">
                  {paper.authors.join(' · ')} · {paper.year}
                  {paper.venue ? ` · ${paper.venue}` : ''}
                </span>
                {paper.url && (
                  <span className="yr">
                    <a className="wiki" href={paper.url} target="_blank" rel="noreferrer">
                      ↗
                    </a>
                  </span>
                )}
              </div>
            ))}
          </>
        )}

        {deps.length > 0 && (
          <>
            <div className="block-sec">依赖关系</div>
            <div className="dep-chain">
              {deps.map((d) => (
                <Link key={d.id} to={`/point/${d.id}`} className="wiki">
                  {d.title}
                </Link>
              ))}
              <span className="arrow">▸</span>
              <span className="me">{p.title}</span>
            </div>
          </>
        )}

        {related.length > 0 && (
          <>
            <div className="block-sec">相关知识点</div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {related.map((r) => (
                <Link key={r.id} to={`/point/${r.id}`} className="chip" style={{ textDecoration: 'none' }}>
                  {r.title}
                </Link>
              ))}
            </div>
          </>
        )}

        {backlinks.length > 0 && (
          <>
            <div className="block-sec">反向链接</div>
            <div className="backlinks">
              被{' '}
              {backlinks.map((b, i) => (
                <span key={b.id}>
                  {i > 0 && '、'}
                  <Link to={`/point/${b.id}`} className="wiki">
                    {b.title}
                  </Link>
                </span>
              ))}{' '}
              引用
            </div>
          </>
        )}
      </div>

      <div className="fab glass">
        <button className="btn" aria-pressed={fav} onClick={() => profileStore.toggleFavorite(p.id)}>
          <IconBookmark size={16} /> 收藏
        </button>
        <button className="btn" aria-pressed={read} onClick={() => profileStore.toggleRead(p.id)}>
          <IconCheck size={16} /> 已读
        </button>
        <button className="btn" onClick={onNote}>
          <IconPen size={16} /> 笔记
        </button>
      </div>
    </main>
  );
}
