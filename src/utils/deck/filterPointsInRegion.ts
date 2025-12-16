import { point, polygon, bbox, booleanPointInPolygon } from '@turf/turf';
import type {
  Feature,
  Polygon,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
} from 'geojson';

export default function filterPointsInRegion<
  T extends number | null | undefined
>(points: [number, number, T][], regionGeo: unknown): [number, number, T][] {
  const geo = regionGeo as
    | FeatureCollection<Geometry, GeoJsonProperties>
    | Feature<Geometry, GeoJsonProperties>;

  const features = (geo as FeatureCollection<Geometry, GeoJsonProperties>)
    .features ?? [geo as Feature<Geometry, GeoJsonProperties>];

  const polygons: Feature<Polygon, GeoJsonProperties>[] = [];

  for (const feature of features) {
    if (feature.geometry.type === 'Polygon') {
      polygons.push(polygon(feature.geometry.coordinates));
    } else if (feature.geometry.type === 'MultiPolygon') {
      feature.geometry.coordinates.forEach((coords) => {
        polygons.push(polygon(coords));
      });
    }
  }

  const bboxes = polygons.map((poly) => bbox(poly));

  return points.filter(([lat, lng]) => {
    const p = point([lng, lat]);

    for (let i = 0; i < polygons.length; i++) {
      const [minX, minY, maxX, maxY] = bboxes[i];

      if (
        lng >= minX &&
        lng <= maxX &&
        lat >= minY &&
        lat <= maxY &&
        booleanPointInPolygon(p, polygons[i])
      ) {
        return true;
      }
    }

    return false;
  });
}
