# Architecture Review

## Scope Reviewed

- `src/app/[locale]/alerts-and-correction-factors`
- `src/features`
- `src/lib/api`
- `src`
- `ai/context.md`
- `ai/STATE.md`


## Architecture Summary

This project is a Next.js App Router application with:

- locale-scoped routing under `src/app/[locale]`
- `next-intl` for i18n
- React Query for client-side read fetching and prefetching
- Zustand for shared client state
- a thin Next API proxy layer in `src/app/api/*`
- a mostly route-colocated feature organization pattern

The strongest existing architectural style is:

1. Keep routes and route-specific logic together under `src/app/[locale]/<route>`.
2. Keep cross-cutting reusable code in shared top-level folders such as `src/components`, `src/hooks`, `src/store`, `src/lib/api`, `src/utils`, and `src/constants`.
3. Use thin `page.tsx` files and move interactive orchestration into client container components.

## Organization Patterns

### Pages and Route Structure

The app uses the App Router:

- global app shell in `src/app/layout.tsx`
- locale shell in `src/app/[locale]/layout.tsx`
- feature routes under `src/app/[locale]/*`

Examples:

- `forecast/page.tsx` is thin and renders `ForecastMapContainer`
- `now-casting/page.tsx` is thin and renders `NowCastingMapContainer`
- `alerts-and-correction-factors` has nested route pages and its own local layout

The route-local layout pattern is already used in:

- `src/app/[locale]/alerts-and-correction-factors/layout.tsx`

That layout applies route-specific navigation and also overrides theme behavior while mounted.

### Components and Feature Logic

There are two main patterns:

#### 1. Route-colocated domain logic

Complex route areas such as `forecast` and `now-casting` colocate:

- `components`
- `hooks`
- `constants`
- `utils`
- sometimes `stores`

inside the route folder itself.

This is the clearest existing template for adding a new interactive feature.

#### 2. Shared global modules

Reusable modules live in:

- `src/components`
- `src/hooks`
- `src/store`
- `src/context`
- `src/lib/api`
- `src/utils`
- `src/constants`

These are exposed through barrel exports in many places.

### `src/features`

`src/features` is currently minimal and only contains `i18n`.

That means `src/features` is not currently the main place for business-domain features. The project currently favors route-colocation for domain logic instead.

## API Patterns

API access is split into two layers.

### 1. Client API helper layer

Located in:

- `src/lib/api/forecast.ts`
- `src/lib/api/nowCasting.ts`

These files:

- build query strings
- call internal Next API routes using `fetch`
- throw on non-OK responses
- return parsed JSON

There is no centralized fetch client abstraction yet.

### 2. Next API proxy layer

Located in:

- `src/app/api/forecast/*`
- `src/app/api/nowcasting/*`
- related latitude/longitude routes

These route handlers:

- read `SILAM_*` env vars
- forward the incoming query string to the upstream backend
- attach Basic Auth headers
- return upstream JSON through `NextResponse.json`

So the current pattern is:

client component/hook -> `src/lib/api/*` helper -> internal `/api/*` route -> upstream API

## React Query Usage

React Query is installed globally in `src/app/layout.tsx` via `ReactQueryProvider`.

Current usage pattern:

- one global `QueryClient`
- no custom default query options
- no SSR hydration/dehydration setup
- no `useMutation`
- no invalidation workflow
- mainly `useQuery` for reads
- `useQueryClient().prefetchQuery(...)` for timeline/navigation optimization

Examples:

- `useHourlyForecast`
- `useHourlyNowCasting`
- route-local prefetch hooks in `forecast/hooks` and `now-casting/hooks`

Important detail:

React Query is not the only cache. Forecast also uses a route-local `useRef` cache via `usePollenCacheManager`. So this codebase is comfortable mixing React Query with feature-local caching when performance or transformation needs justify it.

## State Management Patterns

### Zustand

Zustand is the main shared client-state solution.

Global/shared stores live in:

- `src/store/theme`
- `src/store/loading`
- `src/store/maps`
- `src/store/pollen`

Patterns observed:

- persisted stores for theme and some location selections
- non-persisted stores for transient shared UI/app state
- direct store access with selectors in components
- occasional `store.getState()` usage inside hooks/containers for imperative reads

Examples of shared state responsibilities:

- theme selection
- global/partial loading flags
- current/search location
- forecast and now-casting coordinate grids
- pollen details chart visibility/data

There is also a route-local Zustand store in:

- `src/app/[locale]/forecast/stores/pollen/pollenStore.ts`

