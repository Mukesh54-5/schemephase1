import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { INITIAL_SCHEMES } from './seedData';
import { INDIAN_STATES } from '../types';

test('INITIAL_SCHEMES contains all 6 Central schemes and all 28 Indian State schemes', () => {
  const central = INITIAL_SCHEMES.filter((s) => s.governmentLevel === 'Central');
  const stateSchemes = INITIAL_SCHEMES.filter((s) => s.governmentLevel === 'State');

  assert.equal(central.length, 6, 'Expected 6 Central Government schemes');
  assert.equal(INDIAN_STATES.length, 28, 'Expected 28 Indian States');
  assert.equal(stateSchemes.length, 28, 'Expected 28 State Government schemes');

  const coveredStates = new Set(stateSchemes.map((s) => s.stateName));
  for (const state of INDIAN_STATES) {
    assert.equal(
      coveredStates.has(state),
      true,
      `Missing State agricultural scheme for ${state}`
    );
  }
});

test('Every scheme has unique slug, complete details, official logo asset, and valid https officialUrl', () => {
  const slugs = new Set<string>();
  for (const scheme of INITIAL_SCHEMES) {
    assert.equal(slugs.has(scheme.slug), false, `Duplicate slug: ${scheme.slug}`);
    slugs.add(scheme.slug);

    assert.ok(scheme.name.trim().length > 5, `Empty name for ${scheme.slug}`);
    assert.ok(scheme.shortName.trim().length > 1, `Empty shortName for ${scheme.slug}`);
    assert.ok(scheme.overview.trim().length > 20, `Short overview for ${scheme.slug}`);
    assert.ok(scheme.benefits.trim().length > 20, `Short benefits for ${scheme.slug}`);
    assert.ok(scheme.eligibilitySummary.trim().length > 20, `Short eligibilitySummary for ${scheme.slug}`);
    assert.ok(scheme.objectives.length >= 2, `Expected objectives for ${scheme.slug}`);
    assert.ok(scheme.requiredDocuments.length >= 3, `Expected documents for ${scheme.slug}`);
    assert.ok(scheme.applicationProcedure.length >= 3, `Expected application steps for ${scheme.slug}`);
    assert.ok(
      scheme.officialUrl.startsWith('https://'),
      `Official URL must use https:// for ${scheme.slug}: ${scheme.officialUrl}`
    );
    assert.equal(
      scheme.logoUrl,
      `/src/assets/images/schemes/${scheme.slug}.png`,
      `Expected official PNG logoUrl for ${scheme.slug}`
    );
    const diskPath = path.join(process.cwd(), scheme.logoUrl.replace(/^\//, ''));
    assert.equal(
      fs.existsSync(diskPath),
      true,
      `Missing scheme logo file on disk for ${scheme.slug}: ${diskPath}`
    );
    const header = fs.readFileSync(diskPath).subarray(0, 8);
    assert.equal(
      header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47,
      true,
      `Expected valid PNG file for ${scheme.slug}`
    );
    assert.ok(
      Array.isArray(scheme.eligibilityRules.states) && scheme.eligibilityRules.states.length > 0,
      `Expected eligibilityRules.states for ${scheme.slug}`
    );
  }

  const schemeLogoDir = path.join(process.cwd(), 'src/assets/images/schemes');
  const files = fs.readdirSync(schemeLogoDir);
  assert.equal(
    files.filter((f) => f.endsWith('.svg')).length,
    0,
    'Expected all old placeholder SVG scheme logos to be removed'
  );
  assert.equal(
    files.filter((f) => f.endsWith('.png')).length,
    INITIAL_SCHEMES.length,
    'Expected exact 1-to-1 PNG logo file count matching all 34 schemes'
  );
});
