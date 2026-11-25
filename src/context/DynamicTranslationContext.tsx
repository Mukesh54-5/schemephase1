import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { translateBatchTexts } from '../services/api';

export type SupportedPortalLang = 'en' | 'hi' | 'kn';

export function normalizePortalLang(raw?: string | null): SupportedPortalLang {
  const base = (raw || 'en').split('-')[0].toLowerCase();
  if (base === 'hi' || base === 'kn') return base;
  return 'en';
}

const STORAGE_PREFIX = 'ks_dyn_tr_';

function loadStoredTranslations(lang: 'hi' | 'kn'): Record<string, string> {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${lang}`);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function saveStoredTranslations(lang: 'hi' | 'kn', map: Record<string, string>) {
  try {
    const entries = Object.entries(map);
    const trimmed =
      entries.length > 2500 ? Object.fromEntries(entries.slice(entries.length - 2500)) : map;
    localStorage.setItem(`${STORAGE_PREFIX}${lang}`, JSON.stringify(trimmed));
  } catch {
    // Ignore storage quota errors
  }
}

interface DynamicTranslationContextValue {
  lang: SupportedPortalLang;
  tr: (text?: string | null) => string;
  requestTranslation: (texts: Array<string | null | undefined>) => void;
}

const DynamicTranslationContext = createContext<DynamicTranslationContextValue>({
  lang: 'en',
  tr: (text) => text || '',
  requestTranslation: () => {},
});

export const DynamicTranslationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { i18n } = useTranslation();
  const lang = normalizePortalLang(i18n.language);

  const [cacheByLang, setCacheByLang] = useState<{
    hi: Record<string, string>;
    kn: Record<string, string>;
  }>(() => ({
    hi: loadStoredTranslations('hi'),
    kn: loadStoredTranslations('kn'),
  }));

  const cacheRef = useRef(cacheByLang);
  cacheRef.current = cacheByLang;

  const pendingRef = useRef<Record<'hi' | 'kn', Set<string>>>({
    hi: new Set(),
    kn: new Set(),
  });
  const inFlightRef = useRef<Record<'hi' | 'kn', Set<string>>>({
    hi: new Set(),
    kn: new Set(),
  });
  const failedRef = useRef<Record<'hi' | 'kn', Set<string>>>({
    hi: new Set(),
    kn: new Set(),
  });
  const flushTimersRef = useRef<Record<'hi' | 'kn', number | null>>({
    hi: null,
    kn: null,
  });
  const activeWorkersRef = useRef<Record<'hi' | 'kn', number>>({
    hi: 0,
    kn: 0,
  });

  const processQueue = useCallback(async (targetLang: 'hi' | 'kn') => {
    if (activeWorkersRef.current[targetLang] >= 2) return;
    const pendingSet = pendingRef.current[targetLang];
    if (pendingSet.size === 0) return;

    const batch: string[] = [];
    for (const item of pendingSet) {
      batch.push(item);
      pendingSet.delete(item);
      inFlightRef.current[targetLang].add(item);
      if (batch.length >= 40) break;
    }

    if (batch.length === 0) return;

    activeWorkersRef.current[targetLang] += 1;
    try {
      const result = await translateBatchTexts(targetLang, batch);
      const entries = Object.entries(result);
      if (entries.length > 0) {
        setCacheByLang((prev) => {
          const nextLangMap = { ...prev[targetLang], ...result };
          saveStoredTranslations(targetLang, nextLangMap);
          return { ...prev, [targetLang]: nextLangMap };
        });
      }
      for (const s of batch) {
        if (!(s in result)) {
          failedRef.current[targetLang].add(s);
        }
      }
    } catch {
      for (const s of batch) {
        failedRef.current[targetLang].add(s);
      }
    } finally {
      for (const s of batch) {
        inFlightRef.current[targetLang].delete(s);
      }
      activeWorkersRef.current[targetLang] = Math.max(
        0,
        activeWorkersRef.current[targetLang] - 1
      );
      if (pendingRef.current[targetLang].size > 0) {
        void processQueue(targetLang);
      }
    }
  }, []);

  const requestTranslation = useCallback(
    (texts: Array<string | null | undefined>) => {
      if (lang === 'en') return;
      const targetLang = lang;
      const currentCache = cacheRef.current[targetLang];
      let added = false;

      for (const raw of texts) {
        if (typeof raw !== 'string') continue;
        const clean = raw.trim();
        if (!clean || /^[\d\s.,:%/°+-]+$/.test(clean)) continue;
        if (
          Object.prototype.hasOwnProperty.call(currentCache, raw) ||
          inFlightRef.current[targetLang].has(raw) ||
          failedRef.current[targetLang].has(raw) ||
          pendingRef.current[targetLang].has(raw)
        ) {
          continue;
        }
        pendingRef.current[targetLang].add(raw);
        added = true;
      }

      if (added && flushTimersRef.current[targetLang] === null) {
        flushTimersRef.current[targetLang] = window.setTimeout(() => {
          flushTimersRef.current[targetLang] = null;
          void processQueue(targetLang);
          if (pendingRef.current[targetLang].size > 0) {
            void processQueue(targetLang);
          }
        }, 60);
      }
    },
    [lang, processQueue]
  );

  useEffect(() => {
    return () => {
      if (flushTimersRef.current.hi !== null) {
        window.clearTimeout(flushTimersRef.current.hi);
      }
      if (flushTimersRef.current.kn !== null) {
        window.clearTimeout(flushTimersRef.current.kn);
      }
    };
  }, []);

  const tr = useCallback(
    (text?: string | null): string => {
      if (!text) return '';
      if (lang === 'en') return text;
      return cacheByLang[lang][text] || text;
    },
    [lang, cacheByLang]
  );

  const value = useMemo(
    () => ({ lang, tr, requestTranslation }),
    [lang, tr, requestTranslation]
  );

  return (
    <DynamicTranslationContext.Provider value={value}>
      {children}
    </DynamicTranslationContext.Provider>
  );
};

export function useDynamicTranslation() {
  return useContext(DynamicTranslationContext);
}

export function useTranslatedText(text?: string | null): string {
  const { lang, tr, requestTranslation } = useDynamicTranslation();

  useEffect(() => {
    if (lang !== 'en' && text) {
      requestTranslation([text]);
    }
  }, [lang, text, requestTranslation]);

  return tr(text);
}

export function useTranslatedTexts(texts: Array<string | null | undefined>) {
  const { lang, tr, requestTranslation } = useDynamicTranslation();
  const signature = texts.filter(Boolean).join('\u0001');

  useEffect(() => {
    if (lang !== 'en' && texts.length > 0) {
      requestTranslation(texts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, signature, requestTranslation]);

  return tr;
}

export function useObserveTranslate(
  ref: React.RefObject<HTMLElement | null>,
  texts: Array<string | null | undefined>
) {
  const { lang, tr, requestTranslation } = useDynamicTranslation();
  const signature = texts.filter(Boolean).join('\u0001');

  useEffect(() => {
    if (lang === 'en' || texts.length === 0) return;

    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      requestTranslation(texts);
      return;
    }

    let triggered = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (triggered) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            triggered = true;
            requestTranslation(texts);
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin: '400px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, signature, requestTranslation]);

  return tr;
}

export const TranslatedText: React.FC<{ text?: string | null }> = ({ text }) => {
  const translated = useTranslatedText(text);
  return <>{translated}</>;
};
