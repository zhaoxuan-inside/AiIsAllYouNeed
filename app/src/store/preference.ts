import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeName = 'night' | 'paper'

interface PreferenceState {
  theme: ThemeName
  toggleTheme: () => void
}

/** 偏好：主题（纸墨·默认阅读 / 星夜·深色），只存本地。v2 键避免沿用旧像素/夜默认。 */
export const usePreferenceStore = create<PreferenceState>()(
  persist(
    (set) => ({
      theme: 'paper',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'paper' ? 'night' : 'paper' })),
    }),
    { name: 'aiana.prefs.v2' },
  ),
)
