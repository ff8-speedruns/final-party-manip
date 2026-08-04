/**
 * Final party manipulation engine.
 *
 * Ported from Pingval's Ruby script.
 */

const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

const isEven = (num) => num % 2 === 0;

const between = (value, a, b) => value >= Math.min(a, b) && value <= Math.max(a, b);

// Target parties, in the same order they're defined and displayed in.
export const TARGETS = [
  ['irvine', 'squall', 'zell'],
  ['irvine', 'squall', 'selphie'],
  ['irvine', 'squall', 'rinoa'],
  ['irvine', 'zell', 'quistis'],
  ['irvine', 'zell', 'selphie'],
  ['irvine', 'zell', 'rinoa'],
  ['irvine', 'selphie', 'rinoa'],
  ['irvine', 'selphie', 'quistis'],
  ['irvine', 'quistis', 'rinoa'],
];

export const GAME_VERSIONS = [
  { value: 'PC', label: 'PC (FR)', duration: 21.5 },
  { value: 'PCEN', label: 'PC (EN)', duration: 22 },
  { value: 'JPHD', label: 'PC (HD JP)', duration: 21.2 },
  { value: 'PSJA', label: 'PS2 (JP)', duration: 22 },
  { value: 'PSEN', label: 'PS2 (EN)', duration: 22.7 },
];

export const HOLY_WAR_PARTY = ['selphie', 'zell', 'quistis', 'irvine'];

export const MOVEMENTS_SIZE = 12;

export const CHARACTERS = ['squall', 'zell', 'irvine', 'quistis', 'rinoa', 'selphie'];

// Party combinations the game picks between, as character indices.
const PARTY_TABLE = [
  [0, 1, 2], [0, 1, 4], [0, 1, 5], [0, 1, 3], [0, 2, 4],
  [0, 2, 5], [0, 2, 3], [0, 4, 5], [0, 4, 3], [0, 5, 3],
  [1, 2, 4], [1, 2, 5], [1, 2, 3], [1, 4, 5], [1, 4, 3],
  [1, 5, 3], [2, 4, 5], [2, 4, 3], [2, 5, 3], [4, 5, 3],
];

/**
 * FF8's field RNG: a linear congruential generator with
 * a = 0x41C64E6D, b = 0x3039, m = 2^32.
 * BigInt because the multiply overflows a double.
 */
class RNG {
  static A = BigInt(0x41c64e6d);
  static B = BigInt(0x3039);
  static M = BigInt(0xffffffff);
  static WORD_MASK = 0x7fff;
  static BYTE_MASK = 0xff;

  constructor() {
    this.current = 1;
  }

  createRand(seed) {
    return Number((BigInt(seed) * RNG.A + RNG.B) & RNG.M);
  }

  nextRng() {
    const old = this.current;
    this.current = this.createRand(this.current);
    return old;
  }

  /** rand(0..32767) */
  next15Bits() {
    return (this.nextRng() >> 16) & RNG.WORD_MASK;
  }

  /** Upper second byte of the state, rand(0..255) */
  next1b() {
    return this.next15Bits() & RNG.BYTE_MASK;
  }
}

const toParty = (indices) => indices.map((i) => CHARACTERS[i]);

const lastParty = (rnd) => toParty(PARTY_TABLE[Math.floor(rnd / 13)]);

const partyKey = (party) => [...party].sort().join(',');

// WASD, IJKL and 8462 all mean the same directions in a search pattern.
const DIRECTION_ALIASES = { s: '2', a: '4', d: '6', w: '8', k: '2', j: '4', l: '6', i: '8' };

// Idea credit: Kiitoksia. Anything not a direction becomes a wildcard.
const WILDCARD_PATTERN = /[^wasdijkl2468]/g;

/**
 * For each index, how many extra draws away the nearest occurrence of each
 * target party is. Walks the party list backwards, counting up from each hit.
 */
