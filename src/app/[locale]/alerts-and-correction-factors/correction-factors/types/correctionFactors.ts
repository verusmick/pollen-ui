export type CorrectionFactorApiId = string | number;

export interface ApiCorrectionFactorDetail {
  id?: CorrectionFactorApiId;
  pollen: string | null;
  factor_percentage: number;
  published: boolean;
}

export interface ApiCorrectionFactorPeakImage {
  pollen: string;
  location: string;
  datetime: string;
  x: number;
  y: number;
  width: number;
  height: number;
  _id: string;
  index: number | null;
}

export interface ApiCorrectionFactorPeak {
  pollen: string;
  location: string;
  start_date: string;
  end_date: string;
  value: number;
  images: ApiCorrectionFactorPeakImage[];
}

export interface ApiCorrectionFactorRecord {
  id: CorrectionFactorApiId;
  start_date: string;
  end_date: string;
  pollen: string;
  location: string;
  correction_factor_details: ApiCorrectionFactorDetail[];
  peaks?: ApiCorrectionFactorPeak[];
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
  peaks?: ApiCorrectionFactorPeak[];
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
  applyRules?: boolean;
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
export type CorrectionFactorMultiplierMode = 'eventBased' | 'manual';
export type CorrectionFactorReviewStateSource = 'active' | 'persisted';
export type CorrectionFactorChartResolution =
  | 'month'
  | 'week'
  | 'day'
  | 'measurement';

export interface CorrectionFactorDetail {
  id?: string;
  pollen: CorrectionFactorSelectablePollen;
  factorPercentage: number;
  published: boolean;
}

export interface CorrectionFactorPeakImage {
  id: string;
  pollen: CorrectionFactorSelectablePollen;
  location: string;
  datetime: string;
  timestamp: number;
  coordinates: CorrectionFactorValidationEventCoordinates;
  index: number | null;
}

export interface CorrectionFactorPeak {
  id: string;
  pollen: CorrectionFactorSelectablePollen;
  location: string;
  startDate: string;
  endDate: string;
  startTimestamp: number;
  endTimestamp: number;
  value: number;
  images: CorrectionFactorPeakImage[];
}

export interface CorrectionFactorRecord {
  id: CorrectionFactorId;
  location: string;
  basePollen: CorrectionFactorPollenCode;
  startDate: string;
  endDate: string;
  details: CorrectionFactorDetail[];
  peaks: CorrectionFactorPeak[];
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
  storedMultiplier?: number | null;
  isBasePollen: boolean;
}

export interface CorrectionFactorFormValues {
  location: string;
  basePollen: CorrectionFactorPollenCode | '';
  ruleEnabled: boolean;
  startDate: string;
  endDate: string;
  selectedReviewSliceId: string | null;
  detectedEvents: number | null;
  multiplierMode: CorrectionFactorMultiplierMode;
  reviewStateSource: CorrectionFactorReviewStateSource;
  manualMultiplier: string;
  events: CorrectionFactorReviewedValidationEvent[];
  peaks: CorrectionFactorPeak[];
  rows: CorrectionFactorDistributionRowForm[];
}

export interface CorrectionFactorFormErrors {
  location?: string;
  basePollen?: string;
  startDate?: string;
  endDate?: string;
  detectedEvents?: string;
  manualMultiplier?: string;
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
  preferStoredMultipliers?: boolean;
}

export interface CorrectionFactorChartRange {
  from: number;
  to: number;
}

export interface CorrectionFactorChartNavigationState {
  rootRange: CorrectionFactorChartRange | null;
  visibleRange: CorrectionFactorChartRange | null;
  canDrillUp: boolean;
  depth: number;
}

export interface CorrectionFactorPreviewPoint {
  id: string;
  timestamp: number;
  endTimestamp: number;
  displayTimestamp: number;
  peakTimestamp: number;
  peakEndTimestamp: number;
  axisLabel: string;
  label: string;
  detailLabel: string;
  peakDateLabel: string;
  peakTimeRangeLabel: string;
  originalValue: number;
  correctedValue: number;
  resolution: CorrectionFactorChartResolution;
  isReviewSlice: boolean;
  sourcePointsCount: number;
}

export interface CorrectionFactorPreviewSeries {
  points: CorrectionFactorPreviewPoint[];
  resolution: CorrectionFactorChartResolution;
  showPointMarkers: boolean;
}

export interface CorrectionFactorReviewSlice {
  id: string;
  from: number;
  to: number;
  peakTimestamp: number;
  label: string;
}

export interface CorrectionFactorPreviewSourcePoint {
  timestamp: number;
  endTimestamp: number;
  displayTimestamp: number;
  value: number;
}

export interface CorrectionFactorValidationEventCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CorrectionFactorValidationEvent {
  id: string;
  classification: string;
  datetime: number;
  device: string;
  imageUrl: string;
  coordinates: CorrectionFactorValidationEventCoordinates | null;
  index: number | null;
}

export interface CorrectionFactorReviewedValidationEvent
  extends CorrectionFactorValidationEvent {
  reviewedPollen: CorrectionFactorSelectablePollen;
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
