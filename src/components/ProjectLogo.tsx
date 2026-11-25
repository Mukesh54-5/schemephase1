import React from 'react';

export const ProjectLogo: React.FC<{ className?: string }> = ({
  className = 'w-20 h-20 sm:w-24 sm:h-24',
}) => (
  <div
    className={`logo-3d-stage relative inline-flex items-center justify-center select-none ${className}`}
    role="img"
    aria-label="KRISHI SANGRAH Emblem"
  >
    <div className="logo-3d-card relative w-full h-full">
      {/* 3D back rim layer */}
      <div
        aria-hidden="true"
        className="logo-3d-depth-ring absolute inset-0 rounded-full bg-gradient-to-br from-[#17613A] via-[#207747] to-[#F47721] opacity-90 shadow-[0_10px_22px_rgba(23,97,58,0.28)]"
      />
      {/* Elevated crisp emblem face */}
      <div className="logo-3d-face relative w-full h-full rounded-full overflow-hidden bg-white p-1 border-2 border-[#17613A]/20 shadow-[inset_0_1px_3px_rgba(255,255,255,0.9),0_6px_14px_rgba(15,23,42,0.16)]">
        <img
          src="/assets/aistudio/6_61ef9bb7.webp"
          alt="KRISHI SANGRAH Agriculture & Mechanization Emblem"
          decoding="async"
          className="w-full h-full object-contain rounded-full contrast-[1.08] saturate-[1.12] brightness-[1.01]"
        />
        {/* Subtle specular light sweep */}
        <div
          aria-hidden="true"
          className="logo-3d-sheen pointer-events-none absolute -inset-y-4 w-8 bg-gradient-to-r from-transparent via-white/60 to-transparent"
        />
      </div>
    </div>
  </div>
);

export const AgriculturalIllustration: React.FC<{ className?: string }> = ({
  className = 'w-20 h-20 sm:w-24 sm:h-24',
}) => (
  <div
    className={`logo-3d-stage relative inline-flex items-center justify-center select-none ${className}`}
    role="img"
    aria-label="Livestock and Sustainable Farming Emblem"
  >
    <div className="logo-3d-card-alt relative w-full h-full">
      {/* 3D back rim layer */}
      <div
        aria-hidden="true"
        className="logo-3d-depth-ring absolute inset-0 rounded-full bg-gradient-to-br from-[#207747] via-[#17613A] to-[#F47721] opacity-90 shadow-[0_10px_22px_rgba(23,97,58,0.28)]"
      />
      {/* Elevated crisp emblem face */}
      <div className="logo-3d-face relative w-full h-full rounded-full overflow-hidden bg-white border-2 border-[#207747]/20 shadow-[inset_0_1px_3px_rgba(255,255,255,0.9),0_6px_14px_rgba(15,23,42,0.16)]">
        <img
          src="/assets/aistudio/image_028a4b78.png"
          alt="KRISHI SANGRAH Livestock and Crop Harmony Emblem"
          decoding="async"
          className="w-full h-full object-cover scale-[1.45] contrast-[1.1] saturate-[1.14]"
        />
        {/* Subtle specular light sweep */}
        <div
          aria-hidden="true"
          className="logo-3d-sheen pointer-events-none absolute -inset-y-4 w-8 bg-gradient-to-r from-transparent via-white/60 to-transparent"
        />
      </div>
    </div>
  </div>
);
