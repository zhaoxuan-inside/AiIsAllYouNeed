import { beforeEach, describe, expect, it } from 'vitest'
import { useProfileStore } from '@/backend/profile-store'
import { usePreferenceStore } from '@/backend/preference-store'

beforeEach(() => {
  localStorage.clear()
  useProfileStore.getState().resetProfile()
  useProfileStore.getState().setNote('transformer', '')
  useProfileStore.persist?.clearStorage?.()
})

describe('本地档案（seam：用户系统信息只存本地）', () => {
  it('默认存在访客档案', () => {
    const s = useProfileStore.getState()
    expect(s.profile.name).toBe('访客')
  })

  it('重命名与选色', () => {
    useProfileStore.getState().renameProfile('小明', '#9D7BE8')
    expect(useProfileStore.getState().profile).toMatchObject({ name: '小明', color: '#9D7BE8' })
  })

  it('收藏切换并持久化到 localStorage', () => {
    useProfileStore.getState().toggleFavorite('transformer')
    expect(useProfileStore.getState().profile.favorites).toContain('transformer')
    useProfileStore.getState().toggleFavorite('transformer')
    expect(useProfileStore.getState().profile.favorites).not.toContain('transformer')

    useProfileStore.getState().toggleFavorite('lstm')
    const raw = localStorage.getItem('aiana.profile.v1')
    expect(raw).toContain('lstm')
  })

  it('阅读进度与笔记', () => {
    useProfileStore.getState().setProgress('transformer', true)
    useProfileStore.getState().setNote('transformer', '注意力的 Q/K/V 要再读一遍')
    const p = useProfileStore.getState().profile
    expect(p.progress['transformer']).toBe(true)
    expect(p.notes['transformer']).toContain('Q/K/V')
  })

  it('重置恢复访客默认', () => {
    useProfileStore.getState().renameProfile('小明', '#9D7BE8')
    useProfileStore.getState().resetProfile()
    expect(useProfileStore.getState().profile.name).toBe('访客')
    expect(useProfileStore.getState().profile.favorites).toEqual([])
  })
})

describe('偏好（主题）', () => {
  it('默认纸墨主题，可切换星夜并持久化', () => {
    expect(usePreferenceStore.getState().theme).toBe('paper')
    usePreferenceStore.getState().toggleTheme()
    expect(usePreferenceStore.getState().theme).toBe('night')
    expect(localStorage.getItem('aiana.prefs.v2')).toContain('night')
  })
})
