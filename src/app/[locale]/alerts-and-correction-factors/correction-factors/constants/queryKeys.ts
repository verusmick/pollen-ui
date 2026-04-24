import type { CorrectionFactorListFilters } from '../types';

export const correctionFactorKeys = {
  all: ['correctionFactors'] as const,
  options: () => [...correctionFactorKeys.all, 'options'] as const,
  locations: () => [...correctionFactorKeys.options(), 'locations'] as const,
  pollens: () => [...correctionFactorKeys.options(), 'pollens'] as const,
  lists: () => [...correctionFactorKeys.all, 'list'] as const,
  list: (filters: CorrectionFactorListFilters) =>
    [...correctionFactorKeys.lists(), filters] as const,
  details: () => [...correctionFactorKeys.all, 'detail'] as const,
  detail: (id: string) => [...correctionFactorKeys.details(), id] as const,
  previews: () => [...correctionFactorKeys.all, 'preview'] as const,
  preview: (params: {
    location: string;
    basePollen: string;
    startDate: string;
    endDate: string;
  }) => [...correctionFactorKeys.previews(), params] as const,
  validationEvents: () =>
    [...correctionFactorKeys.all, 'validationEvents'] as const,
  validationEvent: (params: {
    location: string;
    basePollen: string;
    reviewSliceId: string;
    from: number;
    to: number;
  }) => [...correctionFactorKeys.validationEvents(), params] as const,
};
