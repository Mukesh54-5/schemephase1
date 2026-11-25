import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full bg-[#17613A] text-white border-t-4 border-[#F47721]">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row lg:justify-evenly lg:items-start gap-8 lg:gap-0 text-center sm:text-left">
          {/* Project Overview */}
          <div className="space-y-3 lg:max-w-[270px] lg:shrink-0">
            <div>
              <h3 className="text-base font-bold text-[#F47721] leading-snug tracking-wide">
                {t('header.title')}
              </h3>
              <p className="text-xs font-semibold text-white mt-1.5 leading-relaxed">
                {t('header.hindiTitle')}
              </p>
              <p className="text-xs font-semibold text-white mt-1 leading-relaxed">
                {t('header.kannadaTitle')}
              </p>
            </div>
            <p className="text-sm text-white/85 leading-relaxed pt-0.5">
              {t('footer.aboutText')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="lg:shrink-0">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#F47721] mb-3">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2 text-sm text-white/90">
              <li>
                <Link to="/" className="hover:text-[#F47721] transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#F47721] transition-colors">
                  {t('nav.aboutUs')}
                </Link>
              </li>
              <li>
                <Link to="/eligibility" className="hover:text-[#F47721] transition-colors">
                  {t('nav.eligibilityChecker')}
                </Link>
              </li>
              <li>
                <Link to="/agri-map" className="hover:text-[#F47721] transition-colors">
                  {t('footer.agriMapServices')}
                </Link>
              </li>
              <li>
                <Link to="/chatbot" className="hover:text-[#F47721] transition-colors">
                  {t('footer.aiFarmerAssistant')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#F47721] transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Scheme & Agriculture Links */}
          <div className="lg:shrink-0">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#F47721] mb-3">
              {t('footer.schemeLinks')}
            </h4>
            <ul className="space-y-2 text-sm text-white/90">
              <li>
                <Link to="/schemes" className="hover:text-[#F47721] transition-colors">
                  {t('nav.allSchemes')}
                </Link>
              </li>
              <li>
                <Link to="/schemes?level=Central" className="hover:text-[#F47721] transition-colors">
                  {t('nav.centralSchemes')}
                </Link>
              </li>
              <li>
                <Link to="/schemes?level=State" className="hover:text-[#F47721] transition-colors">
                  {t('nav.stateSchemes')}
                </Link>
              </li>
              <li>
                <Link to="/agriculture/crop" className="hover:text-[#F47721] transition-colors">
                  {t('nav.crops')} &amp; {t('nav.soilInfo')}
                </Link>
              </li>
              <li>
                <Link to="/agriculture/technology" className="hover:text-[#F47721] transition-colors">
                  {t('nav.technologies')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:max-w-[255px] lg:shrink-0">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#F47721] mb-3">
              {t('footer.contactInfo')}
            </h4>
            <ul className="space-y-2.5 text-sm text-white/90">
              <li className="flex items-start justify-center sm:justify-start gap-2">
                <Phone className="w-4 h-4 text-[#F47721] shrink-0 mt-0.5" />
                <span className="tabular-nums">{t('contact.phone')}</span>
              </li>
              <li className="flex items-start justify-center sm:justify-start gap-2">
                <Mail className="w-4 h-4 text-[#F47721] shrink-0 mt-0.5" />
                <span className="break-words">{t('contact.email')}</span>
              </li>
              <li className="flex items-start justify-center sm:justify-start gap-2">
                <MapPin className="w-4 h-4 text-[#F47721] shrink-0 mt-0.5" />
                <span>{t('footer.locationAddress')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/20">
          <div className="flex items-center justify-center text-xs text-white/75 text-center">
            <span>{t('footer.copyright')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
