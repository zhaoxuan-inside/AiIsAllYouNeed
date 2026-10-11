import { create } from 'zustand'

/**
 * 领域筛选状态 —— 应用后端的查询参数（图谱/时间线共用）。
 * 属于数据管理（查询条件），不属于任何视图。
 */
interface FilterState {
  selectedCategories: string[]
  toggleCategory: (id: string) => void
  clearCategories: () => void
}

export const useFilterStore = create<FilterState>((set) => ({
  selectedCategories: [],
  toggleCategory: (id) =>
    set((s) => ({
      selectedCategories: s.selectedCategories.includes(id)
        ? s.selectedCategories.filter((c) => c !== id)
        : [...s.selectedCategories, id],
    })),
  clearCategories: () => set({ selectedCategories: [] }),
}))
