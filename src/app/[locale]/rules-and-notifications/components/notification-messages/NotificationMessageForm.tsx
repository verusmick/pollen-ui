'use client';

import { useTranslations } from 'next-intl';

import type { NotificationRecord } from '../../types';
import type {
  NotificationMessageFormErrors,
  NotificationMessageFormValues,
} from '../../utils';

interface NotificationMessageFormProps {
  mode: 'create' | 'edit';
  values: NotificationMessageFormValues;
  errors: NotificationMessageFormErrors;
  notificationOptions: NotificationRecord[];
  notificationOptionsLoading?: boolean;
  notificationOptionsError?: string | null;
  saving?: boolean;
  deleting?: boolean;
  actionError?: string | null;
  onFieldChange: <K extends keyof NotificationMessageFormValues>(
    field: K,
    value: NotificationMessageFormValues[K]
  ) => void;
  onSubmit: () => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export function NotificationMessageForm({
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
}: NotificationMessageFormProps) {
  const t = useTranslations('messageSystemPage.notificationMessages.form');
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

          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium text-foreground">
              {t('fields.notificationId')}
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
                <option value="">
                  {t('fields.notificationPlaceholder')}
                </option>
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

            {errors.notificationId ? (
              <span className="text-sm text-red-700">
                {errors.notificationId}
              </span>
            ) : null}
          </fieldset>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">
              {t('fields.creationDate')}
            </span>
            <input
              type="datetime-local"
              value={values.creationDate}
              onChange={(event) =>
                onFieldChange('creationDate', event.target.value)
              }
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
            <span className="text-xs text-muted-foreground">
              {t('fields.creationDateHelp')}
            </span>
            {errors.creationDate ? (
              <span className="text-sm text-red-700">
                {errors.creationDate}
              </span>
            ) : null}
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">
              {t('fields.value')}
            </span>
            <input
              type="number"
              step="any"
              value={values.value}
              onChange={(event) => onFieldChange('value', event.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
            {errors.value ? (
              <span className="text-sm text-red-700">{errors.value}</span>
            ) : null}
          </label>

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
