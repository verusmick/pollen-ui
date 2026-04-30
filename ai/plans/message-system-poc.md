# Message System POC Implementation Plan

## Goal

Implement a simple API POC for the message-system modules:

- Notifications
- Rules
- Alerts
- Notification messages

This plan is documentation for the future implementation only. Slice 1 does not
implement frontend code, API routes, i18n messages, or UI routes.

Primary references:

- API contract: `ai/contracts/message-system-api.md`
- Postman export: `pollen-api.postman_collection-2026-04-21 (1).json`
- Existing architecture guidance: `ai/context.md`
- Existing Correction Factors plan: `ai/plans/correction-factors-crud.md`
- Existing Correction Factors implementation under:
  `src/app/[locale]/alerts-and-correction-factors/correction-factors`

## Existing Correction Factors Patterns To Reuse

Reuse these patterns:

1. Keep feature code route-local.
   - Put route-specific components, hooks, constants, types, and utils under
     `src/app/[locale]/rules-and-notifications`.

2. Keep `page.tsx` files thin.
   - Pages should render client containers and pass only route params where
     needed.

3. Use internal API proxies.
   - Client code calls internal `/api/*` routes.
   - Internal route handlers forward to `POLLEN_API_BASE`.

4. Use a small `src/lib/api/*` helper.
   - Build request URLs.
   - Send JSON bodies.
   - Throw clear errors for non-OK responses.
   - Parse empty or JSON responses defensively.

5. Use React Query for server state.
   - List/detail reads use `useQuery`.
   - Writes use `useMutation`.
   - Mutations invalidate the affected query-key families.

6. Use local form state.
   - Use `useState` or small route-local form hooks.
   - Do not add a form library.
   - Do not use Zustand for this POC unless a later requirement introduces
     shared cross-route state.

7. Keep user-facing text in `next-intl`.
   - No hardcoded labels, buttons, empty states, errors, or confirmation text in
     implementation components.
   - Add keys to all supported files under `/messages` when implementation
     begins.

8. Avoid premature shared abstractions.
   - Do not introduce a generic CRUD framework.
   - Share tiny helpers only when they remove obvious duplication without hiding
     the POC behavior.

## Recommended Route Structure

Use the existing placeholder route as the route root:

```text
src/app/[locale]/rules-and-notifications/
  layout.tsx
  page.tsx
  notifications/
    page.tsx
    new/
      page.tsx
    [notificationId]/
      edit/
        page.tsx
  rules/
    page.tsx
    new/
      page.tsx
    [ruleId]/
      edit/
        page.tsx
  alerts/
    page.tsx
    new/
      page.tsx
    [alertId]/
      edit/
        page.tsx
  notification-messages/
    page.tsx
    new/
      page.tsx
    [notificationMessageId]/
      edit/
        page.tsx
```

Recommended behavior:

- `/rules-and-notifications` should route to or render the Notifications list as
  the default POC entry.
- `layout.tsx` should provide simple tabs for:
  - Notifications
  - Rules
  - Alerts
  - Notification messages
- Tabs must use `next-intl`.
- Do not use Figma as source of truth for this POC.

## Recommended Route-Local File Structure

Keep the POC grouped under the route root:

```text
src/app/[locale]/rules-and-notifications/
  components/
    index.ts
    shared/
      MessageSystemPageHeader.tsx
      MessageSystemStateBlock.tsx
      MessageSystemActions.tsx
    notifications/
      NotificationsListContainer.tsx
      NotificationsTable.tsx
      NotificationFormContainer.tsx
      NotificationForm.tsx
    rules/
      RulesListContainer.tsx
      RulesTable.tsx
      RuleFormContainer.tsx
      RuleForm.tsx
    alerts/
      AlertsListContainer.tsx
      AlertsTable.tsx
      AlertFormContainer.tsx
      AlertForm.tsx
    notification-messages/
      NotificationMessagesListContainer.tsx
      NotificationMessagesTable.tsx
      NotificationMessageFormContainer.tsx
      NotificationMessageForm.tsx
  hooks/
    index.ts
    useNotificationsList.ts
    useNotificationDetail.ts
    useRulesList.ts
    useRuleDetail.ts
    useAlertsList.ts
    useAlertDetail.ts
    useNotificationMessagesList.ts
    useNotificationMessageDetail.ts
  constants/
    index.ts
    queryKeys.ts
    formDefaults.ts
    messageSystemOptions.ts
  types/
    index.ts
    messageSystem.ts
  utils/
    index.ts
    messageSystemMappers.ts
    messageSystemPayloads.ts
    messageSystemErrors.ts
    messageSystemParsing.ts
```

