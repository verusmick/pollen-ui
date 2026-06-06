## Correction Factors - active backend dependencies
Foundation/data scaffolding is implemented. Backend support now includes persisted reviewed peak/image data through the correction-factor `peaks` key. Remaining backend dependencies are centered on payload parity details and preview sourcing:
- GET /api/correctionFactors/:id exists and returns stored detail multipliers
- New review source of truth is per validation-event reviewed classification; correction-table counts and multipliers are derived from event assignments
- The review workflow is now adaptive drill-down: the selected date range defines the root chart range, broad bucket clicks narrow the visible range, and only final-granularity review slices can load validation-event images
- Do not preload validation-event images for the full date range; the validation-event request needs final-review-slice timestamps from the chart selection
- Correction-factor responses can now return persisted selected peaks and reviewed images via `peaks`; frontend API/domain mappers normalize that shape, edit mode hydrates the first persisted peak deterministically for v1, and event-based write payloads include reviewed peak images when form state has them
- Manual override mode is intentionally independent from event review: chart peak selection remains available as reference, the correction result shows only the manual multiplier, the review panel is disabled, and write payloads do not persist selected peak/images
- Stored detail multipliers alone still do not restore per-event reviewed classifications
- Full multi-peak edit restoration remains a future UI workflow concern; v1 restores the first persisted peak and its selected images
- Avoid reintroducing manual reviewed-count inputs as a fallback; event images default to `UNKNOWN` until event-level assignments are available or reviewed
- Need confirmation how `UNKNOWN` is encoded in payloads and whether `UNKNOWN` details are omitted
- factor_percentage appears to be ratio-based (0..1) from current GET samples
- Measurements preview source is now available at GET /api/measurements
- Need confirmation whether drill-down buckets and final review slices come from upstream metadata or should be derived client-side from measurements
- Current measurements samples may return `polle` instead of `pollen`; UI code should treat this as an adapter-layer normalization concern
- Validation-event images and detected counts are sourced from `https://validation.pollenscience.eu/resources/q`
- Validation location names are now enriched from `https://validation.pollenscience.eu/resources/locations`
- Correction-factor locations are matched against validation locations by canonical name, device alias, and normalized name comparison; unresolved locations still block validation-event loading with a field-level error

## Message System - POC API foundation
Slice 2 API foundation is implemented for notifications, rules, alerts, and notification messages: internal proxy routes, typed `src/lib/api/messageSystem.ts` helpers, route-local types/constants/hooks/utils, and the kebab-case internal `/api/notification-messages` proxy forwarding to upstream `/api/notificationMessages`. No CRUD screens, UI routes, or i18n message files have been implemented yet.

## Message System - POC route shell
Slice 3 route shell is implemented: `/rules-and-notifications` redirects to `/rules-and-notifications/notifications`, route-local tabs link to notifications, rules, alerts, and notification messages, and each module has an i18n-backed placeholder list page. `messageSystemPage` keys were added to all supported locale files. CRUD screens and UI API calls are still not implemented.

## Message System - Notifications CRUD POC
Slice 4 Notifications CRUD POC is implemented: notifications list, create, edit, and delete screens use the Slice 2 API foundation, React Query reads/mutations, local form state, and `messageSystemPage.notifications` i18n keys. Rules, alerts, and notification messages CRUD screens remain placeholders.

## Route grouping adjustment - Alerts with Correction Factors
Alerts are now grouped in the UI under `/alerts-and-correction-factors/alerts` next to Correction Factors. Rules and Notifications tabs now include only notifications, rules, and notification messages. The message-system API contract still owns Alerts endpoints, but Alerts CRUD should be implemented under the Alerts and Correction Factors route group.

## Message System - Rules CRUD POC
Slice 5 Rules CRUD POC is implemented under `/rules-and-notifications/rules`: list, create, edit, and delete screens use the Slice 2 API foundation, React Query reads/mutations, local form state, and `messageSystemPage.rules` i18n keys. Rule notification selection is populated from the Notifications list. Alerts and notification messages CRUD screens remain unimplemented.

