import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  UserCheck,
  Sparkles,
  History,
  CheckCircle2,
  Sprout,
  Bot,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TranslatedText, useTranslatedTexts } from '../context/DynamicTranslationContext';
import { WeatherWidget } from '../components/WeatherWidget';
import { fetchDashboard, updateFarmerProfile } from '../services/api';
import { getNormalizedLang, tEnum } from '../translations/i18n';
import { INDIAN_STATES, type RecommendationItem, type Scheme } from '../types';

const FARMER_CATEGORIES = [
  'Marginal (< 1 ha)',
  'Small (1-2 ha)',
  'Semi-Medium (2-4 ha)',
  'Medium (4-10 ha)',
  'Large (> 10 ha)',
  'Landless / Tenant',
];

const IRRIGATION_TYPES = ['Rainfed', 'Borewell / Pump', 'Canal', 'Drip / Sprinkler'];

const FARMING_TYPES = [
  'Traditional / Rainfed',
  'Irrigated',
  'Organic',
  'Mixed (Organic & Modern)',
];

const GENDERS = ['Male', 'Female', 'Other'];

export const DashboardPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = getNormalizedLang(i18n.language);
  const { user, profile, token, loading: authLoading, setProfileState } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const tabParam = searchParams.get('tab');
  const tab: 'overview' | 'profile' | 'recommendations' =
    tabParam === 'profile' || tabParam === 'recommendations' ? tabParam : 'overview';

  const setTab = (next: 'overview' | 'profile' | 'recommendations') => {
    if (next === 'overview') {
      setSearchParams({});
    } else {
      setSearchParams({ tab: next });
    }
  };
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Scheme[]>([]);
  const [loadingDash, setLoadingDash] = useState(true);

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [state, setState] = useState('Karnataka');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [farmerCategory, setFarmerCategory] = useState('Small (1-2 ha)');
  const [landHoldingAcres, setLandHoldingAcres] = useState('');
  const [mainCrop, setMainCrop] = useState('');
  const [irrigationAvailability, setIrrigationAvailability] = useState('Rainfed');
  const [farmingType, setFarmingType] = useState('Traditional / Rainfed');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const loadData = useCallback(
    async (authToken: string) => {
      setLoadingDash(true);
      try {
        const data = await fetchDashboard(authToken, currentLang);
        setRecommendations(data.recommendations || []);
        setRecentlyViewed(data.recentlyViewed || []);
        if (data.profile) {
          setProfileState(data.profile);
          setFullName(data.profile.fullName || '');
          setAge(data.profile.age ? String(data.profile.age) : '');
          setGender(data.profile.gender || '');
          setState(data.profile.state || 'Karnataka');
          setDistrict(data.profile.district || '');
          setVillage(data.profile.village || '');
          setFarmerCategory(data.profile.farmerCategory || 'Small (1-2 ha)');
          setLandHoldingAcres(data.profile.landHoldingAcres || '');
          setMainCrop(data.profile.mainCrop || '');
          setIrrigationAvailability(data.profile.irrigationAvailability || 'Rainfed');
          setFarmingType(data.profile.farmingType || 'Traditional / Rainfed');
        }
      } finally {
        setLoadingDash(false);
      }
    },
    [currentLang, setProfileState]
  );

  useEffect(() => {
    if (token) {
      void loadData(token);
    }
  }, [token, loadData]);

  useEffect(() => {
    if (profile && !fullName) {
      setFullName(profile.fullName || user?.fullName || '');
    }
  }, [profile, user, fullName]);

  const dynamicTexts = useMemo(() => {
    return [
      ...recommendations.flatMap((r) => [r.scheme.name, r.scheme.benefits]),
      ...recentlyViewed.map((s) => s.shortName),
      profile?.district,
      profile?.mainCrop,
    ];
  }, [recommendations, recentlyViewed, profile?.district, profile?.mainCrop]);

  const tr = useTranslatedTexts(dynamicTexts);

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="h-64 bg-white border border-[#E5E7EB] rounded-md animate-pulse" />
      </div>
    );
  }

  if (!user || !token) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    setSaveErr(null);
    try {
      const updated = await updateFarmerProfile(
        {
          fullName,
          age: age ? Number(age) : null,
          gender,
          state,
          district,
          village,
          farmerCategory,
          landHoldingAcres,
          mainCrop,
          irrigationAvailability,
          farmingType,
        },
        token
      );
      setProfileState(updated);
      setSaveMsg(t('dashboard.profileSavedMsg'));
      await loadData(token);
    } catch (err) {
      setSaveErr(err instanceof Error ? err.message : t('dashboard.profileSaveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <aside className="lg:col-span-3">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
            <div className="pb-4 border-b border-[#E5E7EB]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#F47721]">
                {t('dashboard.farmerAccount')}
              </p>
              <h2 className="mt-1 text-lg font-bold text-[#17613A] truncate">
                {profile?.fullName || user.fullName}
              </h2>
              <p className="text-xs text-[#303030]/75 truncate">{user.email}</p>
            </div>

            <nav className="mt-4 flex flex-row lg:flex-col gap-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => setTab('overview')}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded text-left whitespace-nowrap ${
                  tab === 'overview'
                    ? 'bg-[#17613A] text-white'
                    : 'text-[#303030] hover:bg-[#F5F8F5]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>{t('dashboard.overviewTab')}</span>
              </button>

              <button
                type="button"
                onClick={() => setTab('profile')}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded text-left whitespace-nowrap ${
                  tab === 'profile'
                    ? 'bg-[#17613A] text-white'
                    : 'text-[#303030] hover:bg-[#F5F8F5]'
                }`}
              >
                <UserCheck className="w-4 h-4 shrink-0" />
                <span>{t('dashboard.profileTab')}</span>
              </button>

              <button
                type="button"
                onClick={() => setTab('recommendations')}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded text-left whitespace-nowrap ${
                  tab === 'recommendations'
                    ? 'bg-[#17613A] text-white'
                    : 'text-[#303030] hover:bg-[#F5F8F5]'
                }`}
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>{t('dashboard.recommendationsTab')}</span>
              </button>

              <Link
                to="/eligibility"
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded text-[#303030] hover:bg-[#F5F8F5] whitespace-nowrap"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#207747]" />
                <span>{t('dashboard.eligibilityLink')}</span>
              </Link>

              <Link
                to="/agriculture/crop"
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded text-[#303030] hover:bg-[#F5F8F5] whitespace-nowrap"
              >
                <Sprout className="w-4 h-4 shrink-0 text-[#207747]" />
                <span>{t('dashboard.agriGuidesLink')}</span>
              </Link>

              <Link
                to="/chatbot"
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded text-[#303030] hover:bg-[#F5F8F5] whitespace-nowrap"
              >
                <Bot className="w-4 h-4 shrink-0 text-[#F47721]" />
                <span>{t('dashboard.aiAssistantLink')}</span>
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-6">
          {tab === 'overview' && (
            <>
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-extrabold text-[#17613A]">
                      {t('dashboard.welcome', { name: profile?.fullName || user.fullName })}
                    </h1>
                    <p className="mt-1 text-sm text-[#303030]/85">
                      {profile?.state && profile?.mainCrop
                        ? `${tEnum(t, 'states', profile.state)}${
                            profile.district ? ` · ${tr(profile.district)}` : ''
                          } · ${tEnum(t, 'farmerCategories', profile.farmerCategory)} · ${t(
                            'dashboard.mainCropPrefix'
                          )} ${tr(profile.mainCrop)}`
                        : t('dashboard.completeProfilePrompt')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTab('profile')}
                    className="px-4 py-2 bg-[#F47721] hover:bg-[#d96312] text-white text-sm font-semibold rounded whitespace-nowrap"
                  >
                    {profile?.state
                      ? t('dashboard.editProfileBtn')
                      : t('dashboard.completeProfileBtn')}
                  </button>
                </div>
              </div>

              {/* Real-Time Local Weather & Daily Planning Widget */}
              <WeatherWidget
                defaultLocation={
                  [profile?.village, profile?.district, profile?.state, 'India']
                    .filter((part): part is string => Boolean(part && part.trim()))
                    .join(', ') || 'Bengaluru, Karnataka, India'
                }
              />

              {/* Recommended Schemes */}
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[#17613A]">
                    {t('dashboard.recommendedHeading')}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setTab('recommendations')}
                    className="text-xs font-bold text-[#F47721] hover:underline"
                  >
                    {t('dashboard.viewAllRecommendations')}
                  </button>
                </div>

                {loadingDash ? (
                  <div className="h-32 bg-[#F5F8F5] rounded-lg animate-pulse" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.slice(0, 4).map((rec) => (
                      <div
                        key={rec.scheme.id}
                        className="border border-[#E5E7EB] rounded-lg p-5 bg-[#F5F8F5] min-h-[180px] flex flex-col justify-between gap-3"
                      >
                        <div>
                          <div className="text-xs font-semibold text-[#207747]">
                            {tEnum(t, 'govLevels', rec.scheme.governmentLevel)} ·{' '}
                            {tEnum(t, 'schemeCategories', rec.scheme.category)}
                          </div>
                          <h3 className="mt-1.5 text-base font-bold text-[#17613A]">
                            {tr(rec.scheme.name)}
                          </h3>
                          <ul className="mt-2.5 space-y-1 text-xs text-[#303030]/90 list-disc pl-4">
                            {rec.reasons.slice(0, 2).map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="pt-2 flex items-center gap-3">
                          <Link
                            to={`/schemes/${rec.scheme.slug}`}
                            className="text-xs font-bold text-[#17613A] hover:underline"
                          >
                            {t('home.viewDetails')}
                          </Link>
                          <a
                            href={rec.scheme.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#F47721] hover:underline"
                          >
                            <span>{t('dashboard.officialSite')}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-4 text-xs text-[#303030]/70">
                  {t('dashboard.disclaimerNote')}
                </p>
              </div>

              {/* Recently Viewed Schemes */}
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-4 h-4 text-[#17613A]" />
                  <h2 className="text-lg font-bold text-[#17613A]">
                    {t('dashboard.recentlyViewedHeading')}
                  </h2>
                </div>
                {recentlyViewed.length === 0 ? (
                  <p className="text-sm text-[#303030]/75">
                    {t('dashboard.noSchemesViewed')}{' '}
                    <Link to="/schemes" className="text-[#F47721] font-semibold hover:underline">
                      {t('dashboard.browseSchemesLink')}
                    </Link>
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentlyViewed.map((s) => (
                      <Link
                        key={s.id}
                        to={`/schemes/${s.slug}`}
                        className="border border-[#E5E7EB] hover:border-[#17613A] rounded-lg p-4 sm:p-5 min-h-[108px] flex flex-col justify-between transition-colors"
                      >
                        <div className="text-[11px] font-semibold text-[#207747]">
                          {tEnum(t, 'govLevels', s.governmentLevel)}
                        </div>
                        <div className="mt-2 text-sm font-bold text-[#17613A] line-clamp-2">
                          {tr(s.shortName)}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {tab === 'profile' && (
            <form
              onSubmit={handleSaveProfile}
              className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-7"
            >
              <h2 className="text-xl font-extrabold text-[#17613A]">
                {t('dashboard.profileDetailsTitle')}
              </h2>
              <p className="mt-1 text-sm text-[#303030]/80">
                {t('dashboard.profileDetailsDesc')}
              </p>

              {saveMsg && (
                <div className="mt-4 bg-[#F5F8F5] border border-[#207747]/40 text-[#17613A] text-xs rounded p-3">
                  {saveMsg}
                </div>
              )}
              {saveErr && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded p-3">
                  <TranslatedText text={saveErr} />
                </div>
              )}

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#17613A] mb-1">
                    {t('dashboard.fullNameLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17613A] mb-1">
                    {t('dashboard.ageLabel')}
                  </label>
                  <input
                    type="number"
                    min={18}
                    max={110}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder={t('dashboard.agePlaceholder')}
                    className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17613A] mb-1">
                    {t('dashboard.genderLabel')}
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded bg-white"
                  >
                    <option value="">{t('dashboard.preferNotToSay')}</option>
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>
                        {tEnum(t, 'genders', g)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17613A] mb-1">
                    {t('dashboard.stateLabel')}
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
                    {t('dashboard.districtLabel')}
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder={t('dashboard.districtPlaceholder')}
                    className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17613A] mb-1">
                    {t('dashboard.villageLabel')}
                  </label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder={t('dashboard.villagePlaceholder')}
                    className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17613A] mb-1">
                    {t('dashboard.farmerCategoryLabel')}
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
                    {t('dashboard.landHoldingLabel')}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={landHoldingAcres}
                    onChange={(e) => setLandHoldingAcres(e.target.value)}
                    placeholder={t('dashboard.landHoldingPlaceholder')}
                    className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17613A] mb-1">
                    {t('dashboard.mainCropLabel')}
                  </label>
                  <input
                    type="text"
                    value={mainCrop}
                    onChange={(e) => setMainCrop(e.target.value)}
                    placeholder={t('dashboard.mainCropPlaceholder')}
                    className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17613A] mb-1">
                    {t('dashboard.irrigationLabel')}
                  </label>
                  <select
                    value={irrigationAvailability}
                    onChange={(e) => setIrrigationAvailability(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded bg-white"
                  >
                    {IRRIGATION_TYPES.map((ir) => (
                      <option key={ir} value={ir}>
                        {tEnum(t, 'irrigationTypes', ir)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17613A] mb-1">
                    {t('dashboard.farmingTypeLabel')}
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

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#17613A] hover:bg-[#207747] disabled:opacity-60 text-white text-sm font-semibold rounded"
                >
                  {saving ? t('dashboard.savingProfile') : t('dashboard.saveProfileBtn')}
                </button>
              </div>
            </form>
          )}

          {tab === 'recommendations' && (
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-7">
              <h2 className="text-xl font-extrabold text-[#17613A]">
                {t('dashboard.personalizedTitle')}
              </h2>
              <p className="mt-1 text-sm text-[#303030]/80">
                {t('dashboard.personalizedDesc')}
              </p>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec) => (
                  <div
                    key={rec.scheme.id}
                    className="border border-[#E5E7EB] rounded-lg p-5 sm:p-6 bg-[#F5F8F5] flex flex-col justify-between gap-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-semibold text-[#207747]">
                          {tEnum(t, 'govLevels', rec.scheme.governmentLevel)} ·{' '}
                          {tEnum(t, 'schemeCategories', rec.scheme.category)}
                        </span>
                        <h3 className="text-lg font-bold text-[#17613A]">
                          {tr(rec.scheme.name)}
                        </h3>
                      </div>
                      <Link
                        to={`/schemes/${rec.scheme.slug}`}
                        className="px-4 py-2 bg-[#17613A] text-white text-xs font-semibold rounded whitespace-nowrap self-start sm:self-center"
                      >
                        {t('dashboard.viewSchemeDetails')}
                      </Link>
                    </div>
                    <p className="mt-2 text-sm text-[#303030]">{tr(rec.scheme.benefits)}</p>
                    <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
                      <p className="text-xs font-bold text-[#17613A]">
                        {t('dashboard.whyRecommended')}
                      </p>
                      <ul className="mt-1 space-y-1 text-xs text-[#303030]/90 list-disc pl-4">
                        {rec.reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
