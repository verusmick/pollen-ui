import type { CorrectionFactorTimeOption } from '../types';

const CORRECTION_FACTOR_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const CORRECTION_FACTOR_DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;
const CORRECTION_FACTOR_INPUT_DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

function padNumber(value: number): string {
  return String(value).padStart(2, '0');
}

export const CORRECTION_FACTOR_TIME_OPTIONS: CorrectionFactorTimeOption[] =
  Array.from(
    { length: 24 },
    (_, hour) => `${padNumber(hour)}:00` as CorrectionFactorTimeOption
  );

function isValidDateParts(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function buildCorrectionFactorDateTimeValue(
  year: number,
  month: number,
  day: number,
  hour: number
): string {
  return `${year}-${padNumber(month)}-${padNumber(day)}T${padNumber(hour)}:00`;
}

export function isCorrectionFactorTimeOption(
  value: string
): value is CorrectionFactorTimeOption {
  return CORRECTION_FACTOR_TIME_OPTIONS.includes(value as CorrectionFactorTimeOption);
}

export function splitCorrectionFactorDateTime(value: string): {
  date: string;
  time: CorrectionFactorTimeOption | '';
} {
  const match = CORRECTION_FACTOR_DATE_TIME_PATTERN.exec(value);

  if (!match) {
    return {
      date: '',
      time: '',
    };
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const minute = Number(match[5]);
  const time = `${match[4]}:${match[5]}`;

  if (
    !isValidDateParts(year, month, day) ||
    minute !== 0 ||
    !isCorrectionFactorTimeOption(time)
  ) {
    return {
      date: '',
      time: '',
    };
  }

  return {
    date: `${match[1]}-${match[2]}-${match[3]}`,
    time,
  };
}

export function combineCorrectionFactorDateTime(
  date: string,
  time: string
): string {
  const dateMatch = CORRECTION_FACTOR_DATE_PATTERN.exec(date);

  if (!dateMatch || !isCorrectionFactorTimeOption(time)) {
    return '';
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);

  if (!isValidDateParts(year, month, day)) {
    return '';
  }

  return `${date}T${time}`;
}

export function normalizeCorrectionFactorDateTime(value: string): string {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return '';
  }

  const splitValue = splitCorrectionFactorDateTime(normalizedValue);

  if (splitValue.date && splitValue.time) {
    return normalizedValue;
  }

  const dateMatch = CORRECTION_FACTOR_DATE_PATTERN.exec(normalizedValue);

  if (dateMatch) {
    const year = Number(dateMatch[1]);
    const month = Number(dateMatch[2]);
    const day = Number(dateMatch[3]);

    if (isValidDateParts(year, month, day)) {
      return buildCorrectionFactorDateTimeValue(year, month, day, 0);
    }
  }

  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  const year = parsedDate.getUTCFullYear();
  const month = parsedDate.getUTCMonth() + 1;
  const day = parsedDate.getUTCDate();
  const hour = parsedDate.getUTCHours();

  return buildCorrectionFactorDateTimeValue(year, month, day, hour);
}

export function normalizeCorrectionFactorDateTimeInput(value: string): string {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return '';
  }

  const splitValue = splitCorrectionFactorDateTime(normalizedValue);

  if (splitValue.date && splitValue.time) {
    return normalizedValue;
  }

  const inputMatch = CORRECTION_FACTOR_INPUT_DATE_TIME_PATTERN.exec(normalizedValue);

  if (!inputMatch) {
    return normalizeCorrectionFactorDateTime(normalizedValue);
  }

  const year = Number(inputMatch[1]);
  const month = Number(inputMatch[2]);
  const day = Number(inputMatch[3]);
  const hour = Number(inputMatch[4]);

  if (
    !isValidDateParts(year, month, day) ||
    !Number.isInteger(hour) ||
    hour < 0 ||
    hour > 23
  ) {
    return '';
  }

  return buildCorrectionFactorDateTimeValue(year, month, day, hour);
}

export function isValidCorrectionFactorDateTime(value: string): boolean {
  const splitValue = splitCorrectionFactorDateTime(value);
  return Boolean(splitValue.date && splitValue.time);
}

export function compareCorrectionFactorDateTimes(
  left: string,
  right: string
): number | null {
  const leftTimestamp = toCorrectionFactorUnixTimestamp(left);
  const rightTimestamp = toCorrectionFactorUnixTimestamp(right);

  if (leftTimestamp === null || rightTimestamp === null) {
    return null;
  }

  return leftTimestamp - rightTimestamp;
}

export function toCorrectionFactorUnixTimestamp(value: string): number | null {
  const match = CORRECTION_FACTOR_DATE_TIME_PATTERN.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const time = `${match[4]}:${match[5]}`;

  if (
    !isValidDateParts(year, month, day) ||
    minute !== 0 ||
    !isCorrectionFactorTimeOption(time)
  ) {
    return null;
  }

  return Math.floor(Date.UTC(year, month - 1, day, hour, minute, 0) / 1000);
}

export function toCorrectionFactorApiDateTime(value: string): string | null {
  const timestamp = toCorrectionFactorUnixTimestamp(value);

  if (timestamp === null) {
    return null;
  }

  const date = new Date(timestamp * 1000);

  return `${date.getUTCFullYear()}-${padNumber(
    date.getUTCMonth() + 1
  )}-${padNumber(date.getUTCDate())} ${padNumber(
    date.getUTCHours()
  )}:${padNumber(date.getUTCMinutes())}:00+00`;
}

export function formatCorrectionFactorDateTimeRange(
  startDateTime: string,
  endDateTime: string
): string {
  const normalizedStart = normalizeCorrectionFactorDateTime(startDateTime);
  const normalizedEnd = normalizeCorrectionFactorDateTime(endDateTime);
  const start = splitCorrectionFactorDateTime(normalizedStart);
  const end = splitCorrectionFactorDateTime(normalizedEnd);

  if (start.date && start.time && end.date && end.time) {
    return `${start.date} ${start.time} - ${end.date} ${end.time}`;
  }

  return `${startDateTime} - ${endDateTime}`;
}
