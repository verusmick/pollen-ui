import type {
  MessageSystemAlertType,
  MessageSystemFrequency,
  MessageSystemNotificationMessageStatus,
} from '../types';

export const MESSAGE_SYSTEM_ALERT_TYPES = [
  'green',
  'yellow',
  'red',
] as const satisfies readonly MessageSystemAlertType[];

export const MESSAGE_SYSTEM_FREQUENCIES = [
  'immediately',
  'daily_summary',
  'weekly_summary',
] as const satisfies readonly MessageSystemFrequency[];

export const MESSAGE_SYSTEM_NOTIFICATION_MESSAGE_STATUSES = [
  'UNRESOLVED',
  'RESOLVED',
] as const satisfies readonly MessageSystemNotificationMessageStatus[];

export const MESSAGE_SYSTEM_QUERY_STALE_TIME_MS = 1000 * 60 * 10;
