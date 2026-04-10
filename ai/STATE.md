## Correction Factors - active backend dependencies
Foundation/data scaffolding is implemented. Remaining backend dependencies are centered on event-level review persistence, payload parity, and preview sourcing:
- GET /api/correctionFactors/:id exists and returns stored detail multipliers
- New review source of truth is per validation-event reviewed classification; correction-table counts and multipliers are derived from event assignments
- Current correction-factor detail payloads do not restore per-event reviewed classifications from stored multipliers
- Avoid reintroducing manual reviewed-count inputs as a fallback; event images default to `UNKNOWN` until event-level assignments are available or reviewed
- Need confirmation how `UNKNOWN` is encoded in payloads and whether `UNKNOWN` details are omitted
- factor_percentage appears to be ratio-based (0..1) from current GET samples
- Measurements preview source is now available at GET /api/measurements
- Current measurements samples may return `polle` instead of `pollen`; UI code should treat this as an adapter-layer normalization concern
- Validation-event images and detected counts are sourced from `https://validation.pollenscience.eu/resources/q`
- Validation location names are now enriched from `https://validation.pollenscience.eu/resources/locations`
- Correction-factor locations are matched against validation locations by canonical name, device alias, and normalized name comparison; unresolved locations still block validation-event loading with a field-level error
