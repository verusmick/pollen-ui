import type {
  AlertRecord,
  ApiAlertWriteRequest,
} from '@/app/[locale]/rules-and-notifications/types';

export interface AlertFormValues {
  ruleId: string;
  type: string;
  minValue: string;
  maxValue: string;
}

export interface AlertFormErrors {
  ruleId?: string;
  type?: string;
  minValue?: string;
  maxValue?: string;
}

export const DEFAULT_ALERT_FORM_VALUES: AlertFormValues = {
  ruleId: '',
  type: '',
  minValue: '',
  maxValue: '',
};

export function parseRequiredNumber(value: string): number | null {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : null;
}

export function mapAlertRecordToFormValues(
  record: AlertRecord
): AlertFormValues {
  return {
    ruleId: record.ruleId === null ? '' : String(record.ruleId),
    type: record.type,
    minValue: record.minValue === null ? '' : String(record.minValue),
    maxValue: record.maxValue === null ? '' : String(record.maxValue),
  };
}

export function buildAlertWritePayload(
  values: AlertFormValues,
  id?: string
): ApiAlertWriteRequest {
  return {
    ...(id ? { id } : {}),
    rule_id: Number(values.ruleId),
    type: values.type,
    min_value: Number(values.minValue),
    max_value: Number(values.maxValue),
  };
}
