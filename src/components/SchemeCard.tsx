import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ArrowRight, Landmark } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useObserveTranslate } from '../context/DynamicTranslationContext';
import { tEnum } from '../translations/i18n';
import type { Scheme } from '../types';

interface SchemeCardProps {
  scheme: Scheme;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({ scheme }) => {
  const { t } = useTranslation();
  const [logoFailed, setLogoFailed] = useState(false);
  const cardRef = useRef<HTMLElement>(null);

  const textsToTranslate = useMemo(
    () => [
      scheme.shortName,
      scheme.name,
      scheme.overview,
      scheme.benefits,
      scheme.eligibilitySummary,
    ],
    [scheme.shortName, scheme.name, scheme.overview, scheme.benefits, scheme.eligibilitySummary]
  );

  const tr = useObserveTranslate(cardRef, textsToTranslate);

  return (
    <article
      ref={cardRef}
      className="bg-white border border-[#E5E7EB] rounded-xl p-5 sm:p-6 flex flex-col justify-between gap-4 min-h-[320px] hover:border-[#207747]/60 transition-colors"
    >
      <div>
        <div className="flex items-start gap-3.5 sm:gap-4">
          <div className="w-20 h-20 sm:w-[92px] sm:h-[92px] shrink-0 rounded-lg border border-[#E5E7EB] bg-white p-1.5 flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
            {scheme.logoUrl && !logoFailed ? (
              <img
                src={scheme.logoUrl}
                alt={`${tr(scheme.shortName)} ${t('schemes.logoAltSuffix')}`}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => setLogoFailed(true)}
                className="max-w-full max-h-full w-auto h-auto object-contain"
              />
            ) : (
              <div className="w-full h-full rounded flex flex-col items-center justify-center p-1 text-center bg-gradient-to-br from-[#F5F8F5] to-[#E6EFE9]">
                <Landmark className="w-5 h-5 text-[#17613A] mb-1" aria-hidden="true" />
                <span className="text-[10px] font-bold text-[#17613A] leading-tight line-clamp-2">
                  {tr(scheme.shortName)}
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs font-medium text-[#207747]">
              <span>
                {tEnum(t, 'govLevels', scheme.governmentLevel)} {t('schemes.govSuffix')}
              </span>
              <span aria-hidden="true">·</span>
              <span>{tEnum(t, 'schemeCategories', scheme.category)}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#303030]/70">{tEnum(t, 'states', scheme.stateName)}</span>
            </div>

            <h3 className="mt-1.5 text-base sm:text-lg font-bold text-[#17613A] leading-snug">
              {tr(scheme.name)}
            </h3>
          </div>
        </div>

        <p className="mt-3 text-sm text-[#303030] leading-relaxed line-clamp-3">
          {tr(scheme.overview)}
        </p>

        <div className="mt-3.5 pt-3.5 border-t border-[#E5E7EB] space-y-2 text-xs sm:text-sm">
          <div>
            <span className="font-semibold text-[#17613A]">{t('schemes.benefitsLabel')} </span>
            <span className="text-[#303030]">{tr(scheme.benefits)}</span>
          </div>
          <div>
            <span className="font-semibold text-[#17613A]">{t('schemes.eligibilityLabel')} </span>
            <span className="text-[#303030]/90">{tr(scheme.eligibilitySummary)}</span>
          </div>
        </div>
      </div>

      <div className="pt-3.5 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3">
        <Link
          to={`/schemes/${scheme.slug}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#17613A] hover:bg-[#207747] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
        >
          <span>{t('home.viewDetails')}</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>

        <a
          href={scheme.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#F47721] hover:underline whitespace-nowrap"
        >
          <span>{t('home.officialWebsite')}</span>
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
};
