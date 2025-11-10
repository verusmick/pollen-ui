import dayjs from 'dayjs';

export const normalizeForecastParams = (date: string, hour: number) => {
  const normalizedDate = dayjs(date + 'T00:00:00')
    .add(hour >= 24 ? 1 : 0, 'day')
    .format('YYYY-MM-DD');
  return { date: normalizedDate, hour: hour % 24 };
};