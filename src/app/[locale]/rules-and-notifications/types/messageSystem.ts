export type MessageSystemApiId = string | number;

export type MessageSystemAlertType = 'green' | 'yellow' | 'red';
export type MessageSystemFrequency =
  | 'immediately'
  | 'daily_summary'
  | 'weekly_summary';
export type MessageSystemNotificationMessageStatus = 'RESOLVED' | 'UNRESOLVED';

export interface MessageSystemOption {
  id: string;
  label: string;
  value: string;
}

export interface ApiNotificationRecord {
  id: MessageSystemApiId;
  name: string;
  recipients: string[];
  frequency: MessageSystemFrequency | string;
  alert_types: string[];
}

export interface ApiNotificationWriteRequest {
  id?: MessageSystemApiId;
  name: string;
  recipients: string[];
  frequency: MessageSystemFrequency | string;
  alert_types: string[];
}

export interface ApiRuleInterval {
  start_date: string;
  end_date: string;
}

export interface ApiRuleEmbeddedAlert {
  id?: MessageSystemApiId;
  type: MessageSystemAlertType | string;
  min_value: number;
  max_value: number;
}

export interface ApiRuleRecord {
  id: MessageSystemApiId;
  name: string;
  pollen: string;
  intervals: ApiRuleInterval[];
  locations: string[];
  notification_ids: number[];
  alerts: ApiRuleEmbeddedAlert[];
  description: string;
  enabled: boolean;
}

export interface ApiRuleWriteRequest {
  id?: MessageSystemApiId;
  name: string;
  pollen: string;
  intervals: ApiRuleInterval[];
  locations: string[];
  notification_ids: number[];
  alerts: ApiRuleEmbeddedAlert[];
  description: string;
  enabled: boolean;
}

/**
 * @deprecated `/api/alerts` is deprecated. New Alerts UI work should use
 * notification messages instead.
 */
export interface ApiAlertRecord {
  id: MessageSystemApiId;
  rule_id: number;
  type: MessageSystemAlertType | string;
  min_value: number;
  max_value: number;
}

/**
 * @deprecated `/api/alerts` is deprecated. New Alerts UI work should use
 * notification messages instead.
 */
export interface ApiAlertWriteRequest {
  id?: MessageSystemApiId;
  rule_id: number;
  type: MessageSystemAlertType | string;
  min_value: number;
  max_value: number;
}

export interface ApiNotificationMessageRecord {
  id: MessageSystemApiId;
  notification_id: MessageSystemApiId;
  rule_id: MessageSystemApiId;
  alert_id: MessageSystemApiId;
  creation_date: string;
  value_creation_date?: string | null;
  pollen: string;
  location: string;
  value: number;
  description: string;
  status: MessageSystemNotificationMessageStatus | string;
  notification?: ApiNotificationRecord | ApiNotificationRecord[] | null;
  rule?: unknown;
  alert?: unknown;
}

export interface ApiNotificationMessageStatusWriteRequest {
  status: MessageSystemNotificationMessageStatus | string;
}

/**
 * @deprecated Notification messages are backend-generated. This legacy shape is
 * retained only so the old, not-yet-remapped UI keeps compiling until the Alerts
 * UI migration slice removes it.
 */
export interface ApiNotificationMessageLegacyWriteRequest {
  id?: MessageSystemApiId;
  measure_id: number;
  notification_id: number;
  creation_date: string;
  value: number;
  description: string;
}

export interface ApiMessageSystemDeleteResponse {
  status?: string;
  id?: MessageSystemApiId;
}

export type MessageSystemId = string;

export interface NotificationRecord {
  id: MessageSystemId;
  name: string;
  recipients: string[];
  frequency: string;
  alertTypes: string[];
}

export interface NotificationMessageNotificationRecord {
  id: MessageSystemId;
  name: string;
  recipients: string[];
  frequency: string;
  alertTypes: string[];
}

export interface RuleRecord {
  id: MessageSystemId;
  name: string;
  pollen: string;
  intervals: ApiRuleInterval[];
  locations: string[];
  notificationIds: number[];
  alerts: RuleEmbeddedAlertRecord[];
  description: string;
  enabled: boolean;
  /** @deprecated Temporary compatibility for the old Rules UI. */
  measureId: number | null;
  /** @deprecated Temporary compatibility for the old Rules UI. */
  startDate: string;
  /** @deprecated Temporary compatibility for the old Rules UI. */
  endDate: string;
  /** @deprecated Temporary compatibility for the old Rules UI. */
  locationIds: number[];
}

export interface RuleEmbeddedAlertRecord {
  id?: MessageSystemId;
  type: string;
  minValue: number | null;
  maxValue: number | null;
}

/** @deprecated `/api/alerts` is deprecated. */
export interface AlertRecord {
  id: MessageSystemId;
  ruleId: number | null;
  type: string;
  minValue: number | null;
  maxValue: number | null;
}

export interface NotificationMessageRecord {
  id: MessageSystemId;
  notificationId: MessageSystemId;
  ruleId: MessageSystemId;
  alertId: MessageSystemId;
  creationDate: string;
  valueCreationDate: string;
  pollen: string;
  location: string;
  value: number | null;
  description: string;
  status: string;
  notification?: unknown;
  notifications: NotificationMessageNotificationRecord[];
  rule?: unknown;
  alert?: unknown;
  /** @deprecated Temporary compatibility for the old Notification Messages UI. */
  measureId: number | null;
}
