'use client';

import { CastingMap } from '@/app/casting/components';
import { PanelHeader } from '@/app/components';
import { useTranslations } from 'next-intl';

export const CastingMapContainer = () => {
  const t = useTranslations('castingPage');
  return (
    <div className="relative h-screen w-screen">
      <CastingMap />
      <div className="absolute top-8 left-8 z-50 flex flex-col gap-4">
        <PanelHeader title={t('title')} iconSrc="/zaum.png" />
      </div>
    </div>
  );
};

export default CastingMapContainer;
