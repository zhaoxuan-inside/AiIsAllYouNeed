import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { usePreferenceStore } from '@/backend/preference-store'
import { SearchOverlay } from '@/components/SearchOverlay'
import { MoonIcon, SearchIcon, SunIcon, UserIcon } from '@/components/icons'

const NAV = [
  { to: '/', label: '首页' },
  { to: '/graph', label: '图谱' },
  { to: '/timeline', label: '时间线' },
  { to: '/roadmap', label: '路线' },
  { to: '/profile', label: '档案' },
] as const

/** 应用框架（iA 式收敛）：顶栏 = 字标 + 文字导航 + 工具；移动 = 顶栏 + 底部纯文字 Tab；无侧栏 */
export function Shell() {
  const theme = usePreferenceStore((s) => s.theme)
  const toggleTheme = usePreferenceStore((s) => s.toggleTheme)
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
      <header className="sticky top-0 z-40 bg-void">
        <div className="mx-auto flex h-12 max-w-[960px] items-center gap-5 px-4 lg:px-6">
          <NavLink to="/" className="font-display text-base">
            AI 知识星图
          </NavLink>
          <nav className="hidden items-center gap-5 lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `text-sm transition-colors ${isActive ? 'font-bold text-star' : 'text-dim hover:text-star'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="搜索"
              title="搜索 (⌘K)"
              className="grid h-7 w-7 place-items-center text-dim transition-colors hover:text-star"
            >
              <SearchIcon />
            </button>
            <button
              onClick={toggleTheme}
              aria-label="切换主题"
              title="切换主题"
              className="grid h-7 w-7 place-items-center text-dim transition-colors hover:text-star"
            >
              {theme === 'night' ? <SunIcon /> : <MoonIcon />}
            </button>
            <NavLink
              to="/profile"
              aria-label="本地档案"
              title="本地档案"
              className="grid h-7 w-7 shrink-0 place-items-center text-dim transition-colors hover:text-star"
            >
              <UserIcon />
            </NavLink>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[960px] px-4 pb-24 pt-8 lg:px-6 lg:pb-16">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-edge bg-void lg:hidden">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex h-14 items-center justify-center text-xs ${isActive ? 'font-bold text-star' : 'text-dim'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
