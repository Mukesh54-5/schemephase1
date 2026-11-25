import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TranslatedText, useTranslatedTexts } from '../context/DynamicTranslationContext';
import { checkEligibility, fetchSchemes } from '../services/api';
import { getNormalizedLang, tEnum } from '../translations/i18n';
import { INDIAN_STATES, type EligibilityResult, type Scheme } from '../types';

const FARMER_CATEGORIES = [
  'Marginal (< 1 ha)',
  'Small (1-2 ha)',
  'Semi-Medium (2-4 ha)',
  'Medium (4-10 ha)',
  'Large (> 10 ha)',
  'Landless / Tenant',
];

const FARMING_TYPES = [
  'Traditional / Rainfed',
  'Irrigated',
  'Organic',
  'Mixed (Organic & Modern)',
];

export const EligibilityPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = getNormalizedLang(i18n.language);
  const [searchParams] = useSearchParams();
  const { profile, token } = useAuth();

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(
    searchParams.get('schemeId') || 'all'
  );
  const [state, setState] = useState(profile?.state || 'Karnataka');
  const [farmerCategory, setFarmerCategory] = useState(
    profile?.farmerCategory || 'Small (1-2 ha)'
  );
  const [landHoldingAcres, setLandHoldingAcres] = useState(
    profile?.landHoldingAcres || '2.5'
  );
  const [mainCrop, setMainCrop] = useState(profile?.mainCrop || 'Ragi');
  const [farmingType, setFarmingType] = useState(
    profile?.farmingType || 'Traditional / Rainfed'
  );

  const [results, setResults] = useState<EligibilityResult[]>([]);
  const [hasChecked, setHasChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSchemes()
      .then(setSchemes)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (profile) {
      if (profile.state) setState(profile.state);
      if (profile.farmerCategory) setFarmerCategory(profile.farmerCategory);
      if (profile.landHoldingAcres) setLandHoldingAcres(profile.landHoldingAcres);
      if (profile.mainCrop) setMainCrop(profile.mainCrop);
      if (profile.farmingType) setFarmingType(profile.farmingType);
    }
  }, [profile]);

  const schemeShortNames = useMemo(() => schemes.map((s) => s.shortName), [schemes]);
  const trSchemeName = useTranslatedTexts(schemeShortNames);

  const runCheck = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await checkEligibility(
        {
          schemeId: selectedSchemeId !== 'all' ? Number(selectedSchemeId) : undefined,
          profileOverrides: {
            state,
            farmerCategory,
            landHoldingAcres,
            mainCrop,
            farmingType,
          },
          language: currentLang,
        },
        token
      );
      setResults(data);
      setHasChecked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('eligibility.errorFallback'));
    } finally {
      setLoading(false);
    }
  }, [
    selectedSchemeId,
    state,
    farmerCategory,
    landHoldingAcres,
    mainCrop,
    farmingType,
    currentLang,
    token,
    t,
  ]);

  useEffect(() => {
    if (hasChecked) {
      void runCheck();
    }
    // Re-localize results automatically when language changes after checking
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLang]);

  const handleCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    void runCheck();
  };

  const eligibleResults = results.filter((res) => res.status === 'eligible');
  const needsMoreInfo = results.some((res) => res.status === 'more_info');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-7 sm:py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17613A]">
          {t('eligibility.title')}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#303030]/85 max-w-3xl">
          {t('eligibility.subtitle')}
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleCheck}
        className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-8 mb-8"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#17613A] mb-1">
              {t('eligibility.targetScheme')}
            </label>
            <select
              value={selectedSchemeId}
              onChange={(e) => setSelectedSchemeId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded bg-white"
            >
              <option value="all">{t('eligibility.checkAllSchemes')}</option>
              {schemes.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {trSchemeName(s.shortName)} — {tEnum(t, 'states', s.stateName)} (
                  {tEnum(t, 'govLevels', s.governmentLevel)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17613A] mb-1">
              {t('eligibility.state')}
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded bg-white"
            >
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {tEnum(t, 'states', st)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17613A] mb-1">
              {t('eligibility.farmerCategory')}
            </label>
            <select
              value={farmerCategory}
              onChange={(e) => setFarmerCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded bg-white"
            >
              {FARMER_CATEGORIES.map((fc) => (
                <option key={fc} value={fc}>
                  {tEnum(t, 'farmerCategories', fc)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17613A] mb-1">
              {t('eligibility.landHoldingLabel')}
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={landHoldingAcres}
              onChange={(e) => setLandHoldingAcres(e.target.value)}
              placeholder={t('eligibility.landHoldingPlaceholder')}
              className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17613A] mb-1">
              {t('eligibility.mainCrop')}
            </label>
            <input
              type="text"
              value={mainCrop}
              onChange={(e) => setMainCrop(e.target.value)}
              placeholder={t('eligibility.mainCropPlaceholder')}
              className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17613A] mb-1">
              {t('eligibility.farmingType')}
            </label>
            <select
              value={farmingType}
              onChange={(e) => setFarmingType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded bg-white"
            >
              {FARMING_TYPES.map((ft) => (
                <option key={ft} value={ft}>
                  {tEnum(t, 'farmingTypes', ft)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-[#303030]/75">
            {profile ? t('eligibility.profilePreFilled') : t('eligibility.profileTip')}
          </p>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#F47721] hover:bg-[#d96312] disabled:opacity-60 text-white text-sm font-semibold rounded transition-colors"
          >
            {loading ? t('eligibility.evaluating') : t('eligibility.checkBtn')}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6 text-sm">
          <TranslatedText text={error} />
        </div>
      )}

      {/* Results — Only eligible schemes displayed */}
      {hasChecked && !loading && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-[#17613A]">{t('eligibility.resultsTitle')}</h2>
            <span className="text-xs font-semibold text-[#207747] tabular-nums">
              {t('eligibility.foundCount', { count: eligibleResults.length })}
            </span>
          </div>

          {eligibleResults.length === 0 ? (
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 text-center">
              <p className="text-base font-semibold text-[#17613A]">
                {t('eligibility.noneMatched')}
              </p>
              <p className="mt-1.5 text-sm text-[#303030]/80">
                {needsMoreInfo
                  ? t('eligibility.needMoreInfoHint')
                  : t('eligibility.adjustCriteriaHint')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {eligibleResults.map((res) => (
                <div
                  key={res.schemeId}
                  className="bg-white border border-[#E5E7EB] rounded-xl p-6 flex flex-col justify-between gap-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#207747] shrink-0" />
                        <span className="text-sm font-bold text-[#17613A]">
                          {res.headline}
                        </span>
                      </div>
                      <h3 className="mt-1 text-lg font-bold text-[#303030]">
                        <TranslatedText text={res.schemeName} />
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Link
                        to={`/schemes/${res.slug}`}
                        className="px-3.5 py-2 bg-[#17613A] hover:bg-[#207747] text-white text-xs font-semibold rounded"
                      >
                        {t('eligibility.viewScheme')}
                      </Link>
                      <a
                        href={res.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#F47721] hover:underline"
                      >
                        <span>{t('eligibility.officialPortal')}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {res.reasons.length > 0 && (
                    <ul className="mt-3 space-y-1 text-sm text-[#303030] list-disc pl-5">
                      {res.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
