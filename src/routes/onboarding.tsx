import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/rider/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardMeta, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { errorMessage } from "@/lib/client/errors";
import { useI18n } from "@/lib/rider/i18n-context";
import { ZONES } from "@/lib/rider/catalog";
import { bootstrapRiderFn, saveProfileFn, submitKycFn } from "@/lib/server/rider-fns";
import type { RiderProfile, RiderType, VehicleType } from "@/lib/rider/types";
import { useEffect, useState, type ComponentProps } from "react";

export const Route = createFileRoute("/onboarding")({ component: Page });

function Page() {
  const { t } = useI18n();
  const [rider, setRider] = useState<RiderProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    void bootstrapRiderFn()
      .then(setRider)
      .catch((e) => setError(errorMessage(e, t("connectionLostBody"))));
  }, [t]);

  async function save(patch: Partial<RiderProfile>) {
    setPending(true);
    try {
      const next = await saveProfileFn({ data: patch });
      setRider(next);
      setError(null);
    } catch (e) {
      setError(errorMessage(e, t("actionNotConfirmed")));
    } finally {
      setPending(false);
    }
  }

  async function submit() {
    setPending(true);
    try {
      setRider(await submitKycFn());
    } catch (e) {
      setError(errorMessage(e, t("actionNotConfirmed")));
    } finally {
      setPending(false);
    }
  }

  if (!rider) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">{error ?? "…"}</p>
      </AppShell>
    );
  }

  const field = (key: keyof RiderProfile, label: string, extra: Partial<ComponentProps<typeof Input>> = {}) => (
    <div>
      <Label>{label}</Label>
      <Input
        className="mt-1"
        value={String(rider[key] ?? "")}
        onChange={(e) => setRider({ ...rider, [key]: e.target.value })}
        onBlur={() => void save({ [key]: rider[key] } as Partial<RiderProfile>)}
        {...extra}
      />
    </div>
  );

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl">{t("kyc")}</h1>
          <Badge tone={rider.kycStatus === "VERIFIED" ? "online" : "busy"}>{rider.kycStatus}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{t("kycHint")}</p>
        {error ? <p className="text-sm text-offline">{error}</p> : null}
        <Card className="space-y-3">
          <CardTitle>{t("profile")}</CardTitle>
          {field("fullName", t("name"))}
          {field("phone", t("phone"), { inputMode: "tel" })}
          {field("email", t("email"), { type: "email" })}
          {field("address", t("address"))}
          {field("emergencyName", t("emergencyContact"))}
          {field("emergencyPhone", t("phone"), { inputMode: "tel" })}
          {field("dateOfBirth", t("dob"), { type: "date" })}
          {field("governmentIdLast4", t("govId"), { maxLength: 4, inputMode: "numeric" })}
        </Card>
        <Card className="space-y-3">
          <CardTitle>{t("vehicle")}</CardTitle>
          <Label>{t("vehicleType")}</Label>
          <select
            className="h-11 w-full rounded-md border border-border bg-surface px-3"
            value={rider.vehicleType}
            onChange={(e) => {
              const vehicleType = e.target.value as VehicleType;
              setRider({ ...rider, vehicleType });
              void save({ vehicleType });
            }}
          >
            <option value="MOTORCYCLE">Motorcycle</option>
            <option value="SCOOTER">Scooter</option>
            <option value="BICYCLE">Bicycle</option>
            <option value="WALKING">Walking</option>
          </select>
          {field("vehicleRegistration", t("registration"))}
          {field("licenceNumber", t("licence"))}
          {field("insuranceRef", t("insurance"))}
          <Label>{t("brandTag")}</Label>
          <select
            className="h-11 w-full rounded-md border border-border bg-surface px-3"
            value={rider.riderType}
            onChange={(e) => {
              const riderType = e.target.value as RiderType;
              setRider({ ...rider, riderType });
              void save({ riderType });
            }}
          >
            <option value="DELIVERY_PARTNER">Delivery partner</option>
            <option value="PART_TIME">Part-time</option>
            <option value="FULL_TIME">Full-time</option>
          </select>
        </Card>
        <Card className="space-y-3">
          <CardTitle>{t("settlements")}</CardTitle>
          {field("payoutUpi", t("upi"))}
          <Label>{t("zones")}</Label>
          <div className="flex flex-wrap gap-2">
            {ZONES.map((z) => {
              const on = rider.preferredZones.includes(z);
              return (
                <button
                  key={z}
                  type="button"
                  className={`min-h-11 rounded-full px-3 text-sm ${on ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  onClick={() => {
                    const preferredZones = on
                      ? rider.preferredZones.filter((x) => x !== z)
                      : [...rider.preferredZones, z];
                    setRider({ ...rider, preferredZones });
                    void save({ preferredZones });
                  }}
                >
                  {z}
                </button>
              );
            })}
          </div>
          {field("availabilityNotes", t("availability"))}
        </Card>
        <Card>
          <CardMeta>{t("legalNote")}</CardMeta>
          <Button size="lg" className="mt-4 w-full" disabled={pending} onClick={() => void submit()}>
            {t("submitKyc")}
          </Button>
        </Card>
      </div>
    </AppShell>
  );
}
