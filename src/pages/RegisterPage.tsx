import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TranslatedText } from '../context/DynamicTranslationContext';

function getSafeRedirect(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) {
    return '/dashboard';
  }
  return raw;
}

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading, registerWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const rawRedirect = searchParams.get('redirect');
  const redirectTarget = getSafeRedirect(rawRedirect);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate(redirectTarget, { replace: true });
    }
  }, [user, loading, redirectTarget, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (fullName.trim().length < 2) {
      setError(t('auth.nameLengthError'));
      return;
    }
    const mobileDigits = mobileNumber.replace(/\D/g, '');
    if (mobileDigits.length < 10 || mobileDigits.length > 15) {
      setError(t('auth.mobileError'));
      return;
    }
    if (password.length < 6) {
      setError(t('auth.passwordLengthError'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatchError'));
      return;
    }

    setSubmitting(true);
    try {
      await registerWithEmail({
        fullName,
        email,
        mobileNumber,
        password,
        confirmPassword,
      });
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.registerFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await loginWithGoogle();
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.googleFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const loginLink = rawRedirect
    ? `/login?redirect=${encodeURIComponent(redirectTarget)}`
    : '/login';

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white border border-[#E5E7EB] rounded-md p-6 sm:p-8">
        <span className="text-xs font-bold uppercase tracking-wider text-[#F47721]">
          {t('auth.createAccountBadge')}
        </span>
        <h1 className="mt-1 text-2xl font-extrabold text-[#17613A]">
          {t('auth.registerTitle')}
        </h1>
        <p className="mt-1.5 text-sm text-[#303030]/80">
          {t('auth.registerDesc')}
        </p>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded p-3">
            <TranslatedText text={error} />
          </div>
        )}

        <button
          type="button"
          disabled={submitting}
          onClick={handleGoogleSignUp}
          className="mt-5 w-full py-2.5 px-4 border border-[#E5E7EB] hover:bg-[#F5F8F5] text-[#303030] text-sm font-semibold rounded flex items-center justify-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M12 10.2v3.9h5.5c-.2 1.2-1.4 3.6-5.5 3.6-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.9 1.5l2.7-2.6C16.9 3 14.7 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.2-.2-2H12z"
            />
          </svg>
          <span>{t('auth.signUpWithGoogle')}</span>
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-[#303030]/60">
          <div className="flex-1 h-px bg-[#E5E7EB]" />
          <span>{t('auth.orRegisterWithDetails')}</span>
          <div className="flex-1 h-px bg-[#E5E7EB]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#17613A] mb-1">
              {t('auth.fullNameLabel')}
            </label>
            <input
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t('auth.fullNamePlaceholder')}
              className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded focus:outline-none focus:border-[#17613A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17613A] mb-1">
              {t('auth.emailLabel')}
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded focus:outline-none focus:border-[#17613A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17613A] mb-1">
              {t('auth.mobileLabel')}
            </label>
            <input
              type="tel"
              required
              autoComplete="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder={t('auth.mobilePlaceholder')}
              className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded focus:outline-none focus:border-[#17613A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17613A] mb-1">
              {t('auth.passwordLabel')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.newPasswordPlaceholder')}
                className="w-full px-3 py-2 pr-10 text-sm border border-[#E5E7EB] rounded focus:outline-none focus:border-[#17613A]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#303030]/60 hover:text-[#17613A]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17613A] mb-1">
              {t('auth.confirmPasswordLabel')}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={6}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                className="w-full px-3 py-2 pr-10 text-sm border border-[#E5E7EB] rounded focus:outline-none focus:border-[#17613A]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword ? t('auth.hideConfirmPassword') : t('auth.showConfirmPassword')
                }
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#303030]/60 hover:text-[#17613A]"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-[#F47721] hover:bg-[#d96312] disabled:opacity-60 text-white text-sm font-semibold rounded transition-colors"
          >
            {submitting ? t('auth.creatingAccount') : t('auth.createAccountBtn')}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-[#303030]/80">
          {t('auth.alreadyRegistered')}{' '}
          <Link to={loginLink} className="font-bold text-[#17613A] hover:underline">
            {t('auth.loginHere')}
          </Link>
        </p>
      </div>
    </div>
  );
};
