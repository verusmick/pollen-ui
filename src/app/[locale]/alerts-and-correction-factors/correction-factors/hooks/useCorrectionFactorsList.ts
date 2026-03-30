'use client';

import { useQuery } from '@tanstack/react-query';

import { getCorrectionFactors } from '@/lib/api/correctionFactors';

import { correctionFactorKeys } from '../constants';
import type {
  CorrectionFactorListFilters,
  CorrectionFactorListRequest,
  CorrectionFactorRecord,
} from '../types';
import { mapApiCorrectionFactorsList } from '../utils';

function mapListFiltersToRequest(
  filters: CorrectionFactorListFilters
): CorrectionFactorListRequest {
  return {
    from: filters.from || undefined,
    pollen: filters.pollen || undefined,
    // UI uses `location`, while the API contract expects `locations`.
    locations: filters.location || undefined,
  };
}

export function useCorrectionFactorsList(filters: CorrectionFactorListFilters) {
  return useQuery<CorrectionFactorRecord[]>({
    queryKey: correctionFactorKeys.list(filters),
    queryFn: async () => {
      const response = await getCorrectionFactors(mapListFiltersToRequest(filters));
      return mapApiCorrectionFactorsList(response);
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 10,
  });
}
