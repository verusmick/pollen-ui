'use client';

import { useQuery } from '@tanstack/react-query';

import { getCorrectionFactorById } from '@/lib/api/correctionFactors';

import { correctionFactorKeys } from '../constants';
import type { CorrectionFactorRecord } from '../types';
import { mapApiCorrectionFactorRecord } from '../utils';

export function useCorrectionFactorDetail(id?: string) {
  return useQuery<CorrectionFactorRecord>({
    queryKey: correctionFactorKeys.detail(id ?? ''),
    queryFn: async () => {
      if (!id) {
        throw new Error('Correction factor id is required.');
      }

      const response = await getCorrectionFactorById(id);
      return mapApiCorrectionFactorRecord(response);
    },
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 10,
  });
}
