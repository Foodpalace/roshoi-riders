import type { CustomerSlice, DeliveryState } from "./types.ts";

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "••••";
  return `•••• ${digits.slice(-4)}`;
}

export function displayNameFromFull(full: string): string {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Customer";
  if (parts.length === 1) return parts[0]!;
  const last = parts[parts.length - 1]!;
  return `${parts[0]} ${last.charAt(0).toUpperCase()}.`;
}

/** Rider only sees what the current state operationally requires. */
export function minimizeCustomer(
  raw: CustomerSlice,
  state: DeliveryState,
): CustomerSlice {
  const pickedUp =
    state === "PICKED_UP" ||
    state === "ON_THE_WAY" ||
    state === "ARRIVED_AT_CUSTOMER" ||
    state === "CUSTOMER_UNAVAILABLE" ||
    state === "DELIVERED" ||
    state === "SUPPORT_ESCALATION";

  const enRoute =
    state === "ON_THE_WAY" ||
    state === "ARRIVED_AT_CUSTOMER" ||
    state === "CUSTOMER_UNAVAILABLE" ||
    state === "DELIVERED";

  return {
    displayName: raw.displayName,
    area: raw.area,
    address: pickedUp ? raw.address : null,
    contactAllowed: enRoute ? raw.contactAllowed : false,
    contactMasked: enRoute && raw.contactAllowed ? raw.contactMasked : null,
    instructions: pickedUp ? raw.instructions : null,
  };
}

export function offerCustomerView(raw: CustomerSlice): CustomerSlice {
  return {
    displayName: "Customer",
    area: raw.area,
    address: null,
    contactAllowed: false,
    contactMasked: null,
    instructions: null,
  };
}
