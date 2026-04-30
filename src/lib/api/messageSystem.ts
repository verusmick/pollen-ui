import type {
  ApiAlertRecord,
  ApiAlertWriteRequest,
  ApiMessageSystemDeleteResponse,
  ApiNotificationMessageRecord,
  ApiNotificationMessageWriteRequest,
  ApiNotificationRecord,
  ApiNotificationWriteRequest,
  ApiRuleRecord,
  ApiRuleWriteRequest,
} from '@/app/[locale]/rules-and-notifications/types';

const NOTIFICATIONS_BASE_URL = '/api/notifications';
const RULES_BASE_URL = '/api/rules';
const ALERTS_BASE_URL = '/api/alerts';
const NOTIFICATION_MESSAGES_BASE_URL = '/api/notification-messages';

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

export async function listAlerts(): Promise<ApiAlertRecord[]> {
  return requestJson<ApiAlertRecord[]>(ALERTS_BASE_URL);
}

export async function getAlert(id: string): Promise<ApiAlertRecord> {
  return requestJson<ApiAlertRecord>(`${ALERTS_BASE_URL}/${id}`);
}

export async function createAlert(
  payload: ApiAlertWriteRequest
): Promise<ApiAlertRecord> {
  return requestJson<ApiAlertRecord>(
    ALERTS_BASE_URL,
    jsonRequestInit('POST', payload)
  );
}

export async function updateAlert(
  id: string,
  payload: ApiAlertWriteRequest
): Promise<ApiAlertRecord> {
  return requestJson<ApiAlertRecord>(
    `${ALERTS_BASE_URL}/${id}`,
    jsonRequestInit('PUT', payload)
  );
}

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

export async function createNotificationMessage(
  payload: ApiNotificationMessageWriteRequest
): Promise<ApiNotificationMessageRecord> {
  return requestJson<ApiNotificationMessageRecord>(
    NOTIFICATION_MESSAGES_BASE_URL,
    jsonRequestInit('POST', payload)
  );
}

export async function updateNotificationMessage(
  id: string,
  payload: ApiNotificationMessageWriteRequest
): Promise<ApiNotificationMessageRecord> {
  return requestJson<ApiNotificationMessageRecord>(
    `${NOTIFICATION_MESSAGES_BASE_URL}/${id}`,
    jsonRequestInit('PUT', payload)
  );
}

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
