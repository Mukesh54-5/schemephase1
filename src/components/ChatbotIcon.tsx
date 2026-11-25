import React from 'react';

interface ChatbotIconProps {
  className?: string;
}

export const ChatbotIcon: React.FC<ChatbotIconProps> = ({ className = 'w-7 h-7' }) => {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Antenna stem & agricultural leaf sprout crown */}
      <path
        d="M32 16V10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M32 10C32 6 36.5 3.5 41 4.5C40 9 36.5 11.5 32 10Z"
        fill="#4ADE80"
        stroke="#114B2C"
        strokeWidth="1.5"
      />
      <path
        d="M32 10C32 6 27.5 4 23.5 5.5C24.5 9.5 28 11.5 32 10Z"
        fill="#86EFAC"
        stroke="#114B2C"
        strokeWidth="1.5"
      />

      {/* Side headset earpieces */}
      <rect x="7" y="27" width="6" height="14" rx="3" fill="#F47721" stroke="#FFFFFF" strokeWidth="1.5" />
      <rect x="51" y="27" width="6" height="14" rx="3" fill="#F47721" stroke="#FFFFFF" strokeWidth="1.5" />

      {/* Main chatbot head */}
      <rect
        x="12"
        y="16"
        width="40"
        height="34"
        rx="12"
        fill="#FFFFFF"
        stroke="#17613A"
        strokeWidth="2.5"
      />

      {/* Inner visor screen */}
      <rect
        x="17"
        y="22"
        width="30"
        height="17"
        rx="7"
        fill="#17613A"
      />

      {/* Friendly glowing eyes */}
      <circle cx="25.5" cy="30" r="3" fill="#FDE047" />
      <circle cx="38.5" cy="30" r="3" fill="#FDE047" />
      <circle cx="26.5" cy="29" r="1" fill="#FFFFFF" />
      <circle cx="39.5" cy="29" r="1" fill="#FFFFFF" />

      {/* Warm friendly smile */}
      <path
        d="M25 43.5C27.5 46 36.5 46 39 43.5"
        stroke="#17613A"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Chat bubble pointer */}
      <path
        d="M22 50L18 57L28 50"
        fill="#FFFFFF"
        stroke="#17613A"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <rect x="21" y="48" width="9" height="3" fill="#FFFFFF" />
    </svg>
  );
};
