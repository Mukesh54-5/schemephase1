import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ONGOING_SCHEMES_TICKER,
  formatOngoingSchemeAriaLabel,
  isValidOfficialSchemeUrl,
} from './ongoingSchemesTicker.ts';

test('ONGOING_SCHEMES_TICKER contains at least two ongoing government schemes with valid HTTPS official links', () => {
  assert.ok(
    ONGOING_SCHEMES_TICKER.length >= 2,
    `Expected at least 2 ongoing schemes, got ${ONGOING_SCHEMES_TICKER.length}`
  );

  for (const item of ONGOING_SCHEMES_TICKER) {
    assert.ok(item.slug.trim().length > 0, 'Scheme slug must be non-empty');
    assert.ok(item.shortName.trim().length > 0, 'Scheme shortName must be non-empty');
    assert.ok(item.highlight.trim().length > 0, 'Scheme highlight must be non-empty');
    assert.ok(
      isValidOfficialSchemeUrl(item.officialUrl),
      `Expected valid https URL for ${item.shortName}, got ${item.officialUrl}`
    );
    assert.ok(
      new URL(item.officialUrl).hostname.includes(item.portalDomain),
      `Expected portalDomain ${item.portalDomain} to match ${item.officialUrl}`
    );
  }
});

test('formatOngoingSchemeAriaLabel produces clear accessible redirect description', () => {
  const first = ONGOING_SCHEMES_TICKER[0];
  const label = formatOngoingSchemeAriaLabel(first);
  assert.ok(label.includes(first.shortName));
  assert.ok(label.includes(first.portalDomain));
  assert.ok(label.includes('official portal'));
});
