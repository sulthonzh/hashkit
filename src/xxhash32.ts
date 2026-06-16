/**
 * xxHash32 — by Yann Collet
 * Extremely fast for large inputs. Used in LZ4, ZSTD, and many databases.
 * https://github.com/Cyan4973/xxHash
 */

const P1 = 0x9E3779B1;
const P2 = 0x85EBCA77;
const P3 = 0xC2B2AE3D;
const P4 = 0x27D4EB2F;
const P5 = 0x165667B1;

function rotl(x: number, r: number): number {
  return ((x << r) | (x >>> (32 - r))) >>> 0;
}

function readU32(data: Uint8Array, offset: number): number {
  return (
    (data[offset] & 0xff) |
    ((data[offset + 1] & 0xff) << 8) |
    ((data[offset + 2] & 0xff) << 16) |
    ((data[offset + 3] & 0xff) << 24)
  );
}

/** XXH32 round function */
function round(acc: number, input: number): number {
  acc = (acc + Math.imul(input, P2)) >>> 0;
  acc = rotl(acc, 13);
  acc = Math.imul(acc, P1);
  return acc >>> 0;
}

/** XXH32 merge round */
function mergeRound(acc: number, val: number): number {
  val = round(0, val);
  acc = (acc ^ val) >>> 0;
  acc = (Math.imul(acc, P1) + P4) >>> 0;
  return acc;
}

/** Compute xxHash32 of a string with optional seed. Returns 32-bit unsigned int. */
export function xxhash32(input: string, seed = 0): number {
  const data = new TextEncoder().encode(input);
  const len = data.length;
  let h32: number;
  let p = 0;

  if (len >= 16) {
    const limit = len - 16;
    let v1 = (seed + P1 + P2) >>> 0;
    let v2 = (seed + P2) >>> 0;
    let v3 = (seed + 0) >>> 0;
    let v4 = (seed - P1) >>> 0;

    do {
      v1 = round(v1, readU32(data, p)); p += 4;
      v2 = round(v2, readU32(data, p)); p += 4;
      v3 = round(v3, readU32(data, p)); p += 4;
      v4 = round(v4, readU32(data, p)); p += 4;
    } while (p <= limit);

    h32 = (rotl(v1, 1) + rotl(v2, 7) + rotl(v3, 12) + rotl(v4, 18)) >>> 0;

    h32 = mergeRound(h32, v1);
    h32 = mergeRound(h32, v2);
    h32 = mergeRound(h32, v3);
    h32 = mergeRound(h32, v4);
  } else {
    h32 = (seed + P5) >>> 0;
  }

  h32 = (h32 + len) >>> 0;

  // Process remaining 4-byte blocks
  while (p + 4 <= len) {
    h32 = (h32 + Math.imul(readU32(data, p), P3)) >>> 0;
    h32 = Math.imul(rotl(h32, 17), P4);
    h32 = (h32 ^ (h32 >>> 15)) >>> 0;
    p += 4;
  }

  // Process remaining bytes
  while (p < len) {
    h32 = (h32 + Math.imul(data[p], P5)) >>> 0;
    h32 = Math.imul(rotl(h32, 11), P1);
    p++;
  }

  // Avalanche
  h32 = (h32 ^ (h32 >>> 15)) >>> 0;
  h32 = Math.imul(h32, P2);
  h32 = (h32 ^ (h32 >>> 13)) >>> 0;
  h32 = Math.imul(h32, P3);
  h32 = (h32 ^ (h32 >>> 16)) >>> 0;

  return h32 >>> 0;
}
