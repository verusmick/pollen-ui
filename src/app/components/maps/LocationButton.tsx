'use client';

import { useState, useEffect, useCallback } from 'react';
import { BiMap, BiX } from 'react-icons/bi';
import { TbLocationFilled } from 'react-icons/tb';

import { useTranslations } from 'next-intl';
import { usePollenDetailsChartStore } from '@/app/forecast/stores';
import { fetchAndShowPollenChart } from '@/app/forecast/utils';
import { Tooltip } from '@/app/components';
import { useCurrentLocationStore, usePartialLoadingStore } from '@/app/stores';

interface LocationButtonProps {
  tooltipText: string;
  pollenSelected: string;
  currentDate: string;
}

export const LocationButton = ({
  tooltipText,
  currentDate,
  pollenSelected,
}: LocationButtonProps) => {
  const t = useTranslations('forecastPage.show_your_location');
  const [open, setOpen] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<
    'idle' | 'granted' | 'denied' | 'prompt'
  >('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setChartLoading } = usePartialLoadingStore();
  const setLocation = useCurrentLocationStore((state) => state.setLocation);
  const { setShow: setShowPollenDetailsChart } = usePollenDetailsChartStore();

  // Check permission once
  useEffect(() => {
    if (!navigator.permissions) return;
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      setPermissionStatus(result.state);
      result.onchange = () => setPermissionStatus(result.state);
    });
  }, []);

  const getUserLocation = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }, []);

  const handleRequestPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setOpen(false);
    setLoading(true);
    setError(null);

    try {
      const position = await getUserLocation();
      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      setPermissionStatus('granted');
      setLocation(coords);
      setChartLoading(true);

      await fetchAndShowPollenChart({
        lat: coords.lat,
        lng: coords.lng,
        pollen: pollenSelected,
        date: currentDate,
        setShowPollenDetailsChart,
      });
    } catch (err: any) {
      if (err.code === err.PERMISSION_DENIED) {
        setPermissionStatus('denied');
        setError('Permission denied for geolocation.');
      } else {
        console.error('Error fetching pollen data:', err);
        setError('Failed to load pollen data. Please try again.');
      }
    } finally {
      setLoading(false);
      setChartLoading(false);
    }
  }, [
    currentDate,
    getUserLocation,
    pollenSelected,
    setChartLoading,
    setLocation,
    setShowPollenDetailsChart,
  ]);

  const renderStatusMessage = () => {
    if (loading) return null;
    if (error)
      return <p className="text-center text-sm text-red-400">⚠️ {error}</p>;
    if (permissionStatus === 'granted')
      return (
        <p className="text-center text-sm text-green-400">
          ✅ {t('description_permission_granted')}
        </p>
      );
    if (permissionStatus === 'denied')
      return (
        <p className="text-center text-sm text-red-400">
          ⚠️ {t('description_permission_denied')}
        </p>
      );
    return null;
  };

  return (
    <>
      <Tooltip text={tooltipText} position="left" visible={!open}>
        <button
          onClick={() => setOpen(true)}
          className="bg-card backdrop-blur-sm hover:bg-neutral-800 text-white
            p-3 rounded-full shadow-lg focus:outline-none transition
            border border-white/10 cursor-pointer"
          aria-label={t('title_button_location')}
        >
          <TbLocationFilled size={20} />
        </button>
      </Tooltip>

      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-card rounded-xl shadow-xl w-[360px] p-6 flex flex-col gap-4 text-white relative"
            aria-busy={loading}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
              aria-label="Cerrar modal"
            >
              <BiX size={22} />
            </button>

            <h2 className="text-xl font-semibold text-center">
              {t('name_company')}
            </h2>
            <p className="text-sm text-gray-300 text-center">
              {t('description_card_location')}
            </p>

            <button
              onClick={handleRequestPermission}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 
              text-white py-2 rounded-lg font-medium transition-all disabled:opacity-70"
              disabled={loading}
            >
              {loading ? (
                t('loading')
              ) : (
                <>
                  <BiMap size={20} /> {t('title_button_location')}
                </>
              )}
            </button>

            {renderStatusMessage()}
          </div>
        </div>
      )}
    </>
  );
};
