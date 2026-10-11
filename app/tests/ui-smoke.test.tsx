import { describe, expect, it } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Shell } from '@/app/Shell'
import { HomePage } from '@/features/home/HomePage'
import { GraphPage } from '@/features/graph/GraphPage'
import { TimelinePage } from '@/features/timeline/TimelinePage'
import { RoadmapPage } from '@/features/roadmap/RoadmapPage'
import { DomainPage } from '@/features/domain/DomainPage'
import { KnowledgePointPage } from '@/features/knowledge-point/KnowledgePointPage'
import { ProfilePage } from '@/features/profile/ProfilePage'
import { getHomeView } from '@/backend/knowledge-service'
import { usePreferenceStore } from '@/backend/preference-store'

// 兼容两种历史调用形态；页面一律经完整路由树渲染（含 useParams）
function renderWithRouter(_ui?: React.ReactElement, { path = '/' }: { path?: string } = {}) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<HomePage />} />
          <Route path="/graph" element={<GraphPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/domain/:categoryId" element={<DomainPage />} />
          <Route path="/point/:pointId" element={<KnowledgePointPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('Shell 冒烟', () => {
  it('渲染主导航与顶栏', () => {
    renderWithRouter(<Shell />)
    expect(screen.getAllByText('AI 知识星图').length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /图谱/ }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /路线/ }).length).toBeGreaterThan(0)
  })

  it('主题切换写入 data-theme', () => {
    renderWithRouter(<Shell />)
    const before = usePreferenceStore.getState().theme
    act(() => {
      usePreferenceStore.getState().toggleTheme()
    })
    expect(document.documentElement.dataset.theme).not.toBe(before)
    act(() => {
      usePreferenceStore.getState().toggleTheme()
    })
  })
})

describe('页面冒烟（真实种子数据）', () => {
  const { stats } = getHomeView()

  it('首页：统计、领域入口与双列表', () => {
    renderWithRouter(<HomePage />)
    expect(screen.getByText(`${stats.points}`)).toBeInTheDocument()
    expect(screen.getByText(/机器学习基础/)).toBeInTheDocument()
    expect(screen.getByText(/高影响力/)).toBeInTheDocument()
  })

  it('图谱页：渲染节点与筛选', () => {
    renderWithRouter(<Shell />, { path: '/graph' })
    expect(screen.getByRole('img', { name: /知识依赖图谱/ })).toBeInTheDocument()
  })

  it('时间线页：年份节点按序渲染', () => {
    renderWithRouter(<Shell />, { path: '/timeline' })
    expect(screen.getByText('「Transformer 纪元」')).toBeInTheDocument()
  })

  it('路线页：默认领域三阶段 + 趋势卡', () => {
    renderWithRouter(<Shell />, { path: '/roadmap' })
    expect(screen.getByText('趋势预测')).toBeInTheDocument()
    expect(screen.getByText('基础')).toBeInTheDocument()
  })

  it('领域页：渲染领域概览', () => {
    renderWithRouter(<Shell />, { path: '/domain/nlp' })
    expect(screen.getByText('知识脉络')).toBeInTheDocument()
    expect(screen.getByText(/知识脉络/)).toBeInTheDocument()
  })

  it('详情页：标题、论文、依赖/应用拆分与收藏', () => {
    renderWithRouter(<Shell />, { path: '/point/transformer' })
    expect(screen.getByRole('heading', { name: /Transformer/ })).toBeInTheDocument()
    expect(screen.getAllByText(/Attention Is All You Need/).length).toBeGreaterThan(0)
    expect(screen.getByText('依赖')).toBeInTheDocument()
    expect(screen.getByText('应用')).toBeInTheDocument()
    // 依赖/应用列表来自后端视图模型：transformer 的应用应含 BERT 与 GPT-1
    expect(screen.getAllByText('BERT 与双向预训练').length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: /在全景图谱中定位/ })).toHaveAttribute('href', '/graph?focus=transformer')
    expect(screen.getByRole('button', { name: /收藏/ })).toBeInTheDocument()
  })

  it('档案页：默认访客与三个 Tab', () => {
    renderWithRouter(<Shell />, { path: '/profile' })
    expect(screen.getByDisplayValue('访客')).toBeInTheDocument()
    expect(screen.getByText('仅存于本机浏览器')).toBeInTheDocument()
  })
})
