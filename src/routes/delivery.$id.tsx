import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/rider/app-shell";
import { DeliveryActions } from "@/components/rider/delivery-actions";
import { MapPane } from "@/components/rider/map-pane";
import { Badge } from "@/components/ui/badge";
import { errorMessage } from "@/lib/client/errors";
import { useI18n } from "@/lib/rider/i18n-context";
import { getDeliveryFn } from "@/lib/server/rider-fns";
import { useCallback, useEffect, useState } from "react";

export const Route = createFileRoute("/delivery/$id")({ component: Page });

function Page() {
  const { id } = Route.useParams();
  const { t } = useI18n();
  const [pack, setPack] = useState<Awaited<ReturnType<typeof getDeliveryFn>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    void getDeliveryFn({ data: { deliveryId: id } })
      .then(setPack)
      .catch((e) => setError(errorMessage(e, t("forbidden"))));
  }, [id, t]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AppShell>
      {error ? <p className="text-sm text-offline">{error}</p> : null}
      {pack ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl">{pack.delivery.orderCode}</h1>
            <Badge tone="busy">{pack.delivery.state.replaceAll("_", " ")}</Badge>
          </div>
          <MapPane
            pickup={pack.delivery.pickupLocation}
            drop={pack.delivery.dropLocation}
            pickupLabel={pack.delivery.restaurant.name}
            dropLabel={pack.delivery.customer.area}
            navigateLabel={t("mapsOpen")}
          />
          <DeliveryActions
            delivery={pack.delivery}
            cash={null}
            simulatedOtp={pack.simulatedOtp}
            onChanged={load}
          />
        </div>
      ) : null}
    </AppShell>
  );
}
