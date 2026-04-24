# Correction Factors CRUD Architecture

## Goal

Design the frontend architecture for Correction Factors CRUD inside the existing route:

- `src/app/[locale]/alerts-and-correction-factors`

This plan follows the conventions documented in `ai/context.md`:

- thin `page.tsx` files
- route-colocated feature logic
- shared code only when it is genuinely reusable
- React Query for reads
- lightweight manual form state
- Zustand only if shared state is truly needed

This document defines architecture and skeletons only, not full implementation.

## Source of Truth

- UI mockup: `ai/design/correction-factors-ui.png`
- API contract: `ai/contracts/correction-factors-api.md`
- env base URL: `POLLEN_API_BASE=https://staging.pollen.enjambre.com.bo`

## High-Level Decisions

1. Keep the feature route-local under `src/app/[locale]/alerts-and-correction-factors/correction-factors`.
2. Replace the current static list page with a thin page plus a client container.
3. Add nested route pages for create and edit:
   - `/alerts-and-correction-factors/correction-factors`
   - `/alerts-and-correction-factors/correction-factors/new`
   - `/alerts-and-correction-factors/correction-factors/[correctionFactorId]/edit`
4. Follow the existing API pattern:
   - internal Next route handlers in `src/app/api/*`
   - client helpers in `src/lib/api/*`
5. Use local React state via a feature-local form hook for the form.
6. Do not introduce a form library.
7. Do not introduce a feature store in phase 1. No Zustand is needed unless draft state must be shared across distant components later.
8. Treat form start/end values as date-plus-hour selections aligned to the measurements API 3-hour granularity.
9. Make the chart the primary review driver for the create/edit experience.
10. Keep the selected date range as the chart query input, but do not load validation-event images for the whole range up front.
11. Load validation-event images only after the scientist selects a peak or time slice from the chart.
12. Replace the current vertical carousel-first review model with a faster CAPTCHA-style image-selection workflow.
13. In version 1, event review is binary:
    - selected image = base pollen
    - unselected image = `UNKNOWN`
14. Keep additional pollen-classification support possible in types and utilities, but do not let that future flexibility drive the v1 UI.
15. Treat event assignments as the only editable review source of truth. Reviewed counts, unknown counts, and multipliers remain derived outputs.

## Route Integration

Recommended route shape:

```text
src/app/[locale]/alerts-and-correction-factors/
  layout.tsx
  page.tsx
  alerts/
    page.tsx
  correction-factors/
    page.tsx
    new/
      page.tsx
    [correctionFactorId]/
      edit/
        page.tsx
    components/
    hooks/
    constants/
    utils/
    types/
```

Thin pages:

```tsx
// correction-factors/page.tsx
export default function CorrectionFactorsPage() {
  return <CorrectionFactorsListContainer />;
}

// correction-factors/new/page.tsx
export default function NewCorrectionFactorPage() {
  return <CorrectionFactorFormContainer mode="create" />;
}

// correction-factors/[correctionFactorId]/edit/page.tsx
export default function EditCorrectionFactorPage() {
  return <CorrectionFactorFormContainer mode="edit" correctionFactorId={...} />;
}
```

## Feature Folder Structure

Recommended route-local structure:

```text
src/app/[locale]/alerts-and-correction-factors/correction-factors/
  page.tsx
  new/
    page.tsx
  [correctionFactorId]/
    edit/
      page.tsx
  components/
    index.ts
    list/
      CorrectionFactorsListContainer.tsx
      CorrectionFactorsHeader.tsx
      CorrectionFactorsFilters.tsx
      CorrectionFactorsTable.tsx
      CorrectionFactorsTableRow.tsx
    form/
      CorrectionFactorFormContainer.tsx
      CorrectionFactorForm.tsx
      CorrectionFactorFormHeader.tsx
      CorrectionFactorMetaFields.tsx
      CorrectionFactorChartReviewSection.tsx
      CorrectionFactorDistributionSection.tsx
      CorrectionFactorDistributionTable.tsx
      CorrectionFactorEventSelectionGrid.tsx
      CorrectionFactorPeakSelectionSummary.tsx
      CorrectionFactorTotals.tsx
      CorrectionFactorChartPreview.tsx
      CorrectionFactorActions.tsx
  hooks/
    index.ts
    useCorrectionFactorsList.ts
    useCorrectionFactorDetail.ts
    useCorrectionFactorForm.ts
    useCorrectionFactorChartPreview.ts
    useCorrectionFactorPeakEvents.ts
  constants/
    index.ts
    queryKeys.ts
    pollenOptions.ts
    formDefaults.ts
  utils/
    index.ts
    correctionFactorMappers.ts
    correctionFactorPayload.ts
    correctionFactorMath.ts
    correctionFactorValidation.ts
    correctionFactorPreview.ts
  types/
    index.ts
    correctionFactors.ts
```

