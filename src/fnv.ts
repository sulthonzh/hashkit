/**
 * FNV (Fowler-Noll-Vo) hash functions
 * Simple, fast, well-known. Good for short keys.
 * https://www.isthe.com/chongo/tech/comp/fnv/
 */

const FNV_PRIME_32 = 0x01000193;
const FNV_OFFSET_32 = 0x811c9dc5;

/** FNV-1a: XOR then multiply. Better avalanche than FNV-1. */
export function fnv1a(input: string): number {
  let hash = FNV_OFFSET_32 >>> 0;
  const data = new TextEncoder().encode(input);
  for (let i = 0; i < data.length; i++) {
    hash ^= data[i];
    hash = Math.imul(hash, FNV_PRIME_32);
  }
  return hash >>> 0;
}

/** FNV-1: Multiply then XOR. (Original, slightly worse distribution.) */
export function fnv1(input: string): number {
  let hash = FNV_OFFSET_32 >>> 0;
  const data = new TextEncoder().encode(input);
  for (let i = 0; i < data.length; i++) {
    hash = Math.imul(hash, FNV_PRIME_32);
    hash ^= data[i];
  }
  return hash >>> 0;
}
