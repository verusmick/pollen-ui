import type {
  AlertRecord,
  ApiAlertRecord,
  ApiNotificationMessageRecord,
  ApiNotificationRecord,
  ApiRuleRecord,
  MessageSystemApiId,
  NotificationMessageRecord,
  NotificationRecord,
  RuleRecord,
} from '../types';

function toId(value: MessageSystemApiId): string {
  return String(value);
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
  return {
    id: toId(record.id),
    name: record.name ?? '',
    measureId: toNumberOrNull(record.measure_id),
    startDate: record.start_date ?? '',
    endDate: record.end_date ?? '',
    locationIds: toNumberArray(record.location_ids),
    notificationIds: toNumberArray(record.notification_ids),
    description: record.description ?? '',
    enabled: Boolean(record.enabled),
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
    measureId: toNumberOrNull(record.measure_id),
    notificationId: toNumberOrNull(record.notification_id),
    creationDate: record.creation_date ?? '',
    value: toNumberOrNull(record.value),
    description: record.description ?? '',
  };
}

export function mapApiNotificationMessageRecords(
  records: ApiNotificationMessageRecord[]
): NotificationMessageRecord[] {
  return records.map(mapApiNotificationMessageRecord);
}
