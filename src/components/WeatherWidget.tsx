import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CloudRain,
  CloudSun,
  Compass,
  Droplets,
  LocateFixed,
  MapPin,
  RefreshCw,
  Search,
  Sun,
  Thermometer,
  Wind,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { fetchWeather, getGoogleMapsApiKey } from '../services/api';
import { useTranslatedTexts } from '../context/DynamicTranslationContext';
import { getNormalizedLang } from '../translations/i18n';
import { AgriServicesMap } from './AgriServicesMap';
import type { WeatherReport } from '../types';

interface WeatherWidgetProps {
  defaultLocation: string;
}

const WeatherIcon: React.FC<{
  iconUri?: string | null;
  conditionText: string;
  className?: string;
}> = ({ iconUri, conditionText, className = 'w-10 h-10' }) => {
  const [failed, setFailed] = useState(false);

  if (iconUri && !failed) {
    return (
      <img
        src={iconUri}
        alt={conditionText}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={className}
      />
    );
  }

  const lower = conditionText.toLowerCase();
  if (lower.includes('rain') || lower.includes('storm') || lower.includes('drizzle') || lower.includes('shower')) {
    return <CloudRain className={`${className} text-[#17613A]`} aria-hidden="true" />;
  }
  if (lower.includes('sun') || lower.includes('clear')) {
    return <Sun className={`${className} text-[#F47721]`} aria-hidden="true" />;
  }
  return <CloudSun className={`${className} text-[#207747]`} aria-hidden="true" />;
};

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  defaultLocation,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = getNormalizedLang(i18n.language);
  const [queryInput, setQueryInput] = useState(defaultLocation);
  const [report, setReport] = useState<WeatherReport | null>(null);
  const [mapsApiKey, setMapsApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const lastQueryRef = useRef<{ location?: string; lat?: number; lng?: number }>({
    location: defaultLocation,
  });

  useEffect(() => {
    getGoogleMapsApiKey().then((key) => setMapsApiKey(key)).catch(() => {});
  }, []);

  const loadWeather = useCallback(
    async (params: { location?: string; lat?: number; lng?: number }, langOverride?: string) => {
      setLoading(true);
      setErrorMsg(null);
      lastQueryRef.current = params;
      try {
        const data = await fetchWeather({
          ...params,
          lang: langOverride || currentLang,
        });
        setReport(data);
      } catch (err) {
        setErrorMsg(
          err instanceof Error ? err.message : t('weather.fetchError')
        );
      } finally {
        setLoading(false);
      }
    },
    [currentLang, t]
  );

  useEffect(() => {
    setQueryInput(defaultLocation);
    void loadWeather({ location: defaultLocation }, currentLang);
  }, [defaultLocation, currentLang, loadWeather]);

  const weatherDynamicTexts = useMemo(() => {
    if (!report) return [];
    return [
      report.locationName,
      report.current.conditionText,
      report.current.windDirection,
      ...report.daily.map((d) => d.conditionText),
    ];
  }, [report]);

  const tr = useTranslatedTexts(weatherDynamicTexts);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    void loadWeather({ location: queryInput.trim() });
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setErrorMsg(t('weather.geoUnavailable'));
      return;
    }
    setLocating(true);
    setErrorMsg(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        void loadWeather({
          lat: Number(pos.coords.latitude.toFixed(4)),
          lng: Number(pos.coords.longitude.toFixed(4)),
        });
      },
      () => {
        setLocating(false);
        setErrorMsg(t('weather.geoDenied'));
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const statusStyle = (status: 'Optimal' | 'Caution' | 'Avoid') => {
    if (status === 'Optimal') {
      return 'bg-[#F5F8F5] text-[#17613A] border-[#17613A]/25';
    }
    if (status === 'Caution') {
      return 'bg-amber-50 text-amber-900 border-amber-300';
    }
    return 'bg-red-50 text-red-800 border-red-200';
  };

  return (
    <section
      aria-label={t('weather.regionAria')}
      className="bg-white border border-[#E5E7EB] rounded-xl p-6"
    >
      {/* Header & Location Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E5E7EB]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#F47721]">
            {t('weather.badge')}
          </span>
          <h2 className="mt-0.5 text-lg sm:text-xl font-extrabold text-[#17613A]">
            {t('weather.title')}
          </h2>
          {report && (
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-[#303030]/80">
              <MapPin className="w-3.5 h-3.5 text-[#207747] shrink-0" aria-hidden="true" />
              <span>{tr(report.locationName)}</span>
            </p>
          )}
        </div>

        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search
              className="w-4 h-4 text-[#303030]/50 absolute left-2.5 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder={t('weather.searchPlaceholder')}
              aria-label={t('weather.searchAria')}
              className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm border border-[#E5E7EB] rounded focus:outline-none focus:border-[#17613A]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-3.5 py-2 bg-[#17613A] hover:bg-[#207747] disabled:opacity-60 text-white text-xs sm:text-sm font-semibold rounded whitespace-nowrap"
          >
            {t('weather.checkBtn')}
          </button>
          <button
            type="button"
            onClick={handleUseGps}
            disabled={loading || locating}
            title={t('weather.gpsTitle')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#F5F8F5] hover:bg-[#E6EFE9] border border-[#E5E7EB] text-[#17613A] text-xs font-semibold rounded whitespace-nowrap"
          >
            <LocateFixed className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{locating ? t('weather.locating') : t('weather.useGps')}</span>
          </button>
          <button
            type="button"
            onClick={() => void loadWeather(lastQueryRef.current)}
            disabled={loading}
            aria-label={t('weather.refreshAria')}
            className="p-2 border border-[#E5E7EB] rounded hover:bg-[#F5F8F5] text-[#303030]"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? 'animate-spin text-[#17613A]' : ''}`}
              aria-hidden="true"
            />
          </button>
        </form>
      </div>

      {/* Loading State */}
      {loading && !report && (
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-[#F5F8F5] rounded animate-pulse md:col-span-1" />
          <div className="h-32 bg-[#F5F8F5] rounded animate-pulse md:col-span-2" />
        </div>
      )}

      {/* Error State */}
      {errorMsg && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 text-xs sm:text-sm text-red-800">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => void loadWeather(lastQueryRef.current)}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-red-300 text-red-800 rounded hover:bg-red-100 self-start sm:self-center shrink-0"
          >
            {t('weather.retry')}
          </button>
        </div>
      )}

      {/* Loaded Weather Dashboard */}
      {report && (
        <div className="mt-5 space-y-6">
          {/* Current Weather Metrics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-5 bg-[#F5F8F5] border border-[#E5E7EB] rounded-lg p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <WeatherIcon
                  iconUri={report.current.iconUri}
                  conditionText={report.current.conditionText}
                  className="w-12 h-12 shrink-0"
                />
                <div>
                  <div className="text-3xl font-extrabold text-[#17613A] tabular-nums">
                    {report.current.temperatureC !== null
                      ? `${Math.round(report.current.temperatureC)}°C`
                      : '--'}
                  </div>
                  <div className="text-sm font-semibold text-[#303030]">
                    {tr(report.current.conditionText)}
                  </div>
                  {report.current.feelsLikeC !== null && (
                    <div className="text-xs text-[#303030]/75 tabular-nums">
                      {t('weather.feelsLike', { temp: Math.round(report.current.feelsLikeC) })}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right text-xs text-[#303030]/75 tabular-nums">
                <div>{t('weather.rainChance')}</div>
                <div className="text-lg font-bold text-[#17613A]">
                  {report.current.rainProbability}%
                </div>
                <div>{report.current.precipitationMm.toFixed(1)} mm</div>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="border border-[#E5E7EB] rounded-lg p-4 min-h-[116px] flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-xs text-[#303030]/70">
                  <Droplets className="w-3.5 h-3.5 text-[#207747]" aria-hidden="true" />
                  <span>{t('weather.humidity')}</span>
                </div>
                <div>
                  <div className="text-xl font-bold text-[#17613A] tabular-nums">
                    {report.current.humidity !== null ? `${report.current.humidity}%` : '--'}
                  </div>
                  <div className="text-[11px] text-[#303030]/70">{t('weather.relative')}</div>
                </div>
              </div>

              <div className="border border-[#E5E7EB] rounded-lg p-4 min-h-[116px] flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-xs text-[#303030]/70">
                  <Wind className="w-3.5 h-3.5 text-[#207747]" aria-hidden="true" />
                  <span>{t('weather.wind')}</span>
                </div>
                <div>
                  <div className="text-xl font-bold text-[#17613A] tabular-nums">
                    {report.current.windSpeedKmh !== null
                      ? `${Math.round(report.current.windSpeedKmh)} km/h`
                      : '--'}
                  </div>
                  <div className="text-[11px] text-[#303030]/70 truncate">
                    {tr(report.current.windDirection)}
                  </div>
                </div>
              </div>

              <div className="border border-[#E5E7EB] rounded-lg p-4 min-h-[116px] flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-xs text-[#303030]/70">
                  <Sun className="w-3.5 h-3.5 text-[#F47721]" aria-hidden="true" />
                  <span>{t('weather.uvIndex')}</span>
                </div>
                <div>
                  <div className="text-xl font-bold text-[#17613A] tabular-nums">
                    {report.current.uvIndex !== null ? report.current.uvIndex : '--'}
                  </div>
                  <div className="text-[11px] text-[#303030]/70 tabular-nums">
                    {t('weather.cloudPct', { pct: report.current.cloudCover ?? '--' })}
                  </div>
                </div>
              </div>

              <div className="border border-[#E5E7EB] rounded-lg p-4 min-h-[116px] flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-xs text-[#303030]/70">
                  <Compass className="w-3.5 h-3.5 text-[#207747]" aria-hidden="true" />
                  <span>{t('weather.stormRisk')}</span>
                </div>
                <div>
                  <div className="text-xl font-bold text-[#17613A] tabular-nums">
                    {report.current.thunderstormProbability}%
                  </div>
                  <div className="text-[11px] text-[#303030]/70">{t('weather.thunderstorm')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Activity Farm Advisories */}
          <div>
            <h3 className="text-sm font-bold text-[#17613A] mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#207747]" aria-hidden="true" />
              <span>{t('weather.advisoriesHeading')}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {report.advisories.map((adv) => (
                <div
                  key={adv.activity}
                  className={`border rounded-lg p-4 sm:p-5 flex flex-col justify-between gap-2 ${statusStyle(adv.status)}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wide">
                      {adv.activity}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 border border-current/25 rounded bg-white/70">
                      {t(`weather.statuses.${adv.status}`, { defaultValue: adv.status })}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">
                    {adv.guidance}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Hourly & 5-Day Forecast */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Next Hours */}
            <div className="lg:col-span-6 border border-[#E5E7EB] rounded-lg p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#17613A] mb-3.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#F47721]" aria-hidden="true" />
                <span>{t('weather.nextHoursHeading')}</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {report.hourly.slice(0, 8).map((hr, idx) => (
                  <div
                    key={`${hr.timeLabel}-${idx}`}
                    className="bg-[#F5F8F5] border border-[#E5E7EB] rounded-lg p-3 min-h-[112px] flex flex-col items-center justify-between text-center"
                  >
                    <div className="text-[11px] font-semibold text-[#303030]/80 tabular-nums">
                      {hr.timeLabel}
                    </div>
                    <div className="my-1 flex justify-center">
                      <WeatherIcon
                        iconUri={hr.iconUri}
                        conditionText={hr.conditionText}
                        className="w-6 h-6"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#17613A] tabular-nums">
                        {hr.temperatureC !== null ? `${Math.round(hr.temperatureC)}°` : '--'}
                      </div>
                      <div className="text-[10px] text-[#207747] font-medium tabular-nums">
                        {t('weather.rainPctLabel', { pct: hr.rainProbability })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5-Day Outlook */}
            <div className="lg:col-span-6 border border-[#E5E7EB] rounded-lg p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#17613A] mb-3 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-[#F47721]" aria-hidden="true" />
                <span>{t('weather.fiveDayHeading')}</span>
              </h3>
              <div className="divide-y divide-[#E5E7EB]">
                {report.daily.map((d) => (
                  <div
                    key={d.dateLabel}
                    className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs sm:text-sm"
                  >
                    <div className="w-24 shrink-0">
                      <span className="font-bold text-[#17613A]">{d.dayName}</span>{' '}
                      <span className="text-xs text-[#303030]/70">{d.dateLabel}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <WeatherIcon
                        iconUri={d.iconUri}
                        conditionText={d.conditionText}
                        className="w-5 h-5 shrink-0"
                      />
                      <span className="text-xs text-[#303030] truncate">{tr(d.conditionText)}</span>
                    </div>
                    <div className="text-xs text-[#207747] font-medium tabular-nums shrink-0">
                      {t('weather.rainPctLabel', { pct: d.rainProbability })}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-[#17613A] tabular-nums shrink-0 w-16 text-right">
                      {d.maxTempC !== null ? `${Math.round(d.maxTempC)}°` : '--'} /{' '}
                      <span className="font-normal text-[#303030]/75">
                        {d.minTempC !== null ? `${Math.round(d.minTempC)}°` : '--'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Farm Coordinates Map */}
          <div className="border border-[#E5E7EB] rounded-lg p-4 bg-[#F5F8F5]/60">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#17613A] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#F47721]" aria-hidden="true" />
                  <span>{t('weather.farmLocationMap')}</span>
                </h3>
                <p className="text-xs text-[#303030]/75 tabular-nums">
                  {tr(report.locationName)} ({report.latitude.toFixed(4)}°N, {report.longitude.toFixed(4)}°E)
                </p>
              </div>
              <Link
                to="/agri-map"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#17613A] hover:bg-[#207747] text-white text-xs font-semibold rounded transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t('weather.findNearbyMandis')}</span>
              </Link>
            </div>
            <AgriServicesMap
              apiKey={mapsApiKey}
              center={{ lat: report.latitude, lng: report.longitude }}
              centerLabel={tr(report.locationName)}
              heightClassName="h-[240px]"
              zoom={11}
              language={currentLang}
            />
          </div>
        </div>
      )}
    </section>
  );
};
