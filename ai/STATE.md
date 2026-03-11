## Correction Factors - active backend dependencies
Foundation/data scaffolding is implemented. The following backend points still block edit and preview behavior:
- Need confirmation whether GET /api/correctionFactors/:id exists
- Need confirmation how edit mode reconstructs reviewedEvents
- Need confirmation how Unknown is encoded in payloads
- Need confirmation whether factor_percentage expects 0..1 or 0..100
- Need confirmation preview data endpoint/source
