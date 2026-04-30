'use client';

import { useTranslations } from 'next-intl';

import {
  MESSAGE_SYSTEM_ALERT_TYPES,
  MESSAGE_SYSTEM_FREQUENCIES,
} from '../../constants';
import type {
  NotificationFormErrors,
  NotificationFormValues,
} from '../../utils';

interface NotificationFormProps {
  mode: 'create' | 'edit';
  values: NotificationFormValues;
  errors: NotificationFormErrors;
  saving?: boolean;
  deleting?: boolean;
  actionError?: string | null;
  onFieldChange: <K extends keyof NotificationFormValues>(
    field: K,
    value: NotificationFormValues[K]
  ) => void;
  onToggleAlertType: (alertType: string) => void;
  onSubmit: () => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export function NotificationForm({
  mode,
  values,
  errors,
  saving = false,
  deleting = false,
  actionError = null,
  onFieldChange,
  onToggleAlertType,
  onSubmit,
  onDelete,
  onCancel,
}: NotificationFormProps) {
  const t = useTranslations('messageSystemPage.notifications.form');
  const optionsT = useTranslations('messageSystemPage.notifications.options');
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
          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">
              {t('fields.name')}
            </span>
            <input
              type="text"
              value={values.name}
              onChange={(event) => onFieldChange('name', event.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
            {errors.name ? (
              <span className="text-sm text-red-700">{errors.name}</span>
            ) : null}
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">
              {t('fields.recipients')}
            </span>
            <textarea
              value={values.recipientsText}
              onChange={(event) =>
                onFieldChange('recipientsText', event.target.value)
              }
              rows={5}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
            <span className="text-xs text-muted-foreground">
              {t('fields.recipientsHelp')}
            </span>
            {errors.recipients ? (
              <span className="text-sm text-red-700">{errors.recipients}</span>
            ) : null}
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">
              {t('fields.frequency')}
            </span>
            <select
              value={values.frequency}
              onChange={(event) =>
                onFieldChange('frequency', event.target.value)
              }
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            >
              {MESSAGE_SYSTEM_FREQUENCIES.map((frequency) => (
                <option key={frequency} value={frequency}>
                  {optionsT(`frequency.${frequency}`)}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium text-foreground">
              {t('fields.alertTypes')}
            </legend>
            <div className="flex flex-wrap gap-3">
              {MESSAGE_SYSTEM_ALERT_TYPES.map((alertType) => (
                <label
                  key={alertType}
                  className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground"
                >
                  <input
                    type="checkbox"
                    checked={values.alertTypes.includes(alertType)}
                    onChange={() => onToggleAlertType(alertType)}
                  />
                  <span>{optionsT(`alertTypes.${alertType}`)}</span>
                </label>
              ))}
            </div>
            {errors.alertTypes ? (
              <span className="text-sm text-red-700">{errors.alertTypes}</span>
            ) : null}
          </fieldset>

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
