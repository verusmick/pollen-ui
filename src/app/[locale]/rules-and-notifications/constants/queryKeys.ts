export const messageSystemKeys = {
  all: ['messageSystem'] as const,

  notifications: () =>
    [...messageSystemKeys.all, 'notifications'] as const,
  notificationsList: () =>
    [...messageSystemKeys.notifications(), 'list'] as const,
  notificationDetails: () =>
    [...messageSystemKeys.notifications(), 'detail'] as const,
  notificationDetail: (id: string) =>
    [...messageSystemKeys.notificationDetails(), id] as const,

  rules: () => [...messageSystemKeys.all, 'rules'] as const,
  rulesList: () => [...messageSystemKeys.rules(), 'list'] as const,
  ruleDetails: () => [...messageSystemKeys.rules(), 'detail'] as const,
  ruleDetail: (id: string) =>
    [...messageSystemKeys.ruleDetails(), id] as const,

  alerts: () => [...messageSystemKeys.all, 'alerts'] as const,
  alertsList: () => [...messageSystemKeys.alerts(), 'list'] as const,
  alertDetails: () => [...messageSystemKeys.alerts(), 'detail'] as const,
  alertDetail: (id: string) =>
    [...messageSystemKeys.alertDetails(), id] as const,

  notificationMessages: () =>
    [...messageSystemKeys.all, 'notificationMessages'] as const,
  notificationMessagesList: () =>
    [...messageSystemKeys.notificationMessages(), 'list'] as const,
  notificationMessageDetails: () =>
    [...messageSystemKeys.notificationMessages(), 'detail'] as const,
  notificationMessageDetail: (id: string) =>
    [...messageSystemKeys.notificationMessageDetails(), id] as const,

  options: () => [...messageSystemKeys.all, 'options'] as const,
  pollenOptions: () => [...messageSystemKeys.options(), 'pollen'] as const,
  locationOptions: () => [...messageSystemKeys.options(), 'locations'] as const,
};
