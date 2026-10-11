import { HashRouter, Route, Routes } from 'react-router-dom'
import { Shell } from './Shell'
import { HomePage } from '@/features/home/HomePage'
import { GraphPage } from '@/features/graph/GraphPage'
import { TimelinePage } from '@/features/timeline/TimelinePage'
import { RoadmapPage } from '@/features/roadmap/RoadmapPage'
import { DomainPage } from '@/features/domain/DomainPage'
import { KnowledgePointPage } from '@/features/knowledge-point/KnowledgePointPage'
import { ProfilePage } from '@/features/profile/ProfilePage'

/**
 * Hash 路由：静态托管（GitHub Pages）与 Tauri file 协议下零配置可用，
 * 是六端一致分发的最稳选择。
 */
export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<HomePage />} />
          <Route path="/graph" element={<GraphPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/domain/:categoryId" element={<DomainPage />} />
          <Route path="/point/:pointId" element={<KnowledgePointPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<HomePage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
