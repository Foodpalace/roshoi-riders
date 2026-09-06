import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/settlements")({
  component: () => <Navigate to="/earnings" />,
});
