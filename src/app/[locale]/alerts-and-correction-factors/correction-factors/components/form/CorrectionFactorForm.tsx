'use client';

import type { CorrectionFactorLocationOption } from '@/lib/api/correctionFactors';
import { useTranslations } from 'next-intl';
import type {
  CorrectionFactorFormDerivedState,
  CorrectionFactorFormErrors,
  CorrectionFactorFormValues,
} from '../../types';
import { CorrectionFactorDistributionSection } from './CorrectionFactorDistributionSection';
import { CorrectionFactorFormHeader } from './CorrectionFactorFormHeader';
import { CorrectionFactorMetaFields } from './CorrectionFactorMetaFields';

interface CorrectionFactorFormProps {
  values: CorrectionFactorFormValues;
  errors: CorrectionFactorFormErrors;
  derived: CorrectionFactorFormDerivedState;
  locationOptions: CorrectionFactorLocationOption[];
  pollenOptions: string[];
  locationsLoading?: boolean;
  pollensLoading?: boolean;
  saving: boolean;
  submitError?: string | null;
  canAddRow: boolean;
  getPollenOptions: (currentRowPollen: string) => string[];
  onLocationChange: (value: string) => void;
  onBasePollenChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onDetectedEventsChange: (value: string) => void;
  onPublishChange: (value: boolean) => void;
  onAddRow: () => void;
  onPollenChange: (clientId: string, pollen: string) => void;
  onReviewedEventsChange: (clientId: string, reviewedEvents: string) => void;
  onRemoveRow: (clientId: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export function CorrectionFactorForm({
  values,
  errors,
  derived,
  locationOptions,
  pollenOptions,
  locationsLoading = false,
  pollensLoading = false,
  saving,
  submitError,
  canAddRow,
  getPollenOptions,
  onLocationChange,
  onBasePollenChange,
  onStartDateChange,
  onEndDateChange,
  onDetectedEventsChange,
  onPublishChange,
  onAddRow,
  onPollenChange,
  onReviewedEventsChange,
  onRemoveRow,
  onCancel,
  onSubmit,
}: CorrectionFactorFormProps) {
  const t = useTranslations('correctionFactorsPage.form.preview');

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <CorrectionFactorFormHeader
        saving={saving}
        submitError={submitError}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="space-y-4">
          <CorrectionFactorMetaFields
            values={values}
            errors={errors}
            locationOptions={locationOptions}
            pollenOptions={pollenOptions}
            locationsLoading={locationsLoading}
            pollensLoading={pollensLoading}
            onLocationChange={onLocationChange}
            onBasePollenChange={onBasePollenChange}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
            onDetectedEventsChange={onDetectedEventsChange}
            onPublishChange={onPublishChange}
          />

          <CorrectionFactorDistributionSection
            values={values}
            derived={derived}
            errors={errors}
            canAddRow={canAddRow}
            getPollenOptions={getPollenOptions}
            onAddRow={onAddRow}
            onPollenChange={onPollenChange}
            onReviewedEventsChange={onReviewedEventsChange}
            onRemoveRow={onRemoveRow}
          />
        </div>

        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-base font-semibold text-foreground">{t('title')}</h2>
          <div className="mt-4 flex min-h-[340px] items-center justify-center rounded-lg border border-dashed border-border bg-background px-6 text-center text-sm text-muted-foreground">
            {t('placeholder')}
          </div>
        </section>
      </div>
    </div>
  );
}
