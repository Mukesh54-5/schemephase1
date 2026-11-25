import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_AGRICULTURE_ITEMS, type SeedAgricultureItem } from './seedData.ts';
import { EXTRA_SOIL_ITEMS } from './extraSoilsData.ts';
import { EXTRA_ANIMAL_ITEMS } from './extraAnimalsData.ts';
import { EXTRA_ORGANIC_ITEMS } from './extraOrganicData.ts';
import { EXTRA_INORGANIC_ITEMS } from './extraInorganicData.ts';
import { EXTRA_TECHNOLOGY_ITEMS } from './extraTechnologiesData.ts';
import { balanceDetailColumns } from '../utils/agricultureDetailsLayout.ts';

const SECTION_EXPECTATIONS: Array<{
  section: SeedAgricultureItem['section'];
  extraItems: SeedAgricultureItem[];
  expectedTotal: number;
  expectedExtraPerCategory: number;
  categories: readonly string[];
}> = [
  {
    section: 'soil',
    extraItems: EXTRA_SOIL_ITEMS,
    expectedTotal: 92,
    expectedExtraPerCategory: 20,
    categories: [
      'Major Upland & Plains Soils',
      'Coastal & Hill Soils',
      'Problem Soils & Reclamation',
      'Arid & Desert Soils',
    ],
  },
  {
    section: 'animal',
    extraItems: EXTRA_ANIMAL_ITEMS,
    expectedTotal: 132,
    expectedExtraPerCategory: 30,
    categories: [
      'Dairy Livestock',
      'Small Ruminants',
      'Poultry & Avian',
      'Allied Livestock & Aquaculture',
    ],
  },
  {
    section: 'organic',
    extraItems: EXTRA_ORGANIC_ITEMS,
    expectedTotal: 90,
    expectedExtraPerCategory: 20,
    categories: [
      'Organic Manures',
      'Biofertilizers & Green Manure',
      'Natural Farming',
      'Organic Pest & Crop Systems',
    ],
  },
  {
    section: 'inorganic',
    extraItems: EXTRA_INORGANIC_ITEMS,
    expectedTotal: 70,
    expectedExtraPerCategory: 20,
    categories: [
      'Primary Macronutrients',
      'Secondary & Micronutrients',
      'INM & Safe Stewardship',
    ],
  },
  {
    section: 'technology',
    extraItems: EXTRA_TECHNOLOGY_ITEMS,
    expectedTotal: 116,
    expectedExtraPerCategory: 20,
    categories: [
      'Irrigation Technologies',
      'Protected Cultivation',
      'Agricultural Machinery',
      'Precision & Digital Agriculture',
      'Foreign & Global AgTech',
    ],
  },
];

test('each expanded agriculture section satisfies exact per-category expansion counts without duplicates', () => {
  for (const cfg of SECTION_EXPECTATIONS) {
    const allInSection = INITIAL_AGRICULTURE_ITEMS.filter((i) => i.section === cfg.section);
    assert.equal(
      allInSection.length,
      cfg.expectedTotal,
      `Expected ${cfg.expectedTotal} total items in "${cfg.section}", got ${allInSection.length}`
    );

    assert.equal(
      cfg.extraItems.length,
      cfg.expectedExtraPerCategory * cfg.categories.length,
      `Expected ${cfg.expectedExtraPerCategory * cfg.categories.length} new items in "${cfg.section}"`
    );

    const extraCatCounts = new Map<string, number>();
    for (const item of cfg.extraItems) {
      const cat = item.details.Category;
      assert.ok(cfg.categories.includes(cat), `Unexpected category "${cat}" for ${item.slug}`);
      extraCatCounts.set(cat, (extraCatCounts.get(cat) ?? 0) + 1);
    }

    for (const cat of cfg.categories) {
      assert.equal(
        extraCatCounts.get(cat) ?? 0,
        cfg.expectedExtraPerCategory,
        `Expected ${cfg.expectedExtraPerCategory} new items in ${cfg.section} -> "${cat}"`
      );
    }
  }
});

test('all 800 seeded agriculture entries have unique slugs, unique titles, unique valid local images, and balanced columns', () => {
  assert.equal(INITIAL_AGRICULTURE_ITEMS.length, 800);

  const seenSlugs = new Set<string>();
  const seenTitles = new Set<string>();
  const seenImageUrls = new Set<string>();
  const extraFileHashes = new Set<string>();

  const extraSlugSet = new Set([
    ...EXTRA_SOIL_ITEMS,
    ...EXTRA_ANIMAL_ITEMS,
    ...EXTRA_ORGANIC_ITEMS,
    ...EXTRA_INORGANIC_ITEMS,
    ...EXTRA_TECHNOLOGY_ITEMS,
  ].map((x) => x.slug));

  for (const item of INITIAL_AGRICULTURE_ITEMS) {
    assert.ok(!seenSlugs.has(item.slug), `Duplicate slug across agriculture items: ${item.slug}`);
    seenSlugs.add(item.slug);

    const normalizedTitle = item.title.trim().toLowerCase();
    assert.ok(!seenTitles.has(normalizedTitle), `Duplicate title across agriculture items: ${item.title}`);
    seenTitles.add(normalizedTitle);

    assert.ok(item.subtitle.trim().length > 0, `Missing subtitle for ${item.slug}`);
    assert.ok(item.summary.trim().length >= 30, `Summary too short for ${item.slug}`);
    assert.ok(Array.isArray(item.highlights) && item.highlights.length >= 2, `Need >= 2 highlights for ${item.slug}`);

    assert.ok(item.imageUrl.startsWith('/src/assets/images/'), `Invalid imageUrl path on ${item.slug}: ${item.imageUrl}`);
    assert.ok(!seenImageUrls.has(item.imageUrl), `Duplicate imageUrl "${item.imageUrl}" on ${item.slug}`);
    seenImageUrls.add(item.imageUrl);

    const diskPath = path.join(process.cwd(), item.imageUrl.slice(1));
    assert.ok(fs.existsSync(diskPath), `Missing image file on disk for ${item.slug}: ${diskPath}`);
    const buf = fs.readFileSync(diskPath);
    assert.ok(buf.length >= 3000, `Image asset too small/corrupt (${buf.length} bytes) for ${item.slug}`);

    if (extraSlugSet.has(item.slug)) {
      const md5 = crypto.createHash('md5').update(buf).digest('hex');
      assert.ok(!extraFileHashes.has(md5), `Duplicate binary image content detected on ${item.slug}`);
      extraFileHashes.add(md5);
    }

    const { left, right } = balanceDetailColumns(item.details);
    assert.ok(left.length >= 1 && right.length >= 1, `Unbalanced detail columns on ${item.slug}`);
  }

  assert.equal(seenImageUrls.size, 800);
  assert.equal(extraFileHashes.size, 440);
});
