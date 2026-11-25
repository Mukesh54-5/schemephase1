import React, { useEffect, useState } from 'react';
import {
  APIProvider,
  APILoadingStatus,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useApiLoadingStatus,
  useAdvancedMarkerRef,
  useMap,
} from '@vis.gl/react-google-maps';
import { ExternalLink, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TranslatedText } from '../context/DynamicTranslationContext';
import type { AgriPlaceItem } from '../types';

interface AgriServicesMapProps {
  apiKey: string;
  center: { lat: number; lng: number };
  centerLabel?: string;
  places?: AgriPlaceItem[];
  selectedPlaceId?: string | null;
  onSelectPlace?: (place: AgriPlaceItem | null) => void;
  heightClassName?: string;
  zoom?: number;
  language?: string;
}

const MapViewportController: React.FC<{
  center: { lat: number; lng: number };
  places: AgriPlaceItem[];
  selectedPlaceId: string | null;
  defaultZoom: number;
}> = ({ center, places, selectedPlaceId, defaultZoom }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (selectedPlaceId) {
      const target = places.find((p) => p.id === selectedPlaceId);
      if (target) {
        map.panTo({ lat: target.latitude, lng: target.longitude });
        if ((map.getZoom() ?? 0) < 13) {
          map.setZoom(14);
        }
        return;
      }
    }

    if (places.length > 0) {
      let north = center.lat;
      let south = center.lat;
      let east = center.lng;
      let west = center.lng;
      for (const p of places) {
        if (p.latitude > north) north = p.latitude;
        if (p.latitude < south) south = p.latitude;
        if (p.longitude > east) east = p.longitude;
        if (p.longitude < west) west = p.longitude;
      }
      map.fitBounds(
        { north, south, east, west },
        { top: 48, right: 40, bottom: 48, left: 40 }
      );
    } else {
      map.panTo(center);
      map.setZoom(defaultZoom);
    }
  }, [map, center, places, selectedPlaceId, defaultZoom]);

  return null;
};

const PlaceMarkerWithInfo: React.FC<{
  place: AgriPlaceItem;
  isSelected: boolean;
  onSelect: (place: AgriPlaceItem) => void;
  onClose: () => void;
}> = ({ place, isSelected, onSelect, onClose }) => {
  const { t } = useTranslation();
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: place.latitude, lng: place.longitude }}
        title={place.name}
        zIndex={isSelected ? 50 : 10}
        onClick={() => onSelect(place)}
      >
        <Pin
          background={isSelected ? '#F47721' : '#207747'}
          borderColor={isSelected ? '#B84D08' : '#114B2C'}
          glyphColor="#FFFFFF"
          scale={isSelected ? 1.25 : 1.05}
        />
      </AdvancedMarker>

      {isSelected && marker && (
        <InfoWindow anchor={marker} maxWidth={280} onCloseClick={onClose}>
          <div className="p-1 text-[#303030] space-y-1.5">
            {place.primaryType && (
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#F47721]">
                <TranslatedText text={place.primaryType} />
              </div>
            )}
            <h4 className="text-sm font-bold text-[#17613A] leading-snug">
              <TranslatedText text={place.name} />
            </h4>
            <p className="text-xs text-[#303030]/85 leading-relaxed">
              <TranslatedText text={place.address} />
            </p>
            <div className="pt-1.5 flex flex-wrap items-center gap-2 border-t border-[#E5E7EB]">
              {place.directionsUri && (
                <a
                  href={place.directionsUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#17613A] text-white text-xs font-semibold rounded hover:bg-[#207747]"
                >
                  <Navigation className="w-3 h-3" aria-hidden="true" />
                  <span>{t('agriMap.directionsShort')}</span>
                </a>
              )}
              {place.googleMapsUri && (
                <a
                  href={place.googleMapsUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 border border-[#E5E7EB] text-[#17613A] text-xs font-semibold rounded hover:bg-[#F5F8F5]"
                >
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  <span>{t('agriMap.mapsShort')}</span>
                </a>
              )}
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

const FarmCenterMarker: React.FC<{
  center: { lat: number; lng: number };
  label: string;
}> = ({ center, label }) => {
  const { t } = useTranslation();
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [open, setOpen] = useState(false);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={center}
        title={label}
        zIndex={30}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Pin
          background="#17613A"
          borderColor="#FFFFFF"
          glyphColor="#F47721"
          scale={1.15}
        />
      </AdvancedMarker>
      {open && marker && (
        <InfoWindow anchor={marker} maxWidth={240} onCloseClick={() => setOpen(false)}>
          <div className="p-1 text-[#303030]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#207747]">
              {t('agriMap.selectedLocation')}
            </div>
            <div className="text-xs font-bold text-[#17613A] mt-0.5">
              <TranslatedText text={label} />
            </div>
            <div className="text-[11px] text-[#303030]/75 tabular-nums mt-0.5">
              {center.lat.toFixed(4)}°N, {center.lng.toFixed(4)}°E
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

const MapLoadStatusGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const status = useApiLoadingStatus();

  useEffect(() => {
    if (status === APILoadingStatus.AUTH_FAILURE) {
      window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    }
  }, [status]);

  if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#F5F8F5] text-center p-6">
        <div className="max-w-sm space-y-1.5">
          <div className="text-sm font-bold text-[#17613A]">{t('agriMap.mapUnavailableTitle')}</div>
          <p className="text-xs text-[#303030]/80">
            {t('agriMap.mapUnavailableDesc')}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export const AgriServicesMap: React.FC<AgriServicesMapProps> = ({
  apiKey,
  center,
  centerLabel,
  places = [],
  selectedPlaceId = null,
  onSelectPlace,
  heightClassName = 'h-[420px] sm:h-[500px]',
  zoom = 12,
  language = 'en',
}) => {
  const { t } = useTranslation();
  const resolvedCenterLabel = centerLabel || t('agriMap.defaultCenterLabel');

  if (!apiKey) {
    return (
      <div
        className={`w-full ${heightClassName} rounded-lg border border-[#E5E7EB] bg-[#F5F8F5] flex items-center justify-center p-6 text-center`}
      >
        <div className="max-w-sm space-y-1.5">
          <div className="text-sm font-bold text-[#17613A]">{t('agriMap.mapLoadingTitle')}</div>
          <p className="text-xs text-[#303030]/80">
            {t('agriMap.mapKeyMissing')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${heightClassName} rounded-lg overflow-hidden border border-[#E5E7EB]`}>
      <APIProvider
        apiKey={apiKey}
        libraries={['marker']}
        language={language || 'en'}
        region="IN"
      >
        <MapLoadStatusGuard>
          <GoogleMap
            mapId="DEMO_MAP_ID"
            defaultCenter={center}
            defaultZoom={zoom}
            gestureHandling="greedy"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
          >
            <MapViewportController
              center={center}
              places={places}
              selectedPlaceId={selectedPlaceId}
              defaultZoom={zoom}
            />
            <FarmCenterMarker center={center} label={resolvedCenterLabel} />
            {places.map((place) => (
              <PlaceMarkerWithInfo
                key={place.id}
                place={place}
                isSelected={selectedPlaceId === place.id}
                onSelect={(p) => onSelectPlace?.(p)}
                onClose={() => onSelectPlace?.(null)}
              />
            ))}
          </GoogleMap>
        </MapLoadStatusGuard>
      </APIProvider>
    </div>
  );
};
