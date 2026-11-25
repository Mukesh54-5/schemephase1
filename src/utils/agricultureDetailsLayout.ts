export type DetailEntry = [string, string];

export interface BalancedDetailColumns {
  left: DetailEntry[];
  right: DetailEntry[];
  leftWeight: number;
  rightWeight: number;
}

const CHARS_PER_LINE = 38;

export function estimateDetailLines(key: string, value: string): number {
  const totalChars = key.length + value.length + 2;
  return Math.max(1, Math.ceil(totalChars / CHARS_PER_LINE));
}

/**
 * Splits key-value detail entries into two vertical columns with minimal height
 * imbalance so short fields (e.g., Category) never create row-stretching whitespace
 * and both columns end evenly above the card footer.
 */
export function balanceDetailColumns(
  details: Record<string, string>
): BalancedDetailColumns {
  const entries = Object.entries(details) as DetailEntry[];
  if (entries.length === 0) {
    return { left: [], right: [], leftWeight: 0, rightWeight: 0 };
  }
  if (entries.length === 1) {
    return {
      left: entries,
      right: [],
      leftWeight: estimateDetailLines(entries[0][0], entries[0][1]),
      rightWeight: 0,
    };
  }

  const weights = entries.map(([k, v]) => estimateDetailLines(k, v));

  // For small detail lists (all 4-6 field agriculture cards), exact subset search
  // finds the minimum height difference while keeping the first entry (Category) on the left.
  if (entries.length <= 12) {
    const restCount = entries.length - 1;
    const totalMask = 1 << restCount;
    let bestDiff = Infinity;
    let bestCountDiff = Infinity;
    let bestMask = 0;

    for (let mask = 0; mask < totalMask; mask++) {
      let leftWeight = weights[0];
      let rightWeight = 0;
      let leftCount = 1;
      let rightCount = 0;

      for (let i = 0; i < restCount; i++) {
        const idx = i + 1;
        if ((mask & (1 << i)) === 0) {
          leftWeight += weights[idx];
          leftCount++;
        } else {
          rightWeight += weights[idx];
          rightCount++;
        }
      }

      if (rightCount === 0) continue;

      const diff = Math.abs(leftWeight - rightWeight);
      const countDiff = Math.abs(leftCount - rightCount);
      if (diff < bestDiff || (diff === bestDiff && countDiff < bestCountDiff)) {
        bestDiff = diff;
        bestCountDiff = countDiff;
        bestMask = mask;
      }
    }

    const left: DetailEntry[] = [entries[0]];
    const right: DetailEntry[] = [];
    let leftWeight = weights[0];
    let rightWeight = 0;

    for (let i = 0; i < restCount; i++) {
      const idx = i + 1;
      if ((bestMask & (1 << i)) === 0) {
        left.push(entries[idx]);
        leftWeight += weights[idx];
      } else {
        right.push(entries[idx]);
        rightWeight += weights[idx];
      }
    }

    return { left, right, leftWeight, rightWeight };
  }

  // Fallback greedy assignment for unusually large detail objects
  const left: DetailEntry[] = [];
  const right: DetailEntry[] = [];
  let leftWeight = 0;
  let rightWeight = 0;

  entries.forEach((entry, idx) => {
    const w = weights[idx];
    if (leftWeight <= rightWeight) {
      left.push(entry);
      leftWeight += w;
    } else {
      right.push(entry);
      rightWeight += w;
    }
  });

  return { left, right, leftWeight, rightWeight };
}
