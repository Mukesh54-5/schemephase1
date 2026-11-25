import 'dotenv/config';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import express from 'express';
import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { and, desc, eq } from 'drizzle-orm';
import { createServer as createViteServer, type ViteDevServer } from 'vite';
import { db } from './src/db/index.ts';
import {
  agricultureItems,
  chatConversations,
  chatMessages,
  contactMessages,
  farmerProfiles,
  recentlyViewedSchemes,
  schemes,
  users,
} from './src/db/schema.ts';
import { ensureSeeded } from './src/db/seed.ts';
import {
  getMimeTypeForAsset,
  readPackedAsset,
  unpackMissingAssets,
} from './src/utils/assetPack.ts';
import {
  type AuthRequest,
  clearSessionCookie,
  createSessionToken,
  optionalAuth,
  requireAdmin,
  requireAuth,
  setSessionCookie,
} from './src/middleware/auth.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '1mb' }));

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

type SupportedLang = 'en' | 'hi' | 'kn';

function normalizeLang(raw: unknown): SupportedLang {
  if (typeof raw !== 'string') return 'en';
  const base = raw.trim().toLowerCase().split('-')[0];
  if (base === 'hi' || base === 'kn') return base;
  return 'en';
}

const TRANSLATION_CACHE_PATH = path.join(os.tmpdir(), 'krishi-sangrah-translations-cache.json');
const translationMemoryCache: Record<'hi' | 'kn', Map<string, string>> = {
  hi: new Map<string, string>(),
  kn: new Map<string, string>(),
};

try {
  if (fs.existsSync(TRANSLATION_CACHE_PATH)) {
    const rawCache = JSON.parse(fs.readFileSync(TRANSLATION_CACHE_PATH, 'utf8')) as {
      hi?: Record<string, string>;
      kn?: Record<string, string>;
    };
    if (rawCache.hi) {
      for (const [k, v] of Object.entries(rawCache.hi)) {
        translationMemoryCache.hi.set(k, v);
      }
    }
    if (rawCache.kn) {
      for (const [k, v] of Object.entries(rawCache.kn)) {
        translationMemoryCache.kn.set(k, v);
      }
    }
  }
} catch {
  // Ignore corrupted cache file
}

let flushTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleTranslationCacheFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    try {
      const payload = {
        hi: Object.fromEntries(translationMemoryCache.hi.entries()),
        kn: Object.fromEntries(translationMemoryCache.kn.entries()),
      };
      fs.writeFileSync(TRANSLATION_CACHE_PATH, JSON.stringify(payload), 'utf8');
    } catch {
      // Ignore disk write failure on read-only FS
    }
  }, 1500);
}

const STATE_NAMES_I18N: Record<string, { hi: string; kn: string }> = {
  'All India': { hi: 'पूरा भारत', kn: 'ಅಖಿಲ ಭಾರತ' },
  'Andhra Pradesh': { hi: 'आंध्र प्रदेश', kn: 'ಆಂಧ್ರ ಪ್ರದೇಶ' },
  'Arunachal Pradesh': { hi: 'अरुणाचल प्रदेश', kn: 'ಅರುಣಾಚಲ ಪ್ರದೇಶ' },
  Assam: { hi: 'असम', kn: 'ಅಸ್ಸಾಂ' },
  Bihar: { hi: 'बिहार', kn: 'ಬಿಹಾರ' },
  Chhattisgarh: { hi: 'छत्तीसगढ़', kn: 'ಛತ್ತೀಸ್‌ಗಢ' },
  Goa: { hi: 'गोवा', kn: 'ಗೋವಾ' },
  Gujarat: { hi: 'गुजरात', kn: 'ಗುಜರಾತ್' },
  Haryana: { hi: 'हरियाणा', kn: 'ಹರಿಯಾಣ' },
  'Himachal Pradesh': { hi: 'हिमाचल प्रदेश', kn: 'ಹಿಮಾಚಲ ಪ್ರದೇಶ' },
  Jharkhand: { hi: 'झारखंड', kn: 'ಜಾರ್ಖಂಡ್' },
  Karnataka: { hi: 'कर्नाटक', kn: 'ಕರ್ನಾಟಕ' },
  Kerala: { hi: 'केरल', kn: 'ಕೇರಳ' },
  'Madhya Pradesh': { hi: 'मध्य प्रदेश', kn: 'ಮಧ್ಯ ಪ್ರದೇಶ' },
  Maharashtra: { hi: 'महाराष्ट्र', kn: 'ಮಹಾರಾಷ್ಟ್ರ' },
  Manipur: { hi: 'मणिपुर', kn: 'ಮಣಿಪುರ' },
  Meghalaya: { hi: 'मेघालय', kn: 'ಮೇಘಾಲಯ' },
  Mizoram: { hi: 'मिज़ोरम', kn: 'ಮಿಜೋರಾಂ' },
  Nagaland: { hi: 'नागालैंड', kn: 'ನಾಗಾಲ್ಯಾಂಡ್' },
  Odisha: { hi: 'ओडिशा', kn: 'ಒಡಿಶಾ' },
  Punjab: { hi: 'पंजाब', kn: 'ಪಂಜಾಬ್' },
  Rajasthan: { hi: 'राजस्थान', kn: 'ರಾಜಸ್ಥಾನ' },
  Sikkim: { hi: 'सिक्किम', kn: 'ಸಿಕ್ಕಿಂ' },
  'Tamil Nadu': { hi: 'तमिलनाडु', kn: 'ತಮಿಳುನಾಡು' },
  Telangana: { hi: 'तेलंगाना', kn: 'ತೆಲಂಗಾಣ' },
  Tripura: { hi: 'त्रिपुरा', kn: 'ತ್ರಿಪುರಾ' },
  'Uttar Pradesh': { hi: 'उत्तर प्रदेश', kn: 'ಉತ್ತರ ಪ್ರದೇಶ' },
  Uttarakhand: { hi: 'उत्तराखंड', kn: 'ಉತ್ತರಾಖಂಡ್' },
  'West Bengal': { hi: 'पश्चिम बंगाल', kn: 'ಪಶ್ಚಿಮ ಬಂಗಾಳ' },
};

const FARMER_CATEGORY_I18N: Record<string, { hi: string; kn: string }> = {
  'Marginal (< 1 ha)': { hi: 'सीमांत (< 1 हेक्टेयर)', kn: 'ಅತಿ ಸಣ್ಣ (< 1 ಹೆಕ್ಟೇರ್)' },
  'Small (1-2 ha)': { hi: 'लघु (1-2 हेक्टेयर)', kn: 'ಸಣ್ಣ (1-2 ಹೆಕ್ಟೇರ್)' },
  'Semi-Medium (2-4 ha)': { hi: 'अर्ध-मध्यम (2-4 हेक्टेयर)', kn: 'ಅರೆ-ಮಧ್ಯಮ (2-4 ಹೆಕ್ಟೇರ್)' },
  'Medium (4-10 ha)': { hi: 'मध्यम (4-10 हेक्टेयर)', kn: 'ಮಧ್ಯಮ (4-10 ಹೆಕ್ಟೇರ್)' },
  'Large (> 10 ha)': { hi: 'बड़े (> 10 हेक्टेयर)', kn: 'ದೊಡ್ಡ (> 10 ಹೆಕ್ಟೇರ್)' },
  'Landless / Tenant': { hi: 'भूमिहीन / बटाईदार', kn: 'ಭೂರಹಿತ / ಗೇಣಿದಾರ' },
};

function localizeStateName(name: string, lang: SupportedLang): string {
  if (lang === 'en') return name;
  return STATE_NAMES_I18N[name]?.[lang] ?? name;
}

function localizeFarmerCategory(cat: string, lang: SupportedLang): string {
  if (lang === 'en') return cat;
  return FARMER_CATEGORY_I18N[cat]?.[lang] ?? cat;
}

