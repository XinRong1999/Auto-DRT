import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const outDir = process.argv[2];
const icnsPath = process.argv[3];
if (!outDir) {
  throw new Error("Usage: node make-icon.mjs <Icon.iconset directory> [output.icns]");
}

const crcTable = new Uint32Array(256).map((_, index) => {
  let c = index;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});

mkdirSync(outDir, { recursive: true });

const sizes = [
  ["icon_16x16.png", 16],
  ["icon_16x16@2x.png", 32],
  ["icon_32x32.png", 32],
  ["icon_32x32@2x.png", 64],
  ["icon_128x128.png", 128],
  ["icon_128x128@2x.png", 256],
  ["icon_256x256.png", 256],
  ["icon_256x256@2x.png", 512],
  ["icon_512x512.png", 512],
  ["icon_512x512@2x.png", 1024]
];

const pngBySize = new Map();

for (const [name, size] of sizes) {
  const png = encodePng(size, size, renderIcon(size));
  writeFileSync(join(outDir, name), png);
  pngBySize.set(size, png);
}

if (icnsPath) {
  writeFileSync(icnsPath, encodeIcns([
    ["icp4", pngBySize.get(16)],
    ["icp5", pngBySize.get(32)],
    ["icp6", pngBySize.get(64)],
    ["ic07", pngBySize.get(128)],
    ["ic08", pngBySize.get(256)],
    ["ic09", pngBySize.get(512)],
    ["ic10", pngBySize.get(1024)]
  ]));
}

function renderIcon(size) {
  const data = new Uint8Array(size * size * 4);
  const radius = size * 0.19;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const cover = roundedRectCoverage(x + 0.5, y + 0.5, size, size, radius);
      if (cover <= 0) continue;
      const t = (x + y) / (size * 2);
      const base = mix([15, 118, 110], [22, 78, 99], t);
      setPixel(data, size, x, y, base[0], base[1], base[2], Math.round(255 * cover));
    }
  }

  drawLine(data, size, [
    [0.20, 0.67],
    [0.80, 0.67]
  ], size * 0.033, [217, 247, 238], 0.38);

  drawLine(data, size, [
    [0.24, 0.70],
    [0.31, 0.58],
    [0.39, 0.48],
    [0.47, 0.48],
    [0.55, 0.62],
    [0.63, 0.61],
    [0.73, 0.49],
    [0.78, 0.35]
  ], size * 0.056, [245, 158, 11], 1);

  drawLine(data, size, [
    [0.39, 0.48],
    [0.47, 0.48],
    [0.55, 0.62],
    [0.63, 0.61],
    [0.73, 0.49],
    [0.78, 0.35]
  ], size * 0.031, [248, 250, 252], 0.78);

  drawCircle(data, size, 0.44, 0.48, 0.048, [248, 250, 252], 1);
  drawCircle(data, size, 0.60, 0.61, 0.043, [245, 158, 11], 1);
  drawLine(data, size, [[0.27, 0.28], [0.74, 0.28]], size * 0.029, [217, 247, 238], 0.82);
  drawLine(data, size, [[0.27, 0.35], [0.55, 0.35]], size * 0.028, [217, 247, 238], 0.70);
  drawText(data, size, "DRT", 0.5, 0.80, size * 0.118, [248, 250, 252], 0.96);

  return data;
}

function drawText(data, size, text, cx, cy, scale, color, alpha) {
  const glyphs = {
    D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
    R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"]
  };
  const glyphW = 5;
  const glyphH = 7;
  const gap = 1.4;
  const total = text.length * glyphW + (text.length - 1) * gap;
  const unit = scale / glyphH;
  const startX = size * cx - total * unit / 2;
  const startY = size * cy - glyphH * unit / 2;

  for (let i = 0; i < text.length; i += 1) {
    const glyph = glyphs[text[i]];
    if (!glyph) continue;
    const gx = startX + i * (glyphW + gap) * unit;
    for (let row = 0; row < glyphH; row += 1) {
      for (let col = 0; col < glyphW; col += 1) {
        if (glyph[row][col] === "1") {
          fillRect(data, size, gx + col * unit, startY + row * unit, unit * 0.82, unit * 0.82, color, alpha);
        }
      }
    }
  }
}

function fillRect(data, size, x0, y0, w, h, color, alpha) {
  const minX = Math.max(0, Math.floor(x0 - 1));
  const maxX = Math.min(size - 1, Math.ceil(x0 + w + 1));
  const minY = Math.max(0, Math.floor(y0 - 1));
  const maxY = Math.min(size - 1, Math.ceil(y0 + h + 1));
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const dx = Math.max(x0 - (x + 0.5), 0, (x + 0.5) - (x0 + w));
      const dy = Math.max(y0 - (y + 0.5), 0, (y + 0.5) - (y0 + h));
      const cover = clamp(1 - Math.hypot(dx, dy), 0, 1) * alpha;
      blendPixel(data, size, x, y, color, cover);
    }
  }
}

