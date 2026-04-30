export type MessageSystemApiId = string | number;

export type MessageSystemAlertType = 'green' | 'yellow' | 'red';
export type MessageSystemFrequency = 'immediately';

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

export interface ApiRuleRecord {
  id: MessageSystemApiId;
  name: string;
  measure_id: number;
  start_date: string;
  end_date: string;
  location_ids: number[];
  notification_ids: number[];
  description: string;
  enabled: boolean;
}

export interface ApiRuleWriteRequest {
  id?: MessageSystemApiId;
  name: string;
  measure_id: number;
  start_date: string;
  end_date: string;
  location_ids: number[];
  notification_ids: number[];
  description: string;
  enabled: boolean;
}

export interface ApiAlertRecord {
  id: MessageSystemApiId;
  rule_id: number;
  type: MessageSystemAlertType | string;
  min_value: number;
  max_value: number;
}

export interface ApiAlertWriteRequest {
  id?: MessageSystemApiId;
  rule_id: number;
  type: MessageSystemAlertType | string;
  min_value: number;
  max_value: number;
}

export interface ApiNotificationMessageRecord {
  id: MessageSystemApiId;
  measure_id: number;
  notification_id: number;
  creation_date: string;
  value: number;
  description: string;
}

export interface ApiNotificationMessageWriteRequest {
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

export interface RuleRecord {
  id: MessageSystemId;
  name: string;
  measureId: number | null;
  startDate: string;
  endDate: string;
  locationIds: number[];
  notificationIds: number[];
  description: string;
  enabled: boolean;
}

export interface AlertRecord {
  id: MessageSystemId;
  ruleId: number | null;
  type: string;
  minValue: number | null;
  maxValue: number | null;
}

export interface NotificationMessageRecord {
  id: MessageSystemId;
  measureId: number | null;
  notificationId: number | null;
  creationDate: string;
  value: number | null;
  description: string;
}
