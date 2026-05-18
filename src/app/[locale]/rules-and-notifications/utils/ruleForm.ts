import type {
  ApiRuleEmbeddedAlert,
  ApiRuleInterval,
  ApiRuleWriteRequest,
  RuleEmbeddedAlertRecord,
  RuleRecord,
} from '../types';

export interface RuleAlertFormValues {
  type: string;
  minValue: string;
  maxValue: string;
}

export interface RuleFormValues {
  name: string;
  pollen: string;
  flightStart: string;
  flightEnd: string;
  locations: string[];
  notificationIds: string[];
  alerts: RuleAlertFormValues[];
  description: string;
  enabled: boolean;
}

export interface RuleAlertFormErrors {
  type?: string;
  minValue?: string;
  maxValue?: string;
}

export interface RuleFormErrors {
  name?: string;
  pollen?: string;
  flightStart?: string;
  flightEnd?: string;
  flightPeriod?: string;
  locations?: string;
  notificationIds?: string;
  alerts?: string;
  alertRows?: RuleAlertFormErrors[];
}

export const DEFAULT_RULE_ALERT_FORM_VALUES: RuleAlertFormValues = {
  type: 'green',
  minValue: '',
  maxValue: '',
};

export const DEFAULT_RULE_FORM_VALUES: RuleFormValues = {
  name: '',
  pollen: '',
  flightStart: '',
  flightEnd: '',
  locations: [],
  notificationIds: [],
  alerts: [{ ...DEFAULT_RULE_ALERT_FORM_VALUES }],
  description: '',
  enabled: true,
};

interface DateTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function parseBackendDateTime(value: string): DateTimeParts | null {
  const match = value
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);

  if (!match) {
    return null;
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
    second: Number(match[6] ?? '0'),
  };
}

function parseMonthDay(value: string): { month: number; day: number } | null {
  const match = value.trim().match(/^(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const month = Number(match[1]);
  const day = Number(match[2]);
  const date = new Date(Date.UTC(2000, month - 1, day));

  if (
    !Number.isFinite(date.getTime()) ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return { month, day };
}

function formatMonthDay(month: number, day: number): string {
  return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function toMonthDayFromBackendDateTime(value: string): string {
  const parts = parseBackendDateTime(value);

  return parts ? formatMonthDay(parts.month, parts.day) : '';
}

function toFixedYearComparable(value: string): number | null {
  const parts = parseMonthDay(value);

  if (!parts) {
    return null;
  }

  return Date.UTC(2000, parts.month - 1, parts.day);
}

function formatFlightPeriodStart(value: string): string {
  const parts = parseMonthDay(value);

  if (!parts) {
    return '';
  }

  return `2000-${formatMonthDay(parts.month, parts.day)} 00:00:00+00`;
}

function formatFlightPeriodEnd(value: string): string {
  const parts = parseMonthDay(value);

  if (!parts) {
    return '';
  }

  return `2000-${formatMonthDay(parts.month, parts.day)} 23:59:59+00`;
}

function mapRuleAlertRecordToFormValues(
  alert: RuleEmbeddedAlertRecord
): RuleAlertFormValues {
  return {
    type: alert.type,
    minValue: alert.minValue === null ? '' : String(alert.minValue),
    maxValue: alert.maxValue === null ? '' : String(alert.maxValue),
  };
}

export function generateRuleIntervalsFromFlightPeriod(
  flightStartValue: string,
  flightEndValue: string
): ApiRuleInterval[] | null {
  const flightStart = formatFlightPeriodStart(flightStartValue);
  const flightEnd = formatFlightPeriodEnd(flightEndValue);
  const comparableStart = toFixedYearComparable(flightStartValue);
  const comparableEnd = toFixedYearComparable(flightEndValue);

  if (
    !flightStart ||
    !flightEnd ||
    comparableStart === null ||
    comparableEnd === null
  ) {
    return null;
  }

  if (comparableEnd < comparableStart) {
    return null;
  }

  return [
    {
      start_date: flightStart,
      end_date: flightEnd,
    },
  ];
}

function inferFlightPeriodFromIntervals(intervals: ApiRuleInterval[]): {
  flightStart: string;
  flightEnd: string;
} | null {
  const interval = intervals[0];

  if (!interval) {
    return null;
  }

  const flightStart = toMonthDayFromBackendDateTime(interval.start_date);
  const flightEnd = toMonthDayFromBackendDateTime(interval.end_date);

  if (!flightStart || !flightEnd) {
    return null;
  }

  return { flightStart, flightEnd };
}

export function mapRuleRecordToFormValues(record: RuleRecord): RuleFormValues {
  const inferredFlightPeriod = inferFlightPeriodFromIntervals(record.intervals);

  return {
    name: record.name,
    pollen: record.pollen,
    flightStart: inferredFlightPeriod?.flightStart ?? '',
    flightEnd: inferredFlightPeriod?.flightEnd ?? '',
    locations: [...record.locations],
    notificationIds: record.notificationIds.map((id) => String(id)),
    alerts:
      record.alerts.length > 0
        ? record.alerts.map(mapRuleAlertRecordToFormValues)
        : [{ ...DEFAULT_RULE_ALERT_FORM_VALUES }],
    description: record.description,
    enabled: record.enabled,
  };
}

export function buildRuleWritePayload(
  values: RuleFormValues
): ApiRuleWriteRequest {
  const intervals = generateRuleIntervalsFromFlightPeriod(
    values.flightStart,
    values.flightEnd
  );
  const alerts: ApiRuleEmbeddedAlert[] = values.alerts.map((alert) => ({
    type: alert.type,
    min_value: Number(alert.minValue.trim()),
    max_value: Number(alert.maxValue.trim()),
  }));

  return {
    name: values.name.trim(),
    pollen: values.pollen,
    intervals: intervals ?? [],
    locations: values.locations,
    notification_ids: values.notificationIds.map((id) => Number(id)),
    alerts,
    description: values.description.trim(),
    enabled: values.enabled,
  };
}

export function hasValidFlightPeriod(values: RuleFormValues): boolean {
  const intervals = generateRuleIntervalsFromFlightPeriod(
    values.flightStart,
    values.flightEnd
  );

  return Boolean(intervals && intervals.length === 1);
}
