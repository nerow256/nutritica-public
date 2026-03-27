import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function createIcon(size, maskable) {
  const pixels = Buffer.alloc(size * size * 4);
  const cx = size / 2, cy = size / 2;
  const radius = maskable ? size / 2 : size * 0.45;
  const crossLen = size * 0.3, crossW = size * 0.09;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const inCircle = dist <= radius;

      if (inCircle || maskable) {
        pixels[idx] = 0x2e; pixels[idx+1] = 0x7d; pixels[idx+2] = 0x32; pixels[idx+3] = 255;
        // White health cross
        const isCross = (Math.abs(dx) < crossW && Math.abs(dy) < crossLen) ||
                        (Math.abs(dy) < crossW && Math.abs(dx) < crossLen);
        if (isCross && dist <= radius * 0.82) {
          pixels[idx] = 255; pixels[idx+1] = 255; pixels[idx+2] = 255;
        }
      }
    }
  }

  // Encode PNG
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;

  const raw = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    raw[y * (1 + size * 4)] = 0;
    pixels.copy(raw, y * (1 + size * 4) + 1, y * size * 4, (y + 1) * size * 4);
  }

  return Buffer.concat([sig, makeChunk('IHDR', ihdr), makeChunk('IDAT', deflateSync(raw)), makeChunk('IEND', Buffer.alloc(0))]);
}

const dir = join(process.cwd(), 'public', 'icons');
for (const [size, maskable, name] of [[192,false,'icon-192.png'],[512,false,'icon-512.png'],[192,true,'icon-maskable-192.png'],[512,true,'icon-maskable-512.png']]) {
  writeFileSync(join(dir, name), createIcon(size, maskable));
  console.log(`Generated ${name}`);
}