Shared files outside the route:

```text
src/lib/api/correctionFactors.ts
src/app/api/correction-factors/route.ts
src/app/api/correction-factors/[correctionFactorId]/route.ts
```

## Component Hierarchy

### 1. List Page

```text
CorrectionFactorsListContainer
  CorrectionFactorsHeader
    NewCorrectionFactorButton
  CorrectionFactorsFilters
  CorrectionFactorsTable
    CorrectionFactorsTableRow
      EditLink
```

Responsibilities:

- container owns filters, query state, loading/error handling
- table stays presentational
- filter controls mirror the mockup: from date, location, pollen, reset
- new button routes to `/new`

### 2. Create/Edit Form Page

```text
CorrectionFactorFormContainer
  CorrectionFactorFormHeader
  CorrectionFactorForm
    CorrectionFactorMetaFields
    CorrectionFactorChartReviewSection
      CorrectionFactorChartPreview
      CorrectionFactorPeakSelectionSummary
    CorrectionFactorEventSelectionGrid
    CorrectionFactorDistributionSection
      CorrectionFactorDistributionTable
      CorrectionFactorTotals
    CorrectionFactorActions
      SaveButton
      DeleteButton (edit only)
```

Responsibilities:

- container owns bootstrap, submit, delete, navigation, error handling
- form component stays presentational and receives state + callbacks
- chart review section is the primary workflow surface and owns peak/time-slice selection
- event review grid loads only the currently selected peak/time slice and exposes fast image acceptance toggles
- distribution section renders a derived summary of reviewed event assignments and is not a second editable review system
- chart preview receives immutable chart source data plus selected-slice state, not raw mutable review logic

## Workflow

The new scientific review flow is chart-first:

1. The scientist chooses location, base pollen, and date range.
2. Those top-level controls load the chart data for the selected range.
3. No validation-event images are loaded yet.
4. The scientist inspects the chart and selects a peak or time slice directly from the chart.
5. That selection becomes the active review scope.
6. Only then does the page load and show the detected-event images for that selected scope.
7. The scientist reviews images in a fast selection grid:
   - click image to accept it as the base pollen
   - leave it unselected to keep it as `UNKNOWN`
8. Reviewed counts and multipliers are recalculated from the event assignments for the active review scope.
9. The chart remains visually above the image-review area so exploration stays first and event review stays second.

## Source of Truth Strategy

Avoid competing sources of truth by separating editable state from queried source data:

- top-level form inputs are the editable source of truth for:
  - `location`
  - `basePollen`
  - `startDate`
  - `endDate`
- chart series and selectable peaks/time slices come from React Query and are never copied into a second mutable store
- selected peak/time slice is a single local UI state value, typically `selectedSliceId`
- slice-scoped validation events come from React Query for the selected slice only
- reviewed event assignments are the only editable review state and should be keyed by `eventId`
- detected-event counts, reviewed counts, unknown counts, summary rows, and multipliers are derived from queried slice events plus reviewed assignments

Do not keep:

- a full-range event-image array in form state
- manual reviewed-count inputs
- editable correction-table rows that can diverge from image assignments
- separate reviewed state inside both chart components and event-review components

## TypeScript Domain Types

### API-Normalized Domain Types

