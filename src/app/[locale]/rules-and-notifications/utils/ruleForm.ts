import type {
  ApiRuleEmbeddedAlert,
  ApiRuleWriteRequest,
  RuleRecord,
} from '../types';

export interface RuleFormValues {
  name: string;
  measureId: string;
  startDate: string;
  endDate: string;
  locationIdsText: string;
  notificationId: string;
  description: string;
  enabled: boolean;
}

export interface RuleFormErrors {
  name?: string;
  measureId?: string;
  startDate?: string;
  endDate?: string;
  locationIds?: string;
  notificationIds?: string;
}

export const DEFAULT_RULE_FORM_VALUES: RuleFormValues = {
  name: '',
  measureId: '',
  startDate: '',
  endDate: '',
  locationIdsText: '',
  notificationId: '',
  description: '',
  enabled: true,
};

export function parseNumericList(value: string): number[] {
  return value
    .split(/[\n,]+/)
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item));
}

export function parseRequiredNumber(value: string): number | null {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function toDateTimeInputValue(value: string): string {
  const trimmedValue = value.trim();
  const match = trimmedValue.match(
    /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/
  );

  if (match) {
    return `${match[1]}T${match[2]}`;
  }

  return trimmedValue;
}

function toBackendDateString(value: string, boundary: 'start' | 'end'): string {
  const trimmedValue = value.trim();

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmedValue)) {
    return `${trimmedValue.replace('T', ' ')}:00+00`;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    return trimmedValue;
  }

  return boundary === 'start'
    ? `${trimmedValue} 00:00:00+00`
    : `${trimmedValue} 23:59:59+00`;
}

export function mapRuleRecordToFormValues(record: RuleRecord): RuleFormValues {
  return {
    name: record.name,
    measureId: record.measureId === null ? '' : String(record.measureId),
    startDate: toDateTimeInputValue(record.startDate),
    endDate: toDateTimeInputValue(record.endDate),
    locationIdsText: record.locationIds.join(', '),
    notificationId:
      record.notificationIds.length > 0 ? String(record.notificationIds[0]) : '',
    description: record.description,
    enabled: record.enabled,
  };
}

export function buildRuleWritePayload(
  values: RuleFormValues,
  id?: string
): ApiRuleWriteRequest {
  const startDate = toBackendDateString(values.startDate, 'start');
  const endDate = toBackendDateString(values.endDate, 'end');
  const locations = parseNumericList(values.locationIdsText).map((locationId) =>
    String(locationId)
  );
  const alerts: ApiRuleEmbeddedAlert[] = [];

  return {
    ...(id ? { id } : {}),
    name: values.name.trim(),
    pollen: values.measureId.trim(),
    intervals: [{ start_date: startDate, end_date: endDate }],
    locations,
    notification_ids: [Number(values.notificationId)],
    alerts,
    description: values.description.trim(),
    enabled: values.enabled,
  };
}
