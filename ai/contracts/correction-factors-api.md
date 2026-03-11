Correction Factor
Tables
1. correction_factors
• id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
• start_date TIMESTAMPTZ NOT NULL
• end_date TIMESTAMPTZ NOT NULL
• measure_id BIGINT NOT NULL
• location_id BIGINT NOT NULL
2. correction_factor_details
• id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
• correction_factor_id BIGINT NOT NULL
• measure_id BIGINT
• factor_percentage DOUBLE PRECISION NOT NULL
• published BOOLEAN NOT NULL DEFAULT FALSE
API
GET List of Corrrection Factor
GET http://localhost:8989/api/correctionFactors
Query params
• from
• pollen
• locations
Example 1: return all correction factors request
curl -X GET \
"http://localhost:8989/api/correctionFactors?from=2026-04-01%2000:00:00&pollen=Alnus&locations=DEBIED"
Example 1: resposne
[]
POST Create Correction Factor
/api/correctionFactors
POST http://localhost:8989/api/correctionFactors Content-Type: application/json
{
"start_date": "2026-04-01 00:00:00+00",
"end_date": "2026-04-30 23:59:59+00",
"pollen": "Alnus",
"location": "DEBIED",
"correction_factor_details": [
{
"pollen": "Alnus",
"factor_percentage": 0.5,
"published": true
},
{
1
"pollen": "Betula",
"factor_percentage": 0.5,
"published": true
}
]
}
Example 2: request
curl -X POST "http://localhost:8989/api/correctionFactors" \
-H "Content-Type: application/json" \
-d '{
"start_date": "2026-04-01 00:00:00+00",
"end_date": "2026-04-30 23:59:59+00",
"pollen": "Alnus",
"location": "DEBIED",
"correction_factor_details": [
{
"pollen": "Alnus",
"factor_percentage": 0.5,
"published": true
},
{
"pollen": "Betula",
"factor_percentage": 0.5,
"published": true
}
]
}'
Example 2: response
{"status":"ok","data":{"id":"5","details_count":2}}
PUT Update Correction Factor
/api/correctionFactors/{{correctionFactorId}}
PUT http://localhost:8989/api/correctionFactors/4 Content-Type: application/json
{
"start_date": "2026-04-01 00:00:00+00",
"end_date": "2026-04-30 23:59:59+00",
"pollen": "Alnus",
"location": "DEBIED",
"correction_factor_details": []
}
Example 3: request
curl -X PUT "http://localhost:8989/api/correctionFactors/4" \
-H "Content-Type: application/json" \
-d '{
"start_date": "2026-04-01 00:00:00+00",
"end_date": "2026-04-30 23:59:59+00",
"pollen": "Alnus",
"location": "DEBIED",
2
"correction_factor_details": []
}'
Example 3: response
{"status":"updated","data":{"id":"4","details_count":0}}
DELETE Remove a Correction Factor
/api/correctionFactors/{{correctionFactorId}}
DELETE http://localhost:8989/api/correctionFactors/4 Content-Type: application/json
Example 4: request
curl -X DELETE "http://localhost:8989/api/correctionFactors/4" \
-H "Content-Type: application/json"
Example 4: response
{"status":"deleted","id":"4"}