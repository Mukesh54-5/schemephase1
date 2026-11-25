import React from 'react';
import { TopContactBar } from '../components/TopContactBar';
import { MainHeader } from '../components/MainHeader';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ChatbotWidget } from '../components/ChatbotWidget';

export const MainLayout: React.FC<{ children: React.ReactNode; hideFloatingChat?: boolean }> = ({
  children,
  hideFloatingChat = false,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F8F5] text-[#303030]">
      <TopContactBar />
      <MainHeader />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      {!hideFloatingChat && <ChatbotWidget />}
    </div>
  );
};
