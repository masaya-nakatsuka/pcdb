import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const outDir = path.resolve('public/lp')

function rect(x, y, width, height, fill, rx = 24, extra = '') {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" fill="${fill}" ${extra}/>`
}

function laptop(x, y, width, color = '#dbeafe') {
  const screenH = width * 0.52
  const baseH = width * 0.08
  return `
    ${rect(x, y, width, screenH, '#f8fafc', 28, `stroke="${color}" stroke-width="10"`)}
    ${rect(x + width * 0.06, y + width * 0.06, width * 0.88, screenH * 0.74, color, 18, 'opacity="0.7"')}
    ${rect(x - width * 0.06, y + screenH + 10, width * 1.12, baseH, '#cbd5e1', 16)}
    ${rect(x + width * 0.35, y + screenH + 20, width * 0.3, baseH * 0.22, '#94a3b8', 999)}
  `
}

function monitor(x, y, width, color = '#e0f2fe') {
  const screenH = width * 0.6
  return `
    ${rect(x, y, width, screenH, '#f8fafc', 30, `stroke="${color}" stroke-width="12"`)}
    ${rect(x + width * 0.07, y + width * 0.07, width * 0.86, screenH * 0.72, color, 20, 'opacity="0.75"')}
    ${rect(x + width * 0.44, y + screenH + 14, width * 0.12, width * 0.16, '#94a3b8', 10)}
    ${rect(x + width * 0.32, y + screenH + width * 0.18, width * 0.36, width * 0.08, '#cbd5e1', 999)}
  `
}

function tower(x, y, width, height, color = '#e2e8f0') {
  return `
    ${rect(x, y, width, height, '#f8fafc', 28, `stroke="${color}" stroke-width="10"`)}
    ${rect(x + width * 0.16, y + height * 0.12, width * 0.68, height * 0.1, color, 999)}
    ${rect(x + width * 0.22, y + height * 0.32, width * 0.56, height * 0.34, color, 22, 'opacity="0.7"')}
    <circle cx="${x + width * 0.5}" cy="${y + height * 0.82}" r="${width * 0.08}" fill="#94a3b8"/>
  `
}

function tablet(x, y, width, color = '#ccfbf1') {
  const h = width * 0.72
  return `
    ${rect(x, y, width, h, '#f8fafc', 36, `stroke="${color}" stroke-width="12"`)}
    ${rect(x + width * 0.08, y + width * 0.08, width * 0.84, h * 0.72, color, 24, 'opacity="0.78"')}
    <circle cx="${x + width * 0.5}" cy="${y + h - 24}" r="8" fill="#94a3b8"/>
  `
}

function miniPc(x, y, width, color = '#ede9fe') {
  const h = width * 0.44
  return `
    ${rect(x, y, width, h, '#f8fafc', 30, `stroke="${color}" stroke-width="10"`)}
    ${rect(x + width * 0.1, y + h * 0.24, width * 0.58, h * 0.2, color, 999, 'opacity="0.85"')}
    <circle cx="${x + width * 0.82}" cy="${y + h * 0.35}" r="${width * 0.035}" fill="#64748b"/>
    ${rect(x + width * 0.12, y + h * 0.68, width * 0.76, h * 0.08, '#cbd5e1', 999)}
  `
}

function sceneBackground(width, height, tintA, tintB) {
  return `
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#f8fafc"/>
        <stop offset="100%" stop-color="${tintA}"/>
      </linearGradient>
      <radialGradient id="glow" cx="74%" cy="24%" r="58%">
        <stop offset="0%" stop-color="${tintB}" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="${tintB}" stop-opacity="0"/>
      </radialGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="26" stdDeviation="28" flood-color="#0f172a" flood-opacity="0.14"/>
      </filter>
    </defs>
    ${rect(0, 0, width, height, 'url(#bg)', 0)}
    <rect x="0" y="0" width="${width}" height="${height}" fill="url(#glow)"/>
    <circle cx="${width * 0.12}" cy="${height * 0.18}" r="${width * 0.16}" fill="#ffffff" opacity="0.5"/>
  `
}

function makeSvg({ width, height, tintA, tintB, body }) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      ${sceneBackground(width, height, tintA, tintB)}
      <g filter="url(#shadow)">
        ${body}
      </g>
    </svg>
  `
}

const assets = [
  {
    name: 'specsy-hero-devices.webp',
    width: 1600,
    height: 1200,
    tintA: '#eaf2ff',
    tintB: '#bfdbfe',
    body: `
      ${monitor(770, 245, 520, '#dbeafe')}
      ${tower(1310, 360, 150, 410, '#e2e8f0')}
      ${laptop(185, 520, 650, '#dbeafe')}
      ${miniPc(930, 795, 310, '#ede9fe')}
      ${tablet(1010, 560, 320, '#ccfbf1')}
    `,
  },
  {
    name: 'specsy-laptop-new.webp',
    width: 1600,
    height: 1000,
    tintA: '#eff6ff',
    tintB: '#bfdbfe',
    body: `${laptop(285, 285, 980, '#dbeafe')}`,
  },
  {
    name: 'specsy-laptop-used.webp',
    width: 1600,
    height: 1000,
    tintA: '#ecfdf5',
    tintB: '#bbf7d0',
    body: `${laptop(260, 305, 900, '#bbf7d0')}${miniPc(1060, 590, 250, '#d1fae5')}`,
  },
  {
    name: 'specsy-desktop.webp',
    width: 1600,
    height: 1000,
    tintA: '#f1f5f9',
    tintB: '#cbd5e1',
    body: `${monitor(260, 230, 720, '#e2e8f0')}${tower(1050, 250, 230, 510, '#cbd5e1')}`,
  },
  {
    name: 'specsy-mini-pc.webp',
    width: 1600,
    height: 1000,
    tintA: '#f5f3ff',
    tintB: '#ddd6fe',
    body: `${monitor(260, 230, 650, '#ede9fe')}${miniPc(850, 650, 430, '#ddd6fe')}`,
  },
  {
    name: 'specsy-tablet.webp',
    width: 1600,
    height: 1000,
    tintA: '#ecfeff',
    tintB: '#a5f3fc',
    body: `${tablet(420, 210, 520, '#a5f3fc')}${tablet(865, 300, 380, '#ccfbf1')}`,
  },
  {
    name: 'specsy-monitor.webp',
    width: 1600,
    height: 1000,
    tintA: '#fffbeb',
    tintB: '#fde68a',
    body: `${monitor(285, 210, 980, '#fde68a')}`,
  },
]

await mkdir(outDir, { recursive: true })

for (const asset of assets) {
  const svg = makeSvg(asset)
  const out = path.join(outDir, asset.name)
  await sharp(Buffer.from(svg)).webp({ quality: 90 }).toFile(out)
  console.log(out)
}