## Message System - Alerts CRUD POC
Slice 6 Alerts CRUD POC is implemented under `/alerts-and-correction-factors/alerts`: list, create, edit, and delete screens use the Slice 2 message-system API foundation, React Query reads/mutations, local form state, and `alertsAndCorrectionFactorsPage.alerts` i18n keys. Alert rule selection is populated from the Rules list. Notification messages CRUD remains unimplemented.

## Message System - Notification messages CRUD POC
Slice 7 Notification messages CRUD POC is implemented under `/rules-and-notifications/notification-messages`: list, create, edit, and delete screens use the Slice 2 message-system API foundation, React Query reads/mutations, local form state, and `messageSystemPage.notificationMessages` i18n keys. Notification message notification selection is populated from the Notifications list. All planned message-system POC CRUD screens are now implemented.

## Message System - Pre-review adjustments
Pre-review cleanup is implemented for the completed message-system POC: client-facing copy no longer exposes POC/backend wording, notification frequency options now include `daily_summary` and `weekly_summary`, Rules start/end dates use `datetime-local` inputs with backend-compatible payload conversion, route-local API error normalization hides raw parse/server details from users while logging them, and Alerts list min/max values display the `Pollen/m³` unit.

## Message System - API realignment pending implementation
Documentation has been realigned to the new Postman export: `/api/alerts` is deprecated, Rules now own embedded alerts and use `pollen`, `locations`, `notification_ids`, generated `intervals`, `description`, and `enabled`, and the Alerts UI should be backed by `/api/notificationMessages` with list plus status edit only. Notification message create UI and trigger UI are out of scope for the next implementation pass; Correction Factors remain unchanged.

## Message System - API foundation realignment
API foundation has been realigned for the new message-system contract: rule types/helpers now target `pollen`, `locations`, generated `intervals`, `notification_ids`, embedded `alerts`, `description`, and `enabled`; notification messages include rule/alert/pollen/location/status fields and have a status-only update helper; pollen/location option helpers and hooks use `/api/pollen` and `/api/locations`. Deprecated `/api/alerts` helpers and legacy notification-message write helpers remain only as transitional support for the old screens until the Rules UI and Alerts UI remap slices remove them.

## Message System - Alerts UI remap
Navigation has been remapped so Rules and Notifications exposes only Notifications and Rules, while Alerts under Alerts and Correction Factors is backed by notification messages. The Alerts list now reads notification-message records and the Alerts edit route is status-only using `updateNotificationMessageStatus`; create/delete/trigger actions are not exposed. Old notification-message routes and the old Alerts create route redirect to the remapped Alerts experience. Correction Factors behavior remains unchanged.

## Message System - Rules form realignment
Rules CRUD UI has been realigned to the new rule contract: list rows show pollen, locations, notifications, embedded alert summaries, and enabled state; create/edit forms load pollen and location options, collect notification ids, and submit embedded alert thresholds in the rule payload. The form no longer sends `measure_id`, `location_ids`, or top-level `start_date`/`end_date`.

## Message System - Rules/Alerts UI polish
Rules and notification-message-backed Alerts received focused UI polish: Rules threshold summaries are stacked with `Pollen/m³` units, embedded threshold labels include value units, Rules flight periods collect month/day only and submit one fixed-year 2000 interval, Rules locations support multi-select, and Alerts list/detail displays trigger range plus value with `Pollen/m³`.

## Message System - Alerts detail chart
Alerts detail now loads `/api/measurements` for the alert pollen/location from three days before through three days after the alert/value occurrence date, renders a simple route-local chart with visible measurement points and an alert marker, and exposes a fixed CTA to open the existing new Correction Factor page with alert context query params. Correction Factors files and behavior remain unchanged; prefill from query params is still future work.

## Message System - Alerts notification display and value date alignment
Alerts notification-message mapping now supports `notification` as one object, an array, or missing/null; the Alerts list/detail display notification names instead of raw ids and the detail view includes recipients when present. Alerts Created display and alert chart occurrence-date usage now prefer `value_creation_date` with `creation_date` as a defensive fallback; status updates still send only `{ "status": ... }`.

## Message System - Alerts recipients label
Alerts list/detail copy now labels the notification field as notification recipients across supported locales.
