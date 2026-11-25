import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Globe, Menu, X, User, LogOut, ShieldCheck, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ChatbotIcon } from './ChatbotIcon';

import { getNormalizedLang } from '../translations/i18n';

interface DropdownItem {
  label: string;
  to: string;
}

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = getNormalizedLang(i18n.language);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  const changeLang = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('farmer_portal_lang', code);
    setOpenDropdown(null);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate('/');
  };

  const schemeItems: DropdownItem[] = [
    { label: t('nav.allSchemes'), to: '/schemes' },
    { label: t('nav.centralSchemes'), to: '/schemes?level=Central' },
    { label: t('nav.stateSchemes'), to: '/schemes?level=State' },
    { label: t('nav.eligibilityChecker'), to: '/eligibility' },
  ];

  const farmingItems: DropdownItem[] = [
    { label: t('nav.crops'), to: '/agriculture/crop' },
    { label: t('nav.soilInfo'), to: '/agriculture/soil' },
    { label: t('nav.farmAnimals'), to: '/agriculture/animal' },
    { label: t('nav.organicFarming'), to: '/agriculture/organic' },
    { label: t('nav.inorganicFarming'), to: '/agriculture/inorganic' },
  ];

  const techItems: DropdownItem[] = [
    { label: t('nav.modernFarming'), to: '/agriculture/technology' },
    { label: t('nav.irrigationTech'), to: '/agriculture/technology?focus=irrigation' },
    { label: t('nav.agriMachinery'), to: '/agriculture/technology?focus=machinery' },
    { label: t('nav.foreignAgTech'), to: '/agriculture/technology?focus=foreign' },
  ];

  const renderDesktopDropdown = (
    keyName: string,
    label: string,
    items: DropdownItem[],
    activePrefix?: string
  ) => {
    const isOpen = openDropdown === keyName;
    const isActive = activePrefix ? location.pathname.startsWith(activePrefix) : false;

    return (
      <div
        className="relative"
        onMouseEnter={() => setOpenDropdown(keyName)}
        onMouseLeave={() => setOpenDropdown(null)}
      >
        <button
          type="button"
          onClick={() => setOpenDropdown(isOpen ? null : keyName)}
          className={`flex items-center gap-1 px-2 xl:px-2.5 py-3.5 text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
            isActive ? 'text-[#F47721]' : 'text-white hover:text-[#F47721]'
          }`}
          aria-expanded={isOpen}
        >
          <span>{label}</span>
          <ChevronDown className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        </button>

        {isOpen && (
          <div className="absolute left-0 top-full w-max bg-white text-[#303030] border border-[#E5E7EB] shadow-lg z-50 py-1">
            {items.map((item) => (
              <Link
                key={item.to + item.label}
                to={item.to}
                onClick={() => setOpenDropdown(null)}
                className="block px-4 py-2 text-sm whitespace-nowrap hover:bg-[#F5F8F5] hover:text-[#17613A] font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderMobileAccordion = (keyName: string, label: string, items: DropdownItem[]) => {
    const expanded = mobileExpanded === keyName;
    return (
      <div className="border-b border-white/10">
        <button
          type="button"
          onClick={() => setMobileExpanded(expanded ? null : keyName)}
          className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-white hover:bg-[#207747]"
        >
          <span>{label}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
        {expanded && (
          <div className="bg-[#114B2C] py-1">
            {items.map((item) => (
              <Link
                key={item.to + item.label}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="block px-7 py-2.5 text-sm text-white/90 hover:text-[#F47721]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav
      className="sticky top-0 z-40 w-full bg-[#17613A] text-white shadow-sm border-b border-[#114B2C]"
      aria-label={t('nav.mainAria')}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="flex-1 flex items-center justify-start gap-2 xl:gap-4 2xl:gap-6">
            <Link
              to="/"
              className="px-2 xl:px-2.5 py-3.5 text-sm font-medium text-white hover:text-[#F47721] whitespace-nowrap shrink-0 transition-colors"
            >
              {t('nav.home')}
            </Link>

            <Link
              to="/about"
              className={`px-2 xl:px-2.5 py-3.5 text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                location.pathname.startsWith('/about') ? 'text-[#F47721]' : 'text-white hover:text-[#F47721]'
              }`}
            >
              {t('nav.aboutUs')}
            </Link>
            {renderDesktopDropdown('schemes', t('nav.schemes'), schemeItems, '/schemes')}
            {renderDesktopDropdown('farming', t('nav.farmingInfo'), farmingItems, '/agriculture')}
            {renderDesktopDropdown('tech', t('nav.technologies'), techItems)}

            <Link
              to="/agri-map"
              className={`inline-flex items-center gap-1 px-2 xl:px-2.5 py-3.5 text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                location.pathname === '/agri-map' ? 'text-[#F47721]' : 'text-white hover:text-[#F47721]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{t('nav.agriMap')}</span>
            </Link>

            {/* Language Selector Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setOpenDropdown('lang')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'lang' ? null : 'lang')}
                className="flex items-center gap-1.5 px-2 xl:px-2.5 py-3.5 text-sm font-medium text-white hover:text-[#F47721] whitespace-nowrap shrink-0 transition-colors"
                aria-expanded={openDropdown === 'lang'}
              >
                <Globe className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>
                  {currentLang === 'hi'
                    ? 'हिंदी'
                    : currentLang === 'kn'
                    ? 'ಕನ್ನಡ'
                    : 'English'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              </button>

              {openDropdown === 'lang' && (
                <div className="absolute right-0 top-full w-40 bg-white text-[#303030] border border-[#E5E7EB] shadow-lg z-50 py-1">
                  <button
                    type="button"
                    onClick={() => changeLang('en')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-[#F5F8F5] ${
                      currentLang === 'en' ? 'font-bold text-[#17613A]' : ''
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => changeLang('hi')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-[#F5F8F5] ${
                      currentLang === 'hi' ? 'font-bold text-[#17613A]' : ''
                    }`}
                  >
                    हिंदी (Hindi)
                  </button>
                  <button
                    type="button"
                    onClick={() => changeLang('kn')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-[#F5F8F5] ${
                      currentLang === 'kn' ? 'font-bold text-[#17613A]' : ''
                    }`}
                  >
                    ಕನ್ನಡ (Kannada)
                  </button>
                </div>
              )}
            </div>

            <Link
              to="/contact"
              className={`px-2 xl:px-2.5 py-3.5 text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                location.pathname === '/contact' ? 'text-[#F47721]' : 'text-white hover:text-[#F47721]'
              }`}
            >
              {t('nav.contact')}
            </Link>
          </div>

          {/* AI Assistant Icon & Auth / User Actions at end of navbar */}
          <div className="shrink-0 flex items-center gap-2">
            <Link
              to="/chatbot"
              aria-label={t('nav.aiAssistant')}
              title={t('nav.aiAssistant')}
              className={`inline-flex items-center justify-center p-2 rounded-full shrink-0 transition-colors ${
                location.pathname === '/chatbot'
                  ? 'bg-[#F47721] text-white'
                  : 'hover:bg-[#207747] text-white'
              }`}
            >
              <ChatbotIcon className="w-6 h-6 shrink-0" />
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-[#207747] hover:bg-[#F47721] text-white rounded transition-colors whitespace-nowrap shrink-0"
                >
                  <User className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t('nav.dashboard')}</span>
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-[#F47721] hover:bg-[#d96312] text-white rounded transition-colors whitespace-nowrap shrink-0"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t('nav.admin')}</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium text-white/90 hover:text-[#F47721] transition-colors whitespace-nowrap shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t('nav.logout')}</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-medium text-white hover:text-[#F47721] transition-colors whitespace-nowrap shrink-0"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-sm font-semibold bg-[#F47721] hover:bg-[#d96312] text-white rounded transition-colors whitespace-nowrap shrink-0"
                >
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Header Bar */}
        <div className="flex lg:hidden items-center justify-between py-2.5">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-white hover:bg-[#207747] rounded min-h-[40px]"
            aria-label={t('nav.toggleMenu')}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            <span>{t('nav.menu')}</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Compact Language Quick-Switch on Mobile */}
            <select
              aria-label={t('nav.selectLanguage')}
              value={currentLang}
              onChange={(e) => changeLang(e.target.value)}
              className="bg-[#207747] text-white text-xs font-medium px-2.5 py-1.5 rounded border border-white/20 min-h-[36px]"
            >
              <option value="en">EN</option>
              <option value="hi">हिंदी</option>
              <option value="kn">ಕನ್ನಡ</option>
            </select>

            {user ? (
              <Link
                to="/dashboard"
                className="px-3 py-1.5 text-xs font-semibold bg-[#F47721] text-white rounded min-h-[36px] flex items-center"
              >
                {t('nav.dashboard')}
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-semibold bg-[#F47721] text-white rounded min-h-[36px] flex items-center"
              >
                {t('nav.login')}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#17613A] border-t border-white/15 max-h-[80vh] overflow-y-auto">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="block px-4 py-3 text-sm font-medium text-white border-b border-white/10 hover:bg-[#207747]"
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileOpen(false)}
            className="block px-4 py-3 text-sm font-medium text-white border-b border-white/10 hover:bg-[#207747]"
          >
            {t('nav.aboutUs')}
          </Link>
          {renderMobileAccordion('schemes', t('nav.schemes'), schemeItems)}
          {renderMobileAccordion('farming', t('nav.farmingInfo'), farmingItems)}
          {renderMobileAccordion('tech', t('nav.technologies'), techItems)}
          <Link
            to="/agri-map"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-white border-b border-white/10 hover:bg-[#207747]"
          >
            <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{t('nav.agriMapFull')}</span>
          </Link>
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <Link
              to="/contact"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-white hover:text-[#F47721]"
            >
              {t('nav.contact')}
            </Link>
            <Link
              to="/chatbot"
              onClick={() => setMobileOpen(false)}
              aria-label={t('nav.aiAssistant')}
              title={t('nav.aiAssistant')}
              className="p-1.5 rounded-full hover:bg-[#207747] transition-colors"
            >
              <ChatbotIcon className="w-6 h-6 shrink-0" />
            </Link>
          </div>
          {user ? (
            <div className="p-4 flex flex-col gap-2">
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-2.5 bg-[#207747] text-white text-sm font-medium rounded"
              >
                {t('nav.dashboard')}
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-2.5 bg-[#F47721] text-white text-sm font-medium rounded"
                >
                  {t('nav.admin')}
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-center py-2.5 border border-white/30 text-white text-sm font-medium rounded"
              >
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-2 gap-3">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="text-center py-2.5 border border-white/40 text-white text-sm font-medium rounded"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="text-center py-2.5 bg-[#F47721] text-white text-sm font-semibold rounded"
              >
                {t('nav.register')}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