Keep shared route-local components minimal.

Acceptable route-local shared components:

- a simple page header
- a simple loading/error/empty block
- a small actions row if repeated across forms

Avoid:

- generic CRUD table builders
- generic schema-driven form builders
- global message-system state stores

## API Proxy, Client, And Query Strategy

### Internal Proxy Routes

Create these in the API implementation slice, not in Slice 1:

```text
src/app/api/notifications/route.ts
src/app/api/notifications/[notificationId]/route.ts

src/app/api/rules/route.ts
src/app/api/rules/[ruleId]/route.ts

src/app/api/alerts/route.ts
src/app/api/alerts/[alertId]/route.ts

src/app/api/notification-messages/route.ts
src/app/api/notification-messages/[notificationMessageId]/route.ts
```

Forwarding:

- `/api/notifications` -> `${POLLEN_API_BASE}/api/notifications`
- `/api/rules` -> `${POLLEN_API_BASE}/api/rules`
- `/api/alerts` -> `${POLLEN_API_BASE}/api/alerts`
- `/api/notification-messages` ->
  `${POLLEN_API_BASE}/api/notificationMessages`

Route handlers should follow the Correction Factors proxy style:

- read `POLLEN_API_BASE`
- preserve query strings if present
- forward JSON request bodies for `POST` and `PUT`
- return upstream body and content type
- treat missing env as an error

### Client Helper

Create one grouped helper:

```text
src/lib/api/messageSystem.ts
```

Recommended exported functions:

```ts
getNotifications()
getNotificationById(id)
createNotification(payload)
updateNotification(id, payload)
deleteNotification(id)

getRules()
getRuleById(id)
createRule(payload)
updateRule(id, payload)
deleteRule(id)

getAlerts()
getAlertById(id)
createAlert(payload)
updateAlert(id, payload)
deleteAlert(id)

getNotificationMessages()
getNotificationMessageById(id)
createNotificationMessage(payload)
updateNotificationMessage(id, payload)
deleteNotificationMessage(id)
```

Use one internal `requestJson<T>()` helper local to this file, mirroring
Correction Factors.

### Types

Keep API payload types and UI-normalized record types in the route-local
`types/messageSystem.ts`.

Recommended normalization:

- API ids can be `string | number`
- UI ids should be strings
- arrays should default to `[]` in mappers
- missing optional text should default to `''` in form values

Do not over-model response envelopes until backend response shapes are verified.

### Query Keys

Use a grouped route-local key factory:

```ts
export const messageSystemKeys = {
  all: ['messageSystem'] as const,
  notifications: () => [...messageSystemKeys.all, 'notifications'] as const,
  notificationsList: () => [...messageSystemKeys.notifications(), 'list'] as const,
  notificationDetail: (id: string) =>
    [...messageSystemKeys.notifications(), 'detail', id] as const,

  rules: () => [...messageSystemKeys.all, 'rules'] as const,
  rulesList: () => [...messageSystemKeys.rules(), 'list'] as const,
  ruleDetail: (id: string) =>
    [...messageSystemKeys.rules(), 'detail', id] as const,

  alerts: () => [...messageSystemKeys.all, 'alerts'] as const,
  alertsList: () => [...messageSystemKeys.alerts(), 'list'] as const,
  alertDetail: (id: string) =>
    [...messageSystemKeys.alerts(), 'detail', id] as const,

  notificationMessages: () =>
    [...messageSystemKeys.all, 'notificationMessages'] as const,
  notificationMessagesList: () =>
    [...messageSystemKeys.notificationMessages(), 'list'] as const,
  notificationMessageDetail: (id: string) =>
    [...messageSystemKeys.notificationMessages(), 'detail', id] as const,
};
```

Use `staleTime: 1000 * 60 * 10` for simple list/detail reads, matching the
Correction Factors option/list behavior.

### Mutation Invalidations

After create/update/delete:

- Notifications:
  - invalidate notification list/detail
  - invalidate rules list/detail if rule UI displays notification names
  - invalidate notification messages list/detail if message UI displays
    notification names

- Rules:
  - invalidate rules list/detail
  - invalidate alerts list/detail if alert UI displays rule names

- Alerts:
  - invalidate alerts list/detail

- Notification messages:
  - invalidate notification messages list/detail

For the POC, invalidating the affected list family after each mutation is
sufficient. Add dependent invalidations only where the UI displays joined names.

## Minimal UI Behavior Per Module

All screens should be basic and dense, similar to Correction Factors list/form
structure, without final visual design work.

