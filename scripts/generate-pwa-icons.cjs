const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const GREEN = [47, 107, 79]
const CREAM = [247, 243, 232]
const DARK = [30, 66, 52]

function crc32(buf) {
  let c
  const table = crc32.table || (crc32.table = (() => {
    const t = new Int32Array(256)
    for (let n = 0; n < 256; n++) {
      c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      t[n] = c
    }
    return t
  })())
  let crc = -1
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff]
  return (crc ^ -1) >>> 0
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const body = Buffer.concat([typeBuf, data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([len, body, crc])
}

function encodePng(width, height, rgba) {
  const raw = Buffer.alloc(height * (width * 4 + 1))
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v))
}

function sdRoundRect(x, y, cx, cy, hw, hh, r) {
  const dx = Math.abs(x - cx) - hw + r
  const dy = Math.abs(y - cy) - hh + r
  const ax = Math.max(dx, 0)
  const ay = Math.max(dy, 0)
  return Math.sqrt(ax * ax + ay * ay) + Math.min(Math.max(dx, dy), 0) - r
}

function sdRing(x, y, cx, cy, radius, thickness) {
  return Math.abs(Math.hypot(x - cx, y - cy) - radius) - thickness / 2
}

function sdSegment(x, y, x1, y1, x2, y2, thickness) {
  const dx = x2 - x1
  const dy = y2 - y1
  const t = clamp(((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy), 0, 1)
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy)) - thickness / 2
}

function drawIcon(size, { maskable = false } = {}) {
  const ss = 3
  const S = size * ss
  const out = Buffer.alloc(size * size * 4)

  // cup geometry is relative to the icon size, slightly smaller for maskable safe zone
  const k = maskable ? 0.82 : 0.92
  const cx = 0.5
  const cy = 0.55

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0
      let g = 0
      let b = 0
      let a = 0
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const x = (px * ss + sx + 0.5) / S
          const y = (py * ss + sy + 0.5) / S
          const pxSize = 1 / S

          let cr = 0
          let cg = 0
          let cb = 0
          let ca = 0

          const bgD = maskable
            ? -1
            : sdRoundRect(x, y, 0.5, 0.5, 0.5, 0.5, 0.2)
          const bgA = clamp(0.5 - bgD / pxSize, 0, 1)
          if (bgA > 0) {
            cr = GREEN[0]
            cg = GREEN[1]
            cb = GREEN[2]
            ca = bgA
          }

          const compose = (R, G, B, cov) => {
            if (cov <= 0) return
            const na = cov + ca * (1 - cov)
            if (na <= 0) return
            cr = (R * cov + cr * ca * (1 - cov)) / na
            cg = (G * cov + cg * ca * (1 - cov)) / na
            cb = (B * cov + cb * ca * (1 - cov)) / na
            ca = na
          }

          // handle (behind the cup body)
          const handleD = sdRing(x, y, cx + 0.19 * k, cy + 0.005 * k, 0.095 * k, 0.042 * k)
          compose(CREAM[0], CREAM[1], CREAM[2], clamp(0.5 - handleD / pxSize, 0, 1))

          // cup body
          const bodyD = sdRoundRect(x, y, cx, cy + 0.01 * k, 0.165 * k, 0.135 * k, 0.045 * k)
          compose(CREAM[0], CREAM[1], CREAM[2], clamp(0.5 - bodyD / pxSize, 0, 1))

          // coffee surface (dark band near the top of the cup)
          const coffeeD = sdRoundRect(x, y, cx, cy - 0.062 * k, 0.135 * k, 0.025 * k, 0.02 * k)
          compose(DARK[0], DARK[1], DARK[2], clamp(0.5 - coffeeD / pxSize, 0, 1))

          // saucer
          const saucerD = sdRoundRect(x, y, cx, cy + 0.185 * k, 0.215 * k, 0.022 * k, 0.02 * k)
          compose(CREAM[0], CREAM[1], CREAM[2], clamp(0.5 - saucerD / pxSize, 0, 1))

          // steam
          const steamTop = cy - 0.34 * k
          const steamBottom = cy - 0.185 * k
          for (const offset of [-0.075, 0, 0.075]) {
            const sxPos = cx + offset * k
            const steamD = sdSegment(x, y, sxPos, steamTop, sxPos + offset * 0.35, steamBottom, 0.028 * k)
            compose(CREAM[0], CREAM[1], CREAM[2], clamp(0.5 - steamD / pxSize, 0, 1) * 0.92)
          }

          r += cr * ca
          g += cg * ca
          b += cb * ca
          a += ca
        }
      }
      const n = ss * ss
      const idx = (py * size + px) * 4
      const aa = a / n
      if (aa > 0) {
        out[idx] = Math.round(r / a)
        out[idx + 1] = Math.round(g / a)
        out[idx + 2] = Math.round(b / a)
      }
      out[idx + 3] = Math.round(aa * 255)
    }
  }

  return encodePng(size, size, out)
}

const dir = path.join(process.cwd(), 'public', 'icons')
fs.mkdirSync(dir, { recursive: true })

const targets = [
  ['icon-192.png', 192, {}],
  ['icon-512.png', 512, {}],
  ['maskable-512.png', 512, { maskable: true }],
  ['apple-touch-icon.png', 180, { maskable: true }],
  ['favicon-64.png', 64, {}],
]

for (const [name, size, opts] of targets) {
  fs.writeFileSync(path.join(dir, name), drawIcon(size, opts))
  console.log('wrote', path.join('public/icons', name))
}
