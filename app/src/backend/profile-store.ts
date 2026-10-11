import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface LocalProfile {
  name: string
  color: string
  favorites: string[]
  progress: Record<string, boolean>
  notes: Record<string, string>
  updatedAt: string
}

interface ProfileState {
  profile: LocalProfile
  renameProfile: (name: string, color?: string) => void
  toggleFavorite: (pointId: string) => void
  setProgress: (pointId: string, done: boolean) => void
  setNote: (pointId: string, text: string) => void
  resetProfile: () => void
}

export const GUEST_PROFILE: LocalProfile = {
  name: '访客',
  color: '#E5B85C',
  favorites: [],
  progress: {},
  notes: {},
  updatedAt: '',
}

/** 本地档案：信息只存浏览器本地（localStorage），无服务器。 */
export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: { ...GUEST_PROFILE },
      renameProfile: (name, color) =>
        set((s) => ({
          profile: { ...s.profile, name: name.trim() || s.profile.name, color: color ?? s.profile.color, updatedAt: new Date().toISOString() },
        })),
      toggleFavorite: (pointId) =>
        set((s) => {
          const favorites = s.profile.favorites.includes(pointId)
            ? s.profile.favorites.filter((id) => id !== pointId)
            : [...s.profile.favorites, pointId]
          return { profile: { ...s.profile, favorites, updatedAt: new Date().toISOString() } }
        }),
      setProgress: (pointId, done) =>
        set((s) => ({
          profile: {
            ...s.profile,
            progress: { ...s.profile.progress, [pointId]: done },
            updatedAt: new Date().toISOString(),
          },
        })),
      setNote: (pointId, text) =>
        set((s) => {
          const notes = { ...s.profile.notes }
          const trimmed = text.trim()
          if (trimmed) notes[pointId] = trimmed
          else delete notes[pointId]
          return { profile: { ...s.profile, notes, updatedAt: new Date().toISOString() } }
        }),
      resetProfile: () => set({ profile: { ...GUEST_PROFILE, favorites: [], progress: {}, notes: {} } }),
    }),
    { name: 'aiana.profile.v1' },
  ),
)
