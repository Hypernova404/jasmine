import { writeFileSync, mkdirSync } from "node:fs";
import { deflateSync } from "node:zlib";

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type);
  const crcBuf = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcBuf));
  return Buffer.concat([len, t, data, crc]);
}

function makePng(size, path) {
  const raw = Buffer.alloc((size * 3 + 1) * size);
  let o = 0;
  for (let y = 0; y < size; y++) {
    raw[o++] = 0;
    for (let x = 0; x < size; x++) {
      const cx = x / size - 0.5;
      const cy = y / size - 0.5;
      const inLeaf = cx * cx * 4 + (cy + 0.1) * (cy + 0.1) * 3 < 0.22;
      const stem = Math.abs(cx) < 0.03 && cy > 0.05 && cy < 0.35;
      if (stem || inLeaf) {
        raw[o++] = 255;
        raw[o++] = 255;
        raw[o++] = 255;
      } else {
        raw[o++] = 0x15;
        raw[o++] = 0x80;
        raw[o++] = 0x3d;
      }
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  writeFileSync(path, png);
  console.log("wrote", path);
}

mkdirSync("public/icons", { recursive: true });
makePng(192, "public/icons/icon-192.png");
makePng(512, "public/icons/icon-512.png");
