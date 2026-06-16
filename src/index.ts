/**
 * hashkit — Zero-dependency non-cryptographic hash functions
 *
 * Provides fast, well-distributed hash functions for hash tables, bloom filters,
 * checksums, and general-purpose hashing. NOT for cryptography.
 */

export { murmurhash3_32 } from './murmurhash3';
export { fnv1a, fnv1 } from './fnv';
export { djb2, sdbm } from './djb2';
export { xxhash32 } from './xxhash32';
export { crc32 } from './crc32';
export { adler32 } from './adler32';

import { murmurhash3_32 } from './murmurhash3';

/** Convert a string to a UTF-8 byte array (Uint8Array). */
export function toBytes(input: string): Uint8Array {
  return new TextEncoder().encode(input);
}

/** Hash a string using the default algorithm (murmurhash3_32). */
export function hash(input: string, seed = 0): number {
  return murmurhash3_32(input, seed);
}

/** Get all available hash algorithms. */
export const algorithms = [
  'murmurhash3',
  'fnv1a',
  'fnv1',
  'djb2',
  'sdbm',
  'xxhash32',
  'crc32',
  'adler32',
] as const;

export type Algorithm = (typeof algorithms)[number];
