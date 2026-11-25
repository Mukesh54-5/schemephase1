import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import { TranslatedText } from '../context/DynamicTranslationContext';
import { sendContactMessage } from '../services/api';

export const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await sendContactMessage({ name, email, phone, subject, message });
      setSuccessMsg(res.message || t('contactPage.successDefault'));
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t('contactPage.errorFallback'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-7 sm:py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17613A]">
          {t('contactPage.title')}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#303030]/85 max-w-2xl">
          {t('contactPage.subtitle')}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-7 space-y-5"
      >
        <h2 className="text-lg font-bold text-[#17613A]">{t('contactPage.formTitle')}</h2>

        {successMsg && (
          <div className="bg-[#F5F8F5] border border-[#207747]/40 text-[#17613A] text-sm rounded p-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              <TranslatedText text={successMsg} />
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded p-3">
            <TranslatedText text={errorMsg} />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#17613A] mb-1">
              {t('contactPage.nameLabel')}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17613A] mb-1">
              {t('contactPage.emailLabel')}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#17613A] mb-1">
              {t('contactPage.phoneLabel')}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17613A] mb-1">
              {t('contactPage.subjectLabel')}
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t('contactPage.subjectPlaceholder')}
              className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#17613A] mb-1">
            {t('contactPage.messageLabel')}
          </label>
          <textarea
            rows={4}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('contactPage.messagePlaceholder')}
            className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-[#F47721] hover:bg-[#d96312] disabled:opacity-60 text-white text-sm font-semibold rounded transition-colors"
        >
          {submitting ? t('contactPage.sendingBtn') : t('contactPage.submitBtn')}
        </button>
      </form>
    </div>
  );
};
