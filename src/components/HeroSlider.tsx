import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SlideItem {
  id: number;
  image: string;
  imageAltKey: string;
  titleKey: string;
  descKey: string;
  primaryLabelKey: string;
  primaryTo: string;
  secondaryLabelKey?: string;
  secondaryTo?: string;
}

const SLIDES: SlideItem[] = [
  {
    id: 0,
    image: '/src/assets/images/hero_indian_farmers_field_1794853261391.jpg',
    imageAltKey: 'hero.slide1Alt',
    titleKey: 'hero.slide1Title',
    descKey: 'hero.slide1Desc',
    primaryLabelKey: 'hero.exploreSchemes',
    primaryTo: '/schemes',
    secondaryLabelKey: 'hero.learnMore',
    secondaryTo: '/about',
  },
  {
    id: 1,
    image: '/src/assets/images/hero_modern_farming_machinery_1794853261714.jpg',
    imageAltKey: 'hero.slide2Alt',
    titleKey: 'hero.slide2Title',
    descKey: 'hero.slide2Desc',
    primaryLabelKey: 'hero.exploreSchemes',
    primaryTo: '/schemes',
    secondaryLabelKey: 'nav.eligibilityChecker',
    secondaryTo: '/eligibility',
  },
  {
    id: 2,
    image: '/src/assets/images/hero_drip_irrigation_crops_1794853262136.jpg',
    imageAltKey: 'hero.slide3Alt',
    titleKey: 'hero.slide3Title',
    descKey: 'hero.slide3Desc',
    primaryLabelKey: 'hero.exploreFarming',
    primaryTo: '/agriculture/crop',
    secondaryLabelKey: 'nav.technologies',
    secondaryTo: '/agriculture/technology',
  },
  {
    id: 3,
    image: '/assets/aistudio/image_73bf12da.png',
    imageAltKey: 'hero.slide4Alt',
    titleKey: 'hero.slide4Title',
    descKey: 'hero.slide4Desc',
    primaryLabelKey: 'nav.eligibilityChecker',
    primaryTo: '/eligibility',
    secondaryLabelKey: 'hero.exploreSchemes',
    secondaryTo: '/schemes',
  },
];

export const HeroSlider: React.FC = () => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [paused]);

  const goPrev = () => {
    setPaused(true);
    setActiveIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const goNext = () => {
    setPaused(true);
    setActiveIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const current = SLIDES[activeIndex];

  return (
    <section
      className="relative w-full h-[440px] sm:h-[490px] lg:h-[560px] overflow-hidden bg-[#17613A]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label={t('hero.regionLabel')}
    >
      {/* Background slides */}
      {SLIDES.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            idx === activeIndex ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
          }`}
        >
          <img
            src={slide.image}
            alt={t(slide.imageAltKey)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/60 to-black/70"
            aria-hidden="true"
          />
        </div>
      ))}

      {/* Centered Content */}
      <div className="relative z-10 h-full max-w-5xl mx-auto px-12 sm:px-16 flex flex-col items-center justify-center text-center text-white">
        <span className="inline-block bg-[#F47721] text-white text-[11px] sm:text-xs font-bold tracking-wider uppercase px-4 py-1.5 rounded-full shadow-sm mb-4">
          {t('hero.welcomeBadge')}
        </span>

        <h2
          className="font-extrabold tracking-tight leading-tight text-white max-w-3xl text-balance"
          style={{ fontSize: 'clamp(1.7rem, 3.6vw, 3.15rem)' }}
        >
          {t(current.titleKey)}
        </h2>

        <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-white/90 max-w-2xl leading-relaxed">
          {t(current.descKey)}
        </p>

        <div className="mt-6 sm:mt-7 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link
            to={current.primaryTo}
            className="px-5 py-2.5 sm:px-6 sm:py-3 bg-[#F47721] hover:bg-[#d96312] text-white text-sm sm:text-base font-semibold rounded transition-colors whitespace-nowrap"
          >
            {t(current.primaryLabelKey)}
          </Link>
          {current.secondaryLabelKey && current.secondaryTo && (
            <Link
              to={current.secondaryTo}
              className="px-5 py-2.5 sm:px-6 sm:py-3 border-2 border-white/85 hover:bg-white hover:text-[#17613A] text-white text-sm sm:text-base font-semibold rounded transition-colors whitespace-nowrap"
            >
              {t(current.secondaryLabelKey)}
            </Link>
          )}
        </div>
      </div>

      {/* Left / Right Controls */}
      <button
        type="button"
        onClick={goPrev}
        aria-label={t('hero.prevSlide')}
        className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/45 hover:bg-[#F47721] text-white flex items-center justify-center transition-colors"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={goNext}
        aria-label={t('hero.nextSlide')}
        className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/45 hover:bg-[#F47721] text-white flex items-center justify-center transition-colors"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
      </button>

      {/* Bottom Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
        {SLIDES.map((slide, idx) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => {
              setPaused(true);
              setActiveIndex(idx);
            }}
            aria-label={t('hero.goToSlide', { number: idx + 1 })}
            className={`h-2.5 rounded-full transition-all ${
              idx === activeIndex
                ? 'w-8 bg-[#F47721]'
                : 'w-2.5 bg-white/60 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </section>
  );
};