// Helper for evaluating eligibility of a profile against a scheme
function evaluateSchemeEligibility(
  scheme: typeof schemes.$inferSelect,
  profile: {
    state?: string | null;
    farmerCategory?: string | null;
    landHoldingAcres?: string | null;
    mainCrop?: string | null;
    farmingType?: string | null;
  },
  lang: SupportedLang = 'en'
) {
  const rules = scheme.eligibilityRules;
  const missingFields: string[] = [];
  const reasons: string[] = [];
  let matchesAll = true;

  if (!profile.state?.trim()) {
    missingFields.push(lang === 'hi' ? 'राज्य' : lang === 'kn' ? 'ರಾಜ್ಯ' : 'State');
  }
  if (!profile.farmerCategory?.trim()) {
    missingFields.push(
      lang === 'hi' ? 'किसान श्रेणी' : lang === 'kn' ? 'ರೈತ ವರ್ಗ' : 'Farmer Category'
    );
  }

  const landValue =
    profile.landHoldingAcres !== undefined &&
    profile.landHoldingAcres !== null &&
    profile.landHoldingAcres !== ''
      ? Number(profile.landHoldingAcres)
      : NaN;

  if (rules.minLandAcres !== undefined && Number.isNaN(landValue)) {
    missingFields.push(
      lang === 'hi'
        ? 'कृषि भूमि (एकड़ में)'
        : lang === 'kn'
        ? 'ಸಾಗುವಳಿ ಭೂಮಿ (ಎಕರೆಗಳಲ್ಲಿ)'
        : 'Land Holding (in acres)'
    );
  }

  // State match
  if (rules.states && rules.states.length > 0 && !rules.states.includes('All India')) {
    if (profile.state?.trim()) {
      const stateMatch = rules.states.some(
        (s) => s.toLowerCase() === profile.state!.trim().toLowerCase()
      );
      const locProfileState = localizeStateName(profile.state, lang);
      const locRuleStates = rules.states.map((s) => localizeStateName(s, lang)).join(', ');
      if (stateMatch) {
        reasons.push(
          lang === 'hi'
            ? `राज्य पात्र क्षेत्र (${locProfileState}) से मेल खाता है।`
            : lang === 'kn'
            ? `ರಾಜ್ಯವು ಅರ್ಹ ಪ್ರದೇಶಕ್ಕೆ (${locProfileState}) ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ.`
            : `State matches eligible region (${profile.state}).`
        );
      } else {
        matchesAll = false;
        reasons.push(
          lang === 'hi'
            ? `यह योजना ${locRuleStates} के लिए लागू है, जबकि आपकी प्रोफ़ाइल का राज्य ${locProfileState} है।`
            : lang === 'kn'
            ? `ಈ ಯೋಜನೆಯು ${locRuleStates} ಗೆ ಅನ್ವಯಿಸುತ್ತದೆ, ಆದರೆ ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ರಾಜ್ಯ ${locProfileState} ಆಗಿದೆ.`
            : `This scheme is applicable to ${rules.states.join(', ')}, while your profile state is ${profile.state}.`
        );
      }
    }
  } else {
    reasons.push(
      lang === 'hi'
        ? 'पूरे भारत में उपलब्ध (केंद्र सरकार कवरेज)।'
        : lang === 'kn'
        ? 'ಭಾರತದಾದ್ಯಂತ ಲಭ್ಯವಿದೆ (ಕೇಂದ್ರ ಸರ್ಕಾರದ ವ್ಯಾಪ್ತಿ).'
        : 'Available across All India (Central Government coverage).'
    );
  }

  // Farmer category match
  if (
    rules.farmerCategories &&
    rules.farmerCategories.length > 0 &&
    profile.farmerCategory?.trim()
  ) {
    const catMatch = rules.farmerCategories.some(
      (c) => c.toLowerCase() === profile.farmerCategory!.trim().toLowerCase()
    );
    const locCat = localizeFarmerCategory(profile.farmerCategory, lang);
    const locAllowedCats = rules.farmerCategories
      .map((c) => localizeFarmerCategory(c, lang))
      .join(', ');
    if (catMatch) {
      reasons.push(
        lang === 'hi'
          ? `किसान श्रेणी (${locCat}) पात्र समूहों में शामिल है।`
          : lang === 'kn'
          ? `ರೈತ ವರ್ಗ (${locCat}) ಅರ್ಹ ಗುಂಪುಗಳಲ್ಲಿ ಒಳಗೊಂಡಿದೆ.`
          : `Farmer category (${profile.farmerCategory}) falls within covered groups.`
      );
    } else {
      matchesAll = false;
      reasons.push(
        lang === 'hi'
          ? `किसान श्रेणी (${locCat}) सूचीबद्ध श्रेणियों (${locAllowedCats}) से बाहर है।`
          : lang === 'kn'
          ? `ರೈತ ವರ್ಗ (${locCat}) ಪಟ್ಟಿ ಮಾಡಲಾದ ವರ್ಗಗಳಿಂದ (${locAllowedCats}) ಹೊರಗಿದೆ.`
          : `Farmer category (${profile.farmerCategory}) is outside the primary listed categories (${rules.farmerCategories.join(', ')}).`
      );
    }
  }

  // Land holding check
  if (!Number.isNaN(landValue)) {
    if (rules.minLandAcres !== undefined && landValue < rules.minLandAcres) {
      matchesAll = false;
      reasons.push(
        lang === 'hi'
          ? `सूचीबद्ध भूमि मानदंड के लिए कम से कम ${rules.minLandAcres} एकड़ कृषि भूमि आवश्यक है; दर्ज मान ${landValue} एकड़ है।`
          : lang === 'kn'
          ? `ಪಟ್ಟಿ ಮಾಡಲಾದ ಭೂಮಿ ಮಾನದಂಡಕ್ಕೆ ಕನಿಷ್ಠ ${rules.minLandAcres} ಎಕರೆ ಸಾಗುವಳಿ ಭೂಮಿ ಅಗತ್ಯವಿದೆ; ನಮೂದಿಸಿದ ಮೌಲ್ಯ ${landValue} ಎಕರೆ.`
          : `Listed landholding criterion requires cultivable land (at least ${rules.minLandAcres} acres); entered value is ${landValue} acres.`
      );
    } else if (rules.maxLandAcres !== undefined && landValue > rules.maxLandAcres) {
      matchesAll = false;
      reasons.push(
        lang === 'hi'
          ? `अधिकतम सूचीबद्ध भूमि सीमा ${rules.maxLandAcres} एकड़ है; दर्ज मान ${landValue} एकड़ है।`
          : lang === 'kn'
          ? `ಗರಿಷ್ಠ ಪಟ್ಟಿ ಮಾಡಲಾದ ಭೂಮಿ ಮಿತಿ ${rules.maxLandAcres} ಎಕರೆ; ನಮೂದಿಸಿದ ಮೌಲ್ಯ ${landValue} ಎಕರೆ.`
          : `Maximum listed landholding limit is ${rules.maxLandAcres} acres; entered value is ${landValue} acres.`
      );
    } else if (rules.minLandAcres !== undefined || rules.maxLandAcres !== undefined) {
      reasons.push(
        lang === 'hi'
          ? `दर्ज की गई भूमि (${landValue} एकड़) सूचीबद्ध भूमि मानदंडों के अनुरूप है।`
          : lang === 'kn'
          ? `ನಮೂದಿಸಿದ ಭೂಮಿ (${landValue} ಎಕರೆ) ಪಟ್ಟಿ ಮಾಡಲಾದ ಭೂಮಿ ಮಾನದಂಡಗಳಿಗೆ ಸರಿಹೊಂದುತ್ತದೆ.`
          : `Entered landholding (${landValue} acres) fits the listed land criteria.`
      );
    }
  }

  let status: 'eligible' | 'not_eligible' | 'more_info';
  let headline: string;

  if (!matchesAll) {
    status = 'not_eligible';
    headline =
      lang === 'hi'
        ? 'आप सूचीबद्ध मानदंडों को पूरा नहीं कर सकते हैं।'
        : lang === 'kn'
        ? 'ನೀವು ಪಟ್ಟಿ ಮಾಡಲಾದ ಮಾನದಂಡಗಳನ್ನು ಪೂರೈಸದಿರಬಹುದು.'
        : 'You may not meet the listed criteria.';
  } else if (missingFields.length > 0) {
    status = 'more_info';
    headline =
      lang === 'hi'
        ? 'अधिक जानकारी आवश्यक है।'
        : lang === 'kn'
        ? 'ಹೆಚ್ಚಿನ ಮಾಹಿತಿ ಅಗತ್ಯವಿದೆ.'
        : 'More information is required.';
  } else {
    status = 'eligible';
    headline =
      lang === 'hi'
        ? 'आप पात्र हो सकते हैं।'
        : lang === 'kn'
        ? 'ನೀವು ಅರ್ಹರಾಗಿರಬಹುದು.'
        : 'You may be eligible.';
  }

  return {
    schemeId: scheme.id,
    slug: scheme.slug,
    schemeName: scheme.name,
    shortName: scheme.shortName,
    officialUrl: scheme.officialUrl,
    status,
    headline,
    reasons,
    missingFields,
    notes: rules.notes || [],
  };
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Auth: Register with Email/Mobile/Password
app.post('/api/register', async (req, res) => {
  try {
    await ensureSeeded();
    const { fullName, email, mobileNumber, password, confirmPassword } = req.body ?? {};

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter a valid full name.' });
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    const trimmedMobile = typeof mobileNumber === 'string' ? mobileNumber.trim() : '';
    const mobileDigits = trimmedMobile.replace(/\D/g, '');
    if (
      !trimmedMobile ||
      !/^[0-9+\-\s()]{10,18}$/.test(trimmedMobile) ||
      mobileDigits.length < 10 ||
      mobileDigits.length > 15
    ) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Password and Confirm Password do not match.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const uid = `local_${crypto.randomUUID()}`;

    const [createdUser] = await db
      .insert(users)
      .values({
        uid,
        email: normalizedEmail,
        fullName: fullName.trim(),
        mobileNumber: trimmedMobile,
        passwordHash,
        role: 'farmer',
      })
      .returning();

    const [createdProfile] = await db
      .insert(farmerProfiles)
      .values({
        userId: createdUser.id,
        fullName: createdUser.fullName,
      })
      .returning();

    const token = createSessionToken(createdUser.uid, createdUser.email);
    setSessionCookie(req, res, token);

    res.status(201).json({
      token,
      user: {
        id: createdUser.id,
        uid: createdUser.uid,
        email: createdUser.email,
        fullName: createdUser.fullName,
        mobileNumber: createdUser.mobileNumber,
        role: createdUser.role,
      },
      profile: createdProfile,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Auth: Login with Email & Password
app.post('/api/login', async (req, res) => {
  try {
    await ensureSeeded();
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const found = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (found.length === 0 || !found[0].passwordHash) {
      return res.status(401).json({
        error: 'Invalid email or password. If you registered with Google, please use Google Sign-In.',
      });
    }

    const valid = await bcrypt.compare(String(password), found[0].passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const userRecord = found[0];
    const token = createSessionToken(userRecord.uid, userRecord.email);
    setSessionCookie(req, res, token);

    const profiles = await db
      .select()
      .from(farmerProfiles)
      .where(eq(farmerProfiles.userId, userRecord.id))
      .limit(1);

    res.json({
      token,
      user: {
        id: userRecord.id,
        uid: userRecord.uid,
        email: userRecord.email,
        fullName: userRecord.fullName,
        mobileNumber: userRecord.mobileNumber,
        role: userRecord.role,
      },
      profile: profiles[0] ?? null,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Auth: Forgot password
app.post('/api/forgot-password', async (req, res) => {
  try {
    await ensureSeeded();
    const { email } = req.body ?? {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Please provide your registered email address.' });
    }
    res.json({
      message:
        'If an account matches that email address, password recovery instructions have been recorded. For Google Sign-In accounts, manage your password via your Google Account.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Unable to process request right now.' });
  }
});

// Auth: Restore session from HttpOnly cookie
app.get('/api/auth/session', requireAuth, async (req: AuthRequest, res) => {
  try {
    await ensureSeeded();
    const dbUser = req.dbUser!;
    const profiles = await db
      .select()
      .from(farmerProfiles)
      .where(eq(farmerProfiles.userId, dbUser.id))
      .limit(1);

    const token = createSessionToken(dbUser.uid, dbUser.email);
    res.json({
      token,
      user: dbUser,
      profile: profiles[0] ?? null,
    });
  } catch (error) {
    console.error('Session restore error:', error);
    res.status(500).json({ error: 'Failed to restore session.' });
  }
});

// Auth: Logout
app.post('/api/logout', (req, res) => {
  clearSessionCookie(req, res);
  res.json({ ok: true });
});

// Auth: Sync Firebase Google Sign-In user with PostgreSQL
app.post('/api/auth/firebase-sync', requireAuth, async (req: AuthRequest, res) => {
  try {
    await ensureSeeded();
    const dbUser = req.dbUser!;
    const profiles = await db
      .select()
      .from(farmerProfiles)
      .where(eq(farmerProfiles.userId, dbUser.id))
      .limit(1);

    let profile = profiles[0];
    if (!profile) {
      const [inserted] = await db
        .insert(farmerProfiles)
        .values({
          userId: dbUser.id,
          fullName: dbUser.fullName,
        })
        .returning();
      profile = inserted;
    }

    res.json({ user: dbUser, profile });
  } catch (error) {
    console.error('Firebase sync error:', error);
    res.status(500).json({ error: 'Failed to synchronize account profile.' });
  }
});

// Farmer Profile GET & PUT
app.get('/api/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    await ensureSeeded();
    const dbUser = req.dbUser!;
    const profiles = await db
      .select()
      .from(farmerProfiles)
      .where(eq(farmerProfiles.userId, dbUser.id))
      .limit(1);

    res.json({
      user: dbUser,
      profile: profiles[0] ?? null,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to load farmer profile.' });
  }
});

app.put('/api/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    await ensureSeeded();
    const dbUser = req.dbUser!;
    const {
      fullName,
      age,
      gender,
      state,
      district,
      village,
      farmerCategory,
      landHoldingAcres,
      mainCrop,
      irrigationAvailability,
      farmingType,
      mobileNumber,
    } = req.body ?? {};

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return res.status(400).json({ error: 'Full Name is required.' });
    }

    const parsedAge =
      age !== undefined && age !== null && age !== '' ? Number(age) : null;
    if (parsedAge !== null && (Number.isNaN(parsedAge) || parsedAge < 18 || parsedAge > 110)) {
      return res.status(400).json({ error: 'Age must be between 18 and 110.' });
    }

    await db
      .update(users)
      .set({
        fullName: fullName.trim(),
        ...(mobileNumber ? { mobileNumber: String(mobileNumber).trim() } : {}),
      })
      .where(eq(users.id, dbUser.id));

    const existing = await db
      .select()
      .from(farmerProfiles)
      .where(eq(farmerProfiles.userId, dbUser.id))
      .limit(1);

    const payload = {
      fullName: fullName.trim(),
      age: parsedAge,
      gender: gender ? String(gender).trim() : null,
      state: state ? String(state).trim() : null,
      district: district ? String(district).trim() : null,
      village: village ? String(village).trim() : null,
      farmerCategory: farmerCategory ? String(farmerCategory).trim() : null,
      landHoldingAcres:
        landHoldingAcres !== undefined && landHoldingAcres !== null && landHoldingAcres !== ''
          ? String(landHoldingAcres).trim()
          : null,
      mainCrop: mainCrop ? String(mainCrop).trim() : null,
      irrigationAvailability: irrigationAvailability
        ? String(irrigationAvailability).trim()
        : null,
      farmingType: farmingType ? String(farmingType).trim() : null,
      updatedAt: new Date(),
    };

    let updatedProfile;
    if (existing.length > 0) {
      const [row] = await db
        .update(farmerProfiles)
        .set(payload)
        .where(eq(farmerProfiles.userId, dbUser.id))
        .returning();
      updatedProfile = row;
    } else {
      const [row] = await db
        .insert(farmerProfiles)
        .values({ userId: dbUser.id, ...payload })
        .returning();
      updatedProfile = row;
    }

    res.json({ profile: updatedProfile });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to save farmer profile.' });
  }
});

// Farmer Dashboard summary
app.get('/api/dashboard', requireAuth, async (req: AuthRequest, res) => {
  try {
    await ensureSeeded();
    const lang = normalizeLang(req.query.lang);
    const dbUser = req.dbUser!;
    const [profile] = await db
      .select()
      .from(farmerProfiles)
      .where(eq(farmerProfiles.userId, dbUser.id))
      .limit(1);

    const recentRows = await db
      .select({
        viewedAt: recentlyViewedSchemes.viewedAt,
        scheme: schemes,
      })
      .from(recentlyViewedSchemes)
      .innerJoin(schemes, eq(recentlyViewedSchemes.schemeId, schemes.id))
      .where(eq(recentlyViewedSchemes.userId, dbUser.id))
      .orderBy(desc(recentlyViewedSchemes.viewedAt))
      .limit(6);

    // Deduplicate recently viewed by scheme id
    const seen = new Set<number>();
    const recentlyViewed = recentRows
      .filter((r) => {
        if (seen.has(r.scheme.id)) return false;
        seen.add(r.scheme.id);
        return true;
      })
      .map((r) => r.scheme);

    const allSchemes = await db.select().from(schemes);
    const recommendations = buildRecommendations(allSchemes, profile ?? null, lang);

    res.json({
      user: dbUser,
      profile: profile ?? null,
      recentlyViewed,
      recommendations,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard data.' });
  }
});

// Helper for recommendations
function buildRecommendations(
  allSchemes: (typeof schemes.$inferSelect)[],
  profile: typeof farmerProfiles.$inferSelect | null,
  lang: SupportedLang = 'en'
) {
  return allSchemes
    .map((scheme) => {
      const reasons: string[] = [];
      let score = 0;

      if (!profile) {
        if (scheme.isPopular) {
          score += 2;
          reasons.push(
            lang === 'hi'
              ? 'व्यापक रूप से अपनाई गई आधारभूत कृषि सहायता योजना।'
              : lang === 'kn'
              ? 'ವ್ಯಾಪಕವಾಗಿ ಅಳವಡಿಸಿಕೊಂಡಿರುವ ಮೂಲಭೂತ ಕೃಷಿ ಬೆಂಬಲ ಯೋಜನೆ.'
              : 'Widely adopted foundational agricultural support scheme.'
          );
        }
        return { scheme, score, reasons };
      }

      const state = profile.state?.trim() || '';
      const category = profile.farmerCategory?.trim() || '';
      const crop = profile.mainCrop?.trim().toLowerCase() || '';
      const irrigation = profile.irrigationAvailability?.trim().toLowerCase() || '';
      const farmingType = profile.farmingType?.trim().toLowerCase() || '';
      const landAcres = profile.landHoldingAcres ? Number(profile.landHoldingAcres) : NaN;

      // State & Central Government availability
      if (scheme.governmentLevel === 'State') {
        if (!state) {
          return { scheme, score: 0, reasons };
        }
        if (scheme.stateName.toLowerCase() !== state.toLowerCase()) {
          return { scheme, score: 0, reasons };
        }
        score += 5;
        const locState = localizeStateName(scheme.stateName, lang);
        reasons.push(
          lang === 'hi'
            ? `${locState} के लिए समर्पित राज्य सरकार की कृषि योजना।`
            : lang === 'kn'
            ? `${locState} ರಾಜ್ಯಕ್ಕೆ ಮೀಸಲಾದ ರಾಜ್ಯ ಸರ್ಕಾರದ ಕೃಷಿ ಯೋಜನೆ.`
            : `Dedicated State Government agricultural scheme for ${scheme.stateName}.`
        );
      } else {
        score += 2;
        reasons.push(
          lang === 'hi'
            ? 'केंद्र सरकार के कृषि दिशानिर्देशों के तहत पूरे भारत में उपलब्ध।'
            : lang === 'kn'
            ? 'ಕೇಂದ್ರ ಸರ್ಕಾರದ ಕೃಷಿ ಮಾರ್ಗಸೂಚಿಗಳ ಅಡಿಯಲ್ಲಿ ಭಾರತದಾದ್ಯಂತ ಲಭ್ಯವಿದೆ.'
            : 'Available across India under Central Government agricultural guidelines.'
        );
      }

      // Farmer category relevance
      if (category && scheme.targetCategories.includes(category)) {
        score += 3;
        const locCat = localizeFarmerCategory(category, lang);
        reasons.push(
          lang === 'hi'
            ? `${locCat} किसानों को प्राथमिकता देती है।`
            : lang === 'kn'
            ? `${locCat} ರೈತರಿಗೆ ಆದ್ಯತೆ ನೀಡುತ್ತದೆ.`
            : `Prioritizes ${category} farmers.`
        );
      }

      // Land holding relevance
      if (!Number.isNaN(landAcres)) {
        if (landAcres > 0 && scheme.slug === 'pm-kisan') {
          score += 3;
          reasons.push(
            lang === 'hi'
              ? `कृषि भूमि (${landAcres} एकड़) भू-स्वामी आय सहायता के अनुरूप है।`
              : lang === 'kn'
              ? `ಸಾಗುವಳಿ ಭೂಮಿ (${landAcres} ಎಕರೆ) ಭೂಮಾಲೀಕರ ಆದಾಯ ಬೆಂಬಲಕ್ಕೆ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ.`
              : `Cultivable landholding (${landAcres} acres) aligns with landholder income support.`
          );
        }
        if (landAcres <= 5 && scheme.slug === 'kcc') {
          score += 2;
          reasons.push(
            lang === 'hi'
              ? 'लघु एवं सीमांत जोत के लिए इनपुट और उपकरण लागत कम करने हेतु उपयुक्त।'
              : lang === 'kn'
              ? 'ಸಣ್ಣ ಮತ್ತು ಅತಿ ಸಣ್ಣ ಹಿಡುವಳಿಗಳಿಗೆ ಇನ್‌ಪುಟ್ ಮತ್ತು ಉಪಕರಣ ವೆಚ್ಚ ಕಡಿಮೆ ಮಾಡಲು ವಿನ್ಯಾಸಗೊಳಿಸಲಾಗಿದೆ.'
              : 'Designed to lower input and equipment costs for small & marginal holdings.'
          );
        }
      }

      // Crop / Irrigation / Farming type relevance
      if (
        (irrigation.includes('rainfed') || irrigation.includes('none')) &&
        (scheme.slug === 'pmfby' || scheme.slug === 'pmksy-per-drop-more-crop')
      ) {
        score += 4;
        reasons.push(
          lang === 'hi'
            ? 'वर्षा आधारित जल संचयन, सूक्ष्म सिंचाई और फसल जोखिम सुरक्षा का समर्थन करती है।'
            : lang === 'kn'
            ? 'ಮಳೆಯಾಧಾರಿತ ಜಲ ಸಂಗ್ರಹಣೆ, ಸೂಕ್ಷ್ಮ ನೀರಾವರಿ ಮತ್ತು ಬೆಳೆ ಅಪಾಯ ರಕ್ಷಣೆಯನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ.'
            : 'Supports rainfed water harvesting, micro-irrigation, and crop risk protection.'
        );
      }
      if (
        (irrigation.includes('borewell') || irrigation.includes('pump') || irrigation.includes('drip')) &&
        (scheme.slug === 'pm-kusum' || scheme.slug === 'pmksy-per-drop-more-crop')
      ) {
        score += 4;
        reasons.push(
          lang === 'hi'
            ? 'सोलर पावर या सूक्ष्म सिंचाई सब्सिडी के माध्यम से बोरवेल/पंप सिंचाई को मजबूत बनाती है।'
            : lang === 'kn'
            ? 'ಸೌರಶಕ್ತಿ ಅಥವಾ ಸೂಕ್ಷ್ಮ ನೀರಾವರಿ ಸಬ್ಸಿಡಿ ಮೂಲಕ ಬೋರ್‌ವೆಲ್/ಪಂಪ್ ನೀರಾವರಿಗೆ ಪೂರಕವಾಗಿದೆ.'
            : 'Complements borewell/pump irrigation through solar power or micro-irrigation subsidies.'
        );
      }
      if (crop && (scheme.slug === 'pmfby' || scheme.slug === 'soil-health-card' || scheme.slug === 'kcc')) {
        score += 2;
        reasons.push(
          lang === 'hi'
            ? `${profile.mainCrop} के लिए मौसमी खेती, मृदा पोषक योजना और जोखिम कवरेज में सहायक।`
            : lang === 'kn'
            ? `${profile.mainCrop} ಬೆಳೆಗೆ ಕಾಲೋಚಿತ ಸಾಗುವಳಿ, ಮಣ್ಣಿನ ಪೋಷಕಾಂಶ ಯೋಜನೆ ಮತ್ತು ಅಪಾಯ ರಕ್ಷಣೆಗೆ ಬೆಂಬಲ.`
            : `Supports seasonal cultivation, soil nutrient planning, and risk coverage for ${profile.mainCrop}.`
        );
      }
      if (farmingType.includes('organic') && scheme.slug === 'soil-health-card') {
        score += 2;
        reasons.push(
          lang === 'hi'
            ? 'जैविक खेती के लिए जैविक कार्बन और मिट्टी की उर्वरता की निगरानी में मदद करती है।'
            : lang === 'kn'
            ? 'ಸಾವಯವ ಕೃಷಿಗಾಗಿ ಸಾವಯವ ಇಂಗಾಲ ಮತ್ತು ಮಣ್ಣಿನ ಫಲವತ್ತತೆಯನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.'
            : 'Helps monitor organic carbon and soil fertility for organic cultivation.'
        );
      }

      if (reasons.length === 0) {
        reasons.push(
          lang === 'hi'
            ? 'समीक्षा करने योग्य सामान्य कृषि सहायता योजना।'
            : lang === 'kn'
            ? 'ಪರಿಶೀಲಿಸಲು ಯೋಗ್ಯವಾದ ಸಾಮಾನ್ಯ ಕೃಷಿ ಬೆಂಬಲ ಯೋಜನೆ.'
            : 'General agricultural support scheme worth reviewing.'
        );
      }

      return { scheme, score, reasons };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

// Schemes API
app.get('/api/schemes', async (req, res) => {
  try {
    await ensureSeeded();
    const { search, level, category, state, farmerCategory, sort } = req.query;

    let rows = await db.select().from(schemes);

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.shortName.toLowerCase().includes(q) ||
          s.stateName.toLowerCase().includes(q) ||
          s.governmentLevel.toLowerCase().includes(q) ||
          s.overview.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.benefits.toLowerCase().includes(q)
      );
    }
    if (level && typeof level === 'string' && level !== 'All') {
      rows = rows.filter((s) => s.governmentLevel.toLowerCase() === level.toLowerCase());
    }
    if (category && typeof category === 'string' && category !== 'All') {
      rows = rows.filter((s) => s.category.toLowerCase() === category.toLowerCase());
    }
    if (state && typeof state === 'string' && state !== 'All') {
      rows = rows.filter(
        (s) =>
          s.stateName.toLowerCase() === 'all india' ||
          s.stateName.toLowerCase() === state.toLowerCase()
      );
    }
    if (farmerCategory && typeof farmerCategory === 'string' && farmerCategory !== 'All') {
      rows = rows.filter((s) => s.targetCategories.includes(farmerCategory));
    }

    if (sort === 'name_asc') {
      rows.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'name_desc') {
      rows.sort((a, b) => b.name.localeCompare(a.name));
    } else if (state && typeof state === 'string' && state !== 'All' && state !== 'All India') {
      const targetState = state.toLowerCase();
      rows.sort(
        (a, b) =>
          Number(b.stateName.toLowerCase() === targetState) -
            Number(a.stateName.toLowerCase() === targetState) ||
          Number(b.isPopular) - Number(a.isPopular) ||
          a.stateName.localeCompare(b.stateName) ||
          a.id - b.id
      );
    } else {
      rows.sort(
        (a, b) =>
          Number(b.isPopular) - Number(a.isPopular) ||
          a.stateName.localeCompare(b.stateName) ||
          a.id - b.id
      );
    }

    res.json({ schemes: rows });
  } catch (error) {
    console.error('List schemes error:', error);
    res.status(500).json({ error: 'Failed to load government schemes.' });
  }
});

app.get('/api/schemes/:idOrSlug', async (req, res) => {
  try {
    await ensureSeeded();
    const { idOrSlug } = req.params;
    const numericId = Number(idOrSlug);
    const rows =
      !Number.isNaN(numericId) && Number.isInteger(numericId)
        ? await db.select().from(schemes).where(eq(schemes.id, numericId)).limit(1)
        : await db.select().from(schemes).where(eq(schemes.slug, idOrSlug)).limit(1);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Scheme not found.' });
    }
    res.json({ scheme: rows[0] });
  } catch (error) {
    console.error('Get scheme error:', error);
    res.status(500).json({ error: 'Failed to load scheme details.' });
  }
});

app.post('/api/schemes/:id/view', requireAuth, async (req: AuthRequest, res) => {
  try {
    await ensureSeeded();
    const schemeId = Number(req.params.id);
    if (Number.isNaN(schemeId)) {
      return res.status(400).json({ error: 'Invalid scheme ID.' });
    }
    await db.insert(recentlyViewedSchemes).values({
      userId: req.dbUser!.id,
      schemeId,
    });
    res.json({ ok: true });
  } catch (error) {
    console.error('Track scheme view error:', error);
    res.status(500).json({ error: 'Failed to record scheme view.' });
  }
});

// Eligibility Checker
app.post('/api/eligibility/check', optionalAuth, async (req: AuthRequest, res) => {
  try {
    await ensureSeeded();
    const { schemeId, profileOverrides, language } = req.body ?? {};
    const lang = normalizeLang(language ?? req.query.lang);

    let profileData = {
      state: profileOverrides?.state ?? null,
      farmerCategory: profileOverrides?.farmerCategory ?? null,
      landHoldingAcres: profileOverrides?.landHoldingAcres ?? null,
      mainCrop: profileOverrides?.mainCrop ?? null,
      farmingType: profileOverrides?.farmingType ?? null,
    };

    if (req.dbUser && !profileOverrides) {
      const [stored] = await db
        .select()
        .from(farmerProfiles)
        .where(eq(farmerProfiles.userId, req.dbUser.id))
        .limit(1);
      if (stored) {
        profileData = {
          state: stored.state,
          farmerCategory: stored.farmerCategory,
          landHoldingAcres: stored.landHoldingAcres,
          mainCrop: stored.mainCrop,
          farmingType: stored.farmingType,
        };
      }
    }

    if (schemeId) {
      const [target] = await db
        .select()
        .from(schemes)
        .where(eq(schemes.id, Number(schemeId)))
        .limit(1);
      if (!target) {
        return res.status(404).json({ error: 'Scheme not found.' });
      }
      return res.json({
        results: [evaluateSchemeEligibility(target, profileData, lang)],
      });
    }

    const allSchemes = await db.select().from(schemes);
    const results = allSchemes.map((s) => evaluateSchemeEligibility(s, profileData, lang));
    res.json({ results });
  } catch (error) {
    console.error('Eligibility check error:', error);
    res.status(500).json({ error: 'Failed to evaluate preliminary eligibility.' });
  }
});

// Personalized Recommendations
app.get('/api/recommendations', requireAuth, async (req: AuthRequest, res) => {
  try {
    await ensureSeeded();
    const lang = normalizeLang(req.query.lang);
    const [profile] = await db
      .select()
      .from(farmerProfiles)
      .where(eq(farmerProfiles.userId, req.dbUser!.id))
      .limit(1);

    const allSchemes = await db.select().from(schemes);
    const recommendations = buildRecommendations(allSchemes, profile ?? null, lang);

    res.json({
      profileComplete: Boolean(
        profile?.state && profile?.farmerCategory && profile?.mainCrop
      ),
      recommendations,
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations.' });
  }
});

// Agriculture Information Module
app.get('/api/agriculture', async (req, res) => {
  try {
    await ensureSeeded();
    const { section } = req.query;
    const rows =
      section && typeof section === 'string' && section !== 'all'
        ? await db
            .select()
            .from(agricultureItems)
            .where(eq(agricultureItems.section, section))
        : await db.select().from(agricultureItems);
    res.json({ items: rows });
  } catch (error) {
    console.error('Agriculture items error:', error);
    res.status(500).json({ error: 'Failed to load agriculture information.' });
  }
});

// Helper: build meteorological daily farm activity advisories from live Google Weather metrics
function buildWeatherAdvisories(
  params: {
    temperatureC: number | null;
    humidity: number | null;
    windSpeedKmh: number | null;
    rainProbability: number;
    precipitationMm: number;
    uvIndex: number | null;
    thunderstormProbability: number;
  },
  lang: SupportedLang = 'en'
) {
  const {
    temperatureC,
    humidity,
    windSpeedKmh,
    rainProbability,
    precipitationMm,
    uvIndex,
    thunderstormProbability,
  } = params;

  const advisories: Array<{
    activity: string;
    status: 'Optimal' | 'Caution' | 'Avoid';
    guidance: string;
  }> = [];

  const sprayTitle =
    lang === 'hi' ? 'पर्णीय छिड़काव' : lang === 'kn' ? 'ಎಲೆ ಸಿಂಪಡಣೆ' : 'Foliar Spraying';
  const irrTitle =
    lang === 'hi' ? 'सिंचाई समय' : lang === 'kn' ? 'ನೀರಾವರಿ ಸಮಯ' : 'Irrigation Timing';
  const harvestTitle =
    lang === 'hi' ? 'कटाई एवं सुखाना' : lang === 'kn' ? 'ಕೊಯ್ಲು ಮತ್ತು ಒಣಗಿಸುವಿಕೆ' : 'Harvest & Drying';

  // 1. Spraying Window
  if (thunderstormProbability >= 30 || rainProbability >= 50 || precipitationMm >= 1) {
    advisories.push({
      activity: sprayTitle,
      status: 'Avoid',
      guidance:
        lang === 'hi'
          ? `वर्षा या तूफान की संभावना (${rainProbability}%) छिड़काव को धो सकती है और दवा व्यर्थ हो सकती है।`
          : lang === 'kn'
          ? `ಮಳೆ ಅಥವಾ ಬಿರುಗಾಳಿ ಸಾಧ್ಯತೆ (${rainProbability}%) ಸಿಂಪಡಣೆಯನ್ನು ತೊಳೆದು ಹಾಕಬಹುದು.`
          : `Rain or storm probability (${rainProbability}%) may wash off sprays and waste inputs.`,
    });
  } else if ((windSpeedKmh ?? 0) > 15) {
    advisories.push({
      activity: sprayTitle,
      status: 'Avoid',
      guidance:
        lang === 'hi'
          ? `तेज़ हवा (${Math.round(windSpeedKmh!)} किमी/घंटा) से दवा के बहाव का जोखिम बढ़ता है। शांत समय की प्रतीक्षा करें।`
          : lang === 'kn'
          ? `ಗಾಳಿಯ ವೇಗ (${Math.round(windSpeedKmh!)} km/h) ರಾಸಾಯನಿಕ ಚದುರುವ ಅಪಾಯವನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ. ಶಾಂತ ಸಮಯಕ್ಕಾಗಿ ಕಾಯಿರಿ.`
          : `Wind speed (${Math.round(windSpeedKmh!)} km/h) increases chemical drift risk. Wait for calm hours.`,
    });
  } else if ((windSpeedKmh ?? 0) >= 10 || (temperatureC ?? 25) >= 34 || (uvIndex ?? 0) >= 8) {
    advisories.push({
      activity: sprayTitle,
      status: 'Caution',
      guidance:
        lang === 'hi'
          ? 'मध्यम हवा या दोपहर की गर्मी — छिड़काव सुबह जल्दी (6–9 बजे) या देर शाम को करें।'
          : lang === 'kn'
          ? 'ಮಧ್ಯಮ ಗಾಳಿ ಅಥವಾ ಮಧ್ಯಾಹ್ನದ ಬಿಸಿಲು — ಬೆಳಿಗ್ಗೆ ಬೇಗ (6–9 AM) ಅಥವಾ ಸಂಜೆ ಸಿಂಪಡಣೆ ಮಾಡಿ.'
          : 'Moderate breeze or midday heat — schedule spraying early morning (6–9 AM) or late evening.',
    });
  } else {
    advisories.push({
      activity: sprayTitle,
      status: 'Optimal',
      guidance:
        lang === 'hi'
          ? 'शांत हवा और साफ मौसम छिड़काव या ड्रोन उपयोग के लिए सुरक्षित समय प्रदान करते हैं।'
          : lang === 'kn'
          ? 'ಶಾಂತ ಗಾಳಿ ಮತ್ತು ಶುಭ್ರ ಆಕಾಶವು ಸಿಂಪಡಣೆ ಅಥವಾ ಡ್ರೋನ್ ಬಳಕೆಗೆ ಸುರಕ್ಷಿತ ಸಮಯವನ್ನು ನೀಡುತ್ತದೆ.'
          : 'Calm wind and dry skies provide a safe window for spraying or drone application.',
    });
  }

  // 2. Irrigation Need
  if (rainProbability >= 60 || precipitationMm >= 5) {
    advisories.push({
      activity: irrTitle,
      status: 'Avoid',
      guidance:
        lang === 'hi'
          ? `बारिश की प्रबल संभावना (${rainProbability}%) — जलभराव से बचने के लिए पंप सिंचाई रोकें।`
          : lang === 'kn'
          ? `ಹೆಚ್ಚಿನ ಮಳೆ ಸಾಧ್ಯತೆ (${rainProbability}%) — ನೀರು ನಿಲ್ಲುವುದನ್ನು ತಪ್ಪಿಸಲು ಪಂಪ್ ನೀರಾವರಿ ನಿಲ್ಲಿಸಿ.`
          : `Strong rain chance (${rainProbability}%) — pause pump irrigation to prevent waterlogging.`,
    });
  } else if (rainProbability >= 35) {
    advisories.push({
      activity: irrTitle,
      status: 'Caution',
      guidance:
        lang === 'hi'
          ? 'छिटपुट बौछारें संभव — बोरवेल या नहर से सिंचाई से पहले जड़ क्षेत्र की नमी जांचें।'
          : lang === 'kn'
          ? 'ಚದುರಿದ ಮಳೆ ಸಾಧ್ಯತೆ — ಬೋರ್‌ವೆಲ್ ಅಥವಾ ಕಾಲುವೆ ನೀರು ಹರಿಸುವ ಮೊದಲು ಬೇರಿನ ತೇವಾಂಶ ಪರಿಶೀಲಿಸಿ.'
          : 'Scattered showers possible — check root moisture before running borewell or canal water.',
    });
  } else if ((temperatureC ?? 25) >= 33 || (humidity ?? 55) <= 35) {
    advisories.push({
      activity: irrTitle,
      status: 'Optimal',
      guidance:
        lang === 'hi'
          ? 'आज अधिक वाष्पीकरण — नई और फूल वाली फसलों के लिए ड्रिप या शाम की सिंचाई को प्राथमिकता दें।'
          : lang === 'kn'
          ? 'ಇಂದು ಹೆಚ್ಚು ಆವಿಯಾಗುವಿಕೆ — ಎಳೆಯ ಮತ್ತು ಹೂಬಿಡುವ ಬೆಳೆಗಳಿಗೆ ಹನಿ ನೀರಾವರಿ ಅಥವಾ ಸಂಜೆ ನೀರಾವರಿಗೆ ಆದ್ಯತೆ ನೀಡಿ.'
          : 'High evaporation today — prioritize drip or evening irrigation for young and flowering crops.',
    });
  } else {
    advisories.push({
      activity: irrTitle,
      status: 'Optimal',
      guidance:
        lang === 'hi'
          ? 'संतुलित नमी की आवश्यकता — अपनी सामान्य ड्रिप या फसल-अवस्था सिंचाई चक्र का पालन करें।'
          : lang === 'kn'
          ? 'ಸ್ಥಿರ ತೇವಾಂಶದ ಅಗತ್ಯವಿದೆ — ನಿಮ್ಮ ಸಾಮಾನ್ಯ ಹನಿ ಅಥವಾ ಬೆಳೆ ಹಂತದ ನೀರಾವರಿ ಚಕ್ರವನ್ನು ಅನುಸರಿಸಿ.'
          : 'Steady moisture demand — follow your normal drip or crop-stage irrigation cycle.',
    });
  }

  // 3. Field & Harvest Work
  if (thunderstormProbability >= 35 || rainProbability >= 60) {
    advisories.push({
      activity: harvestTitle,
      status: 'Avoid',
      guidance:
        lang === 'hi'
          ? 'गीले मौसम की संभावना — कटाई/थ्रेसिंग टालें और काटे गए अनाज को ढककर रखें।'
          : lang === 'kn'
          ? 'ಒದ್ದೆಯಾದ ಹವಾಮಾನ ನಿರೀಕ್ಷಿತ — ಕೊಯ್ಲು/ಒಕ್ಕಣೆಯನ್ನು ಮುಂದೂಡಿ ಮತ್ತು ಕೊಯ್ಲು ಮಾಡಿದ ಧಾನ್ಯವನ್ನು ಮುಚ್ಚಿಡಿ.'
          : 'Wet weather expected — postpone harvesting/threshing and keep harvested grain covered.',
    });
  } else if (rainProbability >= 30 || (humidity ?? 50) >= 82) {
    advisories.push({
      activity: harvestTitle,
      status: 'Caution',
      guidance:
        lang === 'hi'
          ? 'उच्च आर्द्रता या बादल — उपज को धूप में सुखाने से पहले स्थानीय मौसम पर नज़र रखें।'
          : lang === 'kn'
          ? 'ಹೆಚ್ಚಿನ ತೇವಾಂಶ ಅಥವಾ ಮೋಡ — ಬೆಳೆಯನ್ನು ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸುವ ಮೊದಲು ಸ್ಥಳೀಯ ಆಕಾಶವನ್ನು ಗಮನಿಸಿ.'
          : 'High humidity or passing clouds — watch local sky closely before sun-drying produce.',
    });
  } else if ((uvIndex ?? 0) >= 8 || (temperatureC ?? 25) >= 37) {
    advisories.push({
      activity: harvestTitle,
      status: 'Caution',
      guidance:
        lang === 'hi'
          ? 'दोपहर में तेज गर्मी/UV — भारी खेत कार्य सुबह 11 बजे से पहले करें और पशुओं को छाया में रखें।'
          : lang === 'kn'
          ? 'ಮಧ್ಯಾಹ್ನದ ತೀವ್ರ ಬಿಸಿಲು/UV — ಭಾರೀ ಹೊಲದ ಕೆಲಸವನ್ನು ಬೆಳಿಗ್ಗೆ 11 ಗಂಟೆಯೊಳಗೆ ಪೂರ್ಣಗೊಳಿಸಿ ಮತ್ತು ಜಾನುವಾರುಗಳಿಗೆ ನೆರಳು ನೀಡಿ.'
          : 'Strong midday heat/UV — schedule heavy field labour before 11 AM and shade livestock.',
    });
  } else {
    advisories.push({
      activity: harvestTitle,
      status: 'Optimal',
      guidance:
        lang === 'hi'
          ? 'बुवाई, निराई, कटाई और अनाज सुखाने के लिए साफ एवं शुष्क कार्य परिस्थितियां उपयुक्त हैं।'
          : lang === 'kn'
          ? 'ಬಿತ್ತನೆ, ಕಳೆ ತೆಗೆಯುವುದು, ಕೊಯ್ಲು ಮತ್ತು ಧಾನ್ಯ ಒಣಗಿಸಲು ಶುಭ್ರ, ಒಣ ಹವಾಮಾನ ಸೂಕ್ತವಾಗಿದೆ.'
          : 'Clear, dry working conditions suited for sowing, weeding, harvesting, and grain drying.',
    });
  }

  return advisories;
}

// Provide public Maps JavaScript API key config cleanly to the React client
app.get('/api/maps/config', (_req, res) => {
  const apiKey =
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.MAPS_API_KEY ||
    '';
  res.json({ apiKey });
});

// Places API (New) Text Search proxy for nearby Mandis, Raitha Samparka Kendras, KVKs & Agri Services
app.post('/api/maps/places', async (req, res) => {
  try {
    const apiKey =
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.VITE_GOOGLE_MAPS_API_KEY ||
      process.env.MAPS_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        error: 'Google Maps API key is not configured on the server.',
      });
    }

    const { textQuery, lat, lng, radiusMeters, languageCode } = req.body ?? {};
    const queryStr = typeof textQuery === 'string' ? textQuery.trim() : '';
    if (!queryStr) {
      return res.status(400).json({ error: 'Search query (textQuery) is required.' });
    }

    const allowedLangs = new Set(['en', 'hi', 'kn']);
    const safeLang =
      typeof languageCode === 'string' && allowedLangs.has(languageCode) ? languageCode : 'en';

    const requestBody: Record<string, unknown> = {
      textQuery: queryStr,
      languageCode: safeLang,
      regionCode: 'in',
      pageSize: 12,
    };

    const parsedLat = Number(lat);
    const parsedLng = Number(lng);
    if (Number.isFinite(parsedLat) && Number.isFinite(parsedLng)) {
      const rawRadius = Number(radiusMeters);
      const clampedRadius = Number.isFinite(rawRadius)
        ? Math.min(Math.max(rawRadius, 500), 50000)
        : 25000;
      requestBody.locationBias = {
        circle: {
          center: { latitude: parsedLat, longitude: parsedLng },
          radius: clampedRadius,
        },
      };
    }

    const placesRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio',
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.location,places.googleMapsUri,places.googleMapsLinks.directionsUri,places.primaryTypeDisplayName,places.businessStatus',
      },
      body: JSON.stringify(requestBody),
    });

    const placesData = (await placesRes.json().catch(() => ({}))) as {
      places?: Array<{
        id?: string;
        displayName?: { text?: string };
        formattedAddress?: string;
        location?: { latitude?: number; longitude?: number };
        googleMapsUri?: string;
        googleMapsLinks?: { directionsUri?: string };
        primaryTypeDisplayName?: { text?: string };
        businessStatus?: string;
      }>;
      error?: { status?: string; message?: string };
    };

    const errText = `${placesData?.error?.status || ''} ${placesData?.error?.message || ''}`.toUpperCase();
    if (
      placesRes.status === 429 ||
      errText.includes('RESOURCE_EXHAUSTED') ||
      errText.includes('OVER_QUERY_LIMIT') ||
      errText.includes('QUOTA')
    ) {
      return res.status(429).json({
        quotaExceeded: true,
        error: 'Google Maps Platform quota reached for this demo key.',
      });
    }

    if (!placesRes.ok) {
      return res.status(placesRes.status >= 400 && placesRes.status < 500 ? placesRes.status : 502).json({
        error: placesData?.error?.message || 'Unable to search nearby agricultural services.',
      });
    }

    const normalized = (placesData.places ?? [])
      .filter(
        (p) =>
          p?.id &&
          p?.location &&
          typeof p.location.latitude === 'number' &&
          typeof p.location.longitude === 'number'
      )
      .map((p) => ({
        id: p.id!,
        name: p.displayName?.text || 'Agricultural Service Center',
        address: p.formattedAddress || 'Address unavailable',
        latitude: p.location!.latitude!,
        longitude: p.location!.longitude!,
        primaryType: p.primaryTypeDisplayName?.text || null,
        businessStatus: p.businessStatus || null,
        googleMapsUri: p.googleMapsUri || null,
        directionsUri: p.googleMapsLinks?.directionsUri || null,
      }));

    res.json({ places: normalized });
  } catch (error) {
    console.error('Places API proxy error:', error);
    res.status(500).json({ error: 'Unable to search nearby places right now.' });
  }
});

// Weather & Local Forecast via Google Maps Platform (Geocoding v4 + Weather API)
app.get('/api/weather', async (req, res) => {
  try {
    const apiKey =
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.VITE_GOOGLE_MAPS_API_KEY ||
      process.env.MAPS_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        error: 'Weather service API key is not configured on the server.',
      });
    }

    const gmpHeaders = {
      'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio',
    };

    const lang = normalizeLang(req.query.lang);
    const rawLat = req.query.lat !== undefined ? Number(req.query.lat) : NaN;
    const rawLng = req.query.lng !== undefined ? Number(req.query.lng) : NaN;
    const locationParam =
      typeof req.query.location === 'string' && req.query.location.trim()
        ? req.query.location.trim()
        : 'Bengaluru, Karnataka, India';

    let latitude: number;
    let longitude: number;
    let locationName = locationParam;

    const isQuotaPayload = (status: number, body: unknown) => {
      if (status === 429) return true;
      const errObj = (body as { error?: { status?: string; message?: string } })?.error;
      const msg = `${errObj?.status || ''} ${errObj?.message || ''}`.toUpperCase();
      return msg.includes('RESOURCE_EXHAUSTED') || msg.includes('OVER_QUERY_LIMIT') || msg.includes('QUOTA');
    };

    if (Number.isFinite(rawLat) && Number.isFinite(rawLng)) {
      latitude = rawLat;
      longitude = rawLng;
      locationName = `${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`;

      // Reverse Geocode v4 for friendly place label
      const revUrl = new URL('https://geocode.googleapis.com/v4/geocode/location');
      revUrl.searchParams.set('location.latitude', String(latitude));
      revUrl.searchParams.set('location.longitude', String(longitude));
      revUrl.searchParams.set('languageCode', lang);

      const revRes = await fetch(revUrl.toString(), {
        headers: {
          ...gmpHeaders,
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'results.placeId,results.formattedAddress',
        },
      });
      const revData = await revRes.json().catch(() => ({}));
      if (isQuotaPayload(revRes.status, revData)) {
        return res.status(429).json({
          quotaExceeded: true,
          error: 'Google Maps Platform quota reached for this demo key.',
        });
      }
      const formatted = (revData as { results?: Array<{ formattedAddress?: string }> })
        ?.results?.[0]?.formattedAddress;
      if (formatted) {
        locationName = formatted;
      }
    } else {
      // Forward Geocode v4
      const geoUrl = new URL(
        `https://geocode.googleapis.com/v4/geocode/address/${encodeURIComponent(locationParam)}`
      );
      geoUrl.searchParams.set('regionCode', 'in');
      geoUrl.searchParams.set('languageCode', lang);

      const geoRes = await fetch(geoUrl.toString(), {
        headers: {
          ...gmpHeaders,
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'results.placeId,results.location,results.formattedAddress',
        },
      });
      const geoData = (await geoRes.json().catch(() => ({}))) as {
        results?: Array<{
          formattedAddress?: string;
          location?: { latitude?: number; longitude?: number };
        }>;
        error?: { message?: string; status?: string };
      };

      if (isQuotaPayload(geoRes.status, geoData)) {
        return res.status(429).json({
          quotaExceeded: true,
          error: 'Google Maps Platform quota reached for this demo key.',
        });
      }

      if (!geoRes.ok) {
        return res.status(geoRes.status >= 400 && geoRes.status < 500 ? geoRes.status : 502).json({
          error: geoData?.error?.message || 'Unable to resolve the requested location.',
        });
      }

      const first = geoData.results?.[0];
      if (!first?.location || first.location.latitude === undefined || first.location.longitude === undefined) {
        return res.status(404).json({
          error: `Location "${locationParam}" was not found. Try entering District and State (e.g., Mandya, Karnataka).`,
        });
      }

      latitude = first.location.latitude;
      longitude = first.location.longitude;
      locationName = first.formattedAddress || locationParam;
    }

    const buildWeatherUrl = (endpoint: string, extra: Record<string, string>) => {
      const u = new URL(`https://weather.googleapis.com/v1/${endpoint}`);
      u.searchParams.set('key', apiKey);
      u.searchParams.set('location.latitude', String(latitude));
      u.searchParams.set('location.longitude', String(longitude));
      u.searchParams.set('unitsSystem', 'METRIC');
      for (const [k, v] of Object.entries(extra)) {
        u.searchParams.set(k, v);
      }
      return u.toString();
    };

    const [currRes, dailyRes, hourlyRes] = await Promise.all([
      fetch(buildWeatherUrl('currentConditions:lookup', {}), { headers: gmpHeaders }),
      fetch(buildWeatherUrl('forecast/days:lookup', { days: '5', pageSize: '5' }), { headers: gmpHeaders }),
      fetch(buildWeatherUrl('forecast/hours:lookup', { hours: '12', pageSize: '12' }), { headers: gmpHeaders }),
    ]);

    const [currJson, dailyJson, hourlyJson] = await Promise.all([
      currRes.json().catch(() => ({})),
      dailyRes.json().catch(() => ({})),
      hourlyRes.json().catch(() => ({})),
    ]);

    if (
      isQuotaPayload(currRes.status, currJson) ||
      isQuotaPayload(dailyRes.status, dailyJson) ||
      isQuotaPayload(hourlyRes.status, hourlyJson)
    ) {
      return res.status(429).json({
        quotaExceeded: true,
        error: 'Google Maps Platform quota reached for this demo key.',
      });
    }

    if (!currRes.ok) {
      const msg = (currJson as { error?: { message?: string } })?.error?.message;
      return res.status(502).json({
        error: msg || 'Live weather observations are temporarily unavailable for this coordinate.',
      });
    }

    const c = currJson as {
      currentTime?: string;
      isDaytime?: boolean;
      temperature?: { degrees?: number };
      feelsLikeTemperature?: { degrees?: number };
      relativeHumidity?: number;
      uvIndex?: number;
      cloudCover?: number;
      thunderstormProbability?: number;
      precipitation?: {
        probability?: { percent?: number };
        qpf?: { quantity?: number };
      };
      wind?: {
        speed?: { value?: number };
        direction?: { cardinal?: string };
      };
      weatherCondition?: {
        description?: { text?: string };
        iconBaseUri?: string;
      };
    };

    const temperatureC = c.temperature?.degrees ?? null;
    const feelsLikeC = c.feelsLikeTemperature?.degrees ?? null;
    const humidity = c.relativeHumidity ?? null;
    const windSpeedKmh = c.wind?.speed?.value ?? null;
    const windDirection = (c.wind?.direction?.cardinal || 'CALM').replace(/_/g, ' ');
    const rainProbability = c.precipitation?.probability?.percent ?? 0;
    const precipitationMm = c.precipitation?.qpf?.quantity ?? 0;
    const uvIndex = c.uvIndex ?? null;
    const cloudCover = c.cloudCover ?? null;
    const thunderstormProbability = c.thunderstormProbability ?? 0;

    const advisories = buildWeatherAdvisories(
      {
        temperatureC,
        humidity,
        windSpeedKmh,
        rainProbability,
        precipitationMm,
        uvIndex,
        thunderstormProbability,
      },
      lang
    );

    const localeTag = lang === 'hi' ? 'hi-IN' : lang === 'kn' ? 'kn-IN' : 'en-IN';
    const rawHourly = ((hourlyJson as { forecastHours?: unknown[] })?.forecastHours || []) as Array<{
      displayDateTime?: { hours?: number };
      temperature?: { degrees?: number };
      weatherCondition?: { description?: { text?: string }; iconBaseUri?: string };
      precipitation?: { probability?: { percent?: number } };
      wind?: { speed?: { value?: number } };
    }>;

    const hourly = rawHourly.slice(0, 8).map((h) => {
      const hr = h.displayDateTime?.hours ?? 0;
      const suffix = hr >= 12 ? 'PM' : 'AM';
      const hr12 = hr % 12 === 0 ? 12 : hr % 12;
      return {
        timeLabel: `${hr12} ${suffix}`,
        temperatureC: h.temperature?.degrees ?? null,
        conditionText: h.weatherCondition?.description?.text || 'Clear',
        iconUri: h.weatherCondition?.iconBaseUri ? `${h.weatherCondition.iconBaseUri}.svg` : null,
        rainProbability: h.precipitation?.probability?.percent ?? 0,
        windKmh: h.wind?.speed?.value ?? null,
      };
    });

    const rawDaily = ((dailyJson as { forecastDays?: unknown[] })?.forecastDays || []) as Array<{
      displayDate?: { year?: number; month?: number; day?: number };
      daytimeForecast?: {
        weatherCondition?: { description?: { text?: string }; iconBaseUri?: string };
        precipitation?: { probability?: { percent?: number }; qpf?: { quantity?: number } };
        wind?: { speed?: { value?: number } };
      };
      maxTemperature?: { degrees?: number };
      minTemperature?: { degrees?: number };
    }>;

    const daily = rawDaily.slice(0, 5).map((d, idx) => {
      const yr = d.displayDate?.year || new Date().getFullYear();
      const mo = (d.displayDate?.month || 1) - 1;
      const dy = d.displayDate?.day || 1;
      const dt = new Date(Date.UTC(yr, mo, dy));
      const dayName =
        idx === 0
          ? lang === 'hi'
            ? 'आज'
            : lang === 'kn'
            ? 'ಇಂದು'
            : 'Today'
          : dt.toLocaleDateString(localeTag, { weekday: 'short', timeZone: 'UTC' });
      const dateLabel = dt.toLocaleDateString(localeTag, {
        day: 'numeric',
        month: 'short',
        timeZone: 'UTC',
      });

      return {
        dateLabel,
        dayName,
        conditionText: d.daytimeForecast?.weatherCondition?.description?.text || 'Fair',
        iconUri: d.daytimeForecast?.weatherCondition?.iconBaseUri
          ? `${d.daytimeForecast.weatherCondition.iconBaseUri}.svg`
          : null,
        maxTempC: d.maxTemperature?.degrees ?? null,
        minTempC: d.minTemperature?.degrees ?? null,
        rainProbability: d.daytimeForecast?.precipitation?.probability?.percent ?? 0,
        precipitationMm: d.daytimeForecast?.precipitation?.qpf?.quantity ?? 0,
        windKmh: d.daytimeForecast?.wind?.speed?.value ?? null,
      };
    });

    res.json({
      locationName,
      latitude,
      longitude,
      observedAt: c.currentTime || new Date().toISOString(),
      isDaytime: c.isDaytime ?? true,
      current: {
        temperatureC,
        feelsLikeC,
        humidity,
        windSpeedKmh,
        windDirection,
        rainProbability,
        precipitationMm,
        uvIndex,
        cloudCover,
        thunderstormProbability,
        conditionText: c.weatherCondition?.description?.text || 'Clear',
        iconUri: c.weatherCondition?.iconBaseUri ? `${c.weatherCondition.iconBaseUri}.svg` : null,
      },
      advisories,
      hourly,
      daily,
    });
  } catch (error) {
    console.error('Weather API proxy error:', error);
    res.status(500).json({ error: 'Unable to fetch local weather forecast right now.' });
  }
});

// Contact Message
app.post('/api/contact', async (req, res) => {
  try {
    await ensureSeeded();
    const { name, email, phone, subject, message } = req.body ?? {};
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Name, email, subject, and message are required.' });
    }
    const [saved] = await db
      .insert(contactMessages)
      .values({
        name: String(name).trim(),
        email: String(email).trim(),
        phone: phone ? String(phone).trim() : null,
        subject: String(subject).trim(),
        message: String(message).trim(),
      })
      .returning();
    res.status(201).json({
      id: saved.id,
      message: 'Your inquiry has been recorded. Thank you for contacting the platform.',
    });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

// KRISHI SANGRAH Website Directory & Navigation Catalog (used by Search & AI Assistant)
const SITE_PAGES_CATALOG = [
  {
    title: 'Home — KRISHI SANGRAH Portal',
    description: 'Platform overview, quick scheme search, popular schemes, core capabilities, and 8-step farmer workflow.',
    path: '/',
    category: 'Platform Page',
    keywords: 'home landing krishi sangrah overview popular workflow',
  },
  {
    title: 'Government Schemes Directory',
    description: 'Search and filter verified Central Government and all 28 Indian States agricultural schemes by category, state, and farmer category.',
    path: '/schemes',
    category: 'Schemes & Eligibility',
    keywords: 'schemes central state subsidies financial income insurance credit filter',
  },
  {
    title: 'Preliminary Eligibility Checker',
    description: 'Check eligibility against Central and all 28 State Government schemes using state, farmer category, landholding acres, crop, and farming type.',
    path: '/eligibility',
    category: 'Interactive Tool',
    keywords: 'eligibility check qualify criteria rules acres farmer category',
  },
  {
    title: 'Farmer Dashboard & Real-Time Weather Planner',
    description: 'Manage Farmer Profile, view Personalized Recommendations, Recently Viewed Schemes, Farm Location Map, and Local Google Weather + Daily Spraying/Irrigation/Harvest advisories.',
    path: '/dashboard',
    category: 'Dashboard & Weather',
    keywords: 'dashboard profile recommendations weather forecast rain humidity wind gps spraying irrigation harvest map',
  },
  {
    title: 'Agri Map & Nearby Services Locator',
    description: 'Interactive Google Map to discover nearby APMC Mandis, Raitha Samparka Kendras, Krishi Vigyan Kendras, Soil Testing Labs, Seed Stores, Tractor Dealers, and Veterinary Centers.',
    path: '/agri-map',
    category: 'Maps & Nearby Services',
    keywords: 'map google maps nearby agri center mandi apmc soil lab kvk raitha samparka seed fertilizer tractor veterinary',
  },
  {
    title: 'Crops Information (32 Varieties)',
    description: 'Complete Indian crop guide: Cereals, Millets, Pulses, Oilseeds, Cash & Fibre, Plantation, Spices, Vegetables, and Fruits.',
    path: '/agriculture/crop',
    category: 'Agriculture Knowledge',
    keywords: 'crops paddy wheat ragi maize jowar bajra pulses oilseeds cotton sugarcane spices vegetables fruits kharif rabi',
  },
  {
    title: 'Soil Information (12 Soil Profiles)',
    description: 'Alluvial, Black Cotton, Red, Laterite, Mountain, Coastal, Alkaline, Saline, and Desert soil pH, crops, and reclamation.',
    path: '/agriculture/soil',
    category: 'Agriculture Knowledge',
    keywords: 'soil red black cotton alluvial laterite coastal saline alkaline desert ph reclamation fertility',
  },
  {
    title: 'Farm Animals & Livestock (12 Guides)',
    description: 'Dairy cattle, buffaloes, goats, sheep, poultry, fisheries, and beekeeping breeds, feed, housing, and care.',
    path: '/agriculture/animal',
    category: 'Agriculture Knowledge',
    keywords: 'animals livestock cattle cow buffalo goat sheep poultry fish aquaculture honeybee dairy',
  },
  {
    title: 'Organic Farming (10 Practices)',
    description: 'Vermicompost, FYM, Biofertilizers, Green Manuring, Jeevamrutha Natural Farming, Neem Biopesticides, and Crop Rotation.',
    path: '/agriculture/organic',
    category: 'Agriculture Knowledge',
    keywords: 'organic compost vermicompost biofertilizer green manure jeevamrutha natural farming neem traps',
  },
  {
    title: 'Inorganic Farming & Nutrient Stewardship (10 Guides)',
    description: 'Urea, DAP, SSP, MOP Potash, Zinc, Boron, Sulphur, Soil Health Card INM, and safe agrochemical PHI practices.',
    path: '/agriculture/inorganic',
    category: 'Agriculture Knowledge',
    keywords: 'inorganic fertilizer urea dap ssp mop potash micronutrients zinc boron sulphur inm safe handling',
  },
  {
    title: 'Modern & Foreign AgTech (16 Technologies)',
    description: 'Drip & sprinkler irrigation, solar pumps, polyhouse, hydroponics, drones, combine harvesters, precision IoT, and global foreign farm tech.',
    path: '/agriculture/technology',
    category: 'Agriculture Knowledge',
    keywords: 'technology modern foreign agtech drip sprinkler solar pump polyhouse hydroponics drone machinery precision gps',
  },
  {
    title: 'Foreign & Global AgTech Focus',
    description: 'International precision agriculture, Israeli drip automation, Dutch greenhouses, Japanese transplanters, and global smart farming.',
    path: '/agriculture/technology?focus=foreign',
    category: 'Agriculture Knowledge',
    keywords: 'foreign global international israel dutch japan agtech automation precision robotics',
  },
  {
    title: 'AI Farmer Assistant & Voice Search',
    description: 'Full-website AI assistant with voice search and multilingual support across English, Hindi, and Kannada.',
    path: '/chatbot',
    category: 'AI Assistant',
    keywords: 'ai chatbot voice assistant help ask search',
  },
  {
    title: 'About KRISHI SANGRAH',
    description: 'Educational mission, project objectives, and platform module overview.',
    path: '/about',
    category: 'Platform Page',
    keywords: 'about project objectives mission',
  },
  {
    title: 'Contact & Support Form',
    description: 'Submit feedback or inquiries (+91 80000 00000, support@farmerschemeportal.edu.in).',
    path: '/contact',
    category: 'Platform Page',
    keywords: 'contact support phone email helpline feedback',
  },
];

// Batch Translation API (Gemini-backed with in-memory & disk cache)
app.post('/api/translate', async (req, res) => {
  try {
    const { targetLanguage, texts } = req.body ?? {};
    const lang = normalizeLang(targetLanguage);

    if (lang === 'en') {
      const identity: Record<string, string> = {};
      if (Array.isArray(texts)) {
        for (const t of texts) {
          if (typeof t === 'string') identity[t] = t;
        }
      }
      return res.json({ translations: identity });
    }

    if (!Array.isArray(texts) || texts.length === 0) {
      return res.json({ translations: {} });
    }

    const uniqueTexts = Array.from(
      new Set(
        texts
          .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
          .slice(0, 60)
      )
    );

    const cacheMap = translationMemoryCache[lang];
    const resolved: Record<string, string> = {};
    const uncached: string[] = [];

    for (const item of uniqueTexts) {
      const hit = cacheMap.get(item);
      if (hit !== undefined) {
        resolved[item] = hit;
      } else {
        uncached.push(item);
      }
    }

    if (uncached.length === 0) {
      return res.json({ translations: resolved });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Translation service is unavailable because GEMINI_API_KEY is not configured.',
        translations: resolved,
      });
    }

    const targetLangName =
      lang === 'hi' ? 'Hindi (Devanagari script)' : 'Kannada (Kannada script)';

    const callModel = (modelName: string) =>
      ai.models.generateContent({
        model: modelName,
        contents: JSON.stringify(uncached),
        config: {
          systemInstruction: `You are an expert agricultural & government-scheme translator. Translate each string in the input JSON array from English into natural, clear, accurate ${targetLangName} suitable for Indian farmers.
Rules:
1. Return a JSON object with a "translations" array of the EXACT same length and in the EXACT same order as the input array.
2. Preserve numbers, measurements, currency symbols (₹), percentages, dates, and URLs accurately.
3. For widely recognized scheme/technical acronyms like PM-KISAN, PMFBY, KCC, NPK, pH, drip/GPS/AI, keep or pair them naturally in ${targetLangName} so farmers recognize them easily.
4. Do not omit or merge any array element.`,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['translations'],
          },
        },
      });

    let response;
    try {
      response = await callModel('gemini-4-hydrogen');
    } catch (firstErr) {
      const msg = firstErr instanceof Error ? firstErr.message : String(firstErr);
      const status = (firstErr as { status?: number })?.status;
      if (status === 503 || msg.includes('503') || msg.includes('UNAVAILABLE')) {
        response = await callModel('gemini-3.1-flash-lite');
      } else {
        throw firstErr;
      }
    }

    const raw = (response.text || '').trim();
    const parsed = JSON.parse(raw) as { translations?: unknown[] };
    const arr = Array.isArray(parsed.translations) ? parsed.translations : [];

    uncached.forEach((src, idx) => {
      const tr = typeof arr[idx] === 'string' && arr[idx].trim() ? arr[idx].trim() : src;
      cacheMap.set(src, tr);
      resolved[src] = tr;
    });
    scheduleTranslationCacheFlush();

    res.json({ translations: resolved });
  } catch (error) {
    console.error('Batch translation error:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    const status =
      typeof (error as { status?: number })?.status === 'number'
        ? (error as { status: number }).status
        : 500;
    res.status(status >= 400 && status < 600 ? status : 500).json({
      error: `Unable to translate content: ${errMsg}`,
    });
  }
});

// Full Website Search API (Pages, Schemes, and all Agriculture Knowledge Items)
app.get('/api/search', async (req, res) => {
  try {
    await ensureSeeded();
    const rawQ = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const lang = normalizeLang(req.query.lang);
    const q = rawQ.toLowerCase();

    const [allSchemes, allAgri] = await Promise.all([
      db.select().from(schemes),
      db.select().from(agricultureItems),
    ]);

    const cacheMap = lang !== 'en' ? translationMemoryCache[lang] : null;
    const localizePage = (p: (typeof SITE_PAGES_CATALOG)[number]) => ({
      title: p.title,
      description: p.description,
      path: p.path,
      category: p.category,
    });

    if (!q) {
      return res.json({
        query: '',
        pages: SITE_PAGES_CATALOG.slice(0, 6).map(localizePage),
        schemes: allSchemes.slice(0, 4),
        agriculture: allAgri.slice(0, 6),
      });
    }

    const terms = q.split(/\s+/).filter(Boolean);
    const matchesAllTerms = (haystack: string) =>
      terms.every((term) => haystack.includes(term));

    const matchedPages = SITE_PAGES_CATALOG.filter((p) => {
      const trTitle = cacheMap?.get(p.title) || '';
      const trDesc = cacheMap?.get(p.description) || '';
      return matchesAllTerms(
        `${p.title} ${p.description} ${p.category} ${p.keywords} ${trTitle} ${trDesc}`.toLowerCase()
      );
    }).map(localizePage);

    const matchedSchemes = allSchemes.filter((s) => {
      const trName = cacheMap?.get(s.name) || '';
      const trBenefits = cacheMap?.get(s.benefits) || '';
      return matchesAllTerms(
        `${s.name} ${s.shortName} ${s.governmentLevel} ${s.stateName} ${s.category} ${s.overview} ${s.benefits} ${s.eligibilitySummary} ${s.requiredDocuments.join(' ')} ${trName} ${trBenefits}`.toLowerCase()
      );
    });

    const matchedAgri = allAgri.filter((a) => {
      const trTitle = cacheMap?.get(a.title) || '';
      const trSummary = cacheMap?.get(a.summary) || '';
      return matchesAllTerms(
        `${a.section} ${a.title} ${a.subtitle} ${a.summary} ${trTitle} ${trSummary} ${Object.entries(a.details || {})
          .map(([k, v]) => `${k} ${v}`)
          .join(' ')} ${(a.highlights || []).join(' ')}`.toLowerCase()
      );
    });

    res.json({
      query: rawQ,
      pages: matchedPages.slice(0, 6),
      schemes: matchedSchemes.slice(0, 8),
      agriculture: matchedAgri.slice(0, 12),
    });
  } catch (error) {
    console.error('Website search error:', error);
    res.status(500).json({ error: 'Unable to search platform records.' });
  }
});

// Voice Audio Transcription (Gemini 3.5 Transcribe fallback when Web Speech API is unavailable)
app.post('/api/chatbot/transcribe', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm', language = 'en' } = req.body ?? {};
    if (!audioBase64 || typeof audioBase64 !== 'string') {
      return res.status(400).json({ error: 'Recorded audio payload is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Voice transcription is unavailable because GEMINI_API_KEY is not configured.',
      });
    }

    const langHint =
      language === 'hi'
        ? 'Hindi (or English)'
        : language === 'kn'
        ? 'Kannada (or English)'
        : 'English (or Indian agricultural terms)';

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: String(mimeType),
              data: audioBase64,
            },
          },
          {
            text: `Transcribe this farmer voice query cleanly into plain text without commentary or quotes. Primary expected language: ${langHint}.`,
          },
        ],
      },
    });

    const transcript = (response.text || '').trim();
    res.json({ transcript });
  } catch (error) {
    console.error('Audio transcription error:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    const status = typeof (error as { status?: number })?.status === 'number' ? (error as { status: number }).status : 500;
    res.status(status >= 400 && status < 600 ? status : 500).json({
      error: `Unable to transcribe audio: ${errMsg}`,
    });
  }
});

