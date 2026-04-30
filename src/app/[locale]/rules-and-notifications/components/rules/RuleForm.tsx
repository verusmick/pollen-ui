'use client';

import { useTranslations } from 'next-intl';

import type { NotificationRecord } from '../../types';
import type { RuleFormErrors, RuleFormValues } from '../../utils';

interface RuleFormProps {
  mode: 'create' | 'edit';
  values: RuleFormValues;
  errors: RuleFormErrors;
  notificationOptions: NotificationRecord[];
  notificationOptionsLoading?: boolean;
  notificationOptionsError?: string | null;
  saving?: boolean;
  deleting?: boolean;
  actionError?: string | null;
  onFieldChange: <K extends keyof RuleFormValues>(
    field: K,
    value: RuleFormValues[K]
  ) => void;
  onSubmit: () => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export function RuleForm({
  mode,
  values,
  errors,
  notificationOptions,
  notificationOptionsLoading = false,
  notificationOptionsError = null,
  saving = false,
  deleting = false,
  actionError = null,
  onFieldChange,
  onSubmit,
  onDelete,
  onCancel,
}: RuleFormProps) {
  const t = useTranslations('messageSystemPage.rules.form');
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
              {t('fields.measureId')}
            </span>
            <input
              type="number"
              value={values.measureId}
              onChange={(event) =>
                onFieldChange('measureId', event.target.value)
              }
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
            {errors.measureId ? (
              <span className="text-sm text-red-700">{errors.measureId}</span>
            ) : null}
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">
                {t('fields.startDate')}
              </span>
              <input
                type="date"
                value={values.startDate}
                onChange={(event) =>
                  onFieldChange('startDate', event.target.value)
                }
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
              {errors.startDate ? (
                <span className="text-sm text-red-700">{errors.startDate}</span>
              ) : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">
                {t('fields.endDate')}
              </span>
              <input
                type="date"
                value={values.endDate}
                onChange={(event) =>
                  onFieldChange('endDate', event.target.value)
                }
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
              {errors.endDate ? (
                <span className="text-sm text-red-700">{errors.endDate}</span>
              ) : null}
            </label>
          </div>

          <p className="text-xs text-muted-foreground">{t('fields.dateHelp')}</p>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">
              {t('fields.locationIds')}
            </span>
            <input
              type="text"
              value={values.locationIdsText}
              onChange={(event) =>
                onFieldChange('locationIdsText', event.target.value)
              }
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
            <span className="text-xs text-muted-foreground">
              {t('fields.locationIdsHelp')}
            </span>
            {errors.locationIds ? (
              <span className="text-sm text-red-700">{errors.locationIds}</span>
            ) : null}
          </label>

          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium text-foreground">
              {t('fields.notificationIds')}
            </legend>

            {notificationOptionsLoading ? (
              <div className="rounded-md border border-border bg-background p-3 text-sm text-muted-foreground">
                {t('states.loadingNotifications')}
              </div>
            ) : null}

            {notificationOptionsError ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {notificationOptionsError}
              </div>
            ) : null}

            {!notificationOptionsLoading && notificationOptions.length > 0 ? (
              <select
                value={values.notificationId}
                onChange={(event) =>
                  onFieldChange('notificationId', event.target.value)
                }
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="">{t('fields.notificationPlaceholder')}</option>
                {notificationOptions.map((notification) => {
                  const numericId = Number(notification.id);

                  return (
                    <option
                      key={notification.id}
                      value={notification.id}
                      disabled={!Number.isFinite(numericId)}
                    >
                      {notification.name}
                    </option>
                  );
                })}
              </select>
            ) : null}

            {!notificationOptionsLoading && notificationOptions.length === 0 ? (
              <div className="rounded-md border border-border bg-background p-3 text-sm text-muted-foreground">
                {t('states.noNotifications')}
              </div>
            ) : null}

            {errors.notificationIds ? (
              <span className="text-sm text-red-700">
                {errors.notificationIds}
              </span>
            ) : null}
          </fieldset>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">
              {t('fields.description')}
            </span>
            <textarea
              value={values.description}
              onChange={(event) =>
                onFieldChange('description', event.target.value)
              }
              rows={4}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={values.enabled}
              onChange={(event) =>
                onFieldChange('enabled', event.target.checked)
              }
            />
            <span>{t('fields.enabled')}</span>
          </label>

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
