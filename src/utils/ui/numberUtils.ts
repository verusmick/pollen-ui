export function roundNumbersToInt(data: any): any {
  if (Array.isArray(data)) {
    return data.map(item => roundNumbersToInt(item));
  } else if (typeof data === 'object' && data !== null) {
    const newObj: any = {};
    for (const key in data) {
      newObj[key] = roundNumbersToInt(data[key]);
    }
    return newObj;
  } else if (typeof data === 'number') {
    return Math.round(data);
  }
  return data;
}
