import dayjs from 'dayjs';

export interface HourPoint {
  label: string;
  date: string;
  apiDate: string;
  apiHour: string;
  hourIndex: number;
  showDate: boolean;
}

export type NavigationDirection = 'next' | 'prev';

interface BuildTimelineParams {
  baseDate: string | Date;
  intervalHours: number;
  totalHours: number;
}


// Timeline Builder
export const buildHourTimeline = ({
  baseDate,
  intervalHours,
  totalHours,
}: BuildTimelineParams) => {
  const steps = totalHours / intervalHours;

  const now = dayjs();
  const base = dayjs(baseDate);

  const currentHour = now.hour();
  const alignedHour = currentHour - (currentHour % intervalHours);

  const end = base
    .hour(alignedHour)
    .minute(0)
    .second(0)
    .millisecond(0);

  const start = end.subtract(totalHours - intervalHours, 'hour');

  const hours: HourPoint[] = [];

  for (let i = 0; i < steps; i++) {
    const d = start.add(i * intervalHours, 'hour');

    hours.push({
      label: d.format('HH:mm'),
      date: d.format('MMM D, YYYY'),
      apiDate: d.format('YYYY-MM-DD'),
      apiHour: String(d.hour()),
      hourIndex: i * intervalHours,
      showDate: i % Math.floor(6 / intervalHours) === 0,
    });
  }

  return { start, hours };
};


//  Timeline Navigation
export const getAdjacentHour = (
  hours: HourPoint[],
  activeHourIndex: number,
  direction: NavigationDirection
): HourPoint | null => {
  if (!hours.length) return null;

  const currentIndex = hours.findIndex(
    (h) => h.hourIndex === activeHourIndex
  );

  if (currentIndex === -1) return null;

  const delta = direction === 'next' ? 1 : -1;
  const nextIndex =
    (currentIndex + delta + hours.length) % hours.length;

  return hours[nextIndex];
};

export const getHourByIndex = (
  hours: HourPoint[],
  hourIndex: number
): HourPoint | null => {
  return hours.find((h) => h.hourIndex === hourIndex) ?? null;
};
