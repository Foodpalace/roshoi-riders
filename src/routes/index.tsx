import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/rider/app-shell";
import { HomeView } from "@/components/rider/home-view";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    if (!context.sessionUser) throw redirect({ to: "/login" });
  },
  component: Home,
});

function Home() {
  return (
    <AppShell>
      <HomeView />
    </AppShell>
  );
}
