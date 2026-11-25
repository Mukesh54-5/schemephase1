import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getNormalizedLang } from '../translations/i18n';
import { AgriculturalIllustration, ProjectLogo } from './ProjectLogo';

export const MainHeader: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = getNormalizedLang(i18n.language);

  return (
    <header className="w-full bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
          {/* Left Section: Project Agricultural Logo */}
          <Link
            to="/"
            className="shrink-0 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#17613A] rounded-full"
            aria-label={t('header.homeAria')}
          >
            <ProjectLogo className="w-20 h-20 sm:w-24 sm:h-24" />
          </Link>

          {/* Center Section: Brand Title, Regional Tagline, Subtitle */}
          <div className="text-center max-w-3xl px-2">
            <h1 className="text-lg sm:text-2xl lg:text-[26px] font-extrabold text-[#17613A] tracking-tight leading-snug">
              {t('header.title')}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg font-bold text-[#207747] mt-1">
              {lang === 'kn' ? t('header.kannadaTitle') : t('header.hindiTitle')}
            </p>
            <p className="text-xs sm:text-sm font-semibold text-[#F47721] mt-1">
              &ldquo;{t('header.subtitle')}&rdquo;
            </p>
          </div>

          {/* Right Section: Secondary Agricultural Illustration */}
          <div className="hidden md:flex shrink-0 items-center justify-center">
            <AgriculturalIllustration className="w-20 h-20 sm:w-24 sm:h-24" />
          </div>
        </div>
      </div>
    </header>
  );
};
