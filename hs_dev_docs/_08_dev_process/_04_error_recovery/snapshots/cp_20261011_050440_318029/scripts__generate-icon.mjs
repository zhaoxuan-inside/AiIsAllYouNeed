#!/usr/bin/env node
/**
 * 生成 Tauri 图标源图（1024×1024 PNG，纯 Node 实现，无图像依赖）。
 * v2 像素风：在 64×64 逻辑网格上绘制，整数倍放大（×16）保持硬边像素。
 * 设计：深靛蓝底 + 金色像素四角星 + 六领域色微星 + 方块星辰。
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { deflateSync } from 'node:zlib'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const GRID = 64
const SCALE = 16
const SIZE = GRID * SCALE
const px = Buffer.alloc(SIZE * SIZE * 4)

const VOID = [10, 14, 31]
const GOLD = [240, 195, 78]
const DOMAIN = [
  [91, 141, 239],
  [63, 190, 168],
  [224, 112, 90],
  [157, 123, 232],
  [240, 195, 78],
  [213, 106, 158],
]

// 在逻辑网格上落一个像素方块
const setCell = (gx, gy, [r, g, b], alpha = 1) => {
  if (gx < 0 || gy < 0 || gx >= GRID || gy >= GRID) return
  for (let dy = 0; dy < SCALE; dy++)
    for (let dx = 0; dx < SCALE; dx++) {
      const i = ((gy * SCALE + dy) * SIZE + gx * SCALE + dx) * 4
      px[i] = r
      px[i + 1] = g
      px[i + 2] = b
      px[i + 3] = Math.round(255 * alpha)
    }
}

// 底色
for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) setCell(x, y, VOID)

// 伪随机方块星辰（固定种子可复现）
let seed = 20261011
const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff)
for (let i = 0; i < 150; i++) {
  const x = Math.floor(rand() * GRID)
  const y = Math.floor(rand() * GRID)
  const c = rand() < 0.18 ? DOMAIN[Math.floor(rand() * DOMAIN.length)] : [242, 245, 255]
  setCell(x, y, c, 0.35 + rand() * 0.65)
  if (rand() < 0.2) setCell(x, y - 1, c, 0.5) // 竖二连星
}

// 中央像素四角星（菱形星芒 + 十字臂，纯方块构成）
const c = GRID / 2
const R = 19
for (let d = -R; d <= R; d++) {
  const arm = R - Math.abs(d)
  // 十字主臂
  for (let k = -arm; k <= arm; k++) {
    const tip = Math.abs(k) < arm * 0.28 ? 1 : 0.85
    setCell(c + k, c + d, GOLD, tip)
    setCell(c + d, c + k, GOLD, tip)
  }
}
// 中心亮块 + 外圈点缀
setCell(c - 1, c - 1, [255, 230, 170])
setCell(c, c, [255, 230, 170])
setCell(c + 1, c + 1, GOLD, 0.9)
setCell(c - 2, c, GOLD, 0.75)
setCell(c + 2, c, GOLD, 0.75)
setCell(c, c - 2, GOLD, 0.75)
setCell(c, c + 2, GOLD, 0.75)

// PNG 编码（RGBA，filter 0）
const raw = Buffer.alloc(SIZE * (SIZE * 4 + 1))
for (let y = 0; y < SIZE; y++) {
  raw[y * (SIZE * 4 + 1)] = 0
  px.copy(raw, y * (SIZE * 4 + 1) + 1, y * SIZE * 4, (y + 1) * SIZE * 4)
}
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let x = n
  for (let k = 0; k < 8; k++) x = x & 1 ? 0xedb88320 ^ (x >>> 1) : x >>> 1
  return x >>> 0
})
const crc32 = (buf) => {
  let crc = 0xffffffff
  for (const b of buf) crc = crcTable[(crc ^ b) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}
const chunk = (type, data) => {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}
const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(SIZE, 0)
ihdr.writeUInt32BE(SIZE, 4)
ihdr[8] = 8
ihdr[9] = 6
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
])

const out = join(resolve(dirname(fileURLToPath(import.meta.url)), '..'), 'app', 'src-tauri', 'icons')
mkdirSync(out, { recursive: true })
writeFileSync(join(out, 'icon-source.png'), png)
console.log(`[icon] pixel icon → ${join(out, 'icon-source.png')} (${png.length} bytes)`)