### Shared List Behavior

Each module list should include:

- title and short description
- create button
- table
- loading state
- error state
- empty state
- edit link per row
- delete button per row
- delete confirmation

No server-side filters are documented. Do not add API query params for these
lists unless backend support is confirmed.

### Shared Form Behavior

Each create/edit form should include:

- local state
- basic required-field checks
- submit button
- cancel/back link
- loading state for edit detail
- save error state
- delete action on edit pages if useful

Do not add complex validation, schema libraries, or final workflow design.

### Notifications

List columns:

- ID
- Name
- Recipients
- Frequency
- Alert types
- Actions

Form fields:

- `name`: text input
- `recipients`: textarea accepting comma-separated or newline-separated emails
- `frequency`: select with `immediately`
- `alert_types`: checkboxes for `green`, `yellow`, `red`

Payload mapping:

- split recipients textarea into `string[]`
- remove empty recipient entries
- send selected alert types as `alert_types`

### Rules

List columns:

- ID
- Name
- Measure ID
- Date range
- Location IDs
- Notification IDs
- Enabled
- Actions

Form fields:

- `name`: text input
- `measure_id`: number input
- `start_date`: simple datetime/text input
- `end_date`: simple datetime/text input
- `location_ids`: numeric comma-separated input for POC
- `notification_ids`: multi-select/checklist from notifications list
- `description`: textarea
- `enabled`: checkbox

POC default:

- keep `location_ids` as numeric manual entry until `/api/locations` numeric id
  compatibility is verified
- use notifications list for notification choices

### Alerts

List columns:

- ID
- Rule ID or rule name if available
- Type
- Min value
- Max value
- Actions

Form fields:

- `rule_id`: select from rules list
- `type`: select with `green`, `yellow`, `red`
- `min_value`: number input
- `max_value`: number input

POC validation:

- require `rule_id`
- require type
- parse min/max as numbers
- do not block on advanced range-overlap validation

### Notification Messages

List columns:

- ID
- Notification ID or notification name if available
- Measure ID
- Creation date
- Value
- Description
- Actions

Form fields:

- `measure_id`: number input
- `notification_id`: select from notifications list
- `creation_date`: simple datetime/text input
- `value`: number input
- `description`: textarea

POC note:

- If backend later confirms messages are generated history, convert create/edit
  to read-only detail behavior in a later slice.

## i18n Strategy

Implementation must add a new namespace to every supported file under
`/messages`:

```json
{
  "messageSystemPage": {
    "tabs": {},
    "shared": {},
    "notifications": {},
    "rules": {},
    "alerts": {},
    "notificationMessages": {}
  }
}
```

Supported files currently include:

- `messages/en.json`
- `messages/es.json`
- `messages/de.json`
- `messages/fr.json`
- `messages/nl.json`
- `messages/ar.json`

Suggested namespace shape:

```text
messageSystemPage.tabs.*
messageSystemPage.shared.actions.*
messageSystemPage.shared.states.*
messageSystemPage.shared.validation.*
messageSystemPage.notifications.list.*
messageSystemPage.notifications.form.*
messageSystemPage.rules.list.*
messageSystemPage.rules.form.*
messageSystemPage.alerts.list.*
messageSystemPage.alerts.form.*
messageSystemPage.notificationMessages.list.*
messageSystemPage.notificationMessages.form.*
```

Also replace hardcoded user-facing strings in touched files, especially:

- route tabs in `rules-and-notifications/layout.tsx`
- placeholder text in `rules-and-notifications/page.tsx`
- any labels/buttons/errors in new list and form components

Do not modify message files in Slice 1.

## Implementation Slices

### Slice 1 - Documentation Only

Create:

- `ai/contracts/message-system-api.md`
- `ai/plans/message-system-poc.md`

Do not create app code, API routes, message keys, or UI routes.

### Slice 2 - API Foundation

Create:

- internal proxy routes for notifications, rules, alerts, and notification
  messages
- `src/lib/api/messageSystem.ts`
- route-local types, query keys, constants, mappers, and error helpers

No full UI yet beyond what is necessary to type-check helper imports if chosen.

### Slice 3 - Route Shell And i18n Foundation

Update:

- `src/app/[locale]/rules-and-notifications/page.tsx`
- add `src/app/[locale]/rules-and-notifications/layout.tsx`
- add route-local tabs
- add `messageSystemPage` keys to all supported message files

Default route should show or route to notifications.

### Slice 4 - Notifications CRUD

Implement:

- notifications list
- create form
- edit form
- delete behavior

