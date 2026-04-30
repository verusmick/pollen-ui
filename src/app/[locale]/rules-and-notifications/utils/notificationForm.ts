import type {
  ApiNotificationWriteRequest,
  NotificationRecord,
} from '../types';
import {
  MESSAGE_SYSTEM_ALERT_TYPES,
  MESSAGE_SYSTEM_FREQUENCIES,
} from '../constants';

export interface NotificationFormValues {
  name: string;
  recipientsText: string;
  frequency: string;
  alertTypes: string[];
}

export interface NotificationFormErrors {
  name?: string;
  recipients?: string;
  alertTypes?: string;
}

export const DEFAULT_NOTIFICATION_FORM_VALUES: NotificationFormValues = {
  name: '',
  recipientsText: '',
  frequency: MESSAGE_SYSTEM_FREQUENCIES[0],
  alertTypes: [...MESSAGE_SYSTEM_ALERT_TYPES],
};

export function parseRecipients(value: string): string[] {
  return value
    .split(/[\n,]+/)
    .map((recipient) => recipient.trim())
    .filter(Boolean);
}

export function isEmailLike(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function mapNotificationRecordToFormValues(
  record: NotificationRecord
): NotificationFormValues {
  return {
    name: record.name,
    recipientsText: record.recipients.join('\n'),
    frequency: record.frequency || MESSAGE_SYSTEM_FREQUENCIES[0],
    alertTypes: record.alertTypes.length > 0 ? record.alertTypes : [],
  };
}

export function buildNotificationWritePayload(
  values: NotificationFormValues,
  id?: string
): ApiNotificationWriteRequest {
  return {
    ...(id ? { id } : {}),
    name: values.name.trim(),
    recipients: parseRecipients(values.recipientsText),
    frequency: values.frequency,
    alert_types: values.alertTypes,
  };
}
