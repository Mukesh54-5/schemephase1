import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_AGRICULTURE_ITEMS } from './seedData.ts';
import { EXTRA_CROP_ITEMS } from './extraCropsData.ts';

const VALID_CROP_CATEGORIES = [
  'Cereals & Millets',
  'Pulses',
  'Oilseeds',
  'Cash & Fibre',
  'Plantation & Spices',
  'Vegetables & Fruits',
] as const;

const REQUIRED_DETAIL_KEYS = [
  'Crop Category',
  'Suitable Climate',
  'Soil Requirements',
  'Main Season',
  'Cultivation Tip',
  'Crop Management',
] as const;

test('seeded crops expand all 6 categories without duplicate slugs or titles', () => {
  const crops = INITIAL_AGRICULTURE_ITEMS.filter((item) => item.section === 'crop');
  assert.equal(EXTRA_CROP_ITEMS.length, 268, 'Expected 268 additional distinct crop guides');
  assert.equal(crops.length, 300, 'Expected 32 existing + 268 new = 300 total crop entries');

  const seenSlugs = new Set<string>();
  const seenTitles = new Set<string>();
  const categoryCounts = new Map<string, number>();

  for (const crop of crops) {
    assert.ok(!seenSlugs.has(crop.slug), `Duplicate crop slug: ${crop.slug}`);
    seenSlugs.add(crop.slug);

    const normalizedTitle = crop.title.trim().toLowerCase();
    assert.ok(!seenTitles.has(normalizedTitle), `Duplicate crop title: ${crop.title}`);
    seenTitles.add(normalizedTitle);

    const category = crop.details['Crop Category'];
    assert.ok(
      (VALID_CROP_CATEGORIES as readonly string[]).includes(category),
      `Invalid Crop Category "${category}" for ${crop.slug}`
    );
    categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
  }

  for (const category of VALID_CROP_CATEGORIES) {
    const count = categoryCounts.get(category) ?? 0;
    assert.ok(count >= 50, `Expected at least 50 crops in "${category}", got ${count}`);
  }
});

test('every seeded crop has complete card fields, 6 spec keys, and a unique valid image asset on disk', () => {
  const crops = INITIAL_AGRICULTURE_ITEMS.filter((item) => item.section === 'crop');
  const seenImageUrls = new Set<string>();

  for (const crop of crops) {
    assert.ok(crop.subtitle.trim().length > 0, `Missing subtitle for ${crop.slug}`);
    assert.ok(crop.summary.trim().length >= 40, `Summary too short for ${crop.slug}`);
    assert.ok(Array.isArray(crop.highlights) && crop.highlights.length >= 2, `Need >= 2 highlights for ${crop.slug}`);

    for (const key of REQUIRED_DETAIL_KEYS) {
      assert.ok(
        typeof crop.details[key] === 'string' && crop.details[key].trim().length > 0,
        `Missing detail "${key}" for ${crop.slug}`
      );
    }

    assert.ok(crop.imageUrl.startsWith('/src/assets/images/'), `Unexpected imageUrl for ${crop.slug}: ${crop.imageUrl}`);
    assert.ok(!seenImageUrls.has(crop.imageUrl), `Shared/duplicate imageUrl "${crop.imageUrl}" on ${crop.slug}`);
    seenImageUrls.add(crop.imageUrl);

    const assetPath = path.join(process.cwd(), crop.imageUrl.slice(1));
    assert.ok(fs.existsSync(assetPath), `Missing image asset on disk for ${crop.slug}: ${assetPath}`);
    assert.ok(fs.statSync(assetPath).size >= 3000, `Image asset too small/corrupt for ${crop.slug}: ${assetPath}`);
  }

  assert.equal(seenImageUrls.size, 300, 'Expected all 300 crops to have 300 unique respective images');
});
