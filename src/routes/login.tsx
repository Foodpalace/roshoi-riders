import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { DEFAULT_BRANDING } from "@/lib/rider/config";
import { useI18n } from "@/lib/rider/i18n-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState, type FormEvent } from "react";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { t, locale, setLocale } = useI18n();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      if (mode === "up") {
        const { error: err } = await authClient.signUp.email({
          email,
          password,
          name: name || email.split("@")[0] || "Partner",
          callbackURL: "/",
        });
        if (err) throw new Error(err.message);
      } else {
        const { error: err } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/",
        });
        if (err) throw new Error(err.message);
      }
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : t("unauthorized"));
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto min-h-dvh max-w-lg px-4 py-10">
      <div className="mb-4 flex items-center justify-between">
        <Badge tone="sim">{t("simulated")}</Badge>
        <button type="button" className="text-sm underline" onClick={() => setLocale(locale === "en" ? "bn" : "en")}>
          {locale === "en" ? "বাংলা" : "English"}
        </button>
      </div>
      <img src={DEFAULT_BRANDING.logoUrl} alt="" className="size-14 rounded-lg" />
      <p className="mt-6 text-xs uppercase tracking-[0.25em] text-muted-foreground">
        {DEFAULT_BRANDING.legalCompanyName}
      </p>
      <h1 className="mt-2 font-display text-4xl leading-none">{DEFAULT_BRANDING.riderFacingBrand}</h1>
      <p className="mt-3 max-w-sm text-muted-foreground">{t("loginLead")}</p>
      <p className="mt-2 text-xs text-muted-foreground">{t("simulatedBanner")}</p>

      <div className="mt-8 space-y-3">
        {authEnabled ? (
          GROK_PROVIDERS.map((p) => (
            <Button
              key={p.providerId}
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => signIn(p.providerId, { callbackURL: "/" })}
            >
              {p.idp === "twitter" ? t("continueX") : t("continueGoogle")}
            </Button>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Sign-in is disabled.</p>
        )}
      </div>

      <p className="my-6 text-center text-xs uppercase tracking-widest text-muted-foreground">{t("or")}</p>

      <form onSubmit={onEmail} className="space-y-3">
        {mode === "up" ? (
          <div>
            <Label>{t("name")}</Label>
            <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </div>
        ) : null}
        <div>
          <Label>{t("email")}</Label>
          <Input
            className="mt-1"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div>
          <Label>{t("password")}</Label>
          <Input
            className="mt-1"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "up" ? "new-password" : "current-password"}
          />
          <p className="mt-1 text-xs text-muted-foreground">{t("passwordHint")}</p>
        </div>
        {error ? <p className="text-sm text-offline">{error}</p> : null}
        <Button size="lg" className="w-full" disabled={pending} type="submit">
          {mode === "up" ? t("signUp") : t("signIn")}
        </Button>
      </form>
      <button
        type="button"
        className="mt-4 text-sm underline"
        onClick={() => setMode(mode === "up" ? "in" : "up")}
      >
        {mode === "up" ? t("haveAccount") : t("needAccount")}
      </button>
      <p className="mt-10 text-xs text-muted-foreground">{t("legalNote")}</p>
      <Link to="/" className="mt-4 inline-block text-sm underline">
        {DEFAULT_BRANDING.domain}
      </Link>
    </main>
  );
}