That suggests local feature stores are acceptable when the state is specific to a route feature.

### Local React State

Local UI state is heavily used inside container components for:

- selected pollen
- selected hour/timeline
- play/pause state
- open/closed UI panels
- map boundary and resolution
- temporary input state

Rule of thumb from existing code:

- use local `useState` for view-local interaction state
- use Zustand for shared or persisted state

### React Context

Context usage is light. It is mainly used for layout data such as sidebar width:

- `src/context/SidebarContext.tsx`

This project does not use Context as a general replacement for app state.

## Form Management Patterns

No dedicated form library is currently in use.

Not found:

- `react-hook-form`
- Formik
- Yup
- Zod form resolver patterns

Current form/input handling is manual:

- native `<input>` / `<select>` elements
- local `useState`
- custom hooks where needed

Examples:

- `src/hooks/useLocationSearch.ts`
- static filter controls in `alerts-and-correction-factors`

So current convention is lightweight/manual forms rather than a form framework.

## Naming and Folder Conventions

### Folder Naming

- route folders use kebab-case:
  - `now-casting`
  - `alerts-and-correction-factors`
  - `correction-factors`

- shared folders are grouped by concern:
  - `components`
  - `hooks`
  - `store`
  - `lib/api`
  - `utils`
  - `constants`

### File Naming

- React component files use PascalCase
- hooks use `useX.ts`
- Zustand store files usually use `*.store.ts`
- barrel files use `index.ts` or `index.tsx`

### Naming Drift

There is some inconsistent naming around now-casting:

- route folder: `now-casting`
- API route: `nowcasting`
- client helper file: `nowCasting.ts`

New features should avoid adding more naming variants and should choose one canonical term.

## Identified Patterns

- App Router + locale segment architecture
- thin page components, heavy client containers
- route-colocated feature modules for complex areas
- shared reusable modules in top-level `src/*` folders
- client-side fetching through React Query
- proxy API routes for backend auth and forwarding
- Zustand for shared/persisted client state
- local React state for screen-level interactions
- lightweight manual input/form handling
- widespread barrel exports for shared modules

## Notes on `alerts-and-correction-factors`

This route currently looks less mature than `forecast` and `now-casting`.

Observed characteristics:

- mostly presentational/static UI
- mock data embedded directly in page files
- filters are not wired to real state or API calls
- layout contains route-local navigation and theme switching

If this area is expanded, it should probably evolve toward the same pattern used by `forecast` and `now-casting`:

- thin page
- client container
- route-local hooks
- API helpers
- optional local store only if genuinely needed

## Recommendations for a New Feature

To stay consistent with the current project architecture:

1. Prefer route-colocation first.
   - If the feature belongs to one route, place its `components`, `hooks`, `constants`, `utils`, and feature-specific state under that route folder.

2. Keep `page.tsx` thin.
   - Render a container component from the page and keep orchestration there.

3. Promote only truly reusable code.
   - Move code to `src/components`, `src/hooks`, `src/store`, `src/utils`, or `src/lib/api` only when it is shared across routes.

4. Use `src/lib/api` plus `src/app/api/*` for backend access.
   - Follow the current proxy pattern if the backend requires auth or should remain hidden from the client.

5. Use React Query for server reads.
   - Create small feature hooks like `useXQuery` / `useHourlyX`.
   - Use stable query keys.
   - Add prefetching only where UX benefits from it.

6. Use Zustand only for shared or persisted state.
   - Keep transient UI state in local React state.

7. Do not introduce a new form framework unless the feature is significantly more form-heavy than existing code.
   - Current project convention is manual form handling.

8. Follow the current naming style.
   - kebab-case for route folders
   - PascalCase for components
   - `useX` for hooks
   - `*.store.ts` for Zustand stores

9. Avoid adding new architectural layers unless there is a clear reuse case.
   - Today, `src/features` is not the dominant pattern for business features.

10. For work inside `alerts-and-correction-factors`, use `forecast` / `now-casting` as the stronger reference architecture, not the current static page implementation.

## Practical Template for Adding a New Route Feature

Recommended shape:

```text
src/app/[locale]/my-feature/
  page.tsx
  layout.tsx                 # only if route-specific shell/navigation is needed
  components/
    MyFeatureContainer.tsx
    ...
  hooks/
    useMyFeatureData.ts
    ...
  constants/
  utils/
  stores/                    # only if route-local shared state is needed
```

And if the feature needs backend data:

```text
src/lib/api/myFeature.ts
src/app/api/my-feature/route.ts
```

This is the most consistent fit with the current repository.
