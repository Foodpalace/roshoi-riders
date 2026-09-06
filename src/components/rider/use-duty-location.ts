import { postLocationFn } from "@/lib/server/rider-fns";
import { useEffect } from "react";

export function useDutyLocation(enabled: boolean, deliveryId: string | null, intervalSec: number) {
  useEffect(() => {
    if (!enabled || typeof navigator === "undefined" || !navigator.geolocation) {
      window.dispatchEvent(new CustomEvent("roshoi-geo", { detail: { ok: true } }));
      return;
    }
    let lastSent = 0;
    const watch = navigator.geolocation.watchPosition(
      (pos) => {
        window.dispatchEvent(new CustomEvent("roshoi-geo", { detail: { ok: true } }));
        const now = Date.now();
        if (now - lastSent < intervalSec * 1000) return;
        lastSent = now;
        void postLocationFn({
          data: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracyM: pos.coords.accuracy ?? null,
            deliveryId,
          },
        }).catch(() => undefined);
      },
      () => {
        window.dispatchEvent(new CustomEvent("roshoi-geo", { detail: { ok: false } }));
      },
      { enableHighAccuracy: false, maximumAge: 15_000, timeout: 12_000 },
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, [enabled, deliveryId, intervalSec]);
}