// AI Chatbot History & Message
app.get('/api/chatbot/history', optionalAuth, async (req: AuthRequest, res) => {
  try {
    await ensureSeeded();
    const sessionKey = String(req.query.sessionKey || 'default');
    const convs = req.dbUser
      ? await db
          .select()
          .from(chatConversations)
          .where(eq(chatConversations.userId, req.dbUser.id))
          .orderBy(desc(chatConversations.createdAt))
          .limit(1)
      : await db
          .select()
          .from(chatConversations)
          .where(eq(chatConversations.sessionKey, sessionKey))
          .orderBy(desc(chatConversations.createdAt))
          .limit(1);

    if (convs.length === 0) {
      return res.json({ messages: [] });
    }

    const msgs = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, convs[0].id))
      .orderBy(chatMessages.id);

    res.json({ messages: msgs });
  } catch (error) {
    console.error('Chatbot history error:', error);
    res.status(500).json({ error: 'Failed to load conversation history.' });
  }
});

app.post('/api/chatbot/message', optionalAuth, async (req: AuthRequest, res) => {
  try {
    await ensureSeeded();
    const { message, language = 'en', sessionKey = 'default' } = req.body ?? {};
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error:
          'AI Assistant service is temporarily unavailable because GEMINI_API_KEY is not configured in the server environment.',
      });
    }

    // Find or create conversation
    let conversationId: number;
    const existingConvs = req.dbUser
      ? await db
          .select()
          .from(chatConversations)
          .where(eq(chatConversations.userId, req.dbUser.id))
          .orderBy(desc(chatConversations.createdAt))
          .limit(1)
      : await db
          .select()
          .from(chatConversations)
          .where(eq(chatConversations.sessionKey, String(sessionKey)))
          .orderBy(desc(chatConversations.createdAt))
          .limit(1);

    if (existingConvs.length > 0) {
      conversationId = existingConvs[0].id;
    } else {
      const [createdConv] = await db
        .insert(chatConversations)
        .values({
          userId: req.dbUser?.id ?? null,
          sessionKey: String(sessionKey),
          title: 'Farmer Assistant Chat',
        })
        .returning();
      conversationId = createdConv.id;
    }

    // Load recent conversation history for context
    const recentMsgs = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(desc(chatMessages.id))
      .limit(8);

    // Save user message
    await db.insert(chatMessages).values({
      conversationId,
      role: 'user',
      content: message.trim(),
    });

    // Load complete website data from PostgreSQL (all schemes + all 92 agri guides + optional signed-in farmer profile)
    const [allSchemes, allAgri, profileRows] = await Promise.all([
      db.select().from(schemes),
      db.select().from(agricultureItems),
      req.dbUser
        ? db
            .select()
            .from(farmerProfiles)
            .where(eq(farmerProfiles.userId, req.dbUser.id))
            .limit(1)
        : Promise.resolve([]),
    ]);

    const userProfile = profileRows[0] ?? null;

    const websiteFeaturesContext = SITE_PAGES_CATALOG.map(
      (p) => `- ${p.title} [Route: ${p.path}] (${p.category}): ${p.description}`
    ).join('\n');

    const schemeContext = allSchemes
      .map((s) => {
        const rules = s.eligibilityRules;
        const ruleSummary = [
          rules.states?.length ? `States: ${rules.states.join(', ')}` : '',
          rules.farmerCategories?.length ? `Categories: ${rules.farmerCategories.join(', ')}` : '',
          rules.minLandAcres !== undefined ? `MinAcres: ${rules.minLandAcres}` : '',
          rules.maxLandAcres !== undefined ? `MaxAcres: ${rules.maxLandAcres}` : '',
          rules.notes?.length ? `Notes: ${rules.notes.join(' | ')}` : '',
        ]
          .filter(Boolean)
          .join('; ');
        return `- [Scheme Route: /schemes/${s.slug}] ${s.name} (Short: ${s.shortName}, Level: ${s.governmentLevel}, State: ${s.stateName}, Category: ${s.category}, Target Groups: ${s.targetCategories.join(', ')}, Verified: ${s.lastVerifiedDate})
  Overview: ${s.overview}
  Objectives: ${s.objectives.join('; ')}
  Benefits: ${s.benefits}
  Eligibility: ${s.eligibilitySummary} (${ruleSummary})
  Documents: ${s.requiredDocuments.join(', ')}
  Application Steps: ${s.applicationProcedure.join(' -> ')}
  Official Portal: ${s.officialUrl}`;
      })
      .join('\n');

    const agriCatalogIndex = allAgri
      .map((a) => `- [${a.section.toUpperCase()}] ${a.title} (${a.subtitle})`)
      .join('\n');

    const queryLower = `${message.trim()} ${recentMsgs.map((m) => m.content).join(' ')}`.toLowerCase();
    const queryWords = queryLower
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length >= 3);

    const scoredAgri = allAgri
      .map((a) => {
        const hay = `${a.section} ${a.title} ${a.subtitle} ${a.summary} ${Object.values(a.details || {}).join(' ')} ${(a.highlights || []).join(' ')}`.toLowerCase();
        let score = 0;
        for (const w of queryWords) {
          if (a.title.toLowerCase().includes(w)) score += 4;
          else if (a.section.toLowerCase().includes(w)) score += 3;
          else if (hay.includes(w)) score += 1;
        }
        return { item: a, score };
      })
      .sort((a, b) => b.score - a.score);

    const topMatched = scoredAgri.slice(0, 20).map((s) => s.item);

    const agriContext = `COMPLETE 92-ITEM AGRICULTURE CATALOG (Sections: crop, soil, animal, organic, inorganic, technology):
${agriCatalogIndex}

DETAILED RECORDS FOR MOST RELEVANT ITEMS:
${topMatched
  .map((a) => {
    const detailPairs = Object.entries(a.details || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join(' | ');
    return `- [${a.section.toUpperCase()} | Route: /agriculture/${a.section}] ${a.title} (${a.subtitle})
  Summary: ${a.summary}
  Details: ${detailPairs}
  Highlights: ${(a.highlights || []).join('; ')}`;
  })
  .join('\n')}`;

    const profileContext = userProfile
      ? `SIGNED-IN FARMER PROFILE:
Name: ${userProfile.fullName}, State: ${userProfile.state || 'Not set'}, District: ${userProfile.district || 'Not set'}, Village: ${userProfile.village || 'Not set'}, Category: ${userProfile.farmerCategory || 'Not set'}, Landholding Acres: ${userProfile.landHoldingAcres || 'Not set'}, Main Crop: ${userProfile.mainCrop || 'Not set'}, Irrigation: ${userProfile.irrigationAvailability || 'Not set'}, Farming Type: ${userProfile.farmingType || 'Not set'}`
      : 'USER STATUS: Guest visitor (not signed in; can still browse all schemes, agriculture modules, eligibility checker, and voice search).';

    const langLabel =
      language === 'hi' ? 'Hindi' : language === 'kn' ? 'Kannada' : 'English';

    const historyText = recentMsgs
      .reverse()
      .map((m) => `${m.role === 'user' ? 'Farmer' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const systemInstruction = `You are the official AI & Voice Assistant for the "KRISHI SANGRAH" educational agricultural platform.
You know EVERYTHING about the KRISHI SANGRAH website: every page, tool (Eligibility Checker, Real-Time Weather & Daily Activity Planner in Dashboard, Scheme Directory, AI Assistant, Multilingual switcher EN/HI/KN), all government schemes, and all 92 agricultural guides across Crops, Soil Information, Farm Animals, Organic Farming, Inorganic Farming, and Modern & Foreign Technologies.

Respond in ${langLabel} using warm, concise, clear farmer-friendly language.
STRICT GROUNDING RULES:
1. Rely ONLY on the KRISHI SANGRAH KNOWLEDGE BASE below for government scheme benefits, eligibility, documents, official portal links, platform features, and crop/soil/animal/tech specifications.
2. NEVER invent scheme amounts, deadlines, subsidy percentages, or portal URLs not present in the knowledge base.
3. If asked about something NOT covered by the KRISHI SANGRAH knowledge base, state clearly that it is not in KRISHI SANGRAH's verified records and direct the farmer to official portals (myscheme.gov.in, pmkisan.gov.in, pmfby.gov.in, agricoop.gov.in) or their nearest Krishi Vigyan Kendra / CSC.
4. When relevant, mention which KRISHI SANGRAH section or tool to visit and include 1 to 4 exact matching internal routes in the "links" array (using ONLY routes from the knowledge base such as "/", "/schemes", "/schemes/<slug>", "/eligibility", "/dashboard", "/agriculture/crop", "/agriculture/soil", "/agriculture/animal", "/agriculture/organic", "/agriculture/inorganic", "/agriculture/technology", "/agriculture/technology?focus=foreign", "/about", "/contact").
5. Always remind farmers when discussing eligibility that final eligibility is determined by the concerned government department.

${profileContext}

WEBSITE PAGES, TOOLS & NAVIGATION:
${websiteFeaturesContext}

VERIFIED SCHEMES KNOWLEDGE BASE (${allSchemes.length} schemes):
${schemeContext}

VERIFIED AGRICULTURE KNOWLEDGE BASE (${allAgri.length} items across 6 sections):
${agriContext}`;

    const promptContent = historyText
      ? `Previous conversation:\n${historyText}\n\nFarmer: ${message.trim()}`
      : `Farmer: ${message.trim()}`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        reply: {
          type: Type.STRING,
          description: 'Helpful, accurate farmer-friendly answer grounded in KRISHI SANGRAH website data.',
        },
        links: {
          type: Type.ARRAY,
          description: '1 to 4 relevant internal KRISHI SANGRAH website routes to help the user navigate directly.',
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              path: { type: Type.STRING },
              category: { type: Type.STRING },
            },
          },
        },
      },
      required: ['reply', 'links'],
    };

    const callModel = async (modelName: string, useLowThinking: boolean) =>
      ai.models.generateContent({
        model: modelName,
        contents: promptContent,
        config: {
          systemInstruction,
          ...(useLowThinking ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } } : {}),
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

    let response;
    try {
      response = await callModel('gemini-4-hydrogen', true);
    } catch (firstErr) {
      const msg = firstErr instanceof Error ? firstErr.message : String(firstErr);
      const status = (firstErr as { status?: number })?.status;
      if (status === 503 || msg.includes('503') || msg.includes('UNAVAILABLE')) {
        response = await callModel('gemini-3.1-flash-lite', false);
      } else {
        throw firstErr;
      }
    }

    const allowedPaths = new Set([
      '/',
      '/schemes',
      '/eligibility',
      '/dashboard',
      '/agri-map',
      '/chatbot',
      '/about',
      '/contact',
      '/login',
      '/register',
      '/agriculture/crop',
      '/agriculture/soil',
      '/agriculture/animal',
      '/agriculture/organic',
      '/agriculture/inorganic',
      '/agriculture/technology',
      '/agriculture/technology?focus=irrigation',
      '/agriculture/technology?focus=machinery',
      '/agriculture/technology?focus=foreign',
      ...allSchemes.map((s) => `/schemes/${s.slug}`),
    ]);

    let replyText = '';
    let navLinks: Array<{ label: string; path: string; category?: string }> = [];

    const rawText = response.text?.trim() || '';
    try {
      const parsed = JSON.parse(rawText) as {
        reply?: string;
        links?: Array<{ label?: string; path?: string; category?: string }>;
      };
      replyText = (parsed.reply || '').trim();
      if (Array.isArray(parsed.links)) {
        const seenPaths = new Set<string>();
        navLinks = parsed.links
          .filter(
            (l) =>
              l &&
              typeof l.label === 'string' &&
              typeof l.path === 'string' &&
              allowedPaths.has(l.path.trim()) &&
              !seenPaths.has(l.path.trim()) &&
              Boolean(seenPaths.add(l.path.trim()))
          )
          .slice(0, 4)
          .map((l) => ({
            label: l.label!.trim(),
            path: l.path!.trim(),
            category: l.category?.trim() || 'Website Link',
          }));
      }
    } catch {
      replyText = rawText;
    }

    if (!replyText) {
      replyText =
        'I could not generate a verified response right now. Please explore Government Schemes or try asking again.';
    }

    await db.insert(chatMessages).values({
      conversationId,
      role: 'assistant',
      content: replyText,
    });

    res.json({ reply: replyText, links: navLinks });
  } catch (error) {
    console.error('Chatbot message error:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    const status = typeof (error as { status?: number })?.status === 'number' ? (error as { status: number }).status : 500;
    if (status === 400 || status === 403 || errMsg.includes('API_KEY_INVALID') || errMsg.includes('PERMISSION_DENIED')) {
      return res.status(status === 403 ? 403 : 400).json({
        error: 'Gemini API key permission denied or invalid. Please check GEMINI_API_KEY in Settings > Secrets.',
      });
    }
    res.status(status >= 400 && status < 600 ? status : 500).json({
      error: `Unable to reach the Farmer Assistant: ${errMsg}`,
    });
  }
});

// Admin Protected Routes
app.get('/api/admin/overview', requireAuth, requireAdmin, async (_req, res) => {
  try {
    await ensureSeeded();
    const [farmerRows, schemeRows, agriRows, inquiryRows] = await Promise.all([
      db
        .select({
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          mobileNumber: users.mobileNumber,
          role: users.role,
          createdAt: users.createdAt,
          state: farmerProfiles.state,
          district: farmerProfiles.district,
          farmerCategory: farmerProfiles.farmerCategory,
          mainCrop: farmerProfiles.mainCrop,
        })
        .from(users)
        .leftJoin(farmerProfiles, eq(users.id, farmerProfiles.userId))
        .orderBy(desc(users.createdAt)),
      db.select().from(schemes).orderBy(schemes.id),
      db.select().from(agricultureItems).orderBy(agricultureItems.id),
      db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(25),
    ]);

    res.json({
      farmers: farmerRows,
      schemes: schemeRows,
      agricultureItems: agriRows,
      inquiries: inquiryRows,
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ error: 'Failed to load admin overview.' });
  }
});

app.post('/api/admin/schemes', requireAuth, requireAdmin, async (req, res) => {
  try {
    await ensureSeeded();
    const body = req.body ?? {};
    if (!body.name || !body.shortName || !body.governmentLevel || !body.category || !body.overview || !body.benefits || !body.officialUrl) {
      return res.status(400).json({ error: 'Missing required scheme fields.' });
    }
    const slug =
      body.slug ||
      String(body.shortName)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
        '-' +
        Date.now().toString().slice(-4);

    const govLevel = body.governmentLevel === 'State' ? 'State' : 'Central';
    const resolvedState =
      govLevel === 'Central' ? 'All India' : String(body.stateName || 'All India').trim();

    const [created] = await db
      .insert(schemes)
      .values({
        slug,
        name: String(body.name).trim(),
        shortName: String(body.shortName).trim(),
        governmentLevel: govLevel,
        stateName: resolvedState,
        category: String(body.category).trim(),
        targetCategories: Array.isArray(body.targetCategories) && body.targetCategories.length > 0
          ? body.targetCategories
          : ['Marginal (< 1 ha)', 'Small (1-2 ha)'],
        overview: String(body.overview).trim(),
        objectives: Array.isArray(body.objectives) ? body.objectives : [String(body.overview).trim()],
        benefits: String(body.benefits).trim(),
        eligibilitySummary: String(body.eligibilitySummary || 'Refer to official portal guidelines.').trim(),
        eligibilityRules: body.eligibilityRules || {
          states: [resolvedState],
          notes: ['Verify official department criteria before applying.'],
        },
        requiredDocuments: Array.isArray(body.requiredDocuments)
          ? body.requiredDocuments
          : ['Aadhaar Card', 'Land Record', 'Bank Passbook'],
        applicationProcedure: Array.isArray(body.applicationProcedure)
          ? body.applicationProcedure
          : ['Visit the official government portal and follow registration steps.'],
        officialUrl: String(body.officialUrl).trim(),
        logoUrl: body.logoUrl ? String(body.logoUrl).trim() : null,
        lastVerifiedDate: String(body.lastVerifiedDate || new Date().toISOString().slice(0, 10)),
        isPopular: Boolean(body.isPopular),
      })
      .returning();

    res.status(201).json({ scheme: created });
  } catch (error) {
    console.error('Admin create scheme error:', error);
    res.status(500).json({ error: 'Failed to create scheme.' });
  }
});

app.put('/api/admin/schemes/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await ensureSeeded();
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid scheme ID.' });
    const body = req.body ?? {};
    const [updated] = await db
      .update(schemes)
      .set({
        ...(body.name ? { name: String(body.name).trim() } : {}),
        ...(body.shortName ? { shortName: String(body.shortName).trim() } : {}),
        ...(body.governmentLevel ? { governmentLevel: String(body.governmentLevel) } : {}),
        ...(body.stateName ? { stateName: String(body.stateName).trim() } : {}),
        ...(body.category ? { category: String(body.category).trim() } : {}),
        ...(body.overview ? { overview: String(body.overview).trim() } : {}),
        ...(body.benefits ? { benefits: String(body.benefits).trim() } : {}),
        ...(body.eligibilitySummary ? { eligibilitySummary: String(body.eligibilitySummary).trim() } : {}),
        ...(body.officialUrl ? { officialUrl: String(body.officialUrl).trim() } : {}),
        ...(body.logoUrl !== undefined ? { logoUrl: body.logoUrl ? String(body.logoUrl).trim() : null } : {}),
        ...(body.lastVerifiedDate ? { lastVerifiedDate: String(body.lastVerifiedDate).trim() } : {}),
        ...(typeof body.isPopular === 'boolean' ? { isPopular: body.isPopular } : {}),
      })
      .where(eq(schemes.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: 'Scheme not found.' });
    res.json({ scheme: updated });
  } catch (error) {
    console.error('Admin update scheme error:', error);
    res.status(500).json({ error: 'Failed to update scheme.' });
  }
});

app.delete('/api/admin/schemes/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await ensureSeeded();
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid scheme ID.' });
    await db.delete(schemes).where(eq(schemes.id, id));
    res.json({ ok: true });
  } catch (error) {
    console.error('Admin delete scheme error:', error);
    res.status(500).json({ error: 'Failed to delete scheme.' });
  }
});

app.post('/api/admin/agriculture', requireAuth, requireAdmin, async (req, res) => {
  try {
    await ensureSeeded();
    const body = req.body ?? {};
    if (!body.section || !body.title || !body.summary) {
      return res.status(400).json({ error: 'Section, title, and summary are required.' });
    }
    const slug =
      String(body.title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now().toString().slice(-4);

    const [created] = await db
      .insert(agricultureItems)
      .values({
        slug,
        section: String(body.section),
        title: String(body.title).trim(),
        subtitle: String(body.subtitle || 'Agricultural Resource').trim(),
        imageUrl: body.imageUrl ? String(body.imageUrl).trim() : null,
        summary: String(body.summary).trim(),
        details: body.details && typeof body.details === 'object' ? body.details : { Guidance: String(body.summary).trim() },
        highlights: Array.isArray(body.highlights) ? body.highlights : [],
      })
      .returning();
    res.status(201).json({ item: created });
  } catch (error) {
    console.error('Admin create agri item error:', error);
    res.status(500).json({ error: 'Failed to create agriculture item.' });
  }
});

app.delete('/api/admin/agriculture/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await ensureSeeded();
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid ID.' });
    await db.delete(agricultureItems).where(eq(agricultureItems.id, id));
    res.json({ ok: true });
  } catch (error) {
    console.error('Admin delete agri item error:', error);
    res.status(500).json({ error: 'Failed to delete agriculture item.' });
  }
});

function resolveImagePackPath(): string | null {
  const candidates = [
    path.resolve(__dirname, 'src/assets/extra-images.pack'),
    path.resolve(__dirname, 'dist/src/assets/extra-images.pack'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

async function startServer() {
  const PORT = Number(process.env.PORT || 3000);
  const httpServer = http.createServer(app);

  // Restore any packed section images missing on disk after container/workspace rehydration
  try {
    const packPath = resolveImagePackPath();
    if (packPath) {
      const devImagesDir = path.resolve(__dirname, 'src/assets/images');
      const restoredDev = unpackMissingAssets(packPath, devImagesDir);
      if (restoredDev > 0) {
        console.log(`Restored ${restoredDev} packed agriculture images into src/assets/images`);
      }
      if (process.env.NODE_ENV === 'production') {
        const prodImagesDir = path.resolve(__dirname, 'dist/src/assets/images');
        const restoredProd = unpackMissingAssets(packPath, prodImagesDir);
        if (restoredProd > 0) {
          console.log(`Restored ${restoredProd} packed agriculture images into dist/src/assets/images`);
        }
      }
    }
  } catch (err) {
    console.warn('Image asset pack unpack skipped:', err);
  }

  // Serve agricultural & scheme images directly from disk or binary pack (never fall through to SPA HTML)
  app.get('/src/assets/images/*', (req, res) => {
    const rawRel = req.path.replace(/^\/src\/assets\/images\/+/, '');
    let decodedRel = rawRel;
    try {
      decodedRel = decodeURIComponent(rawRel);
    } catch {
      return res.status(400).end();
    }
    if (!decodedRel || decodedRel.includes('..') || decodedRel.includes('\0')) {
      return res.status(400).end();
    }

    const mimeType = getMimeTypeForAsset(decodedRel);
    const searchRoots = [
      path.resolve(__dirname, 'src/assets/images'),
      path.resolve(__dirname, 'dist/src/assets/images'),
    ];

    for (const rootDir of searchRoots) {
      const candidate = path.resolve(rootDir, decodedRel);
      if (
        (candidate === rootDir || candidate.startsWith(rootDir + path.sep)) &&
        fs.existsSync(candidate)
      ) {
        try {
          const stat = fs.statSync(candidate);
          if (stat.isFile() && stat.size > 0) {
            if (mimeType) res.type(mimeType);
            res.setHeader('Cache-Control', 'public, max-age=86400');
            return res.sendFile(candidate);
          }
        } catch {
          // continue to next source
        }
      }
    }

    const packPath = resolveImagePackPath();
    if (packPath) {
      const buf = readPackedAsset(packPath, decodedRel);
      if (buf && buf.length > 0) {
        if (mimeType) res.type(mimeType);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(buf);
      }
    }

    return res.status(404).end();
  });

  if (process.env.NODE_ENV !== 'production') {
    let viteInstance: ViteDevServer | null = null;
    const vitePromise = createViteServer({
      server: {
        middlewareMode: true,
        ws: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
      },
      appType: 'spa',
    }).then((vite) => {
      viteInstance = vite;
      return vite;
    });

    vitePromise.catch((err) => {
      console.error('Failed to initialize Vite dev server:', err);
    });

    app.use(async (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      try {
        const vite = viteInstance ?? (await vitePromise);
        vite.middlewares(req, res, next);
      } catch (err) {
        next(err);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build not found');
      }
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
