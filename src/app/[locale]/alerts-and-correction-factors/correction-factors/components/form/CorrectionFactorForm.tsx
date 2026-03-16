'use client';

import type { CorrectionFactorLocationOption } from '@/lib/api/correctionFactors';
import { useTranslations } from 'next-intl';
import type {
  CorrectionFactorFormMode,
  CorrectionFactorFormDerivedState,
  CorrectionFactorFormErrors,
  CorrectionFactorFormValues,
  CorrectionFactorRecord,
} from '../../types';
import { CorrectionFactorDistributionSection } from './CorrectionFactorDistributionSection';
import { CorrectionFactorFormHeader } from './CorrectionFactorFormHeader';
import { CorrectionFactorMetaFields } from './CorrectionFactorMetaFields';

interface CorrectionFactorFormProps {
  mode: CorrectionFactorFormMode;
  values: CorrectionFactorFormValues;
  errors: CorrectionFactorFormErrors;
  derived: CorrectionFactorFormDerivedState;
  locationOptions: CorrectionFactorLocationOption[];
  pollenOptions: string[];
  locationsLoading?: boolean;
  pollensLoading?: boolean;
  saving: boolean;
  deleting?: boolean;
  actionError?: string | null;
  detailLoading?: boolean;
  detailError?: string | null;
  editHydrationBlocked?: boolean;
  editHydrationMessage?: string | null;
  detailRecord?: CorrectionFactorRecord | null;
  submitDisabled?: boolean;
  deleteDisabled?: boolean;
  canDelete?: boolean;
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
  onDelete?: () => void;
}

function formatDateRange(startDate: string, endDate: string): string {
  return `${startDate.slice(0, 10)} - ${endDate.slice(0, 10)}`;
}

export function CorrectionFactorForm({
  mode,
  values,
  errors,
  derived,
  locationOptions,
  pollenOptions,
  locationsLoading = false,
  pollensLoading = false,
  saving,
  deleting = false,
  actionError,
  detailLoading = false,
  detailError,
  editHydrationBlocked = false,
  editHydrationMessage,
  detailRecord = null,
  submitDisabled = false,
  deleteDisabled = false,
  canDelete = false,
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
  onDelete,
}: CorrectionFactorFormProps) {
  const t = useTranslations('correctionFactorsPage.form.preview');
  const formT = useTranslations('correctionFactorsPage.form');
  const listStatusT = useTranslations('correctionFactorsPage.list.status');

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <CorrectionFactorFormHeader
        mode={mode}
        saving={saving}
        deleting={deleting}
        actionError={actionError}
        submitDisabled={submitDisabled}
        deleteDisabled={deleteDisabled}
        showDelete={canDelete}
        onCancel={onCancel}
        onSubmit={onSubmit}
        onDelete={onDelete}
      />

      {mode === 'edit' && detailLoading ? (
        <section className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          {formT('states.loadingDetail')}
        </section>
      ) : null}

      {mode === 'edit' && detailError ? (
        <section className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {detailError}
        </section>
      ) : null}

      {mode === 'edit' && !detailLoading && !detailError && editHydrationBlocked ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <section className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div>
              <h2 className="text-base font-semibold text-amber-900">
                {formT('editUnavailable.title')}
              </h2>
              <p className="mt-1 text-sm text-amber-800">
                {formT('editUnavailable.description')}
              </p>
            </div>

            {editHydrationMessage ? (
              <div className="rounded-md border border-amber-300 bg-white px-4 py-3 text-sm text-amber-900">
                <span className="font-medium">
                  {formT('editUnavailable.reasonLabel')}:
                </span>{' '}
                {editHydrationMessage}
              </div>
            ) : null}

            {detailRecord ? (
              <div className="space-y-3 rounded-lg border border-border bg-card p-4">
                <h3 className="text-sm font-semibold text-foreground">
                  {formT('editUnavailable.summaryTitle')}
                </h3>
                <div className="grid gap-3 text-sm md:grid-cols-2">
                  <div>
                    <div className="text-muted-foreground">
                      {formT('editUnavailable.location')}
                    </div>
                    <div className="text-foreground">{detailRecord.location}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">
                      {formT('editUnavailable.basePollen')}
                    </div>
                    <div className="text-foreground">{detailRecord.basePollen}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">
                      {formT('editUnavailable.dateRange')}
                    </div>
                    <div className="text-foreground">
                      {formatDateRange(detailRecord.startDate, detailRecord.endDate)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">
                      {formT('editUnavailable.status')}
                    </div>
                    <div className="text-foreground">
                      {detailRecord.status === 'published'
                        ? listStatusT('published')
                        : listStatusT('draft')}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-base font-semibold text-foreground">
              {formT('editUnavailable.detailsTitle')}
            </h2>

            {detailRecord && detailRecord.details.length > 0 ? (
              <div className="mt-4 overflow-hidden rounded-lg border border-border">
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead className="bg-background">
                      <tr className="border-b border-border text-left">
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {formT('editUnavailable.pollen')}
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {formT('editUnavailable.multiplier')}
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {formT('editUnavailable.published')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailRecord.details.map((detail) => (
                        <tr
                          key={detail.id ?? `${detail.pollen}-${detail.factorPercentage}`}
                          className="border-b border-border last:border-b-0"
                        >
                          <td className="px-4 py-3 text-sm text-foreground">
                            {detail.pollen}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {detail.factorPercentage}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {detail.published
                              ? formT('editUnavailable.yes')
                              : formT('editUnavailable.no')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-border bg-background px-4 py-6 text-sm text-muted-foreground">
                {formT('editUnavailable.empty')}
              </div>
            )}
          </section>
        </div>
      ) : null}

      {!(mode === 'edit' && (detailLoading || detailError || editHydrationBlocked)) ? (
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
      ) : null}
    </div>
  );
}
