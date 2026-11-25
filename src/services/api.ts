import type {
  AgriPlaceItem,
  AgricultureItem,
  AssistantNavLink,
  ChatMessageItem,
  EligibilityResult,
  FarmerProfile,
  RecommendationItem,
  Scheme,
  WeatherReport,
  WebsiteSearchResults,
} from '../types';

function authHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchSchemes(params?: {
  search?: string;
  level?: string;
  category?: string;
  state?: string;
  farmerCategory?: string;
  sort?: string;
}): Promise<Scheme[]> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.level && params.level !== 'All') qs.set('level', params.level);
  if (params?.category && params.category !== 'All') qs.set('category', params.category);
  if (params?.state && params.state !== 'All') qs.set('state', params.state);
  if (params?.farmerCategory && params.farmerCategory !== 'All')
    qs.set('farmerCategory', params.farmerCategory);
  if (params?.sort) qs.set('sort', params.sort);

  const res = await fetch(`/api/schemes?${qs.toString()}`);
  if (!res.ok) throw new Error('Failed to load government schemes');
  const data = await res.json();
  return data.schemes;
}

export async function fetchSchemeBySlugOrId(idOrSlug: string): Promise<Scheme> {
  const res = await fetch(`/api/schemes/${encodeURIComponent(idOrSlug)}`);
  if (!res.ok) throw new Error('Scheme not found');
  const data = await res.json();
  return data.scheme;
}

export async function recordSchemeView(schemeId: number, token: string): Promise<void> {
  await fetch(`/api/schemes/${schemeId}/view`, {
    method: 'POST',
    headers: authHeaders(token),
  }).catch(() => {});
}

export async function checkEligibility(
  payload: {
    schemeId?: number;
    language?: string;
    profileOverrides?: {
      state?: string;
      farmerCategory?: string;
      landHoldingAcres?: string;
      mainCrop?: string;
      farmingType?: string;
    };
  },
  token?: string | null
): Promise<EligibilityResult[]> {
  const res = await fetch('/api/eligibility/check', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to evaluate eligibility');
  const data = await res.json();
  return data.results;
}

export async function fetchDashboard(
  token: string,
  lang?: string
): Promise<{
  profile: FarmerProfile | null;
  recentlyViewed: Scheme[];
  recommendations: RecommendationItem[];
}> {
  const qs = lang ? `?lang=${encodeURIComponent(lang)}` : '';
  const res = await fetch(`/api/dashboard${qs}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to load dashboard');
  return res.json();
}

export async function updateFarmerProfile(
  profile: Partial<FarmerProfile> & { fullName: string; mobileNumber?: string },
  token: string
): Promise<FarmerProfile> {
  const res = await fetch('/api/profile', {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(profile),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update profile');
  return data.profile;
}

export async function fetchAgricultureItems(section = 'all'): Promise<AgricultureItem[]> {
  const res = await fetch(`/api/agriculture?section=${encodeURIComponent(section)}`);
  if (!res.ok) throw new Error('Failed to load agriculture information');
  const data = await res.json();
  return data.items;
}

export async function fetchWeather(params: {
  location?: string;
  lat?: number;
  lng?: number;
  lang?: string;
}): Promise<WeatherReport> {
  const qs = new URLSearchParams();
  if (params.lat !== undefined && params.lng !== undefined) {
    qs.set('lat', String(params.lat));
    qs.set('lng', String(params.lng));
  } else if (params.location?.trim()) {
    qs.set('location', params.location.trim());
  }
  if (params.lang) {
    qs.set('lang', params.lang);
  }

  const res = await fetch(`/api/weather?${qs.toString()}`);
  const data = await res.json().catch(() => ({}));

  if (res.status === 429 || data?.quotaExceeded || data?.error?.status === 'RESOURCE_EXHAUSTED') {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    throw new Error(
      data?.error || 'Google Maps Platform quota reached for this demo key.'
    );
  }

  if (!res.ok) {
    throw new Error(data?.error || 'Unable to load local weather forecast.');
  }

  return data as WeatherReport;
}

let cachedMapsApiKey: string | null = null;

export async function getGoogleMapsApiKey(): Promise<string> {
  const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  if (envKey && envKey.trim()) {
    cachedMapsApiKey = envKey.trim();
    return cachedMapsApiKey;
  }
  if (cachedMapsApiKey) {
    return cachedMapsApiKey;
  }
  const res = await fetch('/api/maps/config');
  if (!res.ok) return '';
  const data = (await res.json().catch(() => ({}))) as { apiKey?: string };
  const key = (data.apiKey || '').trim();
  if (key) {
    cachedMapsApiKey = key;
  }
  return key;
}

export async function searchNearbyAgriPlaces(payload: {
  textQuery: string;
  lat?: number;
  lng?: number;
  radiusMeters?: number;
  languageCode?: string;
}): Promise<AgriPlaceItem[]> {
  const res = await fetch('/api/maps/places', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as {
    places?: AgriPlaceItem[];
    quotaExceeded?: boolean;
    error?: string | { status?: string; message?: string };
  };

  const errStatus = typeof data?.error === 'object' ? data.error?.status : undefined;
  if (res.status === 429 || data?.quotaExceeded || errStatus === 'RESOURCE_EXHAUSTED') {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    const errMessage =
      typeof data?.error === 'string'
        ? data.error
        : 'Google Maps Platform quota reached for this demo key.';
    throw new Error(errMessage);
  }

  if (!res.ok) {
    const errMessage =
      typeof data?.error === 'string'
        ? data.error
        : data?.error?.message || 'Unable to search nearby agricultural services.';
    throw new Error(errMessage);
  }

  return Array.isArray(data?.places) ? data.places : [];
}

export async function sendContactMessage(payload: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<{ message: string }> {
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to send message');
  return data;
}

export async function fetchChatHistory(
  sessionKey: string,
  token?: string | null
): Promise<ChatMessageItem[]> {
  const res = await fetch(`/api/chatbot/history?sessionKey=${encodeURIComponent(sessionKey)}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.messages || [];
}

export async function sendChatMessage(
  payload: { message: string; language: string; sessionKey: string },
  token?: string | null
): Promise<{ reply: string; links: AssistantNavLink[] }> {
  const res = await fetch('/api/chatbot/message', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to get response');
  return {
    reply: data.reply,
    links: Array.isArray(data.links) ? data.links : [],
  };
}

export async function transcribeVoiceAudio(
  payload: { audioBase64: string; mimeType: string; language: string },
  token?: string | null
): Promise<string> {
  const res = await fetch('/api/chatbot/transcribe', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to transcribe voice audio');
  return data.transcript || '';
}

export async function searchWebsite(
  query: string,
  lang?: string
): Promise<WebsiteSearchResults> {
  const qs = new URLSearchParams({ q: query });
  if (lang) qs.set('lang', lang);
  const res = await fetch(`/api/search?${qs.toString()}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function translateBatchTexts(
  targetLanguage: 'hi' | 'kn',
  texts: string[]
): Promise<Record<string, string>> {
  if (texts.length === 0) return {};
  const res = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetLanguage, texts }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    translations?: Record<string, string>;
  };
  if (!res.ok && !data.translations) {
    throw new Error('Translation unavailable');
  }
  return data.translations || {};
}
