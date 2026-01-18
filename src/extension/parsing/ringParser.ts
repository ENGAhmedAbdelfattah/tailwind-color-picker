import { TW_RING_REGEX } from "../regex/tailwindRegex";

export type RingMatch = {
  index: number;
  length: number;
  color: string;
};

export function parseRingColors(text: string): RingMatch[] {
  const results: RingMatch[] = [];

  for (const match of text.matchAll(TW_RING_REGEX)) {
    const value = match[2];
    const index = match.index ?? 0;
    const length = match[0].length;
    const color = value.trim().replace(/;$/, "");
    results.push({ index, length, color });
  }

  return results;
}