This slice comes first because rules and notification messages depend on
notifications.

### Slice 5 - Rules CRUD

Implement:

- rules list
- create form
- edit form
- delete behavior
- notification option loading from notifications

Keep `measure_id` and `location_ids` simple unless backend catalogs are
confirmed.

### Slice 6 - Alerts CRUD

Implement:

- alerts list
- create form
- edit form
- delete behavior
- rule option loading from rules

### Slice 7 - Notification Messages CRUD

Implement:

- notification messages list
- create form
- edit form
- delete behavior
- notification option loading from notifications

### Slice 8 - POC Verification And Polish

Run:

- `npm run build`

Check:

- no hardcoded user-facing text in new components
- all supported message files contain matching keys
- lists load
- create/edit/delete flows invalidate and refresh lists
- route navigation works under locale-scoped routes

## Risks And Non-Goals

### Risks

- Response shapes are unknown because Postman includes no response examples for
  message-system endpoints.
- `measure_id` has no confirmed catalog endpoint.
- `/api/locations` may not expose numeric ids compatible with rule
  `location_ids`.
- Notification messages may be generated records rather than manually editable
  records.
- Alert enum values are only partially confirmed.
- Date format expectations are backend-specific and may reject browser-native
  datetime strings unless mapped carefully.

### Non-Goals

- No final Figma implementation.
- No final workflow design.
- No complex validation.
- No schema/form library.
- No Zustand store.
- No generic CRUD framework.
- No global message-system abstraction outside the existing API helper pattern.
- No measurement preview or rule simulation workflow.
- No backend-driven enum/catalog discovery unless existing endpoints clearly
  provide it.

## Files Likely To Be Created Or Modified

### Documentation

```text
ai/contracts/message-system-api.md
ai/plans/message-system-poc.md
```

### API Foundation

```text
src/lib/api/messageSystem.ts
src/app/api/notifications/route.ts
src/app/api/notifications/[notificationId]/route.ts
src/app/api/rules/route.ts
src/app/api/rules/[ruleId]/route.ts
src/app/api/alerts/route.ts
src/app/api/alerts/[alertId]/route.ts
src/app/api/notification-messages/route.ts
src/app/api/notification-messages/[notificationMessageId]/route.ts
```

### Route Feature

```text
src/app/[locale]/rules-and-notifications/layout.tsx
src/app/[locale]/rules-and-notifications/page.tsx
src/app/[locale]/rules-and-notifications/notifications/page.tsx
src/app/[locale]/rules-and-notifications/notifications/new/page.tsx
src/app/[locale]/rules-and-notifications/notifications/[notificationId]/edit/page.tsx
src/app/[locale]/rules-and-notifications/rules/page.tsx
src/app/[locale]/rules-and-notifications/rules/new/page.tsx
src/app/[locale]/rules-and-notifications/rules/[ruleId]/edit/page.tsx
src/app/[locale]/rules-and-notifications/alerts/page.tsx
src/app/[locale]/rules-and-notifications/alerts/new/page.tsx
src/app/[locale]/rules-and-notifications/alerts/[alertId]/edit/page.tsx
src/app/[locale]/rules-and-notifications/notification-messages/page.tsx
src/app/[locale]/rules-and-notifications/notification-messages/new/page.tsx
src/app/[locale]/rules-and-notifications/notification-messages/[notificationMessageId]/edit/page.tsx
src/app/[locale]/rules-and-notifications/components/*
src/app/[locale]/rules-and-notifications/hooks/*
src/app/[locale]/rules-and-notifications/constants/*
src/app/[locale]/rules-and-notifications/types/*
src/app/[locale]/rules-and-notifications/utils/*
```

### i18n

```text
messages/en.json
messages/es.json
messages/de.json
messages/fr.json
messages/nl.json
messages/ar.json
```

## Next Implementation Prompt

Implement Slice 2 only for the message-system POC.

Create the API foundation without building screens:

- Add internal Next API proxy routes for notifications, rules, alerts, and
  notification messages.
- Add `src/lib/api/messageSystem.ts` with list/detail/create/update/delete
  helpers for all four modules.
- Add route-local message-system types, query keys, enum-like constants, payload
  mappers, and error helpers under
  `src/app/[locale]/rules-and-notifications`.
- Follow the Correction Factors API/proxy/client conventions.
- Keep frontend UI routes and message files unchanged in this slice unless a
  minimal type-only barrel is needed.
- Do not implement CRUD screens yet.
- Do not introduce Zustand, form libraries, or a generic CRUD abstraction.
- Verify with TypeScript/build if possible.