```ts
export type CorrectionFactorId = string;
export type CorrectionFactorPollenCode = string;
export type CorrectionFactorUnknownCode = 'UNKNOWN';
export type CorrectionFactorSelectablePollen =
  | CorrectionFactorPollenCode
  | CorrectionFactorUnknownCode;

export interface CorrectionFactorDetail {
  id?: string;
  pollen: CorrectionFactorSelectablePollen;
  factorPercentage: number;
  published: boolean;
}

export interface CorrectionFactorRecord {
  id: CorrectionFactorId;
  location: string;
  basePollen: CorrectionFactorPollenCode;
  startDate: string;
  endDate: string;
  details: CorrectionFactorDetail[];
}

export interface CorrectionFactorListFilters {
  from: string;
  location: string;
  pollen: string;
}
```

### UI Form Types

The UI edits reviewed event assignments, not manual counts or manual multipliers.

```ts
export type CorrectionFactorFormMode = 'create' | 'edit';

export interface CorrectionFactorReviewSlice {
  id: string;
  label: string;
  from: number;
  to: number;
  peakTimestamp: number;
}

export interface CorrectionFactorDetectedEvent {
  eventId: string;
  imageUrl: string;
  datetime: number;
  classification: string;
  sliceId: string;
}

export interface CorrectionFactorDistributionSummaryRow {
  key: string;
  pollen: CorrectionFactorSelectablePollen;
  reviewedEventsNumber: number;
  multiplier: number;
  isBasePollen: boolean;
}

export interface CorrectionFactorFormValues {
  location: string;
  basePollen: CorrectionFactorPollenCode | '';
  startDate: string; // datetime string with 3-hour granularity
  endDate: string; // datetime string with 3-hour granularity
  selectedSliceId: string | null;
  reviewedAssignmentsByEventId: Record<
    string,
    CorrectionFactorSelectablePollen
  >;
}

export interface CorrectionFactorFormErrors {
  location?: string;
  basePollen?: string;
  startDate?: string;
  endDate?: string;
  selectedSliceId?: string;
  eventReview?: string;
}

export interface CorrectionFactorFormDerivedState {
  rows: CorrectionFactorDistributionSummaryRow[];
  detectedEvents: number;
  acceptedEvents: number;
  unknownReviewedEvents: number;
  totalReviewedEvents: number;
  multiplierByPollen: Record<CorrectionFactorSelectablePollen, number>;
}
```

Version 1 keeps the review interaction binary even though the types stay extensible:

- the visible event-review UI only toggles between base pollen and `UNKNOWN`
- `CorrectionFactorSelectablePollen` stays broad enough to support additional pollens later
- summary rows remain derived so future classification expansion does not require reintroducing manual count inputs

Detected events are slice-derived rather than manually entered:

- load chart data after `location`, `basePollen`, `startDate`, and `endDate` are all present
- do not load validation-event images until `selectedSliceId` is set
- convert the selected slice into Unix timestamps for the validation-event query
- treat unselected images as `UNKNOWN`
- derive reviewed counts and multipliers from assignments for the current review scope instead of typed inputs
- treat empty slice responses and unusable validation payloads as distinct UX states

Validation-location integration is adapter-driven:

- correction-factor location options are enriched with validation location names
- matching is attempted by exact validation name, device alias, and normalized canonical-name comparison
- unresolved locations block validation-event loading and surface a user-facing field error

### Preview Types

```ts
export interface CorrectionFactorPreviewPoint {
  label: string;
  originalValue: number;
  correctedValue: number;
}

export interface CorrectionFactorPreviewSeries {
  points: CorrectionFactorPreviewPoint[];
}

export interface CorrectionFactorChartPreviewData {
  series: CorrectionFactorPreviewSeries;
  slices: CorrectionFactorReviewSlice[];
}
```

## API Integration Strategy

### Follow Existing Project Pattern

Use internal Next API routes as a thin proxy to the upstream base URL:

- `POLLEN_API_BASE=https://staging.pollen.enjambre.com.bo`

This keeps the frontend aligned with existing `src/app/api/*` conventions.

### Internal Route Handlers

```text
src/app/api/correction-factors/route.ts
  GET    -> ${POLLEN_API_BASE}/api/correctionFactors
  POST   -> ${POLLEN_API_BASE}/api/correctionFactors

src/app/api/correction-factors/[correctionFactorId]/route.ts
  GET    -> ${POLLEN_API_BASE}/api/correctionFactors/:id
  PUT    -> ${POLLEN_API_BASE}/api/correctionFactors/:id
  DELETE -> ${POLLEN_API_BASE}/api/correctionFactors/:id
```

