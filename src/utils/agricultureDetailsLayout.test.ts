import test from 'node:test';
import assert from 'node:assert/strict';
import { balanceDetailColumns } from './agricultureDetailsLayout.ts';
import { INITIAL_AGRICULTURE_ITEMS } from '../db/seedData.ts';

test('balanceDetailColumns preserves all keys without duplication across all seeded agriculture items', () => {
  for (const item of INITIAL_AGRICULTURE_ITEMS) {
    const originalEntries = Object.entries(item.details);
    const { left, right, leftWeight, rightWeight } = balanceDetailColumns(item.details);

    const combinedKeys = [...left, ...right].map(([k]) => k).sort();
    const expectedKeys = originalEntries.map(([k]) => k).sort();
    assert.deepEqual(combinedKeys, expectedKeys, `Mismatch in keys for ${item.slug}`);

    assert.equal(left[0][0], originalEntries[0][0], `First key should remain first on left for ${item.slug}`);
    assert.ok(right.length > 0, `Right column should not be empty for ${item.slug}`);
    assert.ok(
      Math.abs(leftWeight - rightWeight) <= 3,
      `Column height imbalance too high for ${item.slug}: left=${leftWeight}, right=${rightWeight}`
    );
  }
});

test('balanceDetailColumns balances Red Loamy & Sandy Soils evenly', () => {
  const redSoil = INITIAL_AGRICULTURE_ITEMS.find((i) => i.slug === 'red-soil');
  assert.ok(redSoil);
  const res = balanceDetailColumns(redSoil.details);
  assert.ok(Math.abs(res.leftWeight - res.rightWeight) <= 1, `Expected <=1 line diff, got ${res.leftWeight} vs ${res.rightWeight}`);
});
