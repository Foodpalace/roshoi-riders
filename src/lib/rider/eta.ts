import type { GeoPoint } from "./types.ts";

const EARTH_KM = 6371;

export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Straight-line × local travel factor + prep + buffer. Always an estimate. */
export function estimateMinutes(opts: {
  from: GeoPoint;
  to: GeoPoint;
  travelFactor: number;
  avgSpeedKmh: number;
  preparationMinutes: number;
  bufferMinutes: number;
}): { minutes: number; kind: "ESTIMATED" } {
  const km = haversineKm(opts.from, opts.to) * opts.travelFactor;
  const travel = (km / Math.max(opts.avgSpeedKmh, 1)) * 60;
  const minutes = Math.max(
    1,
    Math.round(travel + opts.preparationMinutes + opts.bufferMinutes),
  );
  return { minutes, kind: "ESTIMATED" };
}

export function formatEta(minutes: number): string {
  if (minutes < 60) return `~${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `~${h} h ${m} min` : `~${h} h`;
}
