import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/rider/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { errorMessage, newIdempotencyKey } from "@/lib/client/errors";
import { useI18n } from "@/lib/rider/i18n-context";
import { createTicketFn, listTicketsFn } from "@/lib/server/rider-fns";
import type { TicketTopic } from "@/lib/rider/types";
import { useEffect, useState, type FormEvent } from "react";

export const Route = createFileRoute("/support")({ component: Page });

const TOPICS: TicketTopic[] = [
  "ORDER_ISSUE",
  "RESTAURANT_ISSUE",
  "CUSTOMER_UNAVAILABLE",
  "CASH_DISPUTE",
  "PAYMENT_ISSUE",
  "APP_ISSUE",
  "VEHICLE_PROBLEM",
  "SAFETY_ISSUE",
  "OTHER",
];

function Page() {
  const { t } = useI18n();
  const [topic, setTopic] = useState<TicketTopic>("ORDER_ISSUE");
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState<Awaited<ReturnType<typeof listTicketsFn>>>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function load() {
    try {
      setTickets(await listTicketsFn());
    } catch (e) {
      setError(errorMessage(e, t("connectionLostBody")));
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      await createTicketFn({
        data: { topic, message, idempotencyKey: newIdempotencyKey() },
      });
      setMessage("");
      await load();
    } catch (err) {
      setError(errorMessage(err, t("actionNotConfirmed")));
    } finally {
      setPending(false);
    }
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <h1 className="font-display text-3xl">{t("support")}</h1>
        <Card>
          <form onSubmit={submit} className="space-y-3">
            <Label>{t("createTicket")}</Label>
            <select
              className="h-11 w-full rounded-md border border-border bg-surface px-3"
              value={topic}
              onChange={(e) => setTopic(e.target.value as TicketTopic)}
            >
              {TOPICS.map((x) => (
                <option key={x} value={x}>
                  {x.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <Input
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("message")}
            />
            {error ? <p className="text-sm text-offline">{error}</p> : null}
            <Button size="lg" className="w-full" disabled={pending} type="submit">
              {t("createTicket")}
            </Button>
          </form>
        </Card>
        <ul className="space-y-2">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <Card>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {t("ticketRef")} {ticket.id.slice(0, 8)}
                  </CardTitle>
                  <Badge tone="muted">{ticket.status}</Badge>
                </div>
                <p className="mt-2 text-sm">{ticket.topic.replaceAll("_", " ")}</p>
                <p className="text-sm text-muted-foreground">{ticket.message}</p>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
