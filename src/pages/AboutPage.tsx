import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Target } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  const rawObjectives = t('about.objectives', { returnObjects: true });
  const objectives = Array.isArray(rawObjectives) ? (rawObjectives as string[]) : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <section className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17613A]">
          {t('about.title')}
        </h1>
        <p className="mt-4 text-base text-[#303030] leading-relaxed">
          {t('about.body')}
        </p>
      </section>

      <section id="objectives" className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-5">
          <Target className="w-5 h-5 text-[#17613A]" />
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#17613A]">
            {t('about.objectivesTitle')}
          </h2>
        </div>
        <ul className="space-y-3">
          {objectives.map((obj) => (
            <li key={obj} className="flex items-start gap-2.5 text-sm sm:text-base text-[#303030]">
              <CheckCircle2 className="w-5 h-5 text-[#207747] shrink-0 mt-0.5" />
              <span>{obj}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
