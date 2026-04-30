## Correction Factors - active backend dependencies
Foundation/data scaffolding is implemented. Remaining backend dependencies are centered on event-level review persistence, payload parity, and preview sourcing:
- GET /api/correctionFactors/:id exists and returns stored detail multipliers
- New review source of truth is per validation-event reviewed classification; correction-table counts and multipliers are derived from event assignments
- The review workflow is now adaptive drill-down: the selected date range defines the root chart range, broad bucket clicks narrow the visible range, and only final-granularity review slices can load validation-event images
- Do not preload validation-event images for the full date range; the validation-event request needs final-review-slice timestamps from the chart selection
- Current correction-factor detail payloads do not restore per-event reviewed classifications from stored multipliers
- Current correction-factor detail payloads also do not restore the original drill-down path or the originally reviewed final slice
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
