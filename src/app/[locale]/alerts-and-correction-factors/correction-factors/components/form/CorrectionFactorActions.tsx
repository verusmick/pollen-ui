'use client';

import { useTranslations } from 'next-intl';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

interface CorrectionFactorActionsProps {
  mode: 'create' | 'edit';
  saving: boolean;
  ruleEnabled: boolean;
  deleting?: boolean;
  actionError?: string | null;
  validationHint?: string | null;
  showActionError?: boolean;
  submitDisabled?: boolean;
  deleteDisabled?: boolean;
  showDelete?: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  onRuleEnabledChange: (enabled: boolean) => void;
  onDelete?: () => void;
}

export function CorrectionFactorActions({
  mode,
  saving,
  ruleEnabled,
  deleting = false,
  actionError,
  validationHint = null,
  showActionError = true,
  submitDisabled = false,
  deleteDisabled = false,
  showDelete = false,
  onCancel,
  onSubmit,
  onRuleEnabledChange,
  onDelete,
}: CorrectionFactorActionsProps) {
  const t = useTranslations('correctionFactorsPage.form.actions');
  const formT = useTranslations('correctionFactorsPage.form');
  const submitLabel =
    mode === 'edit'
      ? saving
        ? t('updating')
        : t('update')
      : saving
        ? t('saving')
        : t('save');
  const RuleStatusIcon = ruleEnabled ? FiCheckCircle : FiXCircle;
  const ruleLabel = ruleEnabled ? formT('ruleEnabled') : formT('ruleDisabled');
  const ruleButtonClassName = ruleEnabled
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 focus-visible:ring-emerald-500'
    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400';

  return (
    <div className="space-y-3">
      {showActionError && actionError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      ) : null}

      {!actionError && validationHint ? (
        <p className="text-right text-xs text-muted-foreground">
          {validationHint}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="w-full rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-background sm:w-auto"
        >
          {t('cancel')}
        </button>
        <button
          type="button"
          aria-pressed={ruleEnabled}
          aria-label={ruleLabel}
          onClick={() => onRuleEnabledChange(!ruleEnabled)}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:w-auto ${ruleButtonClassName}`}
        >
          <RuleStatusIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span>{ruleLabel}</span>
        </button>
        {showDelete && onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting || deleteDisabled || saving}
            className="w-full rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <span className="flex items-center justify-center gap-2">
              {deleting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : null}
              <span>{deleting ? t('deleting') : t('delete')}</span>
            </span>
          </button>
        ) : null}
        <button
          type="button"
          onClick={onSubmit}
          disabled={saving || deleting || submitDisabled}
          aria-busy={saving}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <span className="flex items-center justify-center gap-2">
            {saving ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : null}
            <span>{submitLabel}</span>
          </span>
        </button>
      </div>
    </div>
  );
}
