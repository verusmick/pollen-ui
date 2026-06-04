'use client';

import type { CorrectionFactorLocationOption } from '@/lib/api/correctionFactors';
import { useTranslations } from 'next-intl';
import type {
  CorrectionFactorChartRange,
  CorrectionFactorChartResolution,
  CorrectionFactorFormMode,
  CorrectionFactorFormDerivedState,
  CorrectionFactorFormErrors,
  CorrectionFactorReviewSlice,
  CorrectionFactorPreviewSeries,
  CorrectionFactorPreviewStatus,
  CorrectionFactorFormValues,
  CorrectionFactorRecord,
  CorrectionFactorReviewedValidationEvent,
  CorrectionFactorValidationEventsStatus,
  CorrectionFactorMultiplierMode,
} from '../../types';
import { formatCorrectionFactorDateTimeRange } from '../../utils';
import { CorrectionFactorChartPreview } from './CorrectionFactorChartPreview';
import { CorrectionFactorFormHeader } from './CorrectionFactorFormHeader';
import { CorrectionFactorMetaFields } from './CorrectionFactorMetaFields';
import {
  CorrectionFactorResultSummary,
  CorrectionFactorReviewSummary,
} from './CorrectionFactorReviewSummary';
import { CorrectionFactorReviewWorkspace } from './CorrectionFactorReviewWorkspace';

interface CorrectionFactorFormProps {
  mode: CorrectionFactorFormMode;
  values: CorrectionFactorFormValues;
  errors: CorrectionFactorFormErrors;
  validationErrors: CorrectionFactorFormErrors;
  hasValidated: boolean;
  isFormValid: boolean;
  derived: CorrectionFactorFormDerivedState;
  locationOptions: CorrectionFactorLocationOption[];
  pollenOptions: string[];
  locationsLoading?: boolean;
  pollensLoading?: boolean;
  locationsError?: string | null;
  pollensError?: string | null;
  validationEventsStatus: CorrectionFactorValidationEventsStatus;
  validationEvents: CorrectionFactorReviewedValidationEvent[];
  validationAcceptedEventIds?: string[];
  validationEventsIdleMessage?: string | null;
  validationEventsError?: string | null;
  validationEventsStatusText?: string | null;
  validationEventsFieldError?: string | null;
  validationEventsDisabledReason?: string | null;
  onToggleValidationEventAccepted: (eventId: string) => void;
  reviewWorkspaceOpen: boolean;
  onOpenReviewWorkspace: () => void;
  onCloseReviewWorkspace: () => void;
  onSelectReviewSlice: (sliceId: string) => void;
  onMultiplierModeChange: (mode: CorrectionFactorMultiplierMode) => void;
  onManualMultiplierChange: (value: string) => void;
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
  showStoredMultiplierView?: boolean;
  basePollen: string;
  previewStatus: CorrectionFactorPreviewStatus;
  previewSeries: CorrectionFactorPreviewSeries | null;
  previewReviewSlices: CorrectionFactorReviewSlice[];
  selectedPreviewSliceId: string | null;
  previewVisibleRange: CorrectionFactorChartRange | null;
  previewCanDrillUp: boolean;
  previewResolution: CorrectionFactorChartResolution | null;
  previewError?: string | null;
  onActivatePreviewBucket: (bucketId: string) => void;
  onDrillUpPreviewRange: () => void;
  onLocationChange: (value: string) => void;
  onBasePollenChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onRuleEnabledChange: (value: boolean) => void;
  onCancel: () => void;
  onSubmit: () => void;
  onDelete?: () => void;
}

function formatDateRange(startDate: string, endDate: string): string {
  return formatCorrectionFactorDateTimeRange(startDate, endDate);
}

function formatValue(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(2);
}

