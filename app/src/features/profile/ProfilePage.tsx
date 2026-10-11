import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProfileStore } from '@/backend/profile-store'
import { getPointSummary } from '@/backend/knowledge-service'
import { EmptyState } from '@/components/ui'
import { UserIcon } from '@/components/icons'

const COLORS = ['#E5B85C', '#5B8DEF', '#3FBEA8', '#E0705A', '#9D7BE8', '#D46A9E']

/** 本地档案：昵称/头像色、收藏、阅读进度、笔记——信息只存本机 */
export function ProfilePage() {
  const profile = useProfileStore((s) => s.profile)
  const renameProfile = useProfileStore((s) => s.renameProfile)
  const toggleFavorite = useProfileStore((s) => s.toggleFavorite)
  const [tab, setTab] = useProfileStoreSafeTab()

  const favorites = profile.favorites.flatMap((id) => {
    const summary = getPointSummary(id)
    return summary ? [summary] : []
  })
  const progressList = Object.entries(profile.progress)
    .filter(([, done]) => done)
    .flatMap(([id]) => {
      const summary = getPointSummary(id)
      return summary ? [summary] : []
    })
  const notes = Object.entries(profile.notes).flatMap(([id, text]) => {
    const summary = getPointSummary(id)
    return summary ? [{ point: summary, text }] : []
  })

  return (
    <div className="rise-in">
      <header className="flex flex-wrap items-center gap-4 pb-2">
        {/* 头像：发丝边圆 + 墨色人形；身份色只落在右下功能点上（iA 近单色） */}
        <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full border border-edge">
          <UserIcon className="h-7 w-7 text-star" />
          <span
            className="absolute -bottom-px -right-px h-3.5 w-3.5 rounded-full border-2 border-void"
            style={{ backgroundColor: profile.color }}
            aria-hidden
          />
        </span>
        <div className="min-w-0">
          <input
            defaultValue={profile.name}
            onBlur={(e) => renameProfile(e.target.value)}
            aria-label="昵称"
            className="font-display w-48 border-b border-transparent bg-transparent text-xl outline-none hover:border-edge focus:border-accent"
          />
          <p className="mt-1 text-xs text-dim">仅存于本机浏览器</p>
          <div className="mt-2 flex items-center gap-5">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => renameProfile(profile.name, c)}
                aria-label={`选择头像色 ${c}`}
                aria-pressed={profile.color === c}
                className={`relative grid h-6 w-6 place-items-center rounded-full border transition-colors after:absolute after:-inset-2 after:content-[''] ${
                  profile.color === c ? 'border-star' : 'border-transparent hover:border-edge'
                }`}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c }} />
              </button>
            ))}
          </div>
        </div>
        <div className="ml-auto flex gap-5 font-mono text-sm text-dim">
          <span>{favorites.length} 收藏</span>
          <span>{progressList.length} 已读</span>
          <span>{notes.length} 笔记</span>
        </div>
      </header>

      <div className="mt-6 flex gap-6 border-b border-edge text-sm">
        {(
          [
            ['favorites', '我的收藏'],
            ['progress', '阅读进度'],
            ['notes', '我的笔记'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`relative -mb-px border-b-2 pb-2 transition-colors after:absolute after:-inset-x-2 after:-inset-y-1.5 after:content-[''] ${
              tab === key ? 'border-accent font-bold text-star' : 'border-transparent text-dim hover:text-star'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === 'favorites' &&
          (favorites.length === 0 ? (
            <EmptyState title="还没有收藏" hint="在知识点详情页点「☆ 收藏」即可保存到这里。" action={{ to: '/graph', label: '去图谱探索' }} />
          ) : (
            <ul className="space-y-1">
              {favorites.map((p) => (
                <PointRow key={p.point.id} id={p.point.id} title={p.point.title} year={p.point.year} onRemove={() => toggleFavorite(p.point.id)} />
              ))}
            </ul>
          ))}

        {tab === 'progress' &&
          (progressList.length === 0 ? (
            <EmptyState title="还没有已读记录" hint="在详情页点「标记已读」记录你的学习轨迹。" action={{ to: '/roadmap', label: '从发展路线开始' }} />
          ) : (
            <ul className="space-y-1">
              {progressList.map((p) => (
                <PointRow key={p.point.id} id={p.point.id} title={p.point.title} year={p.point.year} />
              ))}
            </ul>
          ))}

        {tab === 'notes' &&
          (notes.length === 0 ? (
            <EmptyState title="还没有笔记" hint="在知识点详情页底部写下你的理解。" action={{ to: '/timeline', label: '去时间线漫游' }} />
          ) : (
            <ul className="mt-2 space-y-5">
              {notes.map(({ point, text }) => (
                <li key={point.point.id} className="py-3">
                  <Link to={`/point/${point.point.id}`} className="text-sm text-star hover:text-accent">
                    {point.point.title}
                  </Link>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-dim">{text}</p>
                </li>
              ))}
            </ul>
          ))}
      </div>
    </div>
  )
}

function PointRow({ id, title, year, onRemove }: { id: string; title: string; year: number; onRemove?: () => void }) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className="font-mono text-xs text-dim">{year}</span>
      <Link to={`/point/${id}`} className="text-sm text-star hover:text-accent">
        {title}
      </Link>
      {onRemove && (
        <button onClick={onRemove} className="ml-auto text-xs text-dim hover:text-star" aria-label="取消收藏">
          移除
        </button>
      )}
    </li>
  )
}

/** 简化的本地 tab 状态（不持久化） */
function useProfileStoreSafeTab() {
  return useState<'favorites' | 'progress' | 'notes'>('favorites')
}