### Client Helper File

```text
src/lib/api/correctionFactors.ts
```

Skeleton:

```ts
export interface CorrectionFactorListRequest {
  from?: string;
  pollen?: string;
  locations?: string;
}

export interface CorrectionFactorWriteRequest {
  start_date: string;
  end_date: string;
  pollen: string;
  location: string;
  correction_factor_details: Array<{
    pollen: string | null;
    factor_percentage: number;
    published: boolean;
  }>;
}

export async function getCorrectionFactors(params: CorrectionFactorListRequest) {}
export async function getCorrectionFactorById(id: string) {}
export async function createCorrectionFactor(payload: CorrectionFactorWriteRequest) {}
export async function updateCorrectionFactor(id: string, payload: CorrectionFactorWriteRequest) {}
export async function deleteCorrectionFactor(id: string) {}
```

Naming note:

- UI filter naming should follow the mockup and use `location`
- API request naming should follow the contract and use `locations`
- this mismatch should be handled only in the request mapper layer

### Mapping Strategy

Use feature-local mappers in `utils/correctionFactorMappers.ts`:

- API response -> normalized `CorrectionFactorRecord`
- `CorrectionFactorRecord` -> `CorrectionFactorFormValues`
- `CorrectionFactorFormValues` + derived multipliers -> write payload

Important mapping rule:

- UI owns reviewed assignments keyed by `eventId`
- chart range data and selected-slice event data stay in query results
- reviewed event counts are derived from event assignments
- API owns `factor_percentage`
- conversion happens only in derived state and payload builder
- `factor_percentage` scale must be confirmed with backend:
  - fractional ratio, e.g. `0.33`
  - or percentage value, e.g. `33`

## React Query Hooks and Query Keys

### Query Keys

```ts
export const correctionFactorKeys = {
  all: ['correctionFactors'] as const,
  lists: () => [...correctionFactorKeys.all, 'list'] as const,
  list: (filters: CorrectionFactorListFilters) =>
    [...correctionFactorKeys.lists(), filters] as const,
  details: () => [...correctionFactorKeys.all, 'detail'] as const,
  detail: (id: string) => [...correctionFactorKeys.details(), id] as const,
  charts: () => [...correctionFactorKeys.all, 'chart'] as const,
  chart: (params: {
    location: string;
    basePollen: string;
    startDate: string;
    endDate: string;
  }) => [...correctionFactorKeys.charts(), params] as const,
  peakEvents: () => [...correctionFactorKeys.all, 'peakEvents'] as const,
  peakEvent: (params: {
    location: string;
    basePollen: string;
    sliceId: string;
    from: number;
    to: number;
  }) => [...correctionFactorKeys.peakEvents(), params] as const,
};
```

### Read Hooks

```ts
export function useCorrectionFactorsList(filters: CorrectionFactorListFilters) {}
export function useCorrectionFactorDetail(id: string) {}
export function useCorrectionFactorChartPreview(params: ChartSourceParams) {}
export function useCorrectionFactorPeakEvents(params: PeakEventsParams) {}
```

Responsibilities:

- `useCorrectionFactorsList`
  - list query for table page
- `useCorrectionFactorDetail`
  - edit bootstrap query
  - current API detail hydrates stored multipliers only
  - do not convert stored multipliers into manual reviewed-count inputs
  - peak selection and per-event reviewed assignments require additional persisted context
- `useCorrectionFactorChartPreview`
  - fetches the chart source for the selected date range
  - returns immutable chart series plus selectable peak/time-slice metadata
  - keeps chart querying independent from event-image querying
- `useCorrectionFactorPeakEvents`
  - fetches validation-event images only for the selected peak/time slice
  - does not run until chart selection is complete
  - merges query results with form-owned reviewed assignments
  - distinguishes idle/loading/empty/error/mismatch states for form UX

### Write Strategy

To stay close to current project conventions:

- do not introduce a complex mutation abstraction in phase 1
- call write helpers imperatively inside container submit handlers
- after success, invalidate:
  - `correctionFactorKeys.lists()`
  - `correctionFactorKeys.details()`
  - `correctionFactorKeys.detail(id)` when relevant
