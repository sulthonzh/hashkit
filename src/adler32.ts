/**
 * Adler-32 checksum
 * Used in zlib decompression. Simpler and faster than CRC32 but weaker.
 * https://en.wikipedia.org/wiki/Adler-32
 */

const MOD_ADLER = 65521;

/** Compute Adler-32 checksum of a string. Returns 32-bit unsigned integer. */
export function adler32(input: string): number {
  const data = new TextEncoder().encode(input);
  let a = 1;
  let b = 0;
  for (let i = 0; i < data.length; i++) {
    a = (a + data[i]) % MOD_ADLER;
    b = (b + a) % MOD_ADLER;
  }
  return ((b << 16) | a) >>> 0;
}
