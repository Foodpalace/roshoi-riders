import { geoUrl, mapsUrl } from "@/lib/rider/maps";
import type { GeoPoint } from "@/lib/rider/types";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";

function project(p: GeoPoint, all: GeoPoint[]) {
  const lats = all.map((x) => x.lat);
  const lngs = all.map((x) => x.lng);
  const minLat = Math.min(...lats) - 0.01;
  const maxLat = Math.max(...lats) + 0.01;
  const minLng = Math.min(...lngs) - 0.01;
  const maxLng = Math.max(...lngs) + 0.01;
  const x = ((p.lng - minLng) / (maxLng - minLng)) * 100;
  const y = (1 - (p.lat - minLat) / (maxLat - minLat)) * 100;
  return { x, y };
}

export function MapPane({
  pickup,
  drop,
  current,
  pickupLabel,
  dropLabel,
  navigateLabel,
}: {
  pickup?: GeoPoint | null;
  drop?: GeoPoint | null;
  current?: GeoPoint | null;
  pickupLabel: string;
  dropLabel: string;
  navigateLabel: string;
}) {
  const points = [pickup, drop, current].filter(Boolean) as GeoPoint[];
  const target = drop ?? pickup;
  return (
    <div className="overflow-hidden rounded-lg bg-paper">
      <svg viewBox="0 0 100 72" className="h-44 w-full" role="img" aria-label="Route">
        <rect width="100" height="72" className="fill-paper" />
        <g className="stroke-border" strokeWidth="0.4">
          {Array.from({ length: 6 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 12} x2="100" y2={i * 12} />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`v${i}`} x1={i * 12.5} y1="0" x2={i * 12.5} y2="72" />
          ))}
        </g>
        {points.length >= 2 && pickup && drop ? (
          <line
            x1={project(pickup, points).x}
            y1={project(pickup, points).y}
            x2={project(drop, points).x}
            y2={project(drop, points).y}
            className="stroke-primary"
            strokeWidth="1.2"
            strokeDasharray="2 1.5"
          />
        ) : null}
        {pickup && points.length ? (
          <circle cx={project(pickup, points).x} cy={project(pickup, points).y} r="2.4" className="fill-primary" />
        ) : null}
        {drop && points.length ? (
          <circle cx={project(drop, points).x} cy={project(drop, points).y} r="2.4" className="fill-cod" />
        ) : null}
        {current && points.length ? (
          <circle cx={project(current, points).x} cy={project(current, points).y} r="2" className="fill-fg" />
        ) : null}
      </svg>
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5" />
          {pickupLabel} → {dropLabel}
        </p>
        {target ? (
          <Button asChild variant="ghost" size="sm" className="min-h-10">
            <a href={mapsUrl(target, dropLabel)} target="_blank" rel="noreferrer">
              <Navigation className="size-4" />
              {navigateLabel}
            </a>
          </Button>
        ) : null}
        {target ? <link rel="alternate" href={geoUrl(target)} /> : null}
      </div>
    </div>
  );
}