function generateOffsetTable(partyArr, targets) {
  const reversed = [...partyArr].reverse();
  const table = [];
  const targetKeys = targets.map(partyKey);

  reversed.forEach((currentParty, i) => {
    table[i] = {};

    if (i > 0) {
      for (const key of Object.keys(table[i - 1])) {
        table[i][key] = table[i - 1][key] + 1;
      }
    }

    const currentKey = partyKey(currentParty);
    if (targetKeys.includes(currentKey)) {
      table[i][currentKey] = 0;
    }
  });

  return table.reverse();
}

export function createManip({
  lastMapDuration = 21.5,
  targets = TARGETS,
  base = 12,
  width = 9000,
  movementsSize = MOVEMENTS_SIZE,
} = {}) {
  // How far past the last recorded movement the party-selection draw lands.
  const rem = lastMapDuration % 0.5;
  const safeRange = [0.1, 0.2, 0.3, 0.4];
  const minSafe = Math.min(...safeRange);
  const maxSafe = Math.max(...safeRange);
  const lastMapExtra = between(rem, minSafe, maxSafe) ? 0 : rem < minSafe ? 0.25 - rem : 0.75 - rem;
  const partyRndOffset = Math.floor((lastMapDuration + lastMapExtra) / 0.5) + 1;

  // Work out the window of indices to build (only the min/max of this set
  // matter - the table itself is always built ascending from `from` to `to`).
  let indices = [
    ...new Set(
      range(0, width / 2)
        .flatMap((offset) => [base + offset, base - offset])
        .filter((idx) => idx >= 0)
    ),
  ];

  if (isEven(width)) {
    const max = Math.max(...indices);
    indices = indices.filter((n) => n !== max);
  }

  const from = Math.min(...indices);
  const to = Math.max(...indices);

  // Build the tables.
  const margin = 250;
  const size = to + margin;

  const stateRng = new RNG();
  const rngStateArr = range(0, size).map(() => stateRng.nextRng());

  // sourceArr is just the upper second byte of each rngState.
  const sourceArr = rngStateArr.map((state) => (state >> 16) & RNG.BYTE_MASK);

  // Which way Squall drifts during time compression.
  const directionArr = sourceArr.map((v) => ['8', '2', '4', '6'][v & 3]);

  const partyArr = Array.from({ length: size - partyRndOffset }, (_, idx) =>
    lastParty(sourceArr[idx + partyRndOffset])
  );

  const offsetTableArr = generateOffsetTable(partyArr, targets);

  const table = range(from, to).map((idx) => {
    const targetOffsets = targets.map((targetParty) => ({
      party: targetParty,
      offset: offsetTableArr[idx][partyKey(targetParty)],
    }));

    const min = Math.min(...targetOffsets.map((item) => item.offset));

    return {
      index: idx,
      source: sourceArr[idx],
      rngState: rngStateArr[idx].toString(16),
      movements: directionArr.slice(Math.max(0, idx - (movementsSize - 1)), idx + 1).join(''),
      targetOffsets,
      nearestTarget: targetOffsets.find((item) => item.offset === min).party.join('/'),
    };
  });

  /**
   * Finds table rows whose movement string matches the entered pattern.
   * WASD, IJKL and 8462 all mean the same directions; anything else is a
   * wildcard.
   */
  function search(rawPattern) {
    let pattern = rawPattern.toLowerCase();

    for (const [letter, digit] of Object.entries(DIRECTION_ALIASES)) {
      pattern = pattern.replaceAll(letter, digit);
    }

    pattern = pattern.replace(WILDCARD_PATTERN, '5');

    return table.filter((item) => {
      const movements = item.movements;
      // The earliest rows haven't accumulated MOVEMENTS_SIZE movements yet
      // (e.g. index 0 has a 1-character history), so they can never be a
      // real match for a full-length pattern. Without this check, trailing
      // wildcard positions would compare against `undefined` and pass.
      if (movements.length !== pattern.length) return false;
      for (let i = 0; i < pattern.length; i++) {
        if (pattern[i] !== '5' && pattern[i] !== movements[i]) return false;
      }
      return true;
    });
  }

  return { table, search, partyRndOffset };
}
