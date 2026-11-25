import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Search,
  LocateFixed,
  Navigation,
  ExternalLink,
  AlertTriangle,
  Building2,
  Sprout,
  Tractor,
  FlaskConical,
  Store,
  Stethoscope,
  CloudSun,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TranslatedText, useTranslatedTexts } from '../context/DynamicTranslationContext';
import {
  fetchWeather,
  getGoogleMapsApiKey,
  searchNearbyAgriPlaces,
} from '../services/api';
import { getNormalizedLang } from '../translations/i18n';
import { AgriServicesMap } from '../components/AgriServicesMap';
import type { AgriPlaceItem, WeatherReport } from '../types';

interface ServiceCategory {
  id: string;
  query: string;
  icon: React.FC<{ className?: string }>;
}

const AGRI_CATEGORIES: ServiceCategory[] = [
  {
    id: 'mandi',
    query: 'APMC market yard agricultural produce market',
    icon: Store,
  },
  {
    id: 'rsk',
    query: 'Raitha Samparka Kendra OR agriculture extension office',
    icon: Building2,
  },
  {
    id: 'kvk',
    query: 'Krishi Vigyan Kendra OR soil testing laboratory',
    icon: FlaskConical,
  },
  {
    id: 'seeds',
    query: 'agriculture seeds fertilizer agro center',
    icon: Sprout,
  },
  {
    id: 'machinery',
    query: 'tractor dealer agricultural machinery showroom',
    icon: Tractor,
  },
  {
    id: 'vet',
    query: 'veterinary hospital dairy cooperative milk center',
    icon: Stethoscope,
  },
];

const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 };

