import type {
  ApiCorrectionFactorDeleteResponse,
  ApiCorrectionFactorRecord,
  ApiCorrectionFactorWriteRequest,
  ApiCorrectionFactorWriteSuccessResponse,
  CorrectionFactorListRequest,
} from '@/app/[locale]/alerts-and-correction-factors/correction-factors/types';

const BASE_URL = '/api/correction-factors';

function buildListQuery(params: CorrectionFactorListRequest): string {
  const query = new URLSearchParams();

  if (params.from) {
    query.set('from', params.from);
  }

  if (params.pollen) {
    query.set('pollen', params.pollen);
  }

  if (params.locations) {
    query.set('locations', params.locations);
  }

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

async function requestJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    throw new Error(`Correction Factors API error: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function getCorrectionFactors(
  params: CorrectionFactorListRequest
): Promise<ApiCorrectionFactorRecord[]> {
  return requestJson<ApiCorrectionFactorRecord[]>(
    `${BASE_URL}${buildListQuery(params)}`
  );
}

export async function getCorrectionFactorById(
  id: string
): Promise<ApiCorrectionFactorRecord> {
  return requestJson<ApiCorrectionFactorRecord>(`${BASE_URL}/${id}`);
}

export async function createCorrectionFactor(
  payload: ApiCorrectionFactorWriteRequest
): Promise<ApiCorrectionFactorWriteSuccessResponse> {
  return requestJson<ApiCorrectionFactorWriteSuccessResponse>(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export async function updateCorrectionFactor(
  id: string,
  payload: ApiCorrectionFactorWriteRequest
): Promise<ApiCorrectionFactorWriteSuccessResponse> {
  return requestJson<ApiCorrectionFactorWriteSuccessResponse>(
    `${BASE_URL}/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );
}

export async function deleteCorrectionFactor(
  id: string
): Promise<ApiCorrectionFactorDeleteResponse> {
  return requestJson<ApiCorrectionFactorDeleteResponse>(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
}
