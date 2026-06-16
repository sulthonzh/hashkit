/**
 * CRC32 (Cyclic Redundancy Check)
 * IEEE 802.3 polynomial (0xEDB88320 reflected). Used in zip, gzip, PNG.
 */

// Precomputed CRC32 table (IEEE 802.3 polynomial)
let table: Uint32Array | null = null;

function getTable(): Uint32Array {
  if (table) return table;
  table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
}

/** Compute CRC32 of a string. Returns 32-bit unsigned integer. */
export function crc32(input: string): number {
  const data = new TextEncoder().encode(input);
  const tbl = getTable();
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = tbl[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
