import { describe, expect, it } from 'vitest'
import { kmeansCluster } from '@/domain/clusters'

describe('kmeansCluster（seam：图谱空间聚类，确定性）', () => {
  it('两个远离的点团各自聚为一簇，且簇内标签一致', () => {
    const points = [
      { x: 0, y: 0 }, { x: 1, y: 1 }, { x: 0.5, y: 0.2 },
      { x: 100, y: 100 }, { x: 101, y: 99 }, { x: 100.4, y: 100.3 },
    ]
    const assign = kmeansCluster(points, 2)
    expect(new Set(assign.slice(0, 3)).size).toBe(1)
    expect(new Set(assign.slice(3)).size).toBe(1)
    expect(assign[0]).not.toBe(assign[3])
  })

  it('确定性：同输入两次运行结果完全一致', () => {
    const points = Array.from({ length: 40 }, (_, i) => ({
      x: (i * 37) % 100 + Math.sin(i) * 5,
      y: (i * 53) % 100 + Math.cos(i) * 5,
    }))
    expect(kmeansCluster(points, 5)).toEqual(kmeansCluster(points, 5))
  })

  it('k 超过点数时收缩到点数，每点独立成簇', () => {
    const points = [{ x: 0, y: 0 }, { x: 10, y: 10 }]
    const assign = kmeansCluster(points, 8)
    expect(assign).toHaveLength(2)
    expect(new Set(assign).size).toBe(2)
  })

  it('空输入返回空数组', () => {
    expect(kmeansCluster([], 3)).toEqual([])
  })

  it('k=1 时所有点同簇', () => {
    const assign = kmeansCluster([{ x: 0, y: 0 }, { x: 5, y: 5 }, { x: 9, y: 9 }], 1)
    expect(new Set(assign).size).toBe(1)
  })
})
