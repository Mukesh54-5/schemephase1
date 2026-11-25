/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './context/AuthContext';
import { DynamicTranslationProvider } from './context/DynamicTranslationContext';
import { getNormalizedLang } from './translations/i18n';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { SchemesPage } from './pages/SchemesPage';
import { SchemeDetailPage } from './pages/SchemeDetailPage';
import { EligibilityPage } from './pages/EligibilityPage';
import { AgriculturePage } from './pages/AgriculturePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ChatbotPage } from './pages/ChatbotPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AgriMapPage } from './pages/AgriMapPage';

export default function App() {
  const { t, i18n } = useTranslation();
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);

  useEffect(() => {
    const lang = getNormalizedLang(i18n.language);
    document.documentElement.lang = lang;
    document.title = t('header.title');
  }, [i18n.language, t]);

  useEffect(() => {
    const handleQuotaExceeded = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  return (
    <AuthProvider>
      <DynamicTranslationProvider>
        {gmpQuotaExceeded && (
          <div
            role="alert"
            className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm flex items-center justify-center gap-4"
          >
            <span>
              {t('common.quotaBannerBeforeLink')}{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                {t('common.quotaBannerLinkText')}
              </a>{' '}
              {t('common.quotaBannerAfterLink')}
            </span>
            <button
              type="button"
              onClick={() => setGmpQuotaExceeded(false)}
              className="px-2.5 py-1 text-xs font-semibold border border-amber-400 rounded hover:bg-amber-100 shrink-0"
            >
              {t('common.dismiss')}
            </button>
          </div>
        )}
        <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <MainLayout>
                <HomePage />
              </MainLayout>
            }
          />
          <Route
            path="/schemes"
            element={
              <MainLayout>
                <SchemesPage />
              </MainLayout>
            }
          />
          <Route
            path="/schemes/:slug"
            element={
              <MainLayout>
                <SchemeDetailPage />
              </MainLayout>
            }
          />
          <Route
            path="/eligibility"
            element={
              <MainLayout>
                <EligibilityPage />
              </MainLayout>
            }
          />
          <Route
            path="/agriculture/:section"
            element={
              <MainLayout>
                <AgriculturePage />
              </MainLayout>
            }
          />
          <Route
            path="/agriculture"
            element={
              <MainLayout>
                <AgriculturePage />
              </MainLayout>
            }
          />
          <Route
            path="/login"
            element={
              <MainLayout>
                <LoginPage />
              </MainLayout>
            }
          />
          <Route
            path="/register"
            element={
              <MainLayout>
                <RegisterPage />
              </MainLayout>
            }
          />
          <Route
            path="/dashboard"
            element={
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            }
          />
          <Route
            path="/admin"
            element={
              <MainLayout>
                <AdminDashboardPage />
              </MainLayout>
            }
          />
          <Route
            path="/agri-map"
            element={
              <MainLayout>
                <AgriMapPage />
              </MainLayout>
            }
          />
          <Route
            path="/chatbot"
            element={
              <MainLayout hideFloatingChat>
                <ChatbotPage />
              </MainLayout>
            }
          />
          <Route
            path="/about"
            element={
              <MainLayout>
                <AboutPage />
              </MainLayout>
            }
          />
          <Route
            path="/contact"
            element={
              <MainLayout>
                <ContactPage />
              </MainLayout>
            }
          />
          <Route
            path="*"
            element={
              <MainLayout>
                <HomePage />
              </MainLayout>
            }
          />
        </Routes>
      </BrowserRouter>
      </DynamicTranslationProvider>
    </AuthProvider>
  );
}