export const AgriMapPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = getNormalizedLang(i18n.language);
  const { profile } = useAuth();

  const initialLocation =
    profile?.district && profile?.state
      ? `${profile.district}, ${profile.state}, India`
      : profile?.state
      ? `${profile.state}, India`
      : 'Mandya, Karnataka, India';

  const [apiKey, setApiKey] = useState('');
  const [locationInput, setLocationInput] = useState(initialLocation);
  const [customQuery, setCustomQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>(AGRI_CATEGORIES[0]);
  const [radiusMeters, setRadiusMeters] = useState<number>(25000);

  const [center, setCenter] = useState<{ lat: number; lng: number }>(DEFAULT_CENTER);
  const [centerLabel, setCenterLabel] = useState<string>(initialLocation);
  const [weatherSummary, setWeatherSummary] = useState<WeatherReport | null>(null);
  const [places, setPlaces] = useState<AgriPlaceItem[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [locating, setLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    getGoogleMapsApiKey().then((k) => setApiKey(k)).catch(() => {});
  }, []);

  const runSearchForCenter = async (
    coords: { lat: number; lng: number },
    queryText: string,
    radius = radiusMeters,
    lang = currentLang
  ) => {
    setLoadingPlaces(true);
    setErrorMsg(null);
    setSelectedPlaceId(null);
    try {
      const results = await searchNearbyAgriPlaces({
        textQuery: queryText,
        lat: coords.lat,
        lng: coords.lng,
        radiusMeters: radius,
        languageCode: lang,
      });
      setPlaces(results);
      if (results.length > 0) {
        setSelectedPlaceId(results[0].id);
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : t('agriMap.placesError')
      );
      setPlaces([]);
    } finally {
      setLoadingPlaces(false);
    }
  };

  const resolveLocationAndSearch = async (
    params: { location?: string; lat?: number; lng?: number },
    queryText: string,
    radius = radiusMeters,
    lang = currentLang
  ) => {
    setLoadingPlaces(true);
    setErrorMsg(null);
    try {
      const weatherData = await fetchWeather({ ...params, lang });
      const nextCenter = { lat: weatherData.latitude, lng: weatherData.longitude };
      setCenter(nextCenter);
      setCenterLabel(weatherData.locationName);
      setWeatherSummary(weatherData);
      await runSearchForCenter(nextCenter, queryText, radius, lang);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t('agriMap.locationError'));
      setLoadingPlaces(false);
    }
  };

  const activeQueryString = customQuery.trim()
    ? customQuery.trim()
    : selectedCategory.query;

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      void resolveLocationAndSearch({ location: initialLocation }, AGRI_CATEGORIES[0].query, 25000, currentLang);
    } else {
      void resolveLocationAndSearch(
        { lat: center.lat, lng: center.lng },
        activeQueryString,
        radiusMeters,
        currentLang
      );
    }
    // Re-localize geocoded location, weather summary, and places when language changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLang]);

  const dynamicTexts = useMemo(() => {
    return [
      centerLabel,
      weatherSummary?.locationName,
      weatherSummary?.current.conditionText,
      ...places.flatMap((p) => [p.name, p.address, p.primaryType]),
    ];
  }, [centerLabel, weatherSummary, places]);

  const tr = useTranslatedTexts(dynamicTexts);

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationInput.trim()) return;
    void resolveLocationAndSearch({ location: locationInput.trim() }, activeQueryString, radiusMeters);
  };

  const handleCustomQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;
    void runSearchForCenter(center, customQuery.trim(), radiusMeters);
  };

  const handleCategoryClick = (cat: ServiceCategory) => {
    setSelectedCategory(cat);
    setCustomQuery('');
    void runSearchForCenter(center, cat.query, radiusMeters);
  };

  const handleRadiusChange = (nextRadius: number) => {
    setRadiusMeters(nextRadius);
    void runSearchForCenter(center, activeQueryString, nextRadius);
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setErrorMsg(t('agriMap.geoUnavailable'));
      return;
    }
    setLocating(true);
    setErrorMsg(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const coords = {
          lat: Number(pos.coords.latitude.toFixed(4)),
          lng: Number(pos.coords.longitude.toFixed(4)),
        };
        void resolveLocationAndSearch(coords, activeQueryString, radiusMeters);
      },
      () => {
        setLocating(false);
        setErrorMsg(t('agriMap.geoDenied'));
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const displayCenterLabel = tr(centerLabel);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 sm:py-8 space-y-5">
      {/* Header & Weather Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-[#E5E7EB] rounded-xl p-5 sm:p-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17613A]">
            {t('agriMap.title')}
          </h1>
          <p className="mt-1.5 text-sm text-[#303030]/85 max-w-2xl">
            {t('agriMap.subtitle')}
          </p>
        </div>

        {weatherSummary && (
          <div className="bg-[#F5F8F5] border border-[#E5E7EB] rounded-lg px-4 py-3 flex items-center gap-4 shrink-0">
            <CloudSun className="w-8 h-8 text-[#F47721] shrink-0" aria-hidden="true" />
            <div>
              <div className="text-xs font-semibold text-[#17613A] line-clamp-1 max-w-[220px]">
                {tr(weatherSummary.locationName)}
              </div>
              <div className="text-sm font-bold text-[#303030] tabular-nums">
                {weatherSummary.current.temperatureC !== null
                  ? `${Math.round(weatherSummary.current.temperatureC)}°C`
                  : '--'}{' '}
                · {tr(weatherSummary.current.conditionText)}
              </div>
              <div className="text-[11px] text-[#207747] tabular-nums">
                {t('agriMap.rainChance', { pct: weatherSummary.current.rainProbability })} ·{' '}
                {center.lat.toFixed(2)}°N, {center.lng.toFixed(2)}°E
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Location & Category Controls */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Location Lookup */}
          <form onSubmit={handleLocationSubmit} className="lg:col-span-6 flex flex-wrap sm:flex-nowrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <MapPin
                className="w-4 h-4 text-[#17613A]/60 absolute left-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder={t('agriMap.areaPlaceholder')}
                aria-label={t('agriMap.areaAria')}
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#E5E7EB] rounded focus:outline-none focus:border-[#17613A]"
              />
            </div>
            <button
              type="submit"
              disabled={loadingPlaces}
              className="px-4 py-2 bg-[#17613A] hover:bg-[#207747] disabled:opacity-60 text-white text-sm font-semibold rounded whitespace-nowrap"
            >
              {t('agriMap.setAreaBtn')}
            </button>
            <button
              type="button"
              onClick={handleUseGps}
              disabled={locating || loadingPlaces}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#F5F8F5] hover:bg-[#E6EFE9] border border-[#E5E7EB] text-[#17613A] text-sm font-semibold rounded whitespace-nowrap"
            >
              <LocateFixed className="w-4 h-4" aria-hidden="true" />
              <span>{locating ? t('agriMap.locating') : t('agriMap.useGps')}</span>
            </button>
          </form>

          {/* Keyword Search + Radius */}
          <form onSubmit={handleCustomQuerySubmit} className="lg:col-span-6 flex flex-wrap sm:flex-nowrap gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search
                className="w-4 h-4 text-[#303030]/50 absolute left-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder={t('agriMap.customSearchPlaceholder')}
                aria-label={t('agriMap.customSearchAria')}
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#E5E7EB] rounded focus:outline-none focus:border-[#17613A]"
              />
            </div>
            <select
              aria-label={t('agriMap.radiusAria')}
              value={radiusMeters}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="px-3 py-2 text-sm border border-[#E5E7EB] rounded bg-white text-[#303030]"
            >
              <option value={10000}>{t('agriMap.within10Km')}</option>
              <option value={25000}>{t('agriMap.within25Km')}</option>
              <option value={50000}>{t('agriMap.within50Km')}</option>
            </select>
            <button
              type="submit"
              disabled={loadingPlaces}
              className="px-4 py-2 bg-[#F47721] hover:bg-[#d96312] disabled:opacity-60 text-white text-sm font-semibold rounded whitespace-nowrap"
            >
              {t('agriMap.findBtn')}
            </button>
          </form>
        </div>

        {/* Service Category Filters */}
        <div className="flex flex-wrap gap-2 pt-1">
          {AGRI_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = !customQuery.trim() && selectedCategory.id === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded text-xs sm:text-sm font-semibold border transition-colors ${
                  active
                    ? 'bg-[#17613A] text-white border-[#17613A]'
                    : 'bg-[#F5F8F5] text-[#17613A] border-[#E5E7EB] hover:border-[#17613A]/50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{t(`agriMap.categories.${cat.id}`)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2.5 text-sm text-red-800">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            <TranslatedText text={errorMsg} />
          </span>
        </div>
      )}

      {/* Map + Results Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-xl p-3">
          <AgriServicesMap
            apiKey={apiKey}
            center={center}
            centerLabel={centerLabel}
            places={places}
            selectedPlaceId={selectedPlaceId}
            onSelectPlace={(p) => setSelectedPlaceId(p ? p.id : null)}
            heightClassName="h-[440px] sm:h-[540px]"
            zoom={12}
            language={currentLang}
          />
          <div className="mt-2.5 px-1 flex flex-wrap items-center justify-between gap-2 text-xs text-[#303030]/75">
            <span>
              {t('agriMap.centeredOn')}{' '}
              <strong className="text-[#17613A]">{displayCenterLabel}</strong>
            </span>
            <Link
              to="/eligibility"
              className="font-semibold text-[#17613A] hover:text-[#F47721] underline"
            >
              {t('agriMap.checkEligibilityLink')}
            </Link>
          </div>
        </div>

        {/* Places Results List */}
        <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
            <div>
              <h2 className="text-base font-bold text-[#17613A]">
                {customQuery.trim()
                  ? t('agriMap.resultsFor', { query: customQuery.trim() })
                  : t(`agriMap.categories.${selectedCategory.id}`)}
              </h2>
              <p className="text-xs text-[#303030]/70">
                {loadingPlaces
                  ? t('agriMap.searchingPlaces')
                  : t('agriMap.placesFound', {
                      count: places.length,
                      location: displayCenterLabel,
                    })}
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {loadingPlaces ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-24 bg-[#F5F8F5] border border-[#E5E7EB] rounded-lg animate-pulse"
                />
              ))
            ) : places.length === 0 ? (
              <div className="p-6 text-center bg-[#F5F8F5] rounded-lg border border-[#E5E7EB]">
                <p className="text-sm font-semibold text-[#17613A]">
                  {t('agriMap.noPlacesTitle')}
                </p>
                <p className="mt-1 text-xs text-[#303030]/80">
                  {t('agriMap.noPlacesHint')}
                </p>
              </div>
            ) : (
              places.map((place, index) => {
                const selected = selectedPlaceId === place.id;
                return (
                  <div
                    key={place.id}
                    onClick={() => setSelectedPlaceId(place.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedPlaceId(place.id);
                      }
                    }}
                    className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                      selected
                        ? 'bg-[#F5F8F5] border-[#F47721] ring-1 ring-[#F47721]/40'
                        : 'bg-white border-[#E5E7EB] hover:border-[#207747]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#F47721]">
                          #{index + 1} ·{' '}
                          {place.primaryType
                            ? tr(place.primaryType)
                            : t('agriMap.defaultType')}
                        </div>
                        <h3 className="text-sm font-bold text-[#17613A] mt-0.5 leading-snug">
                          {tr(place.name)}
                        </h3>
                      </div>
                      {place.businessStatus === 'OPERATIONAL' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-[#E6EFE9] text-[#17613A] rounded shrink-0">
                          {t('agriMap.openListing')}
                        </span>
                      )}
                    </div>

                    <p className="mt-1.5 text-xs text-[#303030]/80 leading-relaxed">
                      {tr(place.address)}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {place.directionsUri && (
                        <a
                          href={place.directionsUri}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#17613A] hover:bg-[#207747] text-white text-xs font-semibold rounded"
                        >
                          <Navigation className="w-3 h-3" aria-hidden="true" />
                          <span>{t('agriMap.getDirections')}</span>
                        </a>
                      )}
                      {place.googleMapsUri && (
                        <a
                          href={place.googleMapsUri}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2.5 py-1 border border-[#E5E7EB] bg-white hover:bg-[#F5F8F5] text-[#17613A] text-xs font-semibold rounded"
                        >
                          <ExternalLink className="w-3 h-3" aria-hidden="true" />
                          <span>{t('agriMap.googleMaps')}</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