function drawCircle(data, size, cx, cy, radius, color, alpha) {
  const x0 = cx * size;
  const y0 = cy * size;
  const r = radius * size;
  const minX = Math.max(0, Math.floor(x0 - r - 2));
  const maxX = Math.min(size - 1, Math.ceil(x0 + r + 2));
  const minY = Math.max(0, Math.floor(y0 - r - 2));
  const maxY = Math.min(size - 1, Math.ceil(y0 + r + 2));
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const dist = Math.hypot(x + 0.5 - x0, y + 0.5 - y0);
      const cover = clamp(r + 0.8 - dist, 0, 1) * alpha;
      blendPixel(data, size, x, y, color, cover);
    }
  }
}

function drawLine(data, size, points, width, color, alpha) {
  const px = points.map(([x, y]) => [x * size, y * size]);
  const half = width / 2;
  const minX = Math.max(0, Math.floor(Math.min(...px.map((p) => p[0])) - half - 2));
  const maxX = Math.min(size - 1, Math.ceil(Math.max(...px.map((p) => p[0])) + half + 2));
  const minY = Math.max(0, Math.floor(Math.min(...px.map((p) => p[1])) - half - 2));
  const maxY = Math.min(size - 1, Math.ceil(Math.max(...px.map((p) => p[1])) + half + 2));
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      let dist = Infinity;
      for (let i = 0; i < px.length - 1; i += 1) {
        dist = Math.min(dist, distanceToSegment(x + 0.5, y + 0.5, px[i], px[i + 1]));
      }
      const cover = clamp(half + 0.85 - dist, 0, 1) * alpha;
      blendPixel(data, size, x, y, color, cover);
    }
  }
}

function distanceToSegment(x, y, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const lengthSq = dx * dx + dy * dy;
  const t = lengthSq === 0 ? 0 : clamp(((x - a[0]) * dx + (y - a[1]) * dy) / lengthSq, 0, 1);
  return Math.hypot(x - (a[0] + t * dx), y - (a[1] + t * dy));
}

function roundedRectCoverage(x, y, width, height, radius) {
  const cx = clamp(x, radius, width - radius);
  const cy = clamp(y, radius, height - radius);
  const dist = Math.hypot(x - cx, y - cy);
  return clamp(radius + 0.8 - dist, 0, 1);
}

function blendPixel(data, size, x, y, color, alpha) {
  if (alpha <= 0) return;
  const idx = (y * size + x) * 4;
  const srcA = clamp(alpha, 0, 1);
  const dstA = data[idx + 3] / 255;
  const outA = srcA + dstA * (1 - srcA);
  if (outA <= 0) return;
  data[idx] = Math.round((color[0] * srcA + data[idx] * dstA * (1 - srcA)) / outA);
  data[idx + 1] = Math.round((color[1] * srcA + data[idx + 1] * dstA * (1 - srcA)) / outA);
  data[idx + 2] = Math.round((color[2] * srcA + data[idx + 2] * dstA * (1 - srcA)) / outA);
  data[idx + 3] = Math.round(outA * 255);
}

function setPixel(data, size, x, y, r, g, b, a) {
  const idx = (y * size + x) * 4;
  data[idx] = r;
  data[idx + 1] = g;
  data[idx + 2] = b;
  data[idx + 3] = a;
}

function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t)
  ];
}

function encodePng(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    Buffer.from(rgba.buffer, y * width * 4, width * 4).copy(raw, rowStart + 1);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", concatBuffers(u32(width), u32(height), Buffer.from([8, 6, 0, 0, 0]))),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

function encodeIcns(items) {
  const chunks = items.map(([type, data]) => {
    if (!data) throw new Error(`Missing PNG data for ${type}`);
    return concatBuffers(Buffer.from(type, "ascii"), u32(data.length + 8), data);
  });
  const totalLength = 8 + chunks.reduce((sum, chunkData) => sum + chunkData.length, 0);
  return concatBuffers(Buffer.from("icns", "ascii"), u32(totalLength), ...chunks);
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  return concatBuffers(u32(data.length), typeBuffer, data, u32(crc32(concatBuffers(typeBuffer, data))));
}

function u32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(value >>> 0, 0);
  return buffer;
}

function concatBuffers(...buffers) {
  return Buffer.concat(buffers);
}

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) {
    c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
