#!/usr/bin/env node
/**
 * 生成 Tauri 图标源图（1024×1024 PNG，纯 Node 实现，无图像依赖）。
 * 设计：深靛蓝底（--void）+ 金色四角星（星光金 --gold）+ 六领域色微星。
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { deflateSync } from 'node:zlib'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SIZE = 1024
const px = Buffer.alloc(SIZE * SIZE * 4)

const VOID = [10, 14, 31]
const GOLD = [229, 184, 92]
const DOMAIN = [
  [91, 141, 239],
  [63, 190, 168],
  [224, 112, 90],
  [157, 123, 232],
  [213, 106, 158],
  [111, 183, 232],
]

const setPx = (x, y, [r, g, b], a = 255) => {
  if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return
  const i = (y * SIZE + x) * 4
  const na = a / 255
  px[i] = Math.round(r * na + px[i] * (1 - na))
  px[i + 1] = Math.round(g * na + px[i + 1] * (1 - na))
  px[i + 2] = Math.round(b * na + px[i + 2] * (1 - na))
  px[i + 3] = Math.max(px[i + 3], a)
}

// 底色
for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) setPx(x, y, VOID)

// 星域微星（伪随机，固定种子保证可复现）
let seed = 20261011
const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff)
for (let i = 0; i < 220; i++) {
  const x = Math.floor(rand() * SIZE)
  const y = Math.floor(rand() * SIZE)
  const r = rand() * 2.2 + 0.6
  const c = rand() < 0.18 ? DOMAIN[Math.floor(rand() * DOMAIN.length)] : [233, 237, 248]
  for (let dy = -3; dy <= 3; dy++)
    for (let dx = -3; dx <= 3; dx++) {
      const d = Math.hypot(dx, dy)
      if (d <= r) setPx(x + dx, y + dy, c, Math.round(255 * Math.max(0.25, 1 - d / (r + 0.5))))
    }
}

// 中央四角星（星芒形：|x|^0.7 + |y|^0.7 <= R）
const cx = SIZE / 2
const cy = SIZE / 2
const R = 300
for (let y = -R; y <= R; y++)
  for (let x = -R; x <= R; x++) {
    const v = Math.pow(Math.abs(x), 0.62) + Math.pow(Math.abs(y), 0.62)
    if (v <= R) {
      const edge = (R - v) / R
      const glow = Math.min(1, edge * 3.5)
      setPx(cx + x, cy + y, GOLD, Math.round(180 + 75 * glow))
    } else if (v <= R * 1.28) {
      const glow = 1 - (v - R) / (R * 0.28)
      setPx(cx + x, cy + y, GOLD, Math.round(60 * glow))
    }
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
ihdr[8] = 8 // bit depth
ihdr[9] = 6 // RGBA
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
])

const out = join(resolve(dirname(fileURLToPath(import.meta.url)), '..'), 'app', 'src-tauri', 'icons')
mkdirSync(out, { recursive: true })
writeFileSync(join(out, 'icon-source.png'), png)
console.log(`[icon] ${join(out, 'icon-source.png')} (${png.length} bytes)`)
