# Message System API Contract

## Scope

This document captures the API contract for the message-system POC.

Source of truth:

- Postman export: `pollen-api.postman_collection-2026-04-21 (1).json`

Modules covered:

- Notifications
- Rules
- Alerts
- Notification messages

This is intentionally one grouped contract because the modules depend on each
other:

- Rules reference notifications through `notification_ids`
- Alerts reference rules through `rule_id`
- Notification messages reference notifications through `notification_id`
- Rules also reference `location_ids` and `measure_id`

The contract documents the known request shapes from Postman. Response shapes
are not included in the Postman export and should be treated as open until
verified against the backend.

## Module Purposes

### Notifications

Notifications define a named delivery configuration:

- who receives a notification
- how often it is sent
- which alert types are included

### Rules

Rules define when notifications should be evaluated.

A rule connects:

- one measure
- one date range
- one or more locations
- one or more notifications
- an enabled/disabled state

### Alerts

Alerts define threshold ranges for a rule.

An alert connects:

- one rule
- one alert type
- minimum and maximum values

### Notification Messages

Notification messages represent message records connected to a notification and
measure.

The Postman collection includes full CRUD endpoints, so the POC should treat
messages as editable records unless the backend later clarifies that they are
generated or read-only.

## Endpoints

The Postman export uses `{{host}}/api/*`. In the frontend, these should be
accessed through internal Next API proxy routes that forward to
`POLLEN_API_BASE`.

### Notifications

```text
GET    /api/notifications
GET    /api/notifications/:notificationId
POST   /api/notifications
PUT    /api/notifications/:notificationId
DELETE /api/notifications/:notificationId
```

Known Postman examples:

```text
GET    {{host}}/api/notifications
GET    {{host}}/api/notifications/1
POST   {{host}}/api/notifications
PUT    {{host}}/api/notifications/1
DELETE {{host}}/api/notifications/2
```

### Rules

```text
GET    /api/rules
GET    /api/rules/:ruleId
POST   /api/rules
PUT    /api/rules/:ruleId
DELETE /api/rules/:ruleId
```

Known Postman examples:

```text
GET    {{host}}/api/rules
GET    {{host}}/api/rules/5
POST   {{host}}/api/rules
PUT    {{host}}/api/rules/5
DELETE {{host}}/api/rules/5
```

### Alerts

```text
GET    /api/alerts
GET    /api/alerts/:alertId
POST   /api/alerts
PUT    /api/alerts/:alertId
DELETE /api/alerts/:alertId
```

Known Postman examples:

```text
GET    {{host}}/api/alerts
GET    {{host}}/api/alerts/5
POST   {{host}}/api/alerts
PUT    {{host}}/api/alerts/6
DELETE {{host}}/api/alerts/5
```

### Notification Messages

The upstream API uses camelCase in the path:

```text
GET    /api/notificationMessages
GET    /api/notificationMessages/:notificationMessageId
POST   /api/notificationMessages
PUT    /api/notificationMessages/:notificationMessageId
DELETE /api/notificationMessages/:notificationMessageId
```

Known Postman examples:

```text
GET    {{host}}/api/notificationMessages
GET    {{host}}/api/notificationMessages/3
POST   {{host}}/api/notificationMessages
PUT    {{host}}/api/notificationMessages/3
DELETE {{host}}/api/notificationMessages/3
```

Frontend route/proxy naming should use kebab-case where possible, but the proxy
must forward to the upstream `notificationMessages` path.

## Request Payloads

### Create Notification

```json
{
  "name": "Notification 2",
  "recipients": ["milton.loayza@enjambre.com.bo"],
  "frequency": "immediately",
  "alert_types": ["green", "yellow", "red"]
}
```

### Update Notification

```json
{
  "id": 1,
  "name": "Notification 1 update",
  "recipients": ["milton.loayza@gamil.com.bo"],
  "frequency": "immediately",
  "alert_types": ["green"]
}
```

### Create Rule

```json
{
  "name": "Rule 4",
  "measure_id": 4,
  "start_date": "2026-04-05 00:00:00+00",
  "end_date": "2026-04-10 23:59:59+00",
  "location_ids": [979],
  "notification_ids": [1],
  "description": "Description 4",
  "enabled": true
}
```

### Update Rule

```json
{
  "id": 5,
  "name": "Rule 44",
  "measure_id": 4,
  "start_date": "2026-04-05 00:00:00+00",
  "end_date": "2026-04-10 23:59:59+00",
  "location_ids": [979],
  "notification_ids": [1],
  "description": "Description 44",
  "enabled": true
}
```

### Create Alert

```json
{
  "rule_id": 2,
  "type": "yellow",
  "min_value": 0.8,
  "max_value": 0.8
}
```

### Update Alert

```json
{
  "id": 6,
  "rule_id": 2,
  "type": "red",
  "min_value": 0.8,
  "max_value": 0.8
}
```

### Create Notification Message

```json
{
  "measure_id": 4,
  "notification_id": 1,
  "creation_date": "2026-04-05 00:00:00+00",
  "value": 10.5,
  "description": "Second Message"
}
```