export function CorrectionFactorForm({
  mode,
  values,
  errors,
  validationErrors,
  hasValidated,
  isFormValid,
  derived,
  locationOptions,
  pollenOptions,
  locationsLoading = false,
  pollensLoading = false,
  locationsError = null,
  pollensError = null,
  validationEventsStatus,
  validationEvents,
  validationAcceptedEventIds = [],
  validationEventsIdleMessage = null,
  validationEventsError = null,
  validationEventsStatusText = null,
  validationEventsFieldError = null,
  validationEventsDisabledReason = null,
  onToggleValidationEventAccepted,
  reviewWorkspaceOpen,
  onOpenReviewWorkspace,
  onCloseReviewWorkspace,
  onSelectReviewSlice,
  onMultiplierModeChange,
  onManualMultiplierChange,
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
  showStoredMultiplierView = false,
  basePollen,
  previewStatus,
  previewSeries,
  previewReviewSlices,
  selectedPreviewSliceId,
  previewVisibleRange,
  previewCanDrillUp,
  previewResolution,
  previewError = null,
  onActivatePreviewBucket,
  onDrillUpPreviewRange,
  onLocationChange,
  onBasePollenChange,
  onStartDateChange,
  onEndDateChange,
  onRuleEnabledChange,
  onCancel,
  onSubmit,
  onDelete,
}: CorrectionFactorFormProps) {
  const formT = useTranslations('correctionFactorsPage.form');
  const listTableT = useTranslations('correctionFactorsPage.list.table');
  const selectedPreviewSlice =
    previewReviewSlices.find((slice) => slice.id === selectedPreviewSliceId) ?? null;
  const selectedPreviewPoint =
    previewSeries?.points.find(
      (point) => point.id === selectedPreviewSliceId && point.isReviewSlice
    ) ?? null;
  const selectedPreviewSliceLabel =
    selectedPreviewPoint && values.basePollen
      ? formT('preview.sliceSelection.labelWithContext', {
          slice: selectedPreviewSlice?.label ?? selectedPreviewPoint.label,
          pollen: values.basePollen,
          value: formatValue(selectedPreviewPoint.originalValue),
        })
      : selectedPreviewSlice?.label ?? null;
  const baseDerivedRow = derived.rows.find(
    (row) => row.isBasePollen && !row.isSyntheticUnknown
  );
  const baseStoredMultiplier =
    values.rows.find((row) => row.isBasePollen)?.storedMultiplier ?? null;
  const correctionMultiplier =
    showStoredMultiplierView && baseStoredMultiplier !== null
      ? baseStoredMultiplier
      : (baseDerivedRow?.multiplier ?? 0);
  const visibleValidationErrors: CorrectionFactorFormErrors = hasValidated
    ? validationErrors
    : { rowErrorsById: {} };
  const validationHint =
    !isFormValid ? formT('validationSummary.description') : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 pb-6">
      <CorrectionFactorFormHeader
        mode={mode}
        saving={saving}
        ruleEnabled={values.ruleEnabled}
        deleting={deleting}
        actionError={actionError}
        validationHint={validationHint}
        submitDisabled={submitDisabled}
        deleteDisabled={deleteDisabled}
        showDelete={canDelete}
        onCancel={onCancel}
        onSubmit={onSubmit}
        onRuleEnabledChange={onRuleEnabledChange}
        onDelete={onDelete}
      />

      {hasValidated && !isFormValid ? (
        <section className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
          <h2 className="text-sm font-medium text-amber-900">
            {formT('validationSummary.title')}
          </h2>
          <p className="mt-1 text-sm text-amber-800">
            {formT('validationSummary.description')}
          </p>
        </section>
      ) : null}

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
        <div className="grid min-h-0 gap-4 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
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
                              ? listTableT('enabled')
                              : listTableT('disabled')}
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
        <div className="grid min-h-0 items-start gap-4 xl:grid-cols-[minmax(320px,360px)_minmax(0,1fr)] 2xl:grid-cols-[minmax(340px,380px)_minmax(0,1fr)]">
          <aside className="min-w-0 space-y-4 xl:sticky xl:top-4">
            <CorrectionFactorMetaFields
              values={values}
              errors={errors}
              validationErrors={visibleValidationErrors}
              locationOptions={locationOptions}
              pollenOptions={pollenOptions}
              locationsLoading={locationsLoading}
              pollensLoading={pollensLoading}
              validationEventsStatus={validationEventsStatus}
              locationsError={locationsError}
              pollensError={pollensError}
              validationEventsStatusText={validationEventsStatusText}
              validationEventsError={validationEventsFieldError}
              onLocationChange={onLocationChange}
              onBasePollenChange={onBasePollenChange}
              onStartDateChange={onStartDateChange}
              onEndDateChange={onEndDateChange}
            />

            <CorrectionFactorResultSummary
              values={values}
              detectedEvents={values.detectedEvents}
              derived={derived}
              errors={errors}
              validationErrors={visibleValidationErrors}
              basePollen={values.basePollen}
              correctionMultiplier={correctionMultiplier}
              showStoredMultiplierView={showStoredMultiplierView}
              reviewStateSource={values.reviewStateSource}
              onMultiplierModeChange={onMultiplierModeChange}
              onManualMultiplierChange={onManualMultiplierChange}
            />

            {mode === 'edit' ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <p className="font-medium">{formT('editHydration.title')}</p>
                <p className="mt-1">{formT('editHydration.description')}</p>
              </div>
            ) : null}
          </aside>

          <div className="min-w-0 space-y-4">
            <CorrectionFactorChartPreview
              basePollen={basePollen}
              status={previewStatus}
              series={previewSeries}
              selectedSliceId={selectedPreviewSliceId}
              visibleRange={previewVisibleRange}
              resolution={previewResolution}
              canDrillUp={previewCanDrillUp}
              errorMessage={previewError}
              onActivateBucket={onActivatePreviewBucket}
              onDrillUp={onDrillUpPreviewRange}
            />

            <CorrectionFactorReviewSummary
              detectedEvents={values.detectedEvents}
              hasSelectedSlice={selectedPreviewSlice !== null}
              selectedSliceLabel={selectedPreviewSliceLabel}
              errorMessage={validationEventsError}
              statusText={validationEventsFieldError ?? validationEventsStatusText}
              disabledReason={validationEventsDisabledReason}
              onOpenReviewWorkspace={onOpenReviewWorkspace}
            />
          </div>
        </div>
      ) : null}

      <CorrectionFactorReviewWorkspace
        open={reviewWorkspaceOpen}
        status={validationEventsStatus}
        events={validationEvents}
        acceptedEventIds={validationAcceptedEventIds}
        detectedEvents={values.detectedEvents}
        derived={derived}
        basePollen={values.basePollen}
        selectedSliceLabel={selectedPreviewSliceLabel}
        correctionMultiplier={correctionMultiplier}
        reviewStateSource={values.reviewStateSource}
        reviewSlices={previewReviewSlices}
        selectedSliceId={selectedPreviewSliceId}
        idleMessage={validationEventsIdleMessage}
        errorMessage={validationEventsError}
        onToggleAccepted={onToggleValidationEventAccepted}
        onSelectReviewSlice={onSelectReviewSlice}
        onClose={onCloseReviewWorkspace}
      />
    </div>
  );
}
