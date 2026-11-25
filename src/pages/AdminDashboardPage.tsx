import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trash2, Plus, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TranslatedText } from '../context/DynamicTranslationContext';
import { tEnum } from '../translations/i18n';
import { INDIAN_STATES, type AgricultureItem, type Scheme } from '../types';

interface AdminFarmerRow {
  id: number;
  email: string;
  fullName: string;
  mobileNumber?: string | null;
  role: string;
  state?: string | null;
  district?: string | null;
  farmerCategory?: string | null;
  mainCrop?: string | null;
}

interface AdminInquiryRow {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  createdAt: string;
}

export const AdminDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, token, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<'schemes' | 'farmers' | 'agriculture' | 'inquiries'>('schemes');
  const [farmers, setFarmers] = useState<AdminFarmerRow[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [agriItems, setAgriItems] = useState<AgricultureItem[]>([]);
  const [inquiries, setInquiries] = useState<AdminInquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Scheme Form
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [governmentLevel, setGovernmentLevel] = useState<'Central' | 'State'>('Central');
  const [stateName, setStateName] = useState<string>('All India');
  const [category, setCategory] = useState('Income Support');
  const [overview, setOverview] = useState('');
  const [benefits, setBenefits] = useState('');
  const [officialUrl, setOfficialUrl] = useState('https://www.myscheme.gov.in/');

  // Add Agriculture Form
  const [agriSection, setAgriSection] = useState('crop');
  const [agriTitle, setAgriTitle] = useState('');
  const [agriSubtitle, setAgriSubtitle] = useState('');
  const [agriSummary, setAgriSummary] = useState('');

  const loadAdmin = async (authToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/overview', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load admin overview.');
      setFarmers(data.farmers || []);
      setSchemes(data.schemes || []);
      setAgriItems(data.agricultureItems || []);
      setInquiries(data.inquiries || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.role === 'admin') {
      loadAdmin(token);
    }
  }, [token, user]);

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="h-64 bg-white border border-[#E5E7EB] rounded-md animate-pulse" />
      </div>
    );
  }

  if (!user || !token) return <Navigate to="/login?redirect=%2Fadmin" replace />;
  if (user.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#17613A]">{t('admin.accessRequired')}</h1>
        <p className="mt-2 text-sm text-[#303030]/80">
          {t('admin.restrictedDesc')}
        </p>
        <Link
          to="/login?redirect=%2Fadmin"
          className="mt-5 inline-flex items-center px-5 py-2.5 bg-[#17613A] hover:bg-[#207747] text-white text-sm font-semibold rounded transition-colors"
        >
          {t('admin.signInAdminBtn')}
        </Link>
      </div>
    );
  }

  const handleAddScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/schemes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          shortName,
          governmentLevel,
          stateName: governmentLevel === 'Central' ? 'All India' : stateName,
          category,
          overview,
          benefits,
          officialUrl,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to add scheme');
      }
      setName('');
      setShortName('');
      setOverview('');
      setBenefits('');
      await loadAdmin(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create scheme.');
    }
  };

  const handleDeleteScheme = async (id: number) => {
    await fetch(`/api/admin/schemes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    await loadAdmin(token);
  };

  const handleAddAgri = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/agriculture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          section: agriSection,
          title: agriTitle,
          subtitle: agriSubtitle,
          summary: agriSummary,
        }),
      });
      if (!res.ok) throw new Error('Failed to add item');
      setAgriTitle('');
      setAgriSubtitle('');
      setAgriSummary('');
      await loadAdmin(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item.');
    }
  };

  const handleDeleteAgri = async (id: number) => {
    await fetch(`/api/admin/agriculture/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    await loadAdmin(token);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#F47721]">
            <ShieldCheck className="w-4 h-4" />
            {t('admin.protectedBadge')}
          </span>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#17613A]">
            {t('admin.title')}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab('schemes')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded border ${
              tab === 'schemes'
                ? 'bg-[#17613A] text-white border-[#17613A]'
                : 'bg-white text-[#303030] border-[#E5E7EB]'
            }`}
          >
            {t('admin.schemesTab', { count: schemes.length })}
          </button>
          <button
            type="button"
            onClick={() => setTab('farmers')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded border ${
              tab === 'farmers'
                ? 'bg-[#17613A] text-white border-[#17613A]'
                : 'bg-white text-[#303030] border-[#E5E7EB]'
            }`}
          >
            {t('admin.farmersTab', { count: farmers.length })}
          </button>
          <button
            type="button"
            onClick={() => setTab('agriculture')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded border ${
              tab === 'agriculture'
                ? 'bg-[#17613A] text-white border-[#17613A]'
                : 'bg-white text-[#303030] border-[#E5E7EB]'
            }`}
          >
            {t('admin.agricultureTab', { count: agriItems.length })}
          </button>
          <button
            type="button"
            onClick={() => setTab('inquiries')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded border ${
              tab === 'inquiries'
                ? 'bg-[#17613A] text-white border-[#17613A]'
                : 'bg-white text-[#303030] border-[#E5E7EB]'
            }`}
          >
            {t('admin.inquiriesTab', { count: inquiries.length })}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded text-xs">
          <TranslatedText text={error} />
        </div>
      )}

      {loading ? (
        <div className="h-64 bg-white border border-[#E5E7EB] rounded-md animate-pulse" />
      ) : tab === 'schemes' ? (
        <div className="space-y-6">
          <form
            onSubmit={handleAddScheme}
            className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-5"
          >
            <h2 className="text-lg font-bold text-[#17613A] flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>{t('admin.addSchemeTitle')}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <input
                type="text"
                required
                placeholder={t('admin.schemeNamePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-3 py-2 text-sm border border-[#E5E7EB] rounded sm:col-span-2"
              />
              <input
                type="text"
                required
                placeholder={t('admin.shortNamePlaceholder')}
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                className="px-3 py-2 text-sm border border-[#E5E7EB] rounded"
              />
              <select
                aria-label={t('admin.govLevelAria')}
                value={governmentLevel}
                onChange={(e) => {
                  const next = e.target.value as 'Central' | 'State';
                  setGovernmentLevel(next);
                  setStateName(next === 'Central' ? 'All India' : 'Andhra Pradesh');
                }}
                className="px-3 py-2 text-sm border border-[#E5E7EB] rounded bg-white"
              >
                <option value="Central">{tEnum(t, 'govLevels', 'Central')}</option>
                <option value="State">{tEnum(t, 'govLevels', 'State')}</option>
              </select>
              {governmentLevel === 'State' && (
                <select
                  aria-label={t('admin.stateNameAria')}
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="px-3 py-2 text-sm border border-[#E5E7EB] rounded bg-white"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {tEnum(t, 'states', st)}
                    </option>
                  ))}
                </select>
              )}
              <input
                type="text"
                required
                placeholder={t('admin.categoryPlaceholder')}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 text-sm border border-[#E5E7EB] rounded"
              />
              <input
                type="url"
                required
                placeholder={t('admin.officialUrlPlaceholder')}
                value={officialUrl}
                onChange={(e) => setOfficialUrl(e.target.value)}
                className="px-3 py-2 text-sm border border-[#E5E7EB] rounded sm:col-span-3"
              />
              <textarea
                required
                rows={2}
                placeholder={t('admin.overviewPlaceholder')}
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                className="px-3 py-2 text-sm border border-[#E5E7EB] rounded sm:col-span-2"
              />
              <textarea
                required
                rows={2}
                placeholder={t('admin.benefitsPlaceholder')}
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
                className="px-3 py-2 text-sm border border-[#E5E7EB] rounded sm:col-span-2"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-[#F47721] hover:bg-[#d96312] text-white text-sm font-semibold rounded"
            >
              {t('admin.publishSchemeBtn')}
            </button>
          </form>

          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F8F5] border-b border-[#E5E7EB] text-xs uppercase text-[#17613A]">
                <tr>
                  <th className="p-3.5">{t('admin.colScheme')}</th>
                  <th className="p-3.5">{t('admin.colLevel')}</th>
                  <th className="p-3.5">{t('admin.colCategory')}</th>
                  <th className="p-3.5">{t('admin.colVerified')}</th>
                  <th className="p-3.5 text-right">{t('admin.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {schemes.map((s) => (
                  <tr key={s.id}>
                    <td className="p-3.5 font-semibold text-[#17613A]">
                      <TranslatedText text={s.name} />
                    </td>
                    <td className="p-3.5">{tEnum(t, 'govLevels', s.governmentLevel)}</td>
                    <td className="p-3.5">{tEnum(t, 'schemeCategories', s.category)}</td>
                    <td className="p-3.5 tabular-nums">{s.lastVerifiedDate}</td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteScheme(s.id)}
                        aria-label={t('admin.deleteAria', { name: s.shortName })}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : tab === 'farmers' ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F8F5] border-b border-[#E5E7EB] text-xs uppercase text-[#17613A]">
              <tr>
                <th className="p-3.5">{t('admin.colName')}</th>
                <th className="p-3.5">{t('admin.colEmail')}</th>
                <th className="p-3.5">{t('admin.colStateDistrict')}</th>
                <th className="p-3.5">{t('admin.colCategory')}</th>
                <th className="p-3.5">{t('admin.colMainCrop')}</th>
                <th className="p-3.5">{t('admin.colRole')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {farmers.map((f) => (
                <tr key={f.id}>
                  <td className="p-3.5 font-semibold">{f.fullName}</td>
                  <td className="p-3.5">{f.email}</td>
                  <td className="p-3.5">
                    {f.state ? tEnum(t, 'states', f.state) : '—'}{' '}
                    {f.district ? `/ ${f.district}` : ''}
                  </td>
                  <td className="p-3.5">
                    {f.farmerCategory ? tEnum(t, 'farmerCategories', f.farmerCategory) : '—'}
                  </td>
                  <td className="p-3.5">
                    {f.mainCrop ? <TranslatedText text={f.mainCrop} /> : '—'}
                  </td>
                  <td className="p-3.5 font-semibold text-[#17613A]">
                    <TranslatedText text={f.role} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : tab === 'agriculture' ? (
        <div className="space-y-6">
          <form
            onSubmit={handleAddAgri}
            className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-5"
          >
            <h2 className="text-lg font-bold text-[#17613A]">
              {t('admin.addAgriTitle')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={agriSection}
                onChange={(e) => setAgriSection(e.target.value)}
                className="px-3 py-2 text-sm border border-[#E5E7EB] rounded bg-white"
              >
                <option value="crop">{t('agriculture.sections.crop.label')}</option>
                <option value="soil">{t('agriculture.sections.soil.label')}</option>
                <option value="animal">{t('agriculture.sections.animal.label')}</option>
                <option value="organic">{t('agriculture.sections.organic.label')}</option>
                <option value="inorganic">{t('agriculture.sections.inorganic.label')}</option>
                <option value="technology">{t('agriculture.sections.technology.label')}</option>
              </select>
              <input
                type="text"
                required
                placeholder={t('admin.titlePlaceholder')}
                value={agriTitle}
                onChange={(e) => setAgriTitle(e.target.value)}
                className="px-3 py-2 text-sm border border-[#E5E7EB] rounded"
              />
              <input
                type="text"
                required
                placeholder={t('admin.subtitlePlaceholder')}
                value={agriSubtitle}
                onChange={(e) => setAgriSubtitle(e.target.value)}
                className="px-3 py-2 text-sm border border-[#E5E7EB] rounded"
              />
              <textarea
                required
                rows={2}
                placeholder={t('admin.summaryPlaceholder')}
                value={agriSummary}
                onChange={(e) => setAgriSummary(e.target.value)}
                className="px-3 py-2 text-sm border border-[#E5E7EB] rounded sm:col-span-3"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-[#17613A] hover:bg-[#207747] text-white text-sm font-semibold rounded"
            >
              {t('admin.addAgriBtn')}
            </button>
          </form>

          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F8F5] border-b border-[#E5E7EB] text-xs uppercase text-[#17613A]">
                <tr>
                  <th className="p-3.5">{t('admin.colSection')}</th>
                  <th className="p-3.5">{t('admin.colTitle')}</th>
                  <th className="p-3.5">{t('admin.colSubtitle')}</th>
                  <th className="p-3.5 text-right">{t('admin.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {agriItems.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3.5 uppercase text-xs font-bold text-[#207747]">
                      {t(`agriculture.sections.${item.section}.label`, {
                        defaultValue: item.section,
                      })}
                    </td>
                    <td className="p-3.5 font-semibold">
                      <TranslatedText text={item.title} />
                    </td>
                    <td className="p-3.5">
                      <TranslatedText text={item.subtitle} />
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteAgri(item.id)}
                        aria-label={t('admin.deleteAria', { name: item.title })}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-x-auto">
          {inquiries.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#303030]/75">
              {t('admin.noInquiries')}
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F8F5] border-b border-[#E5E7EB] text-xs uppercase text-[#17613A]">
                <tr>
                  <th className="p-3.5">{t('admin.colSender')}</th>
                  <th className="p-3.5">{t('admin.colContact')}</th>
                  <th className="p-3.5">{t('admin.colSubject')}</th>
                  <th className="p-3.5">{t('admin.colMessage')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {inquiries.map((inq) => (
                  <tr key={inq.id}>
                    <td className="p-3.5 font-semibold text-[#17613A]">{inq.name}</td>
                    <td className="p-3.5 text-xs">
                      <div>{inq.email}</div>
                      {inq.phone && <div className="text-[#303030]/70">{inq.phone}</div>}
                    </td>
                    <td className="p-3.5 font-medium">
                      <TranslatedText text={inq.subject} />
                    </td>
                    <td className="p-3.5 text-xs text-[#303030]/90 max-w-md">
                      <TranslatedText text={inq.message} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};
