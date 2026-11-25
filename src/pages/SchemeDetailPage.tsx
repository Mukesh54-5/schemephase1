import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileText,
  ListChecks,
  CalendarCheck,
  Landmark,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TranslatedText, useTranslatedTexts } from '../context/DynamicTranslationContext';
import { fetchSchemeBySlugOrId, recordSchemeView } from '../services/api';
import { tEnum } from '../translations/i18n';
import type { Scheme } from '../types';

export const SchemeDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { token } = useAuth();
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setLoading(true);
    setLogoFailed(false);
    fetchSchemeBySlugOrId(slug)
      .then((item) => {
        if (active) {
          setScheme(item);
          if (token) {
            recordSchemeView(item.id, token);
          }
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : t('schemeDetail.notFoundTitle'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug, token, t]);

  useEffect(() => {
    if (!scheme || !location.hash) return;
    const id = location.hash.replace(/^#/, '');
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [scheme, location.hash]);

  const dynamicTexts = useMemo(() => {
    if (!scheme) return [];
    return [
      scheme.name,
      scheme.shortName,
      scheme.overview,
      scheme.benefits,
      scheme.eligibilitySummary,
      ...(scheme.objectives || []),
      ...(scheme.eligibilityRules?.notes || []),
      ...(scheme.requiredDocuments || []),
      ...(scheme.applicationProcedure || []),
    ];
  }, [scheme]);

  const tr = useTranslatedTexts(dynamicTexts);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="h-72 bg-white border border-[#E5E7EB] rounded-md animate-pulse" />
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#17613A]">{t('schemeDetail.notFoundTitle')}</h1>
        {error && (
          <p className="mt-2 text-sm text-[#303030]/80">
            <TranslatedText text={error} />
          </p>
        )}
        <Link
          to="/schemes"
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#17613A] text-white text-sm font-semibold rounded"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('schemeDetail.backToSchemesShort')}</span>
        </Link>
      </div>
    );
  }

  const displayShortName = tr(scheme.shortName);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <Link
        to="/schemes"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#17613A] hover:text-[#F47721] mb-6"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        <span>{t('schemeDetail.backToSchemes')}</span>
      </Link>

      {/* Main Header Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
          <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl border border-[#E5E7EB] bg-white p-2 flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
            {scheme.logoUrl && !logoFailed ? (
              <img
                src={scheme.logoUrl}
                alt={`${displayShortName} ${t('schemes.logoAltSuffix')}`}
                referrerPolicy="no-referrer"
                onError={() => setLogoFailed(true)}
                className="max-w-full max-h-full w-auto h-auto object-contain"
              />
            ) : (
              <div className="w-full h-full rounded-lg flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-[#F5F8F5] to-[#E6EFE9]">
                <Landmark className="w-6 h-6 text-[#17613A] mb-1" aria-hidden="true" />
                <span className="text-[11px] font-bold text-[#17613A] leading-tight line-clamp-2">
                  {displayShortName}
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#207747]">
              <span>
                {tEnum(t, 'govLevels', scheme.governmentLevel)} {t('schemes.govSuffix')}
              </span>
              <span aria-hidden="true">·</span>
              <span>{tEnum(t, 'states', scheme.stateName)}</span>
              <span aria-hidden="true">·</span>
              <span>{tEnum(t, 'schemeCategories', scheme.category)}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-[#303030]/75 tabular-nums">
                <CalendarCheck className="w-3.5 h-3.5" aria-hidden="true" />
                {t('schemeDetail.lastVerified')} {scheme.lastVerifiedDate}
              </span>
            </div>

            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#17613A] leading-tight">
              {tr(scheme.name)}
            </h1>
          </div>
        </div>

        <p className="mt-4 text-base text-[#303030] leading-relaxed">
          {tr(scheme.overview)}
        </p>

        <div id="official-portal" className="mt-6 flex flex-wrap gap-3 scroll-mt-20">
          <a
            href={scheme.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F47721] hover:bg-[#d96312] text-white text-sm font-semibold rounded transition-colors"
          >
            <span>{t('schemeDetail.visitOfficialPortal')}</span>
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </a>

          <Link
            to={`/eligibility?schemeId=${scheme.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#17613A] hover:bg-[#207747] text-white text-sm font-semibold rounded transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            <span>{t('schemeDetail.checkPreliminaryEligibility')}</span>
          </Link>
        </div>
      </div>

      {/* Details Grid */}
      <div id="benefits-documents" className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 scroll-mt-20">
        {/* Objectives */}
        <section className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-7">
          <h2 className="text-lg font-bold text-[#17613A] mb-3.5">{t('schemeDetail.objectives')}</h2>
          <ul className="space-y-2.5 text-sm text-[#303030]">
            {scheme.objectives.map((obj, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#207747] shrink-0 mt-0.5" />
                <span>{tr(obj)}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Benefits */}
        <section className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-7">
          <h2 className="text-lg font-bold text-[#17613A] mb-3.5">{t('schemeDetail.keyBenefits')}</h2>
          <p className="text-sm text-[#303030] leading-relaxed">{tr(scheme.benefits)}</p>
          <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
            <h3 className="text-sm font-bold text-[#17613A] mb-1.5">
              {t('schemeDetail.eligibilitySummary')}
            </h3>
            <p className="text-sm text-[#303030]/90 leading-relaxed">
              {tr(scheme.eligibilitySummary)}
            </p>
            {scheme.eligibilityRules?.notes?.length > 0 && (
              <ul className="mt-3 space-y-1.5 text-xs text-[#303030]/80 list-disc pl-4">
                {scheme.eligibilityRules.notes.map((n, i) => (
                  <li key={i}>{tr(n)}</li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Required Documents */}
        <section className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-7">
          <div className="flex items-center gap-2 mb-3.5">
            <FileText className="w-5 h-5 text-[#17613A]" aria-hidden="true" />
            <h2 className="text-lg font-bold text-[#17613A]">
              {t('schemeDetail.requiredDocuments')}
            </h2>
          </div>
          <ul className="space-y-2.5 text-sm text-[#303030]">
            {scheme.requiredDocuments.map((doc, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded bg-[#F5F8F5] border border-[#E5E7EB] text-xs font-bold text-[#17613A] flex items-center justify-center shrink-0 tabular-nums">
                  {i + 1}
                </span>
                <span>{tr(doc)}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Application Procedure */}
        <section className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-7">
          <div className="flex items-center gap-2 mb-3.5">
            <ListChecks className="w-5 h-5 text-[#17613A]" aria-hidden="true" />
            <h2 className="text-lg font-bold text-[#17613A]">
              {t('schemeDetail.applicationProcedure')}
            </h2>
          </div>
          <ol className="space-y-3 text-sm text-[#303030]">
            {scheme.applicationProcedure.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#17613A] text-white text-xs font-bold flex items-center justify-center shrink-0 tabular-nums">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{tr(step)}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
};
