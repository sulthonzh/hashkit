#!/usr/bin/env node

/**
 * hashkit CLI — compute hashes from the command line
 */

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
  Algorithm,
} from './index';

const usage = `
hashkit — non-cryptographic hash functions

USAGE:
  hashkit <algorithm> <string> [--seed N]
  hashkit <algorithm> --stdin
  echo "string" | hashkit <algorithm>
  hashkit --list
  hashkit --all <string>

ALGORITHMS:
${algorithms.map((a) => `  ${a}`).join('\n')}

OPTIONS:
  --seed N     Seed value (for murmurhash3, xxhash32)
  --hex        Output as hex string
  --stdin      Read input from stdin
  --list       List all algorithms
  --all        Run all algorithms on the input
  --help, -h   Show this help
`.trim();

function toHex(n: number): string {
  return '0x' + n.toString(16).padStart(8, '0');
}

function getHash(algo: Algorithm, input: string, seed: number): number {
  switch (algo) {
    case 'murmurhash3':
      return murmurhash3_32(input, seed);
    case 'fnv1a':
      return fnv1a(input);
    case 'fnv1':
      return fnv1(input);
    case 'djb2':
      return djb2(input);
    case 'sdbm':
      return sdbm(input);
    case 'xxhash32':
      return xxhash32(input, seed);
    case 'crc32':
      return crc32(input);
    case 'adler32':
      return adler32(input);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(usage);
    return;
  }

  if (args.includes('--list')) {
    console.log('Available algorithms:');
    for (const a of algorithms) {
      console.log(`  ${a}`);
    }
    return;
  }

  const asHex = args.includes('--hex');
  const cleanArgs = args.filter((a) => a !== '--hex');

  let algorithm: Algorithm | null = null;
  let input: string | null = null;
  let seed = 0;
  let useStdin = false;
  let runAll = false;

  for (let i = 0; i < cleanArgs.length; i++) {
    if (cleanArgs[i] === '--stdin') {
      useStdin = true;
    } else if (cleanArgs[i] === '--all') {
      runAll = true;
      if (i + 1 < cleanArgs.length) input = cleanArgs[i + 1];
    } else if (cleanArgs[i] === '--seed') {
      seed = parseInt(cleanArgs[i + 1] || '0', 10);
      i++;
    } else if (!algorithm && algorithms.includes(cleanArgs[i] as Algorithm)) {
      algorithm = cleanArgs[i] as Algorithm;
    } else if (!input) {
      input = cleanArgs[i];
    }
  }

  if (useStdin && !input) {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    input = Buffer.concat(chunks).toString('utf-8');
  }

  if (!input) {
    // Demo mode
    console.log('\nhashkit demo:\n');
    const demoStrings = ['hello', 'world', 'hashkit', 'The quick brown fox'];
    for (const s of demoStrings) {
      const h = hash(s);
      console.log(`  hash("${s}") = ${h} (${toHex(h)})`);
    }
    return;
  }

  if (runAll) {
    console.log(`Input: "${input}"\n`);
    for (const algo of algorithms) {
      const h = getHash(algo, input, seed);
      console.log(`  ${algo.padEnd(14)} ${asHex ? toHex(h) : h}`);
    }
    return;
  }

  if (!algorithm) {
    algorithm = 'murmurhash3';
  }

  const result = getHash(algorithm, input, seed);
  console.log(asHex ? toHex(result) : result);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
