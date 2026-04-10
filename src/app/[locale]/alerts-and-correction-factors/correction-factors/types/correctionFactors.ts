export type CorrectionFactorApiId = string | number;

export interface ApiCorrectionFactorDetail {
  id?: CorrectionFactorApiId;
  pollen: string | null;
  factor_percentage: number;
  published: boolean;
}

export interface ApiCorrectionFactorRecord {
  id: CorrectionFactorApiId;
  start_date: string;
  end_date: string;
  pollen: string;
  location: string;
  correction_factor_details: ApiCorrectionFactorDetail[];
}

export type ApiCorrectionFactorsListResponse = ApiCorrectionFactorRecord[];

export interface CorrectionFactorListRequest {
  from?: string;
  pollen?: string;
  locations?: string;
}

export interface ApiCorrectionFactorWriteRequest {
  start_date: string;
  end_date: string;
  pollen: string;
  location: string;
  correction_factor_details: ApiCorrectionFactorDetail[];
}

export interface ApiCorrectionFactorWriteSuccessResponse {
  status: string;
  data: {
    id: CorrectionFactorApiId;
    details_count: number;
  };
}

export interface ApiCorrectionFactorDeleteResponse {
  status: string;
  id: CorrectionFactorApiId;
}

export interface CorrectionFactorMeasurementsRequest {
  from: number;
  to: number;
  locations: string;
  pollen: string;
}

export interface CorrectionFactorValidationEventsRequest {
  from: number;
  to: number;
  location: string;
  classification: string;
}

export interface ApiMeasurementRangeRecord {
  from: unknown;
  to: unknown;
  value: unknown;
}

export interface ApiMeasurementRecord {
  location?: unknown;
  pollen?: unknown;
  polle?: unknown;
  data?: unknown;
}

export interface ApiMeasurementsResponse {
  from?: unknown;
  to?: unknown;
  measurements?: unknown;
}

export interface ApiValidationEventRecord {
  _id?: unknown;
  classification?: unknown;
  datetime?: unknown;
  device?: unknown;
  coordinates?: unknown;
  index?: unknown;
}

export interface ApiValidationLocationRecord {
  _id?: unknown;
  name?: unknown;
  devices?: unknown;
}

export type CorrectionFactorId = string;
export type CorrectionFactorStatus = 'draft' | 'published';
export type CorrectionFactorPollenCode = string;
export type CorrectionFactorUnknownCode = 'UNKNOWN';
export type CorrectionFactorSelectablePollen =
  | CorrectionFactorPollenCode
  | CorrectionFactorUnknownCode;
export type CorrectionFactorTimeOption =
  | '00:00'
  | '01:00'
  | '02:00'
  | '03:00'
  | '04:00'
  | '05:00'
  | '06:00'
  | '07:00'
  | '08:00'
  | '09:00'
  | '10:00'
  | '11:00'
  | '12:00'
  | '13:00'
  | '14:00'
  | '15:00'
  | '16:00'
  | '17:00'
  | '18:00'
  | '19:00'
  | '20:00'
  | '21:00'
  | '22:00'
  | '23:00';
export type CorrectionFactorPercentageScale = 'ratio' | 'percentage';

export interface CorrectionFactorDetail {
  id?: string;
  pollen: CorrectionFactorSelectablePollen;
  factorPercentage: number;
  published: boolean;
}

export interface CorrectionFactorRecord {
  id: CorrectionFactorId;
  location: string;
  basePollen: CorrectionFactorPollenCode;
  startDate: string;
  endDate: string;
  status: CorrectionFactorStatus;
  details: CorrectionFactorDetail[];
}

export interface CorrectionFactorListFilters {
  from: string;
  location: string;
  pollen: string;
}

export type CorrectionFactorFormMode = 'create' | 'edit';

export interface CorrectionFactorDistributionRowForm {
  clientId: string;
  pollen: CorrectionFactorSelectablePollen | '';
  reviewedEvents: string;
  isBasePollen: boolean;
}

export interface CorrectionFactorFormValues {
  location: string;
  basePollen: CorrectionFactorPollenCode | '';
  startDate: string;
  endDate: string;
  detectedEvents: number | null;
  publishOnSave: boolean;
  rows: CorrectionFactorDistributionRowForm[];
}

export interface CorrectionFactorFormErrors {
  location?: string;
  basePollen?: string;
  startDate?: string;
  endDate?: string;
  detectedEvents?: string;
  rows?: string;
  rowErrorsById: Record<
    string,
    {
      pollen?: string;
      reviewedEvents?: string;
    }
  >;
}

export interface CorrectionFactorFormDerivedRow {
  clientId: string;
  pollen: CorrectionFactorSelectablePollen | '';
  reviewedEventsNumber: number;
  multiplier: number;
  isBasePollen: boolean;
  isSyntheticUnknown: boolean;
}

export interface CorrectionFactorFormDerivedState {
  rows: CorrectionFactorFormDerivedRow[];
  assignedReviewedEvents: number;
  unknownReviewedEvents: number;
  totalReviewedEvents: number;
  remainingEvents: number;
  isBalanced: boolean;
  hasDuplicatePollens: boolean;
  hasOverAllocatedEvents: boolean;
  multipliersByRowId: Record<string, number>;
}

export interface CorrectionFactorPayloadBuildOptions {
  factorPercentageScale: CorrectionFactorPercentageScale;
  unknownPollenApiValue?: string | null;
}

export interface CorrectionFactorPreviewPoint {
  timestamp: number;
  label: string;
  originalValue: number;
  correctedValue: number;
}

export interface CorrectionFactorPreviewSeries {
  points: CorrectionFactorPreviewPoint[];
}

export interface CorrectionFactorPreviewSourcePoint {
  timestamp: number;
  endTimestamp: number;
  value: number;
}

export interface CorrectionFactorValidationEvent {
  id: string;
  classification: string;
  datetime: number;
  device: string;
  imageUrl: string;
  index: number | null;
}

export type CorrectionFactorPreviewStatus =
  | 'idle'
  | 'loading'
  | 'error'
  | 'empty'
  | 'ready';

export type CorrectionFactorValidationEventsStatus =
  | 'idle'
  | 'loading'
  | 'error'
  | 'empty'
  | 'ready';
