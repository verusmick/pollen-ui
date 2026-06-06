import type { NotificationMessageRecord } from '@/app/[locale]/rules-and-notifications/types';

export function getAlertOccurrenceDate(
  record?: NotificationMessageRecord
): string {
  return record?.valueCreationDate || record?.creationDate || '';
}

export function getNotificationDisplayNames(
  record?: NotificationMessageRecord
): string[] {
  return (
    record?.notifications
      .map((notification) => notification.name.trim())
      .filter(Boolean) ?? []
  );
}
