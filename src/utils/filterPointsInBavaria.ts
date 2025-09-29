import * as turf from "@turf/turf";
import bavariaGeo from '@/data/bavaria.geo.json';

export default function filterPointsInBavaria(points: [number, number, number?][]) {
  const bavariaFeature = bavariaGeo.features[0];
  const polygons: turf.Feature<turf.Polygon>[] = [];

  if (bavariaFeature.geometry.type === "MultiPolygon") {
    bavariaFeature.geometry.coordinates.forEach((coords) => {
      polygons.push(turf.polygon(coords));
    });
  } else {
    polygons.push(turf.polygon(bavariaFeature.geometry.coordinates));
  }

  const bboxes = polygons.map((poly) => turf.bbox(poly));

  return points.filter(([lat, lng]) => {
    const point = turf.point([lng, lat]);

    for (let i = 0; i < polygons.length; i++) {
      const [minX, minY, maxX, maxY] = bboxes[i];
      if (lng >= minX && lng <= maxX && lat >= minY && lat <= maxY) {
        if (turf.booleanPointInPolygon(point, polygons[i])) {
          return true;
        }
      }
    }

    return false;
  });
}