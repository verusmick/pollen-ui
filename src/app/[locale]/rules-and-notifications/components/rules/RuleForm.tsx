'use client';

import { useTranslations } from 'next-intl';

import { MESSAGE_SYSTEM_ALERT_TYPES } from '../../constants';
import type { MessageSystemOption, NotificationRecord } from '../../types';
import type { RuleFormErrors, RuleFormValues } from '../../utils';
import { generateRuleIntervalsFromFlightPeriod } from '../../utils';

interface RuleFormProps {
  mode: 'create' | 'edit';
  values: RuleFormValues;
  errors: RuleFormErrors;
  notificationOptions: NotificationRecord[];
  notificationOptionsLoading?: boolean;
  notificationOptionsError?: string | null;
  pollenOptions: MessageSystemOption[];
  pollenOptionsLoading?: boolean;
  pollenOptionsError?: string | null;
  locationOptions: MessageSystemOption[];
  locationOptionsLoading?: boolean;
  locationOptionsError?: string | null;
  saving?: boolean;
  deleting?: boolean;
  actionError?: string | null;
  onFieldChange: <K extends keyof RuleFormValues>(
    field: K,
    value: RuleFormValues[K]
  ) => void;
  onAlertFieldChange: (
    index: number,
    field: keyof RuleFormValues['alerts'][number],
    value: string
  ) => void;
  onAddAlert: () => void;
  onRemoveAlert: (index: number) => void;
  onSubmit: () => void;
  onDelete?: () => void;
  onCancel: () => void;
}

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function RuleForm({
  mode,
  values,
  errors,
  notificationOptions,
  notificationOptionsLoading = false,
  notificationOptionsError = null,
  pollenOptions,
  pollenOptionsLoading = false,
  pollenOptionsError = null,
  locationOptions,
  locationOptionsLoading = false,
  locationOptionsError = null,
  saving = false,
  deleting = false,
  actionError = null,
  onFieldChange,
  onAlertFieldChange,
  onAddAlert,
  onRemoveAlert,
  onSubmit,
  onDelete,
  onCancel,
}: RuleFormProps) {
  const t = useTranslations('messageSystemPage.rules.form');
  const optionsT = useTranslations('messageSystemPage.notifications.options');
  const isEditMode = mode === 'edit';
  const generatedIntervals = generateRuleIntervalsFromFlightPeriod(
    values.flightStart,
    values.flightEnd
  );

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

          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium text-foreground">
              {t('fields.pollen')}
            </legend>

            {pollenOptionsLoading ? (
              <div className="rounded-md border border-border bg-background p-3 text-sm text-muted-foreground">
                {t('states.loadingPollen')}
              </div>
            ) : null}

            {pollenOptionsError ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {pollenOptionsError}
              </div>
            ) : null}

            <select
              value={values.pollen}
              onChange={(event) => onFieldChange('pollen', event.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="">{t('fields.pollenPlaceholder')}</option>
              {pollenOptions.map((option) => (
                <option key={option.id} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {!pollenOptionsLoading && pollenOptions.length === 0 ? (
              <div className="rounded-md border border-border bg-background p-3 text-sm text-muted-foreground">
                {t('states.noPollen')}
              </div>
            ) : null}

            {errors.pollen ? (
              <span className="text-sm text-red-700">{errors.pollen}</span>
            ) : null}
          </fieldset>

          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium text-foreground">
              {t('fields.locations')}
            </legend>

            {locationOptionsLoading ? (
              <div className="rounded-md border border-border bg-background p-3 text-sm text-muted-foreground">
                {t('states.loadingLocations')}
              </div>
            ) : null}

            {locationOptionsError ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {locationOptionsError}
              </div>
            ) : null}

            {locationOptions.length > 0 ? (
              <div className="grid gap-2">
                <select
                  value={values.locations[0] ?? ''}
                  onChange={(event) =>
                    onFieldChange(
                      'locations',
                      event.target.value ? [event.target.value] : []
                    )
                  }
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                >
                  <option value="">{t('fields.locationPlaceholder')}</option>
                  {locationOptions.map((option) => (
                    <option key={option.id} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {!locationOptionsLoading && locationOptions.length === 0 ? (
              <div className="rounded-md border border-border bg-background p-3 text-sm text-muted-foreground">
                {t('states.noLocations')}
              </div>
            ) : null}

            {errors.locations ? (
              <span className="text-sm text-red-700">{errors.locations}</span>
            ) : null}
          </fieldset>

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

            {notificationOptions.length > 0 ? (
              <div className="grid gap-2 rounded-md border border-border bg-background p-3 md:grid-cols-2">
                {notificationOptions.map((notification) => {
                  const numericId = Number(notification.id);
                  const disabled = !Number.isFinite(numericId);

                  return (
                    <label
                      key={notification.id}
                      className="inline-flex items-center gap-2 text-sm text-foreground"
                    >
                      <input
                        type="checkbox"
                        checked={values.notificationIds.includes(notification.id)}
                        disabled={disabled}
                        onChange={() =>
                          onFieldChange(
                            'notificationIds',
                            toggleValue(values.notificationIds, notification.id)
                          )
                        }
                      />
                      <span>{notification.name}</span>
                    </label>
                  );
                })}
              </div>
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

          <fieldset className="grid gap-3">
            <legend className="text-sm font-medium text-foreground">
              {t('fields.flightPeriod')}
            </legend>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm text-foreground">
                  {t('fields.flightStart')}
                </span>
                <input
                  type="datetime-local"
                  step="1"
                  value={values.flightStart}
                  onChange={(event) =>
                    onFieldChange('flightStart', event.target.value)
                  }
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
                {errors.flightStart ? (
                  <span className="text-sm text-red-700">
                    {errors.flightStart}
                  </span>
                ) : null}
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-foreground">
                  {t('fields.flightEnd')}
                </span>
                <input
                  type="datetime-local"
                  step="1"
                  value={values.flightEnd}
                  onChange={(event) =>
                    onFieldChange('flightEnd', event.target.value)
                  }
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
                {errors.flightEnd ? (
                  <span className="text-sm text-red-700">{errors.flightEnd}</span>
                ) : null}
              </label>
            </div>

            {errors.flightPeriod ? (
              <span className="text-sm text-red-700">{errors.flightPeriod}</span>
            ) : null}

            {errors.flightPeriod ? null : errors.flightStart || errors.flightEnd ? null : (
              <div className="rounded-md border border-border bg-background p-3 text-xs text-muted-foreground">
                {generatedIntervals && generatedIntervals.length > 0
                  ? t('fields.generatedIntervals', {
                      count: generatedIntervals.length,
                    })
                  : t('fields.generatedIntervalsHelp')}
              </div>
            )}
          </fieldset>

          <fieldset className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <legend className="text-sm font-medium text-foreground">
                {t('fields.alerts')}
              </legend>
              <button
                type="button"
                onClick={onAddAlert}
                className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-background"
              >
                {t('actions.addAlert')}
              </button>
            </div>

            {errors.alerts ? (
              <span className="text-sm text-red-700">{errors.alerts}</span>
            ) : null}

            <div className="grid gap-3">
              {values.alerts.map((alert, index) => {
                const rowErrors = errors.alertRows?.[index] ?? {};

                return (
                  <div
                    key={index}
                    className="grid gap-3 rounded-md border border-border bg-background p-3 md:grid-cols-[1fr_1fr_1fr_auto]"
                  >
                    <label className="grid gap-2">
                      <span className="text-sm text-foreground">
                        {t('fields.alertType')}
                      </span>
                      <select
                        value={alert.type}
                        onChange={(event) =>
                          onAlertFieldChange(index, 'type', event.target.value)
                        }
                        className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                      >
                        {MESSAGE_SYSTEM_ALERT_TYPES.map((alertType) => (
                          <option key={alertType} value={alertType}>
                            {optionsT(`alertTypes.${alertType}`)}
                          </option>
                        ))}
                      </select>
                      {rowErrors.type ? (
                        <span className="text-sm text-red-700">
                          {rowErrors.type}
                        </span>
                      ) : null}
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm text-foreground">
                        {t('fields.alertMinValue')}
                      </span>
                      <input
                        type="number"
                        step="any"
                        value={alert.minValue}
                        onChange={(event) =>
                          onAlertFieldChange(
                            index,
                            'minValue',
                            event.target.value
                          )
                        }
                        className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                      />
                      {rowErrors.minValue ? (
                        <span className="text-sm text-red-700">
                          {rowErrors.minValue}
                        </span>
                      ) : null}
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm text-foreground">
                        {t('fields.alertMaxValue')}
                      </span>
                      <input
                        type="number"
                        step="any"
                        value={alert.maxValue}
                        onChange={(event) =>
                          onAlertFieldChange(
                            index,
                            'maxValue',
                            event.target.value
                          )
                        }
                        className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                      />
                      {rowErrors.maxValue ? (
                        <span className="text-sm text-red-700">
                          {rowErrors.maxValue}
                        </span>
                      ) : null}
                    </label>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => onRemoveAlert(index)}
                        className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-card"
                      >
                        {t('actions.removeAlert')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
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
