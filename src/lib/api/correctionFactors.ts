import type {
  ApiCorrectionFactorDeleteResponse,
  ApiCorrectionFactorRecord,
  ApiMeasurementsResponse,
  ApiCorrectionFactorWriteRequest,
  ApiCorrectionFactorWriteSuccessResponse,
  CorrectionFactorMeasurementsRequest,
  CorrectionFactorListRequest,
} from '@/app/[locale]/alerts-and-correction-factors/correction-factors/types';

const BASE_URL = '/api/correction-factors';

export interface CorrectionFactorLocationOption {
  id: string;
  name: string;
}

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

function buildMeasurementsQuery(
  params: CorrectionFactorMeasurementsRequest
): string {
  const query = new URLSearchParams({
    from: String(params.from),
    to: String(params.to),
    locations: params.locations,
    pollen: params.pollen,
  });

  return `?${query.toString()}`;
}

async function requestJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    const errorText = await response.text();
    const trimmedErrorText = errorText.trim();

    throw new Error(
      trimmedErrorText
        ? `Correction Factors API error (${response.status}): ${trimmedErrorText}`
        : `Correction Factors API error (${response.status}): ${response.statusText}`
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  const text = await response.text();

  if (!text.trim()) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}

function normalizeStringArrayResponse(
  payload: unknown,
  resourceName: string
): string[] {
  const candidates: unknown[][] = [];

  if (Array.isArray(payload)) {
    candidates.push(payload);
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const possibleCollections = [
      record.data,
      record.items,
      record.results,
      record.locations,
      record.location,
      record.pollens,
      record.pollen,
    ];

    for (const collection of possibleCollections) {
      if (Array.isArray(collection)) {
        candidates.push(collection);
      }
    }
  }

  for (const candidate of candidates) {
    if (candidate.every((item: unknown): item is string => typeof item === 'string')) {
      return [...candidate].sort((left: string, right: string) =>
        left.localeCompare(right)
      );
    }

    if (
      candidate.every(
        (item: unknown): item is Record<string, unknown> =>
          Boolean(item) && typeof item === 'object' && !Array.isArray(item)
      )
    ) {
      const normalized = candidate
        .map((record: Record<string, unknown>) => {
          const value = record.label ?? record.name ?? record.code ?? record.value;
          return typeof value === 'string' ? value : null;
        })
        .filter((value: string | null): value is string => Boolean(value));

      if (normalized.length > 0) {
        return normalized.sort((left: string, right: string) =>
          left.localeCompare(right)
        );
      }
    }
  }

  throw new Error(
    `${resourceName} response must be a string array or an array of named objects.`
  );
}

function normalizeLocationOptionsResponse(
  payload: unknown
): CorrectionFactorLocationOption[] {
  const candidates: unknown[][] = [];

  if (Array.isArray(payload)) {
    candidates.push(payload);
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const possibleCollections = [
      record.data,
      record.items,
      record.results,
      record.locations,
      record.location,
    ];

    for (const collection of possibleCollections) {
      if (Array.isArray(collection)) {
        candidates.push(collection);
      }
    }
  }

  for (const candidate of candidates) {
    const normalized = candidate
      .map((item: unknown) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
          return null;
        }

        const record = item as Record<string, unknown>;
        const id = record.id ?? record.code ?? record.value;
        const name = record.name ?? record.label ?? record.title;

        if (typeof id !== 'string' || typeof name !== 'string') {
          return null;
        }

        return { id, name };
      })
      .filter(
        (value: CorrectionFactorLocationOption | null): value is CorrectionFactorLocationOption =>
          Boolean(value)
      );

    if (normalized.length > 0) {
      return normalized.sort((left, right) => left.name.localeCompare(right.name));
    }
  }

  throw new Error(
    'Locations response must include objects with string id and name fields.'
  );
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

export async function getCorrectionFactorLocations(): Promise<
  CorrectionFactorLocationOption[]
> {
  const response = await requestJson<unknown>('/api/locations');
  return normalizeLocationOptionsResponse(response);
}

export async function getCorrectionFactorPollens(): Promise<string[]> {
  const response = await requestJson<unknown>('/api/pollen');
  return normalizeStringArrayResponse(response, 'Pollen');
}

export async function getCorrectionFactorMeasurements(
  params: CorrectionFactorMeasurementsRequest
): Promise<ApiMeasurementsResponse> {
  return requestJson<ApiMeasurementsResponse>(
    `/api/measurements${buildMeasurementsQuery(params)}`
  );
}
