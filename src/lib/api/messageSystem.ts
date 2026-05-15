import type {
  ApiAlertRecord,
  ApiAlertWriteRequest,
  ApiMessageSystemDeleteResponse,
  ApiNotificationMessageLegacyWriteRequest,
  ApiNotificationMessageRecord,
  ApiNotificationMessageStatusWriteRequest,
  ApiNotificationRecord,
  ApiNotificationWriteRequest,
  ApiRuleRecord,
  ApiRuleWriteRequest,
  MessageSystemOption,
} from '@/app/[locale]/rules-and-notifications/types';
import { normalizeMessageSystemStringOptions } from '@/app/[locale]/rules-and-notifications/utils/messageSystemMappers';

const NOTIFICATIONS_BASE_URL = '/api/notifications';
const RULES_BASE_URL = '/api/rules';
const ALERTS_BASE_URL = '/api/alerts';
const NOTIFICATION_MESSAGES_BASE_URL = '/api/notification-messages';
const POLLEN_BASE_URL = '/api/pollen';
const LOCATIONS_BASE_URL = '/api/locations';

async function requestJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    const errorText = await response.text();
    const trimmedErrorText = errorText.trim();

    throw new Error(
      trimmedErrorText
        ? `Message System API error (${response.status}): ${trimmedErrorText}`
        : `Message System API error (${response.status}): ${response.statusText}`
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  const text = await response.text();

  if (!text.trim()) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}

function jsonRequestInit(
  method: 'POST' | 'PUT',
  payload: unknown
): RequestInit {
  return {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  };
}

export async function listNotifications(): Promise<ApiNotificationRecord[]> {
  return requestJson<ApiNotificationRecord[]>(NOTIFICATIONS_BASE_URL);
}

export async function getNotification(
  id: string
): Promise<ApiNotificationRecord> {
  return requestJson<ApiNotificationRecord>(`${NOTIFICATIONS_BASE_URL}/${id}`);
}

export async function createNotification(
  payload: ApiNotificationWriteRequest
): Promise<ApiNotificationRecord> {
  return requestJson<ApiNotificationRecord>(
    NOTIFICATIONS_BASE_URL,
    jsonRequestInit('POST', payload)
  );
}

export async function updateNotification(
  id: string,
  payload: ApiNotificationWriteRequest
): Promise<ApiNotificationRecord> {
  return requestJson<ApiNotificationRecord>(
    `${NOTIFICATIONS_BASE_URL}/${id}`,
    jsonRequestInit('PUT', payload)
  );
}

export async function deleteNotification(
  id: string
): Promise<ApiMessageSystemDeleteResponse> {
  return requestJson<ApiMessageSystemDeleteResponse>(
    `${NOTIFICATIONS_BASE_URL}/${id}`,
    {
      method: 'DELETE',
    }
  );
}

export async function listRules(): Promise<ApiRuleRecord[]> {
  return requestJson<ApiRuleRecord[]>(RULES_BASE_URL);
}

export async function getRule(id: string): Promise<ApiRuleRecord> {
  return requestJson<ApiRuleRecord>(`${RULES_BASE_URL}/${id}`);
}

export async function createRule(
  payload: ApiRuleWriteRequest
): Promise<ApiRuleRecord> {
  return requestJson<ApiRuleRecord>(
    RULES_BASE_URL,
    jsonRequestInit('POST', payload)
  );
}

export async function updateRule(
  id: string,
  payload: ApiRuleWriteRequest
): Promise<ApiRuleRecord> {
  return requestJson<ApiRuleRecord>(
    `${RULES_BASE_URL}/${id}`,
    jsonRequestInit('PUT', payload)
  );
}

