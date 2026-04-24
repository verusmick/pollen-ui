import type {
  CorrectionFactorFormErrors,
  CorrectionFactorFormValues,
  CorrectionFactorListFilters,
} from '../types';

export const DEFAULT_CORRECTION_FACTOR_LIST_FILTERS: CorrectionFactorListFilters =
  {
    from: '',
    location: '',
    pollen: '',
  };

export const DEFAULT_CORRECTION_FACTOR_FORM_VALUES: CorrectionFactorFormValues =
  {
    location: '',
    basePollen: '',
    startDate: '',
    endDate: '',
    selectedSliceId: null,
    detectedEvents: null,
    events: [],
    rows: [],
  };

export const EMPTY_CORRECTION_FACTOR_FORM_ERRORS: CorrectionFactorFormErrors = {
  rowErrorsById: {},
};
