import { test } from 'node:test';
import assert from 'node:assert';
import {
  murmurhash3_32,
  fnv1a,
  fnv1,
  djb2,
  sdbm,
  xxhash32,
  crc32,
  adler32,
  hash,
  algorithms,
} from '../index';

test('murmurhash3_32', () => {
  // Known test vectors (seed=0)
  assert.equal(murmurhash3_32(''), 0);
  assert.equal(murmurhash3_32('hello'), 613153351);
  assert.equal(murmurhash3_32('Hello, World!'), 592631239);

  // Different seeds produce different results
  const h1 = murmurhash3_32('test', 0);
  const h2 = murmurhash3_32('test', 1);
  assert.notEqual(h1, h2);

  // Same input same output
  assert.equal(murmurhash3_32('test', 42), murmurhash3_32('test', 42));

  // Returns unsigned 32-bit
  const h = murmurhash3_32('a'.repeat(100));
  assert.ok(h >= 0 && h <= 0xffffffff);

  // Empty string with seed — finalization mix still applies
  assert.equal(murmurhash3_32('', 123), 2235285516);
});

test('murmurhash3_32 — distribution', () => {
  // Different strings should mostly hash to different values
  const strings: string[] = [];
  for (let i = 0; i < 1000; i++) strings.push(`item-${i}`);
  const hashes = new Set(strings.map((s) => murmurhash3_32(s)));
  assert.ok(hashes.size >= 998, 'Should have very few collisions');
});

test('fnv1a', () => {
  // Known test vectors
  assert.equal(fnv1a(''), 0x811c9dc5);
  assert.equal(fnv1a('a'), 0xe40c292c);
  assert.equal(fnv1a('hello'), 0x4f9f2cab);
  assert.equal(fnv1a('foobar'), 0xbf9cf968);

  // Returns unsigned
  assert.ok(fnv1a('test') >= 0);
  // Deterministic
  assert.equal(fnv1a('test'), fnv1a('test'));
});

test('fnv1', () => {
  assert.equal(fnv1(''), 0x811c9dc5);
  assert.equal(fnv1('a'), 0x050c5d7e);

  // Different from fnv1a
  assert.notEqual(fnv1('hello'), fnv1a('hello'));

  // Deterministic
  assert.equal(fnv1('test'), fnv1('test'));
});

test('djb2', () => {
  // Known values
  assert.equal(djb2(''), 5381);
  assert.equal(djb2('Hello'), 223289465);

  // Deterministic
  assert.equal(djb2('test'), djb2('test'));

  // Returns unsigned
  assert.ok(djb2('test') >= 0);
});

test('sdbm', () => {
  // Deterministic
  assert.equal(sdbm('test'), sdbm('test'));

  // Returns unsigned
  assert.ok(sdbm('test') >= 0);

  // Different from djb2
  assert.notEqual(sdbm('test'), djb2('test'));
});

test('xxhash32', () => {
  // Known test vectors (seed=0)
  assert.equal(xxhash32(''), 0x02cc5d05);
  assert.equal(xxhash32('a'), 0x550d7456);
  assert.equal(xxhash32('Hello, World!'), 1756798888);

  // Different seeds
  assert.notEqual(xxhash32('test', 0), xxhash32('test', 1));

  // Deterministic
  assert.equal(xxhash32('test', 42), xxhash32('test', 42));

  // Returns unsigned
  const h = xxhash32('a'.repeat(100));
  assert.ok(h >= 0 && h <= 0xffffffff);
});

test('crc32', () => {
  // Known CRC32 test vectors
  assert.equal(crc32(''), 0);
  assert.equal(crc32('a'), 0xe8b7be43);
  assert.equal(crc32('hello'), 0x3610a686);
  assert.equal(crc32('Hello, World!'), 0xec4ac3d0);

  // Deterministic
  assert.equal(crc32('test'), crc32('test'));
});

test('adler32', () => {
  // Known Adler-32 test vectors
  assert.equal(adler32(''), 1);
  assert.equal(adler32('a'), 0x00620062);
  assert.equal(adler32('hello'), 0x062c0215);
  assert.equal(adler32('Wikipedia'), 0x11E60398);

  // Deterministic
  assert.equal(adler32('test'), adler32('test'));
});

test('default hash() uses murmurhash3', () => {
  assert.equal(hash('hello'), murmurhash3_32('hello'));
  assert.equal(hash('hello', 42), murmurhash3_32('hello', 42));
});

test('algorithms list', () => {
  assert.ok(algorithms.includes('murmurhash3'));
  assert.ok(algorithms.includes('fnv1a'));
  assert.ok(algorithms.includes('crc32'));
  assert.ok(algorithms.includes('xxhash32'));
  assert.ok(algorithms.includes('adler32'));
  assert.ok(algorithms.includes('djb2'));
  assert.ok(algorithms.includes('sdbm'));
  assert.ok(algorithms.includes('fnv1'));
  assert.equal(algorithms.length, 8);
});

test('avalanche quality — all hashes', () => {
  // Single bit change should produce wildly different hashes
  const s1 = 'hello world';
  const s2 = 'hello worle'; // 1 char different

  const algos = [murmurhash3_32, fnv1a, fnv1, djb2, sdbm, xxhash32, crc32, adler32];
  for (const algo of algos) {
    const h1 = algo(s1);
    const h2 = algo(s2);
    assert.notEqual(h1, h2, `${algo.name} should differ for single char change`);
  }
});

test('consistency across multiple calls', () => {
  const inputs = ['', 'a', 'ab', 'abc', 'test data 123', '🎉 emoji test', 'a'.repeat(1000)];

  const fns = [murmurhash3_32, fnv1a, fnv1, djb2, sdbm, xxhash32, crc32, adler32];
  for (const fn of fns) {
    for (const input of inputs) {
      assert.equal(fn(input), fn(input), `${fn.name} must be deterministic for "${input.slice(0, 20)}"`);
    }
  }
});

test('handles unicode and emoji', () => {
  const inputs = ['你好世界', '🎉🚀', 'café', 'naïve', '日本語'];
  const fns = [murmurhash3_32, fnv1a, fnv1, djb2, sdbm, xxhash32, crc32, adler32];

  for (const fn of fns) {
    for (const input of inputs) {
      const h = fn(input);
      assert.ok(h >= 0 && h <= 0xffffffff, `${fn.name} should return valid uint32`);
      assert.equal(h, fn(input), `${fn.name} should be deterministic`);
    }
  }
});

test('large input performance', () => {
  const large = 'x'.repeat(100_000);
  const fns = [murmurhash3_32, fnv1a, fnv1, djb2, sdbm, xxhash32, crc32, adler32];
  for (const fn of fns) {
    const h = fn(large);
    assert.ok(h >= 0, `${fn.name} handles 100KB input`);
  }
});
