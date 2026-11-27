// Deterministic starter icons for Web/PWA and native packaging.
// Generates only public brand assets; no credentials or user data involved.
import {mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {deflateSync} from 'node:zlib';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const label = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([label, data])), 0);
  return Buffer.concat([length, label, data, checksum]);
}
// Rasterize the same three-cell mark used by haibu-mark.svg without new dependencies.
// Center the mark inside the PWA maskable safe area.
function inHex(x, y, cx, cy, radius) {
  const dx = Math.abs(x - cx);
  const dy = Math.abs(y - cy);
  return dx <= Math.sqrt(3) * radius / 2 && dy <= radius - dx / Math.sqrt(3);
}
function inCircle(x, y, cx, cy, radius) {
  return (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2;
}
function makeIcon(size) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  const ink = [21, 29, 41, 255];
  const amber = [233, 191, 99, 255];
  const cells = [[0.50, 0.31], [0.28, 0.64], [0.72, 0.64]];
  const radius = 0.19;
  for (let y = 0; y < size; y += 1) {
    const start = y * (size * 4 + 1);
    raw[start] = 0;
    for (let x = 0; x < size; x += 1) {
      const u = (x + 0.5) / size;
      const v = (y + 0.5) / size;
      const outline = cells.some(([cx, cy]) =>
        inHex(u, v, cx, cy, radius) && !inHex(u, v, cx, cy, radius - 0.017));
      const active = inHex(u, v, 0.50, 0.31, 0.075)
        || inCircle(u, v, 0.28, 0.64, 0.025)
        || inCircle(u, v, 0.72, 0.64, 0.025);
      const color = outline || active ? amber : ink;
      const at = start + 1 + x * 4;
      raw[at] = color[0];
      raw[at + 1] = color[1];
      raw[at + 2] = color[2];
      raw[at + 3] = color[3];
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header), chunk('IDAT', deflateSync(raw, {level: 9})),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const target = path.join(root, 'apps/web/public/icons');
mkdirSync(target, {recursive: true});
for (const size of [180, 192, 512]) {
  writeFileSync(path.join(target, `icon-${size}.png`), makeIcon(size));
  process.stdout.write(`Mobile icon ${size}x${size}: OK\n`);
}
