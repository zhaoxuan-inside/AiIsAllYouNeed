import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { usePreferenceStore } from '@/store/preference'
import { useProfileStore } from '@/store/profile'
import { SearchOverlay } from '@/components/SearchOverlay'

const NAV = [
  { to: '/', label: '首页', icon: '✦' },
  { to: '/graph', label: '知识图谱', icon: '✧' },
  { to: '/timeline', label: '时间线', icon: '⌛' },
  { to: '/roadmap', label: '发展路线', icon: '→' },
  { to: '/profile', label: '档案', icon: '○' },
] as const

/** 应用框架：桌面 = 顶栏 + 左侧栏；移动 = 顶栏 + 底部 Tab */
export function Shell() {
  const theme = usePreferenceStore((s) => s.theme)
  const toggleTheme = usePreferenceStore((s) => s.toggleTheme)
  const profileName = useProfileStore((s) => s.profile.name)
  const profileColor = useProfileStore((s) => s.profile.color)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="min-h-dvh bg-void text-star">
      <header className="sticky top-0 z-40 border-b border-edge bg-void">
        <div className="mx-auto flex h-16 max-w-[1120px] items-center gap-4 px-4 lg:px-6">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="text-lg text-gold" aria-hidden>
              ✦
            </span>
            <span className="font-display text-lg">AI 知识星图</span>
          </NavLink>
          <button
            onClick={() => setSearchOpen(true)}
            className="ml-auto flex h-9 min-w-0 flex-1 max-w-md items-center gap-2 rounded-lg border-2 border-edge bg-panel px-3 text-sm text-dim transition-colors hover:border-gold/60"
          >
            <span aria-hidden>⌕</span>
            <span className="truncate">搜索知识点…</span>
            <kbd className="ml-auto hidden font-mono text-[10px] text-dim/70 sm:inline">⌘K</kbd>
          </button>
          <button
            onClick={toggleTheme}
            aria-label="切换主题"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border-2 border-edge text-sm text-dim hover:border-gold/60 hover:text-star"
          >
            {theme === 'night' ? '☾' : '☀'}
          </button>
          <NavLink
            to="/profile"
            aria-label="本地档案"
            className="hidden h-9 w-9 shrink-0 place-items-center rounded-none text-xs text-gold-ink sm:grid"
            style={{ backgroundColor: profileColor }}
          >
            {profileName.slice(0, 1)}
          </NavLink>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1120px]">
        <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-[220px] shrink-0 border-r border-edge py-6 lg:block">
          <nav className="flex flex-col gap-1 pr-6">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive ? 'bg-panel text-star' : 'text-dim hover:text-star'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-none bg-gold" />}
                    <span className="w-5 text-center text-base" aria-hidden>
                      {item.icon}
                    </span>
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          <p className="mt-8 px-3 text-[11px] leading-relaxed text-dim/60">
            知识点 · 96 颗星
            <br />
            数据随 Git 仓库更新
          </p>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-24 pt-6 lg:px-8 lg:pb-12">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-edge bg-void lg:hidden">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex h-14 flex-col items-center justify-center gap-0.5 text-[10px] ${isActive ? 'text-gold' : 'text-dim'}`
            }
          >
            <span className="text-base" aria-hidden>
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
