import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Filter } from 'lucide-react';
import { SchemeCard } from '../components/SchemeCard';
import { TranslatedText } from '../context/DynamicTranslationContext';
import { fetchSchemes } from '../services/api';
import { tEnum } from '../translations/i18n';
import { INDIAN_STATES, type Scheme } from '../types';

const SCHEME_CATEGORIES = [
  'Income Support',
  'Crop Insurance',
  'Agricultural Credit',
  'Soil Management',
  'Solar & Irrigation',
  'Irrigation',
  'Farm Mechanization',
  'Organic & Natural Farming',
  'Crop Diversification',
  'Horticulture & Inputs',
  'Crop Relief & Inputs',
];

const FARMER_CATEGORIES = [
  'Marginal (< 1 ha)',
  'Small (1-2 ha)',
  'Semi-Medium (2-4 ha)',
  'Medium (4-10 ha)',
  'Landless / Tenant',
];

export const SchemesPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [level, setLevel] = useState(searchParams.get('level') || 'All');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [stateFilter, setStateFilter] = useState(searchParams.get('state') || 'All');
  const [farmerCategory, setFarmerCategory] = useState(searchParams.get('farmerCategory') || 'All');
  const [sort, setSort] = useState(searchParams.get('sort') || 'popular');

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const paramLevel = searchParams.get('level');
    setLevel(paramLevel || 'All');
    const paramSearch = searchParams.get('search');
    if (paramSearch !== null) setSearch(paramSearch);
    const paramState = searchParams.get('state');
    if (paramState !== null) setStateFilter(paramState);
    if (searchParams.get('focus') === 'search') {
      searchInputRef.current?.focus();
    }
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchSchemes({
      search,
      level,
      category,
      state: stateFilter,
      farmerCategory,
      sort,
    })
      .then((rows) => {
        if (active) setSchemes(rows);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : t('schemes.loadError'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [search, level, category, stateFilter, farmerCategory, sort, t]);

  const handleStateChange = (nextState: string) => {
    setStateFilter(nextState);
    if (nextState !== 'All' && nextState !== 'All India' && level === 'Central') {
      setLevel('All');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setLevel('All');
    setCategory('All');
    setStateFilter('All');
    setFarmerCategory('All');
    setSort('popular');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 sm:py-8">
      <div className="mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17613A]">
            {t('schemes.title')}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#303030]/85 max-w-3xl">
            {t('schemes.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0" role="group" aria-label={t('schemes.filterGroupAria')}>
          {[
            { value: 'All', label: t('schemes.tabAll') },
            { value: 'Central', label: t('schemes.tabCentral') },
            { value: 'State', label: t('schemes.tabState') },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setLevel(tab.value);
                if (tab.value === 'Central') {
                  setStateFilter('All');
                }
              }}
              className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded border transition-colors ${
                level === tab.value
                  ? 'bg-[#17613A] text-white border-[#17613A]'
                  : 'bg-white text-[#303030] border-[#E5E7EB] hover:border-[#17613A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 sm:p-6 mb-8">
        <div className="flex items-center gap-2 text-sm font-bold text-[#17613A] mb-4">
          <Filter className="w-4 h-4" aria-hidden="true" />
          <span>{t('schemes.filterHeading')}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
          <div className="relative lg:col-span-2">
            <Search
              className="w-4 h-4 text-[#303030]/50 absolute left-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('schemes.searchPlaceholder')}
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#17613A]"
            />
          </div>

          <select
            aria-label={t('schemes.govLevelAria')}
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="px-3 py-2 text-sm border border-[#E5E7EB] rounded bg-white focus:outline-none focus:border-[#17613A]"
          >
            <option value="All">{t('schemes.allGovernments')}</option>
            <option value="Central">{t('schemes.centralGovOption')}</option>
            <option value="State">{t('schemes.stateGovOption')}</option>
          </select>

          <select
            aria-label={t('schemes.categoryAria')}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 text-sm border border-[#E5E7EB] rounded bg-white focus:outline-none focus:border-[#17613A]"
          >
            <option value="All">{t('schemes.allCategories')}</option>
            {SCHEME_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {tEnum(t, 'schemeCategories', cat)}
              </option>
            ))}
          </select>

          <select
            aria-label={t('schemes.stateAria')}
            value={stateFilter}
            onChange={(e) => handleStateChange(e.target.value)}
            className="px-3 py-2 text-sm border border-[#E5E7EB] rounded bg-white focus:outline-none focus:border-[#17613A]"
          >
            <option value="All">{t('schemes.allStates')}</option>
            <option value="All India">{t('schemes.allIndiaCentral')}</option>
            {INDIAN_STATES.map((st) => (
              <option key={st} value={st}>
                {tEnum(t, 'states', st)}
              </option>
            ))}
          </select>

          <select
            aria-label={t('schemes.farmerCategoryAria')}
            value={farmerCategory}
            onChange={(e) => setFarmerCategory(e.target.value)}
            className="px-3 py-2 text-sm border border-[#E5E7EB] rounded bg-white focus:outline-none focus:border-[#17613A]"
          >
            <option value="All">{t('schemes.allFarmerCategories')}</option>
            {FARMER_CATEGORIES.map((fc) => (
              <option key={fc} value={fc}>
                {tEnum(t, 'farmerCategories', fc)}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 pt-3 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-[#303030]/80 tabular-nums">
            {t('schemes.showingCount', { count: schemes.length })}
          </span>

          <div className="flex items-center gap-3">
            <select
              aria-label={t('schemes.sortAria')}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-1.5 text-xs border border-[#E5E7EB] rounded bg-white"
            >
              <option value="popular">{t('schemes.sortPopular')}</option>
              <option value="name_asc">{t('schemes.sortNameAsc')}</option>
              <option value="name_desc">{t('schemes.sortNameDesc')}</option>
            </select>

            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-semibold text-[#F47721] hover:underline"
            >
              {t('schemes.resetFilters')}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6 text-sm">
          <TranslatedText text={error} />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="min-h-[320px] bg-white border border-[#E5E7EB] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : schemes.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-10 text-center">
          <p className="text-base font-semibold text-[#17613A]">
            {t('schemes.emptyMessage')}
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 px-5 py-2.5 bg-[#17613A] text-white text-sm font-semibold rounded-lg"
          >
            {t('schemes.showAllBtn')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes.map((scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))}
        </div>
      )}
    </div>
  );
};
