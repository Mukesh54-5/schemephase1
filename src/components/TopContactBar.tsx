import React from 'react';
import { ExternalLink, Megaphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  ONGOING_SCHEMES_TICKER,
  type OngoingSchemeTickerItem,
} from '../utils/ongoingSchemesTicker';

export const TopContactBar: React.FC = () => {
  const { t } = useTranslation();

  const renderTickerSet = (items: OngoingSchemeTickerItem[], isDuplicate: boolean) => (
    <div
      className="flex items-center shrink-0"
      aria-hidden={isDuplicate ? true : undefined}
    >
      {items.map((item) => {
        const shortName = t(`ticker.items.${item.slug}.shortName`, {
          defaultValue: item.shortName,
        });
        const highlight = t(`ticker.items.${item.slug}.highlight`, {
          defaultValue: item.highlight,
        });
        return (
          <React.Fragment key={`${isDuplicate ? 'dup' : 'main'}-${item.slug}`}>
            <a
              href={item.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={isDuplicate ? -1 : undefined}
              aria-label={
                isDuplicate
                  ? undefined
                  : `${shortName}: ${highlight} — ${t('ticker.openOfficialPortal')} (${item.portalDomain})`
              }
              title={`${t('ticker.officialWebsitePrefix')}: ${item.officialUrl}`}
              className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-white/95 hover:text-white hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47721] transition-colors whitespace-nowrap shrink-0"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#F47721] shrink-0" aria-hidden="true" />
              <span className="font-semibold tracking-tight text-white">
                {shortName}
              </span>
              <span className="hidden sm:inline text-emerald-100/90 font-normal">
                — {highlight}
              </span>
              <span className="text-[10px] font-mono text-white/90 bg-white/15 px-1.5 py-0.5 rounded group-hover:bg-[#F47721] group-hover:text-white transition-colors">
                {item.portalDomain}
              </span>
              <ExternalLink
                className="w-3 h-3 text-[#FFB076] group-hover:text-white transition-colors shrink-0"
                aria-hidden="true"
              />
            </a>
            <span className="text-white/30 select-none px-1.5 text-xs" aria-hidden="true">
              •
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <div
      className="w-full bg-[#17613A] text-white border-b border-white/15 h-10 flex items-center overflow-hidden"
      role="region"
      aria-label={t('ticker.regionLabel')}
    >
      <div className="w-full pl-2 sm:pl-3 pr-0 flex items-center gap-2 sm:gap-2.5 overflow-hidden">
        <span className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase bg-[#F47721] text-white px-2 sm:px-2.5 py-0.5 rounded-sm shadow-xs whitespace-nowrap">
          <Megaphone className="w-3 h-3 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">{t('ticker.ongoingSchemes')}</span>
          <span className="sm:hidden">{t('ticker.schemesShort')}</span>
        </span>

        <div className="top-schemes-marquee-container relative flex-1 min-w-0 overflow-hidden top-schemes-edge-fade">
          <div className="top-schemes-marquee-track">
            {renderTickerSet(ONGOING_SCHEMES_TICKER, false)}
            {renderTickerSet(ONGOING_SCHEMES_TICKER, true)}
          </div>
        </div>
      </div>
    </div>
  );
};