- clear inactive list/detail/chart/peak-event queries before navigating so stale form data does not flash after route changes
- navigate back to the locale-scoped list route after create, update, and delete

This is the smallest React Query extension necessary for CRUD.

## Form State Strategy

Use a feature-local hook:

```ts
export function useCorrectionFactorForm(params: {
  mode: CorrectionFactorFormMode;
  initialValues: CorrectionFactorFormValues;
}) {}
```

The hook should own:

- `values`
- `errors`
- derived state
- field setters
- selected-slice state
- event assignment toggle actions
- submit payload builder
- validation trigger

The hook should not own:

- chart query results
- peak-event query results
- manually editable summary rows or detected-event counts

Why local state instead of Zustand:

- the form is screen-local
- create/edit is a single container flow
- no cross-route sharing is required
- this matches current project guidance from `ai/context.md`

## Validation Strategy for the Chart-Driven Review

Keep validation in a pure utility:

```ts
export function validateCorrectionFactorForm(
  values: CorrectionFactorFormValues
): CorrectionFactorFormErrors {}
```

Validation rules:

1. `location` is required.
2. `basePollen` is required.
3. `startDate` is required.
4. `endDate` is required.
5. `endDate >= startDate`.
6. a peak/time slice must be selected before submit.
7. selected-slice validation events must be loaded before submit.
8. unselected images are valid and represent `UNKNOWN`; the user does not need to click every image.
9. event review stays binary in v1:
   - base pollen
   - `UNKNOWN`
10. correction-table rows are derived from event assignments and are not manual count inputs.
11. the summary table should include the base pollen row and the `UNKNOWN` row.

Recommended validation timing:

- field-level validation after the first submit attempt and during subsequent edits
- selected-slice validation after the first submit attempt and during subsequent edits
- full-form validation on submit
- keep save disabled while the form remains invalid, and surface a visible validation summary so the disabled state is explainable

## Derived Multiplier Calculation Strategy

Keep all multiplier math in a pure utility:

```ts
export function buildCorrectionFactorDerivedState(
  values: CorrectionFactorFormValues
): CorrectionFactorFormDerivedState {}
```

Rules:

- the active review scope is the currently selected peak/time slice
- `reviewedCount = count(events in selected slice where assignment matches pollen)`
- `multiplier = reviewedCount / detectedEvents`
- multipliers are read-only UI values
- multipliers are not stored as editable form state
- derived state is recalculated with `useMemo`

Special handling:

- base pollen row is included in the summary table and gets a derived multiplier
- users accept images; they do not type reviewed counts
- `UNKNOWN` count is derived from events still left unselected
- `UNKNOWN` is shown in the UI as a derived count
- `UNKNOWN` is omitted from the API payload
- future additional pollen classes can extend the same derived-row utility without changing the v1 image-review interaction

Why this shape:

- experts review each detected event image directly
- the system derives reviewed counts, multipliers, and `UNKNOWN` automatically
- this avoids two competing editable sources of truth

Recommended payload builder:

```ts
export function buildCorrectionFactorWritePayload(
  values: CorrectionFactorFormValues,
  derived: CorrectionFactorFormDerivedState
): CorrectionFactorWriteRequest {}
```

## Chart Preview Update Strategy

The chart should separate range querying, slice selection, and correction math.

Recommended flow:

1. Query the original preview series using only:
   - location
   - base pollen
   - start date
   - end date
2. Normalize that chart response into:
   - chart points
   - selectable peak/time-slice descriptors
3. Store that query result as immutable source data.
4. Recalculate corrected series locally every time selected-slice event assignments change.
5. Re-render chart from:
   - `originalSeries`
   - `correctedSeries`
   - `selectedSlice`

This avoids refetching the chart on every event-selection change and prevents full-range image preloading.

Suggested hook shape:

```ts
export function useCorrectionFactorChartPreview(params: {
  location: string;
  basePollen: string;
  startDate: string;
  endDate: string;
}) {}
```

Internals:

- `useQuery` fetches chart source data only when top-level selection is complete
- `useMemo` derives selectable peak/time slices and corrected preview overlays
- changing `selectedSliceId` must not trigger a chart refetch
- selecting a slice enables the separate peak-events query

### Important Contract Gap

The measurements preview source now exists, but peak-driven review still has one important gap.

Therefore:

- chart data fetching can be built against `GET /api/measurements`
- peak/time-slice selection should be isolated in the chart adapter layer
- backend still needs to confirm whether selectable peak slices come from:
  - upstream metadata
  - or client-side derivation from measurements
- validation-event loading must stay keyed to the selected slice, not to the whole date range

Phase 1 fallback:

- render the chart from measurements and derive selectable slices locally if needed
- gate event-image loading behind explicit chart selection

## Create vs Edit Form Strategy

Use one shared container and one shared form:

```ts
<CorrectionFactorFormContainer mode="create" />
<CorrectionFactorFormContainer mode="edit" correctionFactorId="..." />
```

### Create Mode

Initialization:

- empty location
- empty base pollen
- empty dates
- no selected slice
- no validation-event images or derived summary rows until chart selection is complete

Behavior:

- completing the top-level selections loads the chart only
- the scientist selects a peak/time slice from the chart
- each event in the selected slice defaults to `UNKNOWN`
- the event-review grid uses click-to-accept behavior for base pollen
- the correction table updates as a derived summary of event assignments for the selected slice

### Edit Mode

Bootstrap:

- fetch existing correction factor
- normalize response
- map to form values
- show delete button

### Edit Hydration Behavior

The UI edits peak-scoped per-event assignments, but the contract still stores `factor_percentage`.

Current implemented behavior:

- fetch existing correction factor detail
- hydrate top-level fields from the stored record
- do not pretend stored multipliers can reconstruct:
  - the original selected peak/time slice
  - the reviewed event assignments
- treat stored `factor_percentage` values as legacy summary data, not editable event assignments

Implication:

- edit mode cannot fully restore the new workflow from stored multipliers alone
- do not add manual reviewed-count inputs to compensate for missing event-level data
- a complete edit experience requires persisted slice context and event assignments, or edit stays partially blocked/read-only for legacy records

## First-Version Publish Strategy

The mockup originally showed `Draft` and `Published`, but first-version behavior removes user control of publish state.

The contract exposes `published` at detail level, not clearly at record level.

Recommended frontend mapping:

- do not render a form-level publish control
- do not render a list-level status column or status badge
- when building `correction_factor_details`, preserve deterministic feature ordering and send the first non-`UNKNOWN` detail with `published: true`
- send all remaining non-`UNKNOWN` details with `published: false`

This keeps the initial publish behavior compatible with the contract shape without exposing status decisions in the UI.

## Pollen and Location Options Strategy

The list/form need selectable:

- location
- base pollen

Version 1 does not need a freeform review-classification picker.

Important note:

- keep additional pollen types supported in domain types and payload utilities
- do not expose extra pollen choices in the image-review UI for v1
- do not make the distribution summary editable just to surface future pollen support

Because the current contract does not define option endpoints:

- keep option sources feature-local in phase 1
- add route-local constants/adapters under `constants/`
- elevate to shared constants later only if they become truly cross-route

Important note:

- forecast and now-casting already use different pollen naming/config shapes
- do not force reuse unless the same backend codes are confirmed

## Recommended Implementation Phases

### Phase 1. Routing and Data Scaffolding

- add route pages for list, create, edit
- add route-local folders and barrel files
- add internal API proxy routes
- add `src/lib/api/correctionFactors.ts`
- add normalized types and mappers

### Phase 2. List Screen

- replace static list page with `CorrectionFactorsListContainer`
- implement filters from mockup
- implement query state and list rendering
- wire new button to `/new`
- wire edit links to `/[correctionFactorId]/edit`

### Phase 3. Create Form

- implement shared form component tree
- implement local form hook
- implement chart-first workspace and layout
- implement chart querying for the selected date range
- implement peak/time-slice selection state
- implement submit payload builder

### Phase 4. Slice-Scoped Event Review

- implement slice-scoped validation-event loading
- implement CAPTCHA-style event selection grid
- default unselected images to `UNKNOWN`
- implement derived summary table rules
- implement reviewed-count and multiplier derivation
- wire create request

