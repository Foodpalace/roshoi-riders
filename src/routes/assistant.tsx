import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/rider/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { errorMessage } from "@/lib/client/errors";
import { useI18n } from "@/lib/rider/i18n-context";
import { getHomeFn } from "@/lib/server/rider-fns";
import { askAssistantFn } from "@/lib/server/assistant";
import { useEffect, useState, type FormEvent } from "react";

export const Route = createFileRoute("/assistant")({ component: Page });

function Page() {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(false);
  const [lines, setLines] = useState<Array<{ role: "user" | "assistant"; text: string }>>([]);

  useEffect(() => {
    void getHomeFn()
      .then((h) => setBusy(Boolean(h.active) || h.rider.status === "BUSY"))
      .catch(() => undefined);
  }, []);

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    const question = q.trim();
    setQ("");
    setLines((l) => [...l, { role: "user", text: question }]);
    setPending(true);
    try {
      const res = await askAssistantFn({ data: { question, busy } });
      setLines((l) => [...l, { role: "assistant", text: res.text }]);
    } catch (err) {
      setLines((l) => [...l, { role: "assistant", text: errorMessage(err, t("aiUnavailable")) }]);
    } finally {
      setPending(false);
    }
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <h1 className="font-display text-3xl">{t("assistant")}</h1>
        {busy ? <p className="text-sm text-busy">{t("aiDriving")}</p> : null}
        <div className="space-y-2">
          {lines.map((l, i) => (
            <Card key={i} className={l.role === "user" ? "bg-muted" : ""}>
              <p className="text-sm leading-relaxed">{l.text}</p>
            </Card>
          ))}
        </div>
        <form onSubmit={send} className="flex gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("askAssistant")}
            disabled={pending}
          />
          <Button type="submit" disabled={pending}>
            {t("send")}
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
