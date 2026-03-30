## Correction Factors - active backend dependencies
Foundation/data scaffolding is implemented. Remaining backend dependencies are centered on payload parity and preview sourcing:
- GET /api/correctionFactors/:id exists and returns stored detail multipliers
- Edit mode is implemented by hydrating stored factor multipliers with a normalized detected-events total of 1
- This preserves stored multipliers for editing but does not restore the original reviewed-event counts
- Need confirmation how Unknown is encoded in payloads
- factor_percentage appears to be ratio-based (0..1) from current GET samples
- Need confirmation preview data endpoint/source
