export const findClosestValue = (value: number, array: number[]): number => {
  if (!array || array.length === 0)
    throw new Error('Empty array in findClosestValue');
  return array.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
};
