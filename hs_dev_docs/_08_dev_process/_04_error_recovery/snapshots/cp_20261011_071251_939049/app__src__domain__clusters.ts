/**
 * K-Means 空间聚类（纯函数 · 确定性）。
 *
 * 用途：图谱页对力导向布局的最终坐标做空间聚类，节点按簇着色。
 * 确定性保证：k-means++ 初始化使用固定种子的伪随机数，迭代次序固定——
 * 同一组输入永远得到同一份簇分配（这也是它能进测试的原因）。
 */

export interface ClusterPoint {
  x: number
  y: number
}

/** 固定种子伪随机（mulberry32）——替代 Math.random，保证确定性 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const squaredDist = (a: ClusterPoint, b: ClusterPoint) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2

/**
 * 对点集做 K-Means 聚类，返回与 points 等长的簇编号数组（0..k-1）。
 * k 会被截断到 [1, points.length]；空簇保留原质心（不分配成员）。
 */
export function kmeansCluster(points: ClusterPoint[], k: number, iterations = 16): number[] {
  if (points.length === 0) return []
  const kk = Math.max(1, Math.min(k, points.length))

  // k-means++ 初始化（种子化）
  const rand = mulberry32(0x5eed)
  const centroids: ClusterPoint[] = [{ ...points[Math.floor(rand() * points.length)] }]
  while (centroids.length < kk) {
    const dists = points.map((p) => Math.min(...centroids.map((c) => squaredDist(p, c))))
    const sum = dists.reduce((acc, d) => acc + d, 0)
    let target = rand() * sum
    let idx = points.length - 1
    for (let i = 0; i < points.length; i++) {
      target -= dists[i]
      if (target <= 0) {
        idx = i
        break
      }
    }
    centroids.push({ ...points[idx] })
  }

  const assign = new Array<number>(points.length).fill(0)
  for (let iter = 0; iter < iterations; iter++) {
    // 分配步：就近质心
    let changed = false
    for (let i = 0; i < points.length; i++) {
      let best = 0
      let bestDist = Number.POSITIVE_INFINITY
      for (let c = 0; c < centroids.length; c++) {
        const d = squaredDist(points[i], centroids[c])
        if (d < bestDist) {
          bestDist = d
          best = c
        }
      }
      if (assign[i] !== best) {
        assign[i] = best
        changed = true
      }
    }
    // 更新步：质心 = 簇内均值；空簇保留原质心
    const sums = centroids.map(() => ({ x: 0, y: 0, n: 0 }))
    for (let i = 0; i < points.length; i++) {
      const a = assign[i]
      sums[a].x += points[i].x
      sums[a].y += points[i].y
      sums[a].n += 1
    }
    for (let c = 0; c < centroids.length; c++) {
      if (sums[c].n > 0) centroids[c] = { x: sums[c].x / sums[c].n, y: sums[c].y / sums[c].n }
    }
    if (!changed && iter > 0) break
  }
  return assign
}
