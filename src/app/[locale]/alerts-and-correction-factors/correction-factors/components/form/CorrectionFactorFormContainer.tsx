'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import {
  createCorrectionFactor,
  getCorrectionFactorLocations,
  getCorrectionFactorPollens,
} from '@/lib/api/correctionFactors';
import { correctionFactorKeys } from '../../constants';
import { useCorrectionFactorForm } from '../../hooks';
import { buildCorrectionFactorWritePayload } from '../../utils';
import { CorrectionFactorForm } from './CorrectionFactorForm';

export function CorrectionFactorFormContainer() {
  const router = useRouter();
  const t = useTranslations('correctionFactorsPage.form');
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useCorrectionFactorForm();

  const {
    data: locationOptions = [],
    isLoading: locationsLoading,
  } = useQuery({
    queryKey: correctionFactorKeys.locations(),
    queryFn: getCorrectionFactorLocations,
    staleTime: 1000 * 60 * 10,
  });

  const {
    data: pollenOptions = [],
    isLoading: pollensLoading,
  } = useQuery({
    queryKey: correctionFactorKeys.pollens(),
    queryFn: getCorrectionFactorPollens,
    staleTime: 1000 * 60 * 10,
  });

  async function handleSubmit() {
    setSubmitError(null);

    if (!form.validate()) {
      return;
    }

    try {
      setSaving(true);

      const payload = buildCorrectionFactorWritePayload(form.values, {
        // TODO: Confirm backend factor_percentage scale before enabling edit parity.
        factorPercentageScale: 'ratio',
      });

      await createCorrectionFactor(payload);
      router.push('/alerts-and-correction-factors/correction-factors');
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : t('submitErrorFallback')
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <CorrectionFactorForm
      values={form.values}
      errors={form.errors}
      derived={form.derived}
      locationOptions={locationOptions}
      pollenOptions={pollenOptions}
      locationsLoading={locationsLoading}
      pollensLoading={pollensLoading}
      saving={saving}
      submitError={submitError}
      canAddRow={Boolean(form.values.basePollen)}
      getPollenOptions={(currentRowPollen) =>
        form.getPollenOptions(currentRowPollen, pollenOptions)
      }
      onLocationChange={(value) => form.setField('location', value)}
      onBasePollenChange={(value) => form.setField('basePollen', value)}
      onStartDateChange={(value) => form.setField('startDate', value)}
      onEndDateChange={(value) => form.setField('endDate', value)}
      onDetectedEventsChange={form.setDetectedEventsInput}
      onPublishChange={(value) => form.setField('publishOnSave', value)}
      onAddRow={form.addRow}
      onPollenChange={form.updateRowPollen}
      onReviewedEventsChange={form.updateRowReviewedEvents}
      onRemoveRow={form.removeRow}
      onCancel={() => router.push('/alerts-and-correction-factors/correction-factors')}
      onSubmit={handleSubmit}
    />
  );
}
