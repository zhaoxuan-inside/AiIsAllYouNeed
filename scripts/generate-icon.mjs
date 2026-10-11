#!/usr/bin/env node
/**
 * 生成 Tauri 图标源图（1024×1024 PNG，纯 Node 实现，无图像依赖）。
 * v4 iA 极简：纯白底 + 墨黑细线星座 + 蓝色主星 + 领域色点缀。
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { deflateSync } from 'node:zlib'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SIZE = 1024
const px = Buffer.alloc(SIZE * SIZE * 4)

const PAPER = [255, 255, 255]
const INK = [26, 26, 26]
const ACCENT = [11, 147, 246]
const DOMAIN = [
  [91, 141, 239],
  [63, 190, 168],
  [224, 112, 90],
  [157, 123, 232],
  [213, 106, 158],
  [184, 134, 47],
]

const blend = (x, y, [r, g, b], alpha) => {
  if (x < 0 || y < 0 || x >= SIZE || y >= SIZE || alpha <= 0) return
  const i = (y * SIZE + x) * 4
  const a = Math.min(1, alpha)
  px[i] = Math.round(r * a + px[i] * (1 - a))
  px[i + 1] = Math.round(g * a + px[i + 1] * (1 - a))
  px[i + 2] = Math.round(b * a + px[i + 2] * (1 - a))
  px[i + 3] = 255
}

// 底色
for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) blend(x, y, PAPER, 1)

const dot = (cx, cy, r, color, alpha = 1) => {
  const R = Math.ceil(r) + 2
  for (let dy = -R; dy <= R; dy++)
    for (let dx = -R; dx <= R; dx++) {
      const d = Math.hypot(dx, dy)
      if (d <= r + 1) blend(Math.round(cx) + dx, Math.round(cy) + dy, color, alpha * Math.min(1, Math.max(0, r + 1 - d)))
    }
}
const line = (x1, y1, x2, y2, w, color, alpha = 1) => {
  const len = Math.hypot(x2 - x1, y2 - y1)
  const R = Math.ceil(w / 2 + 2)
  const [minX, maxX] = [Math.min(x1, x2) - R, Math.max(x1, x2) + R]
  const [minY, maxY] = [Math.min(y1, y2) - R, Math.max(y1, y2) + R]
  for (let y = Math.floor(minY); y <= maxY; y++)
    for (let x = Math.floor(minX); x <= maxX; x++) {
      const t = Math.max(0, Math.min(1, ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / (len * len)))
      const d = Math.hypot(x - (x1 + t * (x2 - x1)), y - (y1 + t * (y2 - y1)))
      if (d <= w / 2 + 1) blend(x, y, color, alpha * Math.min(1, Math.max(0, w / 2 + 1 - d)))
    }
}

// 星座：墨蓝细线连接的知识点群
const nodes = [
  [300, 700, 26, DOMAIN[0]],
  [480, 560, 34, INK],
  [660, 640, 22, DOMAIN[1]],
  [560, 380, 28, DOMAIN[4]],
  [750, 300, 40, INK],
  [850, 460, 20, DOMAIN[3]],
]
for (const [a, b] of [[0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [2, 3]]) {
  line(nodes[a][0], nodes[a][1], nodes[b][0], nodes[b][1], 10, INK, 0.5)
}
for (const [x, y, r, c] of nodes) dot(x, y, r, c)

// 琥珀主星（四角星芒）
const cx = 300
const cy = 300
dot(cx, cy, 30, ACCENT)
line(cx - 110, cy, cx + 110, cy, 8, ACCENT, 0.75)
line(cx, cy - 110, cx, cy + 110, 8, ACCENT, 0.75)
dot(cx, cy, 12, [250, 248, 242])

// 稀疏墨色微星
let seed = 20261011
const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff)
for (let i = 0; i < 90; i++) {
  dot(rand() * SIZE, rand() * SIZE, 1.5 + rand() * 2.5, INK, 0.12 + rand() * 0.18)
}

// PNG 编码（RGBA，filter 0）
const raw = Buffer.alloc(SIZE * (SIZE * 4 + 1))
for (let y = 0; y < SIZE; y++) {
  raw[y * (SIZE * 4 + 1)] = 0
  px.copy(raw, y * (SIZE * 4 + 1) + 1, y * SIZE * 4, (y + 1) * SIZE * 4)
}
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc32 = (buf) => {
  let c = 0xffffffff
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
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
console.log(`[icon] ia-minimal icon → ${join(out, 'icon-source.png')} (${png.length} bytes)`)