export async function deleteRule(
  id: string
): Promise<ApiMessageSystemDeleteResponse> {
  return requestJson<ApiMessageSystemDeleteResponse>(`${RULES_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
}

/**
 * @deprecated `/api/alerts` is deprecated. New Alerts UI work should use
 * notification messages instead.
 */
export async function listAlerts(): Promise<ApiAlertRecord[]> {
  return requestJson<ApiAlertRecord[]>(ALERTS_BASE_URL);
}

/**
 * @deprecated `/api/alerts` is deprecated. New Alerts UI work should use
 * notification messages instead.
 */
export async function getAlert(id: string): Promise<ApiAlertRecord> {
  return requestJson<ApiAlertRecord>(`${ALERTS_BASE_URL}/${id}`);
}

/**
 * @deprecated `/api/alerts` is deprecated. New Alerts UI work should use
 * notification messages instead.
 */
export async function createAlert(
  payload: ApiAlertWriteRequest
): Promise<ApiAlertRecord> {
  return requestJson<ApiAlertRecord>(
    ALERTS_BASE_URL,
    jsonRequestInit('POST', payload)
  );
}

/**
 * @deprecated `/api/alerts` is deprecated. New Alerts UI work should use
 * notification messages instead.
 */
export async function updateAlert(
  id: string,
  payload: ApiAlertWriteRequest
): Promise<ApiAlertRecord> {
  return requestJson<ApiAlertRecord>(
    `${ALERTS_BASE_URL}/${id}`,
    jsonRequestInit('PUT', payload)
  );
}

/**
 * @deprecated `/api/alerts` is deprecated. New Alerts UI work should use
 * notification messages instead.
 */
export async function deleteAlert(
  id: string
): Promise<ApiMessageSystemDeleteResponse> {
  return requestJson<ApiMessageSystemDeleteResponse>(
    `${ALERTS_BASE_URL}/${id}`,
    {
      method: 'DELETE',
    }
  );
}

export async function listNotificationMessages(): Promise<
  ApiNotificationMessageRecord[]
> {
  return requestJson<ApiNotificationMessageRecord[]>(
    NOTIFICATION_MESSAGES_BASE_URL
  );
}

export async function getNotificationMessage(
  id: string
): Promise<ApiNotificationMessageRecord> {
  return requestJson<ApiNotificationMessageRecord>(
    `${NOTIFICATION_MESSAGES_BASE_URL}/${id}`
  );
}

export async function updateNotificationMessageStatus(
  id: string,
  payload: ApiNotificationMessageStatusWriteRequest
): Promise<ApiNotificationMessageRecord> {
  return requestJson<ApiNotificationMessageRecord>(
    `${NOTIFICATION_MESSAGES_BASE_URL}/${id}`,
    jsonRequestInit('PUT', { status: payload.status })
  );
}

/**
 * @deprecated Notification messages are backend-generated. This helper remains
 * only for the old notification-messages screen until the Alerts UI remap
 * removes that route.
 */
export async function createNotificationMessage(
  payload: ApiNotificationMessageLegacyWriteRequest
): Promise<ApiNotificationMessageRecord> {
  return requestJson<ApiNotificationMessageRecord>(
    NOTIFICATION_MESSAGES_BASE_URL,
    jsonRequestInit('POST', payload)
  );
}

/**
 * @deprecated Use `updateNotificationMessageStatus` for new work. This legacy
 * full-update helper remains only for the old notification-messages screen
 * until the Alerts UI remap removes that route.
 */
export async function updateNotificationMessage(
  id: string,
  payload: ApiNotificationMessageLegacyWriteRequest
): Promise<ApiNotificationMessageRecord> {
  return requestJson<ApiNotificationMessageRecord>(
    `${NOTIFICATION_MESSAGES_BASE_URL}/${id}`,
    jsonRequestInit('PUT', payload)
  );
}

/**
 * @deprecated Notification messages are generated records. Delete remains only
 * for the old notification-messages screen until the Alerts UI remap removes
 * that route.
 */
export async function deleteNotificationMessage(
  id: string
): Promise<ApiMessageSystemDeleteResponse> {
  return requestJson<ApiMessageSystemDeleteResponse>(
    `${NOTIFICATION_MESSAGES_BASE_URL}/${id}`,
    {
      method: 'DELETE',
    }
  );
}

export async function listPollens(): Promise<MessageSystemOption[]> {
  const response = await requestJson<unknown>(POLLEN_BASE_URL);
  return normalizeMessageSystemStringOptions(response, ['pollen', 'pollens']);
}

export async function listLocations(): Promise<MessageSystemOption[]> {
  const response = await requestJson<unknown>(LOCATIONS_BASE_URL);
  return normalizeMessageSystemStringOptions(
    response,
    ['locations', 'location'],
    ['id', 'code', 'value', 'name', 'label'],
    ['name', 'label', 'id', 'code', 'value']
  );
}
