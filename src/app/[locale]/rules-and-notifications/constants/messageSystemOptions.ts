import type {
  MessageSystemAlertType,
  MessageSystemFrequency,
} from '../types';

export const MESSAGE_SYSTEM_ALERT_TYPES = [
  'green',
  'yellow',
  'red',
] as const satisfies readonly MessageSystemAlertType[];

export const MESSAGE_SYSTEM_FREQUENCIES = [
  'immediately',
] as const satisfies readonly MessageSystemFrequency[];

export const MESSAGE_SYSTEM_QUERY_STALE_TIME_MS = 1000 * 60 * 10;
