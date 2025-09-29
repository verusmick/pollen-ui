import { feature, point, polygon, bbox, booleanPointInPolygon } from "@turf/turf";
import type { Feature, Polygon, GeoJsonProperties } from "geojson";
import bavariaGeo from '@/data/bavaria.geo.json';

export default function filterPointsInBavaria(points: [number, number, number?][]) {
  const bavariaFeature = bavariaGeo.features[0];
  const polygons: Feature<Polygon, GeoJsonProperties>[] = [];

  if (bavariaFeature.geometry.type === "MultiPolygon") {
    bavariaFeature.geometry.coordinates.forEach((coords) => {
      polygons.push(polygon(coords));
    });
  } else {
polygons.push(polygon(bavariaFeature.geometry.coordinates[0]));
  }

  const bboxes = polygons.map((poly) => bbox(poly));

  return points.filter(([lat, lng]) => {
    const p = point([lng, lat]);

    for (let i = 0; i < polygons.length; i++) {
      const [minX, minY, maxX, maxY] = bboxes[i];
      if (lng >= minX && lng <= maxX && lat >= minY && lat <= maxY) {
        if (booleanPointInPolygon(p, polygons[i])) {
          return true;
        }
      }
    }

    return false;
  });
}