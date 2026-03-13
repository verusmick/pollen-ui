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
      CorrectionFactorStatusBadge.tsx
    form/
      CorrectionFactorFormContainer.tsx
      CorrectionFactorForm.tsx
      CorrectionFactorFormHeader.tsx
      CorrectionFactorMetaFields.tsx
      CorrectionFactorDistributionSection.tsx
      CorrectionFactorDistributionTable.tsx
      CorrectionFactorDistributionRow.tsx
      CorrectionFactorTotals.tsx
      CorrectionFactorChartPreview.tsx
      CorrectionFactorActions.tsx
  hooks/
    index.ts
    useCorrectionFactorsList.ts
    useCorrectionFactorDetail.ts
    useCorrectionFactorForm.ts
    useCorrectionFactorPreview.ts
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
      CorrectionFactorStatusBadge
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
    CorrectionFactorDistributionSection
      CorrectionFactorDistributionTable
        CorrectionFactorDistributionRow
      CorrectionFactorTotals
      AddDistributionRowButton
    CorrectionFactorChartPreview
    CorrectionFactorActions
      SaveButton
      DeleteButton (edit only)
```

Responsibilities:

- container owns bootstrap, submit, delete, navigation, error handling
- form component stays presentational and receives state + callbacks
- distribution section is a focused subtree because it contains most business rules
- chart preview receives already-derived series, not raw mutable form logic

## TypeScript Domain Types

### API-Normalized Domain Types

```ts
export type CorrectionFactorId = string;
export type CorrectionFactorStatus = 'draft' | 'published';
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
  status: CorrectionFactorStatus;
  details: CorrectionFactorDetail[];
}

export interface CorrectionFactorListFilters {
  from: string;
  location: string;
  pollen: string;
}
```

### UI Form Types

The UI edits reviewed event counts, not multipliers. Keep raw input values as strings to avoid fighting user typing.

```ts
export type CorrectionFactorFormMode = 'create' | 'edit';

export interface CorrectionFactorDistributionRowForm {
  clientId: string;
  pollen: CorrectionFactorSelectablePollen | '';
  reviewedEvents: string;
  isBasePollen: boolean;
}

export interface CorrectionFactorFormValues {
  location: string;
  basePollen: CorrectionFactorPollenCode | '';
  startDate: string;
  endDate: string;
  detectedEvents: number | null;
  publishOnSave: boolean;
  rows: CorrectionFactorDistributionRowForm[];
}

export interface CorrectionFactorFormErrors {
  location?: string;
  basePollen?: string;
  startDate?: string;
  endDate?: string;
  detectedEvents?: string;
  rows?: string;
  rowErrorsById: Record<
    string,
    {
      pollen?: string;
      reviewedEvents?: string;
    }
  >;
}

export interface CorrectionFactorFormDerivedRow {
  clientId: string;
  multiplier: number;
  reviewedEventsNumber: number;
}

export interface CorrectionFactorFormDerivedState {
  assignedReviewedEvents: number;
  unknownReviewedEvents: number;
  totalReviewedEvents: number;
  remainingEvents: number;
  isBalanced: boolean;
  hasDuplicatePollens: boolean;
  multipliersByRowId: Record<string, number>;
}
```

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
  GET    -> ${POLLEN_API_BASE}/api/correctionFactors/:id   # only if backend supports it
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

- UI owns `reviewedEvents`
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
  preview: (params: {
    location: string;
    basePollen: string;
    startDate: string;
    endDate: string;
  }) => [...correctionFactorKeys.all, 'preview', params] as const,
};
```

### Read Hooks

```ts
export function useCorrectionFactorsList(filters: CorrectionFactorListFilters) {}
export function useCorrectionFactorDetail(id: string) {}
export function useCorrectionFactorPreview(params: PreviewSourceParams) {}
```

Responsibilities:

- `useCorrectionFactorsList`
  - list query for table page
- `useCorrectionFactorDetail`
  - edit bootstrap query
  - only safe if backend provides a detail fetch path or an equivalent fallback
- `useCorrectionFactorPreview`
  - fetches the original chart source only
  - corrected series is derived locally from current form state

### Write Strategy

To stay close to current project conventions:

- do not introduce a complex mutation abstraction in phase 1
- call write helpers imperatively inside container submit handlers
- after success, invalidate:
  - `correctionFactorKeys.lists()`
  - `correctionFactorKeys.detail(id)` when relevant

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
- row add/remove/update actions
- submit payload builder
- validation trigger

Why local state instead of Zustand:

- the form is screen-local
- create/edit is a single container flow
- no cross-route sharing is required
- this matches current project guidance from `ai/context.md`

## Validation Strategy for the Correction Table

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
6. `detectedEvents` must exist before submit.
7. the table must always contain exactly one base pollen row.
8. the base pollen row must always be first.
9. the base pollen row is not removable.
10. `reviewedEvents` must be numeric.
11. `reviewedEvents` must be `>= 0`.
12. duplicate pollens are not allowed.
13. `UNKNOWN` is treated as an implicit remainder in the UI, not as a normal editable row.
14. any difference between `detectedEvents` and the sum of explicit `reviewedEvents` is automatically treated as `UNKNOWN`.
15. explicit reviewed events cannot exceed `detectedEvents`.

Recommended validation timing:

- field-level validation on blur for top-level fields
- row-level validation on change for pollen selection and reviewed events
- full-form validation on submit

## Derived Multiplier Calculation Strategy

Keep all multiplier math in a pure utility:

```ts
export function buildCorrectionFactorDerivedState(
  values: CorrectionFactorFormValues
): CorrectionFactorFormDerivedState {}
```

Rules:

- `multiplier = reviewedEvents / detectedEvents`
- multipliers are read-only UI values
- multipliers are not stored as editable form state
- derived state is recalculated with `useMemo`

Special handling:

- base pollen row is included in the table and gets a derived multiplier
- users distribute reviewed events across explicit pollen classifications only
- `UNKNOWN` is derived as the remainder between `detectedEvents` and the explicit reviewed-event total
- `UNKNOWN` is shown in the UI but is not edited as a normal row
- `UNKNOWN` is omitted from the API payload

Why this shape:

- experts edit reviewed events only
- the system derives both multipliers and `UNKNOWN` automatically
- this keeps the UI simpler and avoids redundant payload data

Recommended payload builder:

```ts
export function buildCorrectionFactorWritePayload(
  values: CorrectionFactorFormValues,
  derived: CorrectionFactorFormDerivedState
): CorrectionFactorWriteRequest {}
```

## Chart Preview Update Strategy

The chart should separate source loading from correction math.

Recommended flow:

1. Query the original preview series using only:
   - location
   - base pollen
   - start date
   - end date
2. Store that query result as immutable source data.
3. Recalculate corrected series locally every time reviewed-event rows change.
4. Re-render chart from:
   - `originalSeries`
   - `correctedSeries`

This avoids refetching on every reviewed-event keystroke.

Suggested hook shape:

```ts
export function useCorrectionFactorPreview(params: {
  location: string;
  basePollen: string;
  startDate: string;
  endDate: string;
  rows: CorrectionFactorDistributionRowForm[];
  detectedEvents: number | null;
}) {}
```

Internals:

- `useQuery` fetches source data only when top-level selection is complete
- `useMemo` transforms source data into corrected preview

### Important Contract Gap

The provided CRUD contract does not define a preview-data endpoint.

Therefore:

- the preview component boundary should be implemented now
- the preview data adapter should be isolated in `useCorrectionFactorPreview`
- actual chart data fetching depends on a backend source being confirmed

Phase 1 fallback:

- render the chart shell and local derived legend/state
- gate live preview behind available source data

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
- `publishOnSave = false`
- no distribution rows until base pollen is selected

Behavior:

- selecting base pollen auto-inserts the base row
- base row pollen stays locked to the selected base pollen

### Edit Mode

Bootstrap:

- fetch existing correction factor
- normalize response
- map to form values
- show delete button

### Important Edit Gap

The UI edits `reviewedEvents`, but the contract stores `factor_percentage`.

That means edit hydration needs at least one of:

1. backend detail response includes `reviewed_events` and `detected_events`, or
2. backend detail response includes enough data to reconstruct reviewed events losslessly

Without that, the edit form cannot faithfully restore the editable table from the current contract alone.

Recommendation:

- treat `GET /api/correctionFactors/:id` support plus edit bootstrap data as a backend dependency for edit mode
- do not hide this gap inside frontend assumptions
- phase-gate edit mode behind backend confirmation of:
  - `GET /api/correctionFactors/:id`
  - enough data to reconstruct `reviewedEvents`

## Status Strategy

The mockup shows `Draft` and `Published`.

The contract exposes `published` at detail level, not clearly at record level.

Recommended frontend mapping:

- form has a single `publishOnSave` boolean
- on submit, write the same `published` value to every detail row
- list status derives as:
  - `published` if all detail rows are published
  - `draft` otherwise

This keeps the UI aligned with the mockup while staying compatible with the contract shape.

## Pollen and Location Options Strategy

The list/form need selectable:

- location
- base pollen
- correction-table pollen rows

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
- implement distribution table rules
- implement derived multipliers
- implement submit payload builder
- wire create request

Create flow should be completed before edit/delete work begins.

### Phase 4. Edit and Delete

- implement edit bootstrap query
- implement shared mode-specific actions
- implement update request
- implement delete request

Dependency:

- backend must support `GET /api/correctionFactors/:id`
- backend must support edit bootstrap data well enough to reconstruct reviewed-event rows

### Phase 5. Chart Preview

- add chart preview component boundary
- wire preview query adapter once source endpoint is confirmed
- compute corrected series locally from form state

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

  const preview = useCorrectionFactorPreview({
    location: form.values.location,
    basePollen: form.values.basePollen,
    startDate: form.values.startDate,
    endDate: form.values.endDate,
    rows: form.values.rows,
    detectedEvents: form.values.detectedEvents,
  });

  async function handleSubmit() {}
  async function handleDelete() {}

  return (
    <CorrectionFactorForm
      mode={props.mode}
      form={form}
      preview={preview}
      onSubmit={handleSubmit}
      onDelete={props.mode === 'edit' ? handleDelete : undefined}
    />
  );
}
```

### Distribution Table Skeleton

```ts
export interface CorrectionFactorDistributionTableProps {
  detectedEvents: number | null;
  rows: CorrectionFactorDistributionRowForm[];
  derived: CorrectionFactorFormDerivedState;
  errors: CorrectionFactorFormErrors;
  onRowChange: (clientId: string, patch: Partial<CorrectionFactorDistributionRowForm>) => void;
  onAddRow: () => void;
  onRemoveRow: (clientId: string) => void;
}
```

## Open Dependencies / Risks

1. The current contract does not specify a `GET by id` endpoint.
2. The current contract does not specify how to hydrate `reviewedEvents` for edit mode.
3. The current contract does not specify a chart preview endpoint.
4. The current contract does not define how `Unknown` should be encoded in API payloads.
5. The current contract does not define where location and pollen option lists come from.
6. The backend must confirm whether `factor_percentage` is a fractional ratio or a percentage value.

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
- pure utilities for validation, mapping, and multiplier math

Do not introduce:

- a new global feature architecture
- a form library
- a Zustand store for the form
- a heavy generic CRUD abstraction

This keeps the feature aligned with the current project rather than redesigning the app around it.