Create flow should be completed before edit/delete work begins.

### Phase 5. Edit and Delete

- implement edit bootstrap query
- implement shared mode-specific actions
- implement update request
- implement delete request

Dependency:

- backend must support `GET /api/correctionFactors/:id`
- backend must provide slice context and event assignments well enough to restore the peak-driven workflow, or edit must stay partially limited

### Phase 6. UX Polish

- loading and error states
- empty states
- translations
- accessibility pass
- date formatting consistency

## Skeletons

### List Container Skeleton

```ts
export function CorrectionFactorsListContainer() {
  const [filters, setFilters] = useState<CorrectionFactorListFilters>(...);
  const { data, isLoading, error } = useCorrectionFactorsList(filters);

  return (
    <CorrectionFactorsPageLayout>
      <CorrectionFactorsHeader />
      <CorrectionFactorsFilters value={filters} onChange={setFilters} />
      <CorrectionFactorsTable rows={data ?? []} loading={isLoading} error={error} />
    </CorrectionFactorsPageLayout>
  );
}
```

### Form Container Skeleton

```ts
export function CorrectionFactorFormContainer(props: {
  mode: 'create' | 'edit';
  correctionFactorId?: string;
}) {
  const detailQuery = useCorrectionFactorDetail(props.correctionFactorId ?? '');
  const form = useCorrectionFactorForm({
    mode: props.mode,
    initialValues: ...,
  });

  const chart = useCorrectionFactorChartPreview({
    location: form.values.location,
    basePollen: form.values.basePollen,
    startDate: form.values.startDate,
    endDate: form.values.endDate,
  });
  const selectedSlice =
    chart.data?.slices.find((slice) => slice.id === form.values.selectedSliceId) ??
    null;
  const peakEvents = useCorrectionFactorPeakEvents({
    location: form.values.location,
    basePollen: form.values.basePollen,
    selectedSlice,
  });

  async function handleSubmit() {}
  async function handleDelete() {}

  return (
    <CorrectionFactorForm
      mode={props.mode}
      form={form}
      chart={chart}
      selectedSlice={selectedSlice}
      peakEvents={peakEvents}
      onSubmit={handleSubmit}
      onDelete={props.mode === 'edit' ? handleDelete : undefined}
    />
  );
}
```

### Event Selection Grid Skeleton

```ts
export interface CorrectionFactorEventSelectionGridProps {
  events: CorrectionFactorDetectedEvent[];
  reviewedAssignmentsByEventId: Record<
    string,
    CorrectionFactorSelectablePollen
  >;
  basePollen: string;
  onToggleAccepted: (eventId: string) => void;
}
```

### Distribution Table Skeleton

```ts
export interface CorrectionFactorDistributionTableProps {
  derived: CorrectionFactorFormDerivedState;
}
```

## Open Dependencies / Risks

1. Edit mode still lacks a lossless source for restoring selected slice context and per-event reviewed assignments.
2. The backend must confirm whether peak/time-slice metadata comes from upstream data or should be derived client-side from measurements.
3. The validation-event query must remain slice-scoped; loading full-range images again would violate the new workflow.
4. The current contract does not define how `Unknown` should be encoded in API payloads.
5. The current contract does not define where location and pollen option lists come from.
6. The backend must confirm whether `factor_percentage` is a fractional ratio or a percentage value.
7. The backend must confirm whether reviewed event assignments are persisted separately from factor multipliers.

These are not reasons to change the frontend architecture, but they do affect implementation sequencing.

These backend uncertainties should also be reflected in `ai/STATE.md`.

## Recommended Path

Proceed with:

- route-local feature structure
- thin pages
- internal `/api/correction-factors` proxy
- client helper layer in `src/lib/api`
- React Query for reads
- local form hook for create/edit
- chart-first layout and workflow
- slice-scoped event loading
- pure utilities for validation, mapping, and multiplier math

Do not introduce:

- a new global feature architecture
- a form library
- a Zustand store for the form
- a heavy generic CRUD abstraction
- manual reviewed-count editing as a fallback workflow

This keeps the feature aligned with the current project rather than redesigning the app around it.