### Update Notification Message

```json
{
  "id": 3,
  "measure_id": 4,
  "notification_id": 1,
  "creation_date": "2026-04-05 00:00:00+00",
  "value": 10.5,
  "description": "Thrid Message"
}
```

## Known Fields

### Shared

- `id`: numeric identifier in Postman examples. UI-normalized records should
  use string ids to match the Correction Factors pattern.
- `name`: display name.

### Notification

- `id`: notification id.
- `name`: notification name.
- `recipients`: array of email strings.
- `frequency`: delivery frequency string.
- `alert_types`: array of alert type strings.

### Rule

- `id`: rule id.
- `name`: rule name.
- `measure_id`: numeric measure id.
- `start_date`: backend datetime string.
- `end_date`: backend datetime string.
- `location_ids`: numeric location ids.
- `notification_ids`: numeric notification ids.
- `description`: free-text rule description.
- `enabled`: boolean rule state.

### Alert

- `id`: alert id.
- `rule_id`: numeric rule id.
- `type`: alert type string.
- `min_value`: numeric lower threshold.
- `max_value`: numeric upper threshold.

### Notification Message

- `id`: notification message id.
- `measure_id`: numeric measure id.
- `notification_id`: numeric notification id.
- `creation_date`: backend datetime string.
- `value`: numeric measured or reported value.
- `description`: free-text message description.

## Known Enum-Like Values

These values are known from the Postman examples. They should be implemented as
route-local constants for the POC, not as global abstractions.

### Notification Frequency

```text
immediately
```

Unknown:

- whether scheduled/daily/weekly values exist
- whether the backend accepts only `immediately`

### Alert Types

Known from notification `alert_types`:

```text
green
yellow
red
```

Known from alert `type`:

```text
yellow
red
```

POC default:

- offer `green`, `yellow`, and `red` wherever an alert type is selected
- keep this choice documented as an assumption until backend confirms the valid
  values

### Rule Enabled State

```text
true
false
```

## Dependencies Between Modules

```text
Notifications
  -> used by Rules through notification_ids
  -> used by Notification Messages through notification_id

Rules
  -> use Notifications through notification_ids
  -> use Locations through location_ids
  -> use Measures through measure_id
  -> used by Alerts through rule_id

Alerts
  -> use Rules through rule_id

Notification Messages
  -> use Notifications through notification_id
  -> use Measures through measure_id
```

Implementation order should respect these dependencies:

1. Notifications
2. Rules
3. Alerts
4. Notification messages

Notification messages can technically be implemented after notifications, but
placing them last keeps the POC organized around the rule/alert dependency
chain first.

## Auxiliary Endpoints

The Postman export and current frontend already include auxiliary endpoints
that may help the POC.

### Locations

```text
GET /api/locations
```

Potential use:

- populate rule `location_ids` if the response includes ids compatible with the
  message-system API

Open issue:

- Correction Factors currently treats locations as objects/string options in
  some places. The message-system rule payload requires numeric `location_ids`.
  Compatibility must be verified during implementation.

### Pollen

```text
GET /api/pollen
```

Potential use:

- not directly required by the message-system payloads
- may help map a pollen/measure concept only if backend confirms the
  relationship

### Measurements

```text
GET /api/measurements?from=1681127449&to=1773147049&locations=DEBIED&pollen=Alnus&applyRules=false
```

Potential use:

- possible source for understanding `measure_id`
- possible future source for previewing rule inputs

POC default:

- do not build measurement workflows for the message-system POC
- keep `measure_id` as a numeric form value until a measure catalog or mapping
  is confirmed

## POC Assumptions

- List endpoints return arrays.
- Detail endpoints return a single record.
- Create/update endpoints accept the request shapes shown above.
- Delete endpoints should be treated as successful on any `2xx` response, even
  if the response body is empty.
- `id` is omitted for create requests and included for update requests only
  because the Postman examples include it.
- For updates, the path id is the source of truth if it conflicts with the
  payload `id`.
- No query parameters are documented for the four message-system list
  endpoints.
- No complex validation is required for the POC beyond required fields, numeric
  parsing, and simple date string presence.
- No final Figma design or final workflow design is part of this POC.
- No shared CRUD framework should be introduced for this work.
- All user-facing frontend text must use `next-intl` when implementation begins.

## Open Questions

- What are the exact response shapes for list, detail, create, update, and
  delete?
- Are ids always numbers, or can the backend return strings?
- Which `frequency` values are valid besides `immediately`, if any?
- Does alert `type` support `green`, or only `yellow` and `red`?
- Are notification `alert_types` and alert `type` backed by the same enum?
- Does `/api/locations` return numeric ids that can be used as `location_ids`?
- What endpoint or catalog should provide valid `measure_id` values?
- Should notification messages be user-editable, or are they generated history
  records that should eventually be read-only?
- Are there server-side constraints for overlapping rules, alert value ranges,
  or duplicate notification recipients?
