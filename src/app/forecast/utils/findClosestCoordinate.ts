export const findClosestCoordinate = (
  value: number,
  coordinates: number[]
): number => {
  if (!coordinates || coordinates.length === 0)
    throw new Error('Empty coordinates in findClosestCoordinate');
  return coordinates.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
};
