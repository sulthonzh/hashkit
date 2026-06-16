/**
 * DJB2 and SDBM hash functions
 * Classic string hash functions used in various hash table implementations.
 */

/** DJB2 hash (Bernstein). Used in many hash table implementations. */
export function djb2(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

/** SDBM hash. Used in gawk and Berkeley DB. Good distribution. */
export function sdbm(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + (hash << 6) + (hash << 16) - hash;
    hash = hash | 0;
  }
  return hash >>> 0;
}
