import type { CorrectionFactorListFilters } from '../types';

export const correctionFactorKeys = {
  all: ['correctionFactors'] as const,
  lists: () => [...correctionFactorKeys.all, 'list'] as const,
  list: (filters: CorrectionFactorListFilters) =>
    [...correctionFactorKeys.lists(), filters] as const,
  details: () => [...correctionFactorKeys.all, 'detail'] as const,
  detail: (id: string) => [...correctionFactorKeys.details(), id] as const,
  preview: (params: {
    location: string;
    basePollen: string;
    startDate: string;
    endDate: string;
  }) => [...correctionFactorKeys.all, 'preview', params] as const,
};
