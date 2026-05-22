export const POLLEN_SCIENCE_DISPLAY_TIME_ZONE = 'Europe/Berlin';

export function formatPollenScienceDateTime(
  timestamp: number,
  options: Intl.DateTimeFormatOptions,
  locale?: string
): string {
  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: POLLEN_SCIENCE_DISPLAY_TIME_ZONE,
  }).format(new Date(timestamp * 1000));
}

export function formatPollenScienceTimeRange(
  startTimestamp: number,
  endTimestamp: number,
  locale?: string
): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  };

  return `${formatPollenScienceDateTime(
    startTimestamp,
    options,
    locale
  )} - ${formatPollenScienceDateTime(endTimestamp, options, locale)}`;
}
