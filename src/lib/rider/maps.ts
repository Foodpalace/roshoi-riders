import type { GeoPoint } from "./types.ts";

export function mapsUrl(point: GeoPoint, label: string): string {
  const q = encodeURIComponent(`${point.lat},${point.lng} (${label})`);
  return `https://www.openstreetmap.org/?mlat=${point.lat}&mlon=${point.lng}#map=16/${point.lat}/${point.lng}&q=${q}`;
}

export function geoUrl(point: GeoPoint): string {
  return `geo:${point.lat},${point.lng}`;
}
