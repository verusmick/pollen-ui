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

function parseDateTimeLocal(value: string): Date | null {
  const parts = parseBackendDateTime(value);

  if (!parts) {
    return null;
  }

  const date = new Date(
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second
    )
  );

  return Number.isFinite(date.getTime()) ? date : null;
}

function formatBackendDateTime(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hour = String(date.getUTCHours()).padStart(2, '0');
  const minute = String(date.getUTCMinutes()).padStart(2, '0');
  const second = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hour}:${minute}:${second}+00`;
}

function formatDateTimeLocal(date: Date): string {
  return formatBackendDateTime(date).slice(0, 19).replace(' ', 'T');
}

function toDateTimeInputValue(value: string): string {
  const date = parseDateTimeLocal(value);
  return date ? formatDateTimeLocal(date) : value.trim();
}

function startOfYear(year: number): Date {
  return new Date(Date.UTC(year, 0, 1, 0, 0, 0));
}

function endOfYear(year: number): Date {
  return new Date(Date.UTC(year, 11, 31, 23, 59, 59));
}

function addSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * 1000);
}

function isSameSecond(left: Date, right: Date): boolean {
  return left.getTime() === right.getTime();
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
  const flightStart = parseDateTimeLocal(flightStartValue);
  const flightEnd = parseDateTimeLocal(flightEndValue);

  if (!flightStart || !flightEnd) {
    return null;
  }

  if (flightStart.getUTCFullYear() !== flightEnd.getUTCFullYear()) {
    return null;
  }

  if (flightEnd.getTime() < flightStart.getTime()) {
    return null;
  }

  const year = flightStart.getUTCFullYear();
  const yearStart = startOfYear(year);
  const yearEnd = endOfYear(year);
  const intervals: ApiRuleInterval[] = [];

  if (flightStart.getTime() > yearStart.getTime()) {
    intervals.push({
      start_date: formatBackendDateTime(yearStart),
      end_date: formatBackendDateTime(addSeconds(flightStart, -1)),
    });
  }

  if (flightEnd.getTime() < yearEnd.getTime()) {
    intervals.push({
      start_date: formatBackendDateTime(addSeconds(flightEnd, 1)),
      end_date: formatBackendDateTime(yearEnd),
    });
  }

  return intervals;
}

function inferFlightPeriodFromIntervals(intervals: ApiRuleInterval[]): {
  flightStart: string;
  flightEnd: string;
} | null {
  if (intervals.length === 0 || intervals.length > 2) {
    return null;
  }

  const parsed = intervals
    .map((interval) => ({
      start: parseDateTimeLocal(interval.start_date),
      end: parseDateTimeLocal(interval.end_date),
    }))
    .filter(
      (interval): interval is { start: Date; end: Date } =>
        Boolean(interval.start) && Boolean(interval.end)
    );

  if (parsed.length !== intervals.length) {
    return null;
  }

  const year = parsed[0].start.getUTCFullYear();

  if (
    parsed.some(
      (interval) =>
        interval.start.getUTCFullYear() !== year ||
        interval.end.getUTCFullYear() !== year
    )
  ) {
    return null;
  }

  const yearStart = startOfYear(year);
  const yearEnd = endOfYear(year);
  const sorted = [...parsed].sort(
    (left, right) => left.start.getTime() - right.start.getTime()
  );
  const first = sorted[0];
  const second = sorted[1];

  if (sorted.length === 2) {
    if (!isSameSecond(first.start, yearStart) || !isSameSecond(second.end, yearEnd)) {
      return null;
    }

    return {
      flightStart: formatDateTimeLocal(addSeconds(first.end, 1)),
      flightEnd: formatDateTimeLocal(addSeconds(second.start, -1)),
    };
  }

  if (isSameSecond(first.start, yearStart)) {
    return {
      flightStart: formatDateTimeLocal(addSeconds(first.end, 1)),
      flightEnd: formatDateTimeLocal(yearEnd),
    };
  }

  if (isSameSecond(first.end, yearEnd)) {
    return {
      flightStart: formatDateTimeLocal(yearStart),
      flightEnd: formatDateTimeLocal(addSeconds(first.start, -1)),
    };
  }

  return null;
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

  return Boolean(intervals && intervals.length > 0);
}
