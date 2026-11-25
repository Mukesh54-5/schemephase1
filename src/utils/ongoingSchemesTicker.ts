export interface OngoingSchemeTickerItem {
  slug: string;
  shortName: string;
  highlight: string;
  officialUrl: string;
  portalDomain: string;
}

export const ONGOING_SCHEMES_TICKER: OngoingSchemeTickerItem[] = [
  {
    slug: 'pm-kisan',
    shortName: 'PM-KISAN',
    highlight: '₹6,000/yr Direct Income Support',
    officialUrl: 'https://pmkisan.gov.in/',
    portalDomain: 'pmkisan.gov.in',
  },
  {
    slug: 'pmfby',
    shortName: 'PMFBY',
    highlight: 'Pradhan Mantri Fasal Bima Yojana',
    officialUrl: 'https://pmfby.gov.in/',
    portalDomain: 'pmfby.gov.in',
  },
  {
    slug: 'pm-kusum',
    shortName: 'PM-KUSUM',
    highlight: 'Solar Irrigation Pump Subsidy',
    officialUrl: 'https://pmkusum.mnre.gov.in/',
    portalDomain: 'pmkusum.mnre.gov.in',
  },
  {
    slug: 'soil-health-card',
    shortName: 'Soil Health Card',
    highlight: 'Soil Nutrient Testing & Advisory',
    officialUrl: 'https://soilhealth.dac.gov.in/',
    portalDomain: 'soilhealth.dac.gov.in',
  },
  {
    slug: 'pmksy-per-drop-more-crop',
    shortName: 'PMKSY',
    highlight: 'Per Drop More Crop Micro-Irrigation',
    officialUrl: 'https://pmksy.gov.in/',
    portalDomain: 'pmksy.gov.in',
  },
  {
    slug: 'kcc',
    shortName: 'Kisan Credit Card',
    highlight: 'Subsidized Crop & Allied Credit',
    officialUrl: 'https://www.myscheme.gov.in/',
    portalDomain: 'myscheme.gov.in',
  },
];

export function formatOngoingSchemeAriaLabel(item: OngoingSchemeTickerItem): string {
  return `${item.shortName}: ${item.highlight} — Open official portal (${item.portalDomain})`;
}

export function isValidOfficialSchemeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname.length > 0;
  } catch {
    return false;
  }
}
