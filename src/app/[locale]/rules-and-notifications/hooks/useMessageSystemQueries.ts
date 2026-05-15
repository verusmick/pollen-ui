'use client';

import { useQuery } from '@tanstack/react-query';

import {
  getAlert,
  getNotification,
  getNotificationMessage,
  getRule,
  listAlerts,
  listLocations,
  listNotificationMessages,
  listNotifications,
  listPollens,
  listRules,
} from '@/lib/api/messageSystem';

import {
  MESSAGE_SYSTEM_QUERY_STALE_TIME_MS,
  messageSystemKeys,
} from '../constants';
import type {
  AlertRecord,
  MessageSystemOption,
  NotificationMessageRecord,
  NotificationRecord,
  RuleRecord,
} from '../types';
import {
  mapApiAlertRecord,
  mapApiAlertRecords,
  mapApiNotificationMessageRecord,
  mapApiNotificationMessageRecords,
  mapApiNotificationRecord,
  mapApiNotificationRecords,
  mapApiRuleRecord,
  mapApiRuleRecords,
} from '../utils';

export function useNotificationsList() {
  return useQuery<NotificationRecord[]>({
    queryKey: messageSystemKeys.notificationsList(),
    queryFn: async () => {
      const response = await listNotifications();
      return mapApiNotificationRecords(response);
    },
    staleTime: MESSAGE_SYSTEM_QUERY_STALE_TIME_MS,
  });
}

export function useNotificationDetail(id?: string) {
  return useQuery<NotificationRecord>({
    queryKey: messageSystemKeys.notificationDetail(id ?? ''),
    queryFn: async () => {
      if (!id) {
        throw new Error('Notification id is required.');
      }

      const response = await getNotification(id);
      return mapApiNotificationRecord(response);
    },
    enabled: Boolean(id),
    staleTime: MESSAGE_SYSTEM_QUERY_STALE_TIME_MS,
  });
}

export function useRulesList() {
  return useQuery<RuleRecord[]>({
    queryKey: messageSystemKeys.rulesList(),
    queryFn: async () => {
      const response = await listRules();
      return mapApiRuleRecords(response);
    },
    staleTime: MESSAGE_SYSTEM_QUERY_STALE_TIME_MS,
  });
}

export function useRuleDetail(id?: string) {
  return useQuery<RuleRecord>({
    queryKey: messageSystemKeys.ruleDetail(id ?? ''),
    queryFn: async () => {
      if (!id) {
        throw new Error('Rule id is required.');
      }

      const response = await getRule(id);
      return mapApiRuleRecord(response);
    },
    enabled: Boolean(id),
    staleTime: MESSAGE_SYSTEM_QUERY_STALE_TIME_MS,
  });
}

export function useAlertsList() {
  return useQuery<AlertRecord[]>({
    queryKey: messageSystemKeys.alertsList(),
    queryFn: async () => {
      const response = await listAlerts();
      return mapApiAlertRecords(response);
    },
    staleTime: MESSAGE_SYSTEM_QUERY_STALE_TIME_MS,
  });
}

export function useAlertDetail(id?: string) {
  return useQuery<AlertRecord>({
    queryKey: messageSystemKeys.alertDetail(id ?? ''),
    queryFn: async () => {
      if (!id) {
        throw new Error('Alert id is required.');
      }

      const response = await getAlert(id);
      return mapApiAlertRecord(response);
    },
    enabled: Boolean(id),
    staleTime: MESSAGE_SYSTEM_QUERY_STALE_TIME_MS,
  });
}

export function usePollenOptions() {
  return useQuery<MessageSystemOption[]>({
    queryKey: messageSystemKeys.pollenOptions(),
    queryFn: listPollens,
    staleTime: MESSAGE_SYSTEM_QUERY_STALE_TIME_MS,
  });
}

export function useLocationOptions() {
  return useQuery<MessageSystemOption[]>({
    queryKey: messageSystemKeys.locationOptions(),
    queryFn: listLocations,
    staleTime: MESSAGE_SYSTEM_QUERY_STALE_TIME_MS,
  });
}

export function useNotificationMessagesList() {
  return useQuery<NotificationMessageRecord[]>({
    queryKey: messageSystemKeys.notificationMessagesList(),
    queryFn: async () => {
      const response = await listNotificationMessages();
      return mapApiNotificationMessageRecords(response);
    },
    staleTime: MESSAGE_SYSTEM_QUERY_STALE_TIME_MS,
  });
}

export function useNotificationMessageDetail(id?: string) {
  return useQuery<NotificationMessageRecord>({
    queryKey: messageSystemKeys.notificationMessageDetail(id ?? ''),
    queryFn: async () => {
      if (!id) {
        throw new Error('Notification message id is required.');
      }

      const response = await getNotificationMessage(id);
      return mapApiNotificationMessageRecord(response);
    },
    enabled: Boolean(id),
    staleTime: MESSAGE_SYSTEM_QUERY_STALE_TIME_MS,
  });
}
