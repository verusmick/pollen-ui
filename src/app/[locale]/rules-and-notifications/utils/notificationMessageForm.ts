import type {
  ApiNotificationMessageLegacyWriteRequest,
  NotificationMessageRecord,
} from '../types';

export interface NotificationMessageFormValues {
  measureId: string;
  notificationId: string;
  creationDate: string;
  value: string;
  description: string;
}

export interface NotificationMessageFormErrors {
  measureId?: string;
  notificationId?: string;
  creationDate?: string;
  value?: string;
}

export const DEFAULT_NOTIFICATION_MESSAGE_FORM_VALUES: NotificationMessageFormValues =
  {
    measureId: '',
    notificationId: '',
    creationDate: '',
    value: '',
    description: '',
  };

export function parseRequiredNotificationMessageNumber(
  value: string
): number | null {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const parsed = Number(trimmedValue);
  return Number.isFinite(parsed) ? parsed : null;
}

function toDateTimeInputValue(value: string): string {
  const trimmedValue = value.trim();
  const match = trimmedValue.match(
    /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/
  );

  if (!match) {
    return trimmedValue;
  }

  return `${match[1]}T${match[2]}`;
}

function toBackendDateTimeString(value: string): string {
  const trimmedValue = value.trim();

  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmedValue)) {
    return trimmedValue;
  }

  return `${trimmedValue.replace('T', ' ')}:00+00`;
}

export function mapNotificationMessageRecordToFormValues(
  record: NotificationMessageRecord
): NotificationMessageFormValues {
  return {
    measureId: record.measureId === null ? '' : String(record.measureId),
    notificationId:
      record.notificationId === null ? '' : String(record.notificationId),
    creationDate: toDateTimeInputValue(record.creationDate),
    value: record.value === null ? '' : String(record.value),
    description: record.description,
  };
}

export function buildNotificationMessageWritePayload(
  values: NotificationMessageFormValues,
  id?: string
): ApiNotificationMessageLegacyWriteRequest {
  return {
    ...(id ? { id } : {}),
    measure_id: Number(values.measureId.trim()),
    notification_id: Number(values.notificationId),
    creation_date: toBackendDateTimeString(values.creationDate),
    value: Number(values.value.trim()),
    description: values.description.trim(),
  };
}
