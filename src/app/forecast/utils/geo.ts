
export function computeResFromZoom(zoom: number): 1 | 2 | 3 {
  if (zoom < 7) return 3;
  if (zoom < 10) return 2;
  return 1;
}

export function getGridCellsResolution(res: 1 | 2 | 3): number {
  switch (res) {
    case 1:
      return 0.02;
    case 2:
      return 0.04;
    case 3:
      return 0.08;
  }
}