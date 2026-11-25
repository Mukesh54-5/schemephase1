import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sprout, Layers, PawPrint, Leaf, FlaskConical, Cpu, Search } from 'lucide-react';
import {
  useDynamicTranslation,
  useObserveTranslate,
} from '../context/DynamicTranslationContext';
import { fetchAgricultureItems } from '../services/api';
import { tEnum } from '../translations/i18n';
import { balanceDetailColumns } from '../utils/agricultureDetailsLayout';
import type { AgricultureItem } from '../types';

const SECTIONS = [
  { key: 'crop', icon: Sprout },
  { key: 'soil', icon: Layers },
  { key: 'animal', icon: PawPrint },
  { key: 'organic', icon: Leaf },
  { key: 'inorganic', icon: FlaskConical },
  { key: 'technology', icon: Cpu },
];

const SECTION_CATEGORIES: Record<string, string[]> = {
  crop: [
    'All',
    'Cereals & Millets',
    'Pulses',
    'Oilseeds',
    'Cash & Fibre',
    'Plantation & Spices',
    'Vegetables & Fruits',
  ],
  soil: [
    'All',
    'Major Upland & Plains Soils',
    'Coastal & Hill Soils',
    'Problem Soils & Reclamation',
    'Arid & Desert Soils',
  ],
  animal: [
    'All',
    'Dairy Livestock',
    'Small Ruminants',
    'Poultry & Avian',
    'Allied Livestock & Aquaculture',
  ],
  organic: [
    'All',
    'Organic Manures',
    'Biofertilizers & Green Manure',
    'Natural Farming',
    'Organic Pest & Crop Systems',
  ],
  inorganic: [
    'All',
    'Primary Macronutrients',
    'Secondary & Micronutrients',
    'INM & Safe Stewardship',
  ],
  technology: [
    'All',
    'Irrigation Technologies',
    'Protected Cultivation',
    'Agricultural Machinery',
    'Precision & Digital Agriculture',
    'Foreign & Global AgTech',
  ],
};

const AgricultureCard: React.FC<{
  item: AgricultureItem;
  FallbackIcon: React.ComponentType<{ className?: string }>;
}> = ({ item, FallbackIcon }) => {
  const cardRef = useRef<HTMLElement | null>(null);
  const [imgFailed, setImgFailed] = useState(false);
  useEffect(() => {
    setImgFailed(false);
  }, [item.imageUrl]);
  const { left, right } = useMemo(() => balanceDetailColumns(item.details), [item.details]);

  const textsToTranslate = useMemo(() => {
    const detailTokens: string[] = [];
    for (const [k, v] of Object.entries(item.details || {})) {
      detailTokens.push(k, v);
    }
    return [item.title, item.subtitle, item.summary, ...detailTokens, ...(item.highlights || [])];
  }, [item]);

  const tr = useObserveTranslate(cardRef, textsToTranslate);

  return (
    <article
      ref={cardRef}
      className="bg-white border border-[#E5E7EB] rounded-xl p-5 sm:p-6 flex flex-col gap-4 hover:border-[#207747]/60 transition-colors"
    >
      <div className="space-y-4">
        {/* Top Row: Padded Square Photo beside Title & Summary */}
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
          <div className="w-full sm:w-40 md:w-44 aspect-square shrink-0 bg-[#F5F8F5] border border-[#E5E7EB] rounded-lg overflow-hidden">
            {item.imageUrl && !imgFailed ? (
              <img
                src={item.imageUrl}
                alt={tr(item.title)}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-[#F5F8F5] to-[#E6EFE9]">
                <FallbackIcon className="w-8 h-8 text-[#17613A] mb-2" aria-hidden="true" />
                <span className="text-xs font-bold text-[#17613A] leading-snug">
                  {tr(item.title)}
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#F47721]">
              {tr(item.subtitle)}
            </p>
            <h2 className="mt-1 text-lg sm:text-xl font-bold text-[#17613A] leading-snug">
              {tr(item.title)}
            </h2>
            <p className="mt-2.5 text-sm text-[#303030] leading-relaxed">
              {tr(item.summary)}
            </p>
          </div>
        </div>

        {/* Balanced 2-Column Technical Specs (independent columns prevent empty row gaps) */}
        <dl className="pt-4 border-t border-[#E5E7EB] grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 items-start text-xs sm:text-sm">
          <div className="space-y-2.5">
            {left.map(([k, v]) => (
              <div key={k} className="leading-relaxed">
                <dt className="font-semibold text-[#17613A] inline">{tr(k)}: </dt>
                <dd className="text-[#303030] inline">{tr(v)}</dd>
              </div>
            ))}
          </div>
          {right.length > 0 && (
            <div className="space-y-2.5">
              {right.map(([k, v]) => (
                <div key={k} className="leading-relaxed">
                  <dt className="font-semibold text-[#17613A] inline">{tr(k)}: </dt>
                  <dd className="text-[#303030] inline">{tr(v)}</dd>
                </div>
              ))}
            </div>
          )}
        </dl>
      </div>

      {item.highlights && item.highlights.length > 0 && (
        <div className="pt-3.5 border-t border-[#E5E7EB] text-xs font-medium text-[#207747] leading-relaxed">
          {item.highlights.map((h) => tr(h)).join(' · ')}
        </div>
      )}
    </article>
  );
};

export const AgriculturePage: React.FC = () => {
  const { t } = useTranslation();
  const { tr } = useDynamicTranslation();
  const { section = 'crop' } = useParams<{ section: string }>();
  const [searchParams] = useSearchParams();
  const focus = searchParams.get('focus');
  const activeMeta = SECTIONS.find((s) => s.key === section) || SECTIONS[0];
  const categories = SECTION_CATEGORIES[activeMeta.key] || ['All'];
  const ActiveIcon = activeMeta.icon;

  const activeLabel = t(`agriculture.sections.${activeMeta.key}.label`);
  const activeNoun = t(`agriculture.sections.${activeMeta.key}.noun`);
  const activePlaceholder = t(`agriculture.sections.${activeMeta.key}.placeholder`);
  const activeDesc = t(`agriculture.sections.${activeMeta.key}.desc`);

  const [items, setItems] = useState<AgricultureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    if (activeMeta.key === 'technology' && focus === 'irrigation') {
      setSelectedCategory('Irrigation Technologies');
    } else if (activeMeta.key === 'technology' && focus === 'machinery') {
      setSelectedCategory('Agricultural Machinery');
    } else if (activeMeta.key === 'technology' && focus === 'foreign') {
      setSelectedCategory('Foreign & Global AgTech');
    } else {
      setSelectedCategory('All');
    }
    setSearchQuery('');
    fetchAgricultureItems(activeMeta.key)
      .then((rows) => {
        if (active) setItems(rows);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [activeMeta.key, focus]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const cat = item.details['Category'] || item.details['Crop Category'] || '';
      const matchesCat = selectedCategory === 'All' || cat === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesCat;
      const hay = `${item.title} ${tr(item.title)} ${item.subtitle} ${tr(item.subtitle)} ${item.summary} ${tr(item.summary)} ${Object.values(item.details).join(' ')} ${(item.highlights || []).join(' ')}`.toLowerCase();
      return matchesCat && hay.includes(q);
    });
  }, [items, selectedCategory, searchQuery, tr]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 sm:py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17613A]">
          {activeLabel}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#303030]/85 max-w-3xl">
          {activeDesc}
        </p>
      </div>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2.5 mb-6 border-b border-[#E5E7EB] pb-4">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const isCurrent = s.key === activeMeta.key;
          return (
            <Link
              key={s.key}
              to={`/agriculture/${s.key}`}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                isCurrent
                  ? 'bg-[#17613A] text-white border-[#17613A]'
                  : 'bg-white text-[#303030] border-[#E5E7EB] hover:border-[#17613A]'
              }`}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span>{t(`agriculture.sections.${s.key}.label`)}</span>
            </Link>
          );
        })}
      </div>

      {/* Category Filters & Search (available on all 6 sections) */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 sm:p-6 mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search
              className="w-4 h-4 text-[#303030]/50 absolute left-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activePlaceholder}
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#17613A]"
            />
          </div>
          <span className="text-xs font-medium text-[#303030]/75 tabular-nums">
            {t('agriculture.showingCount', {
              filtered: filteredItems.length,
              total: items.length,
              noun: activeNoun,
            })}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#F47721] text-white border-[#F47721]'
                  : 'bg-[#F5F8F5] text-[#303030] border-[#E5E7EB] hover:border-[#17613A]'
              }`}
            >
              {cat === 'All'
                ? `${t('agriculture.allPrefix')} ${activeLabel}`
                : tEnum(t, 'agriCategories', cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="min-h-[380px] bg-white border border-[#E5E7EB] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 sm:p-10 text-center">
          <p className="text-base font-semibold text-[#17613A]">
            {t('agriculture.emptyText', { noun: activeNoun })}
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="mt-4 px-5 py-2.5 bg-[#17613A] text-white text-sm font-semibold rounded-lg"
          >
            {t('agriculture.showAllBtn', { label: activeLabel })}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {filteredItems.map((item) => (
            <AgricultureCard key={item.id} item={item} FallbackIcon={ActiveIcon} />
          ))}
        </div>
      )}
    </div>
  );
};
