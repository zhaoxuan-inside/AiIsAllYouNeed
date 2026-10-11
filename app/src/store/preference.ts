import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeName = 'night' | 'paper'

interface PreferenceState {
  theme: ThemeName
  toggleTheme: () => void
}

/** 偏好：主题（星夜/纸面），同样只存本地。 */
export const usePreferenceStore = create<PreferenceState>()(
  persist(
    (set) => ({
      theme: 'night',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'night' ? 'paper' : 'night' })),
    }),
    { name: 'aiana.prefs.v1' },
  ),
)
