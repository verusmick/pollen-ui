'use client';

import { useTranslations } from 'next-intl';

import { MESSAGE_SYSTEM_ALERT_TYPES } from '@/app/[locale]/rules-and-notifications/constants';
import type { RuleRecord } from '@/app/[locale]/rules-and-notifications/types';

import type { AlertFormErrors, AlertFormValues } from '../utils';

interface AlertFormProps {
  mode: 'create' | 'edit';
  values: AlertFormValues;
  errors: AlertFormErrors;
  ruleOptions: RuleRecord[];
  ruleOptionsLoading?: boolean;
  ruleOptionsError?: string | null;
  saving?: boolean;
  deleting?: boolean;
  actionError?: string | null;
  onFieldChange: <K extends keyof AlertFormValues>(
    field: K,
    value: AlertFormValues[K]
  ) => void;
  onSubmit: () => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export function AlertForm({
  mode,
  values,
  errors,
  ruleOptions,
  ruleOptionsLoading = false,
  ruleOptionsError = null,
  saving = false,
  deleting = false,
  actionError = null,
  onFieldChange,
  onSubmit,
  onDelete,
  onCancel,
}: AlertFormProps) {
  const t = useTranslations('alertsAndCorrectionFactorsPage.alerts.form');
  const optionsT = useTranslations('alertsAndCorrectionFactorsPage.alerts.options');
  const isEditMode = mode === 'edit';

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 pb-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold text-foreground">
          {isEditMode ? t('editTitle') : t('createTitle')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEditMode ? t('editDescription') : t('createDescription')}
        </p>
      </header>

      {actionError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {actionError}
        </div>
      ) : null}

      <form
        className="rounded-lg border border-border bg-card p-5"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="grid gap-5">
          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium text-foreground">
              {t('fields.ruleId')}
            </legend>

            {ruleOptionsLoading ? (
              <div className="rounded-md border border-border bg-background p-3 text-sm text-muted-foreground">
                {t('states.loadingRules')}
              </div>
            ) : null}

            {ruleOptionsError ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {ruleOptionsError}
              </div>
            ) : null}

            {!ruleOptionsLoading && ruleOptions.length > 0 ? (
              <select
                value={values.ruleId}
                onChange={(event) => onFieldChange('ruleId', event.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="">{t('fields.rulePlaceholder')}</option>
                {ruleOptions.map((rule) => {
                  const numericId = Number(rule.id);

                  return (
                    <option
                      key={rule.id}
                      value={rule.id}
                      disabled={!Number.isFinite(numericId)}
                    >
                      {rule.name}
                    </option>
                  );
                })}
              </select>
            ) : null}

            {!ruleOptionsLoading && ruleOptions.length === 0 ? (
              <div className="rounded-md border border-border bg-background p-3 text-sm text-muted-foreground">
                {t('states.noRules')}
              </div>
            ) : null}

            {errors.ruleId ? (
              <span className="text-sm text-red-700">{errors.ruleId}</span>
            ) : null}
          </fieldset>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">
              {t('fields.type')}
            </span>
            <select
              value={values.type}
              onChange={(event) => onFieldChange('type', event.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="">{t('fields.typePlaceholder')}</option>
              {MESSAGE_SYSTEM_ALERT_TYPES.map((alertType) => (
                <option key={alertType} value={alertType}>
                  {optionsT(`alertTypes.${alertType}`)}
                </option>
              ))}
            </select>
            {errors.type ? (
              <span className="text-sm text-red-700">{errors.type}</span>
            ) : null}
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">
                {t('fields.minValue')}
              </span>
              <input
                type="number"
                step="any"
                value={values.minValue}
                onChange={(event) =>
                  onFieldChange('minValue', event.target.value)
                }
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
              {errors.minValue ? (
                <span className="text-sm text-red-700">{errors.minValue}</span>
              ) : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">
                {t('fields.maxValue')}
              </span>
              <input
                type="number"
                step="any"
                value={values.maxValue}
                onChange={(event) =>
                  onFieldChange('maxValue', event.target.value)
                }
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
              {errors.maxValue ? (
                <span className="text-sm text-red-700">{errors.maxValue}</span>
              ) : null}
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={saving || deleting}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t('actions.cancel')}
              </button>
              <button
                type="submit"
                disabled={saving || deleting}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? t('actions.saving')
                  : isEditMode
                    ? t('actions.update')
                    : t('actions.create')}
              </button>
            </div>

            {isEditMode && onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                disabled={saving || deleting}
                className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? t('actions.deleting') : t('actions.delete')}
              </button>
            ) : null}
          </div>
        </div>
      </form>
    </div>
  );
}
