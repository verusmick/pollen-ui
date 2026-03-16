## Correction Factors - active backend dependencies
Foundation/data scaffolding is implemented. The following backend points still block edit and preview behavior:
- GET /api/correctionFactors/:id exists and returns stored detail multipliers
- Edit mode hydrates from stored factor multipliers using a normalized detected-events total of 1
- Need confirmation how Unknown is encoded in payloads
- factor_percentage appears to be ratio-based (0..1) from current GET samples
- Need confirmation preview data endpoint/source
