import type {
  AlertRecord,
  ApiAlertRecord,
  ApiRuleEmbeddedAlert,
  ApiRuleInterval,
  ApiNotificationMessageRecord,
  ApiNotificationRecord,
  ApiRuleRecord,
  MessageSystemOption,
  MessageSystemApiId,
  NotificationMessageRecord,
  NotificationRecord,
  RuleRecord,
  RuleEmbeddedAlertRecord,
} from '../types';

function toId(value: MessageSystemApiId | null | undefined): string {
  return value === null || value === undefined ? '' : String(value);
}

function toNumberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item: unknown): item is string => typeof item === 'string')
    : [];
}

function toNumberArray(value: unknown): number[] {
  return Array.isArray(value)
    ? value.filter(
        (item: unknown): item is number =>
          typeof item === 'number' && Number.isFinite(item)
      )
    : [];
}

function toRuleIntervals(value: unknown): ApiRuleInterval[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item: unknown): ApiRuleInterval | null => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return null;
      }

      const record = item as Record<string, unknown>;
      const startDate = record.start_date;
      const endDate = record.end_date;

      if (typeof startDate !== 'string' || typeof endDate !== 'string') {
        return null;
      }

      return {
        start_date: startDate,
        end_date: endDate,
      };
    })
    .filter((item: ApiRuleInterval | null): item is ApiRuleInterval =>
      Boolean(item)
    );
}

function mapApiRuleEmbeddedAlert(
  alert: ApiRuleEmbeddedAlert
): RuleEmbeddedAlertRecord {
  return {
    id: alert.id === undefined ? undefined : toId(alert.id),
    type: alert.type ?? '',
    minValue: toNumberOrNull(alert.min_value),
    maxValue: toNumberOrNull(alert.max_value),
  };
}

function toRuleEmbeddedAlerts(value: unknown): RuleEmbeddedAlertRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item: unknown): item is ApiRuleEmbeddedAlert =>
        Boolean(item) && typeof item === 'object' && !Array.isArray(item)
    )
    .map(mapApiRuleEmbeddedAlert);
}

export function mapApiNotificationRecord(
  record: ApiNotificationRecord
): NotificationRecord {
  return {
    id: toId(record.id),
    name: record.name ?? '',
    recipients: toStringArray(record.recipients),
    frequency: record.frequency ?? '',
    alertTypes: toStringArray(record.alert_types),
  };
}

export function mapApiNotificationRecords(
  records: ApiNotificationRecord[]
): NotificationRecord[] {
  return records.map(mapApiNotificationRecord);
}

export function mapApiRuleRecord(record: ApiRuleRecord): RuleRecord {
  const intervals = toRuleIntervals(record.intervals);
  const firstInterval = intervals[0];

  return {
    id: toId(record.id),
    name: record.name ?? '',
    pollen: record.pollen ?? '',
    intervals,
    locations: toStringArray(record.locations),
    notificationIds: toNumberArray(record.notification_ids),
    alerts: toRuleEmbeddedAlerts(record.alerts),
    description: record.description ?? '',
    enabled: Boolean(record.enabled),
    measureId: null,
    startDate: firstInterval?.start_date ?? '',
    endDate: firstInterval?.end_date ?? '',
    locationIds: [],
  };
}

export function mapApiRuleRecords(records: ApiRuleRecord[]): RuleRecord[] {
  return records.map(mapApiRuleRecord);
}

export function mapApiAlertRecord(record: ApiAlertRecord): AlertRecord {
  return {
    id: toId(record.id),
    ruleId: toNumberOrNull(record.rule_id),
    type: record.type ?? '',
    minValue: toNumberOrNull(record.min_value),
    maxValue: toNumberOrNull(record.max_value),
  };
}

export function mapApiAlertRecords(records: ApiAlertRecord[]): AlertRecord[] {
  return records.map(mapApiAlertRecord);
}

export function mapApiNotificationMessageRecord(
  record: ApiNotificationMessageRecord
): NotificationMessageRecord {
  return {
    id: toId(record.id),
    notificationId: toId(record.notification_id),
    ruleId: toId(record.rule_id),
    alertId: toId(record.alert_id),
    creationDate: record.creation_date ?? '',
    pollen: record.pollen ?? '',
    location: record.location ?? '',
    value: toNumberOrNull(record.value),
    description: record.description ?? '',
    status: record.status ?? '',
    notification: record.notification,
    rule: record.rule,
    alert: record.alert,
    measureId: null,
  };
}

export function mapApiNotificationMessageRecords(
  records: ApiNotificationMessageRecord[]
): NotificationMessageRecord[] {
  return records.map(mapApiNotificationMessageRecord);
}

export function normalizeMessageSystemStringOptions(
  payload: unknown,
  collectionNames: string[]
): MessageSystemOption[] {
  const candidates: unknown[][] = [];

  if (Array.isArray(payload)) {
    candidates.push(payload);
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;

    for (const collectionName of collectionNames) {
      const collection = record[collectionName];

      if (Array.isArray(collection)) {
        candidates.push(collection);
      }
    }

    for (const fallbackName of ['data', 'items', 'results']) {
      const collection = record[fallbackName];

      if (Array.isArray(collection)) {
        candidates.push(collection);
      }
    }
  }

  for (const candidate of candidates) {
    const normalized = candidate
      .map((item: unknown): MessageSystemOption | null => {
        if (typeof item === 'string') {
          return { id: item, label: item, value: item };
        }

        if (!item || typeof item !== 'object' || Array.isArray(item)) {
          return null;
        }

        const record = item as Record<string, unknown>;
        const rawValue =
          record.value ?? record.code ?? record.name ?? record.id ?? record.label;
        const rawLabel = record.label ?? record.name ?? record.code ?? rawValue;

        if (
          (typeof rawValue !== 'string' && typeof rawValue !== 'number') ||
          (typeof rawLabel !== 'string' && typeof rawLabel !== 'number')
        ) {
          return null;
        }

        return {
          id: String(rawValue),
          label: String(rawLabel),
          value: String(rawValue),
        };
      })
      .filter((item: MessageSystemOption | null): item is MessageSystemOption =>
        Boolean(item)
      );

    if (normalized.length > 0) {
      return normalized.sort((left, right) =>
        left.label.localeCompare(right.label)
      );
    }
  }

  return [];
}
