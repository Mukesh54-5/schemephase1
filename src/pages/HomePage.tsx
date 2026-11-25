import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Landmark,
  CheckCircle2,
  Sparkles,
  Sprout,
  Cpu,
  Bot,
  ArrowRight,
} from 'lucide-react';
import { HeroSlider } from '../components/HeroSlider';
import { ChatbotIcon } from '../components/ChatbotIcon';
import { getNormalizedLang } from '../translations/i18n';

export const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = getNormalizedLang(i18n.language);

  const services = [
    {
      icon: Landmark,
      title: t('services.schemesTitle'),
      desc: t('services.schemesDesc'),
      to: '/schemes',
    },
    {
      icon: CheckCircle2,
      title: t('services.eligibilityTitle'),
      desc: t('services.eligibilityDesc'),
      to: '/eligibility',
    },
    {
      icon: Sparkles,
      title: t('services.recommendTitle'),
      desc: t('services.recommendDesc'),
      to: '/dashboard',
    },
    {
      icon: Sprout,
      title: t('services.agriTitle'),
      desc: t('services.agriDesc'),
      to: '/agriculture/crop',
    },
    {
      icon: Cpu,
      title: t('services.techTitle'),
      desc: t('services.techDesc'),
      to: '/agriculture/technology',
    },
    {
      icon: Bot,
      title: t('services.chatTitle'),
      desc: t('services.chatDesc'),
      to: '/chatbot',
    },
  ];

  const rawReasons = t('home.reasons', { returnObjects: true });
  const reasons = Array.isArray(rawReasons) ? (rawReasons as string[]) : [];

  return (
    <div>
      {/* Hero Slider immediately below Navbar */}
      <HeroSlider />

      {currentLang !== 'en' && (
        <div className="bg-white border-b border-[#E5E7EB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 text-xs text-[#17613A]">
            {t('common.translationNotice')}
          </div>
        </div>
      )}

      {/* 1. Welcome to the Platform */}
      <section className="bg-white py-8 sm:py-10 border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17613A] leading-tight text-balance">
                {t('home.welcomeHeading')}
              </h2>
              <p className="mt-4 text-base text-[#303030] leading-relaxed">
                {t('home.welcomeBody1')}
              </p>
              <p className="mt-3 text-base text-[#303030]/90 leading-relaxed">
                {t('home.welcomeBody2')}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/schemes"
                  className="px-5 py-2.5 bg-[#17613A] hover:bg-[#207747] text-white text-sm font-semibold rounded transition-colors whitespace-nowrap"
                >
                  {t('hero.exploreSchemes')}
                </Link>
                <Link
                  to="/eligibility"
                  className="px-5 py-2.5 border border-[#17613A] text-[#17613A] hover:bg-[#F5F8F5] text-sm font-semibold rounded transition-colors whitespace-nowrap"
                >
                  {t('nav.eligibilityChecker')}
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="h-full min-h-[280px] rounded-xl p-2 border border-[#E5E7EB] bg-[#F5F8F5]">
                <img
                  src="/src/assets/images/welcome_farmer_portal_1794853262979.jpg"
                  alt={t('home.welcomeImageAlt')}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Services */}
      <section className="bg-[#F5F8F5] py-8 sm:py-10 border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-7">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17613A]">
              {t('home.servicesHeading')}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#303030]/85">
              {t('home.servicesSubheading')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((srv) => {
              const Icon = srv.icon;
              return (
                <div
                  key={srv.title}
                  className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-7 min-h-[260px] flex flex-col justify-between gap-5 hover:border-[#17613A]/60 transition-colors"
                >
                  <div>
                    <div className="w-12 h-12 rounded-lg bg-[#F5F8F5] border border-[#E5E7EB] flex items-center justify-center text-[#17613A]">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-[#17613A]">
                      {srv.title}
                    </h3>
                    <p className="mt-2.5 text-sm text-[#303030]/90 leading-relaxed">
                      {srv.desc}
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link
                      to={srv.to}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#F47721] hover:text-[#17613A] transition-colors"
                    >
                      <span>{t('services.explore')}</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Why Choose Us */}
      <section className="bg-white py-8 sm:py-10 border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-[#F5F8F5] border border-[#E5E7EB] rounded-xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#17613A]">
              {t('home.whyChooseHeading')}
            </h2>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {reasons.map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-sm text-[#303030]">
                  <CheckCircle2
                    className="w-4 h-4 text-[#207747] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. AI Chatbot Preview */}
      <section className="bg-[#FDF3E7] text-[#303030] py-8 sm:py-10 border-t border-[#F47721]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17613A]">
              {t('home.chatbotHeading')}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#303030]/85 max-w-2xl">
              {t('home.chatbotDesc')}
            </p>
          </div>
          <Link
            to="/chatbot"
            className="shrink-0 inline-flex items-center gap-2.5 px-6 py-3 bg-[#F47721] hover:bg-[#d96312] text-white font-semibold rounded-xl transition-colors whitespace-nowrap"
          >
            <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0">
              <ChatbotIcon className="w-5 h-5 text-[#17613A]" />
            </span>
            <span>{t('home.chatbotCta')}</span>
          </Link>
        </div>
      </section>

    </div>
  );
};
