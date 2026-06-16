/**
 * MurmurHash3 (x86_32) — by Austin Appleby
 * Excellent distribution for hash tables. Non-cryptographic.
 * https://github.com/aappleby/smhasher
 */

const c1 = 0xcc9e2d51;
const c2 = 0x1b873593;

function mul32(a: number, b: number): number {
  return (a & 0xffff) * b + (((a >>> 16) * b & 0xffff) << 16);
}

function rotl32(x: number, r: number): number {
  return (x << r) | (x >>> (32 - r));
}

/** Compute MurmurHash3 x86_32 of a string. Returns a 32-bit unsigned integer. */
export function murmurhash3_32(input: string, seed = 0): number {
  const data = new TextEncoder().encode(input);
  const len = data.length;
  const nblocks = len >> 2;

  let h1 = seed >>> 0;

  for (let i = 0; i < nblocks; i++) {
    const k1 =
      (data[i * 4] & 0xff) |
      ((data[i * 4 + 1] & 0xff) << 8) |
      ((data[i * 4 + 2] & 0xff) << 16) |
      ((data[i * 4 + 3] & 0xff) << 24);

    let kk = mul32(k1, c1);
    kk = rotl32(kk, 15);
    kk = mul32(kk, c2);

    h1 ^= kk;
    h1 = rotl32(h1, 13);
    h1 = (mul32(h1, 5) + 0xe6546b64) | 0;
  }

  // Tail
  const tail = data.length - nblocks * 4;
  let k1 = 0;

  switch (tail) {
    case 3:
      k1 ^= data[nblocks * 4 + 2] << 16;
    // fall through
    case 2:
      k1 ^= data[nblocks * 4 + 1] << 8;
    // fall through
    case 1:
      k1 ^= data[nblocks * 4];
      k1 = mul32(k1, c1);
      k1 = rotl32(k1, 15);
      k1 = mul32(k1, c2);
      h1 ^= k1;
  }

  // Finalization
  h1 ^= len;
  h1 ^= h1 >>> 16;
  h1 = mul32(h1, 0x85ebca6b);
  h1 ^= h1 >>> 13;
  h1 = mul32(h1, 0xc2b2ae35);
  h1 ^= h1 >>> 16;

  return h1 >>> 0;
}
