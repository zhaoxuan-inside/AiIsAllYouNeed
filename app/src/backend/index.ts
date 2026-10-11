/**
 * 应用后端 · 公共出口（seam）。
 * 展示层一律 `import { ... } from '@/backend'`；domain/* 与 data/* 不可直接触碰。
 */
export * from './types'
export * from './knowledge-service'
export * from './filter-store'
export * from './profile-store'
export * from './preference-store'
