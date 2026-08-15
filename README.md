# hashkit

Zero-dependency non-cryptographic hash functions for Node.js.

Fast, well-distributed hashing for hash tables, bloom filters, checksums, and general-purpose use. **Not for cryptography.**

## Install

```bash
npm install @quadbyte/hashkit
```

## Algorithms

| Algorithm | Best For | Notes |
|-----------|----------|-------|
| **MurmurHash3** (x86_32) | General purpose, hash tables | Excellent distribution, seedable |
| **xxHash32** | Large inputs, streaming | Extremely fast, used in LZ4/ZSTD |
| **FNV-1a** | Short keys, simple use cases | Simple and fast, zero config |
| **CRC32** | Checksums, data integrity | IEEE 802.3 polynomial, used in zip/gzip/PNG |
| **DJB2** | Legacy hash tables | Bernstein's classic |
| **SDBM** | Hash tables | Used in Berkeley DB |
| **FNV-1** | Legacy compatibility | Slightly worse distribution than FNV-1a |
| **Adler-32** | Checksums | Used in zlib, faster but weaker than CRC32 |

## Usage

```typescript
import { murmurhash3_32, fnv1a, xxhash32, crc32, hash } from '@quadbyte/hashkit';

// Default hash (murmurhash3)
const h = hash('hello world');

// Specific algorithms
murmurhash3_32('hello', 42);  // 1338531857 (with seed=42)
fnv1a('hello');                // 1335831723
xxhash32('hello');             // 484191181
crc32('hello');                // 907060870

// All return unsigned 32-bit integers
```

## CLI

```bash
# Single hash
hashkit murmurhash3 "hello world"
hashkit fnv1a "hello"

# All algorithms at once
hashkit --all "test data"

# From stdin
echo "data" | hashkit crc32 --stdin

# Hex output
hashkit xxhash32 "hello" --hex

# List algorithms
hashkit --list
```

## Performance

All algorithms are pure JavaScript with zero dependencies. They operate on UTF-8 byte arrays and handle Unicode/emoji correctly.

For most use cases, `murmurhash3_32` offers the best balance of speed and distribution quality. If you're hashing large inputs (>1KB), `xxhash32` tends to be faster due to its 16-byte stripe design.

## License

MIT
