import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChatbotWidget } from '../components/ChatbotWidget';

export const ChatbotPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="sr-only">{t('chatbot.pageHeading')}</h1>
      <ChatbotWidget embedded />
    </div>
  );
};
