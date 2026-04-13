'use client';

import { useTranslations } from 'next-intl';

interface CorrectionFactorDistributionRowProps {
  clientId: string;
  pollen: string;
  reviewedEvents: string;
  multiplier: number;
  pollenOptions: string[];
  isBasePollen: boolean;
  isSyntheticUnknown?: boolean;
  isReadOnly?: boolean;
  errors?: {
    pollen?: string;
    reviewedEvents?: string;
  };
  onPollenChange: (clientId: string, pollen: string) => void;
  onReviewedEventsChange: (clientId: string, reviewedEvents: string) => void;
  onRemove: (clientId: string) => void;
}

export function CorrectionFactorDistributionRow({
  clientId,
  pollen,
  reviewedEvents,
  multiplier,
  pollenOptions,
  isBasePollen,
  isSyntheticUnknown = false,
  isReadOnly = false,
  errors,
  onPollenChange,
  onReviewedEventsChange,
  onRemove,
}: CorrectionFactorDistributionRowProps) {
  const t = useTranslations('correctionFactorsPage.form.distribution');

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-3 align-top">
        {isSyntheticUnknown ? (
          <div className="flex h-9 items-center rounded-md border border-border bg-muted px-3 text-sm text-foreground">
            {t('unknown')}
          </div>
        ) : (
          <select
            value={pollen}
            onChange={(event) => onPollenChange(clientId, event.target.value)}
            disabled={isBasePollen}
            className={`h-9 w-full rounded-md border bg-card px-3 text-sm text-foreground disabled:opacity-70 ${
              errors?.pollen ? 'border-red-300' : 'border-border'
            }`}
          >
            <option value="">{t('selectPollen')}</option>
            {pollenOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}
        {errors?.pollen ? (
          <div className="pt-1 text-xs text-red-600">{errors.pollen}</div>
        ) : null}
      </td>
      <td className="px-4 py-3 align-top">
        <input
          type="number"
          min="0"
          value={reviewedEvents}
          onChange={(event) =>
            onReviewedEventsChange(clientId, event.target.value)
          }
          disabled={isSyntheticUnknown || isReadOnly}
          className={`h-9 w-full rounded-md border bg-card px-3 text-sm text-foreground disabled:bg-muted disabled:text-muted-foreground ${
            errors?.reviewedEvents ? 'border-red-300' : 'border-border'
          }`}
        />
        {errors?.reviewedEvents ? (
          <div className="pt-1 text-xs text-red-600">{errors.reviewedEvents}</div>
        ) : null}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {multiplier.toFixed(2)}
      </td>
      <td className="px-4 py-3 text-right">
        {isSyntheticUnknown ? (
          <span className="text-xs text-muted-foreground">{t('automatic')}</span>
        ) : isBasePollen ? (
          <span className="text-xs text-muted-foreground">{t('baseRow')}</span>
        ) : (
          <button
            type="button"
            onClick={() => onRemove(clientId)}
            className="text-sm font-medium text-primary hover:underline"
          >
            {t('remove')}
          </button>
        )}
      </td>
    </tr>
  );
}
