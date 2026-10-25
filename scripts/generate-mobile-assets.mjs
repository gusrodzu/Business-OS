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
function inRoundedRect(x, y, left, top, right, bottom, radius) {
  const px = Math.max(left + radius, Math.min(x, right - radius));
  const py = Math.max(top + radius, Math.min(y, bottom - radius));
  return ((x - px) ** 2 + (y - py) ** 2) <= radius ** 2;
}
function inEllipse(x, y, cx, cy, rx, ry) {
  return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
}
function makeIcon(size) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y += 1) {
    const start = y * (size * 4 + 1);
    raw[start] = 0;
    for (let x = 0; x < size; x += 1) {
      const u = (x + 0.5) / size, v = (y + 0.5) / size;
      let color = [32, 33, 37, 255];
      if (inRoundedRect(u, v, .13, .13, .87, .87, .205)) color = [221, 249, 105, 255];
      const upper = inEllipse(u, v, .505, .395, .18, .156);
      const lower = inEllipse(u, v, .505, .615, .18, .18);
      const stem = u > .345 && u < .478 && v > .265 && v < .74;
      const middle = u > .40 && u < .515 && v > .45 && v < .55;
      const upperCutout = inEllipse(u, v, .503, .393, .071, .064) && u > .45;
      const lowerCutout = inEllipse(u, v, .505, .616, .075, .072) && u > .45;
      if (upper || lower || stem || middle) color = [31, 35, 31, 255];
      if ((upperCutout || lowerCutout) && !stem) color = [221, 249, 105, 255];
      const at = start + 1 + x * 4;
      raw[at] = color[0]; raw[at + 1] = color[1]; raw[at + 2] = color[2]; raw[at + 3] = color[3];
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; header[9] = 6;
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
