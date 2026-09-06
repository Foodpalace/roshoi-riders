# Window 3 integration contracts

This rider subsystem speaks versioned `/v1/rider/*` contracts. Live adapters are **not** connected. All operational data is labelled **SIMULATED** until Window 5 provides the shared core.

Authentication: Better Auth session. Every mutating call requires `Idempotency-Key` (or `idempotencyKey` in the server-function body). Authorization is always the verified `userId` — never a client-supplied rider id.

## WINDOW 5 — Shared Core (required for live operation)

| Need | Contract | Notes |
|---|---|---|
| Auth | existing Better Auth user id | Map to `riders.user_id` |
| Profile / KYC | `GET/PATCH /v1/rider/profile` | Statuses: DRAFT, SUBMITTED, UNDER_REVIEW, VERIFIED, REJECTED, SUSPENDED |
| Availability | `POST /v1/rider/status` `{ status, confirmed }` | ONLINE / OFFLINE / BUSY. Confirm required. |
| Dispatch offers | `GET /v1/rider/offers` | Rider never self-assigns. Exclusive accept via `UPDATE … WHERE status='OPEN'` |
| Offer respond | `POST /v1/rider/offers/:id/respond` `{ decision, reason?, idempotencyKey }` | Expired → 409 OFFER_EXPIRED |
| Deliveries | `GET /v1/rider/deliveries` | One active delivery in pilot (`multi_order` flag off) |
| Arrive | `POST /v1/rider/deliveries/:id/arrive` | Restaurant or customer; state machine enforced |
| Pickup | `POST /v1/rider/deliveries/:id/pickup` | Idempotent. Verification method is configurable |
| Location | `POST /v1/rider/deliveries/:id/location` `{ lat, lng, accuracyM }` | Only while ONLINE or active delivery. Auth required. |
| Deliver | `POST /v1/rider/deliveries/:id/deliver` `{ otp, idempotencyKey }` | OTP verified **server-side only** |
| POD | `POST /v1/rider/deliveries/:id/pod` | jpeg/png/webp, size cap, not public |
| Earnings | `GET /v1/rider/earnings` | Integer **paise**. Append-only ledger |
| Settlements | `GET /v1/rider/settlements` | PAYABLE/PROCESSING/PAID/FAILED/ON_HOLD/DISPUTED. Paid only after backend confirm |
| Support | `POST /v1/rider/support` | Ticket ids, OPEN→CLOSED |
| Safety | `POST /v1/rider/safety` | Does **not** auto-dispatch emergency services |
| Notifications | adapters: in-app, push, sms, whatsapp | Only in-app is implemented here |
| Config | branding, flags, offer timeout, OTP policy | Editable later without rebuilding logic |
| Risk | `fraud_signals` SIGNAL→REVIEW→ACTION | No auto-ban |

Money: integer paise. Do not invent earnings.

Offer timeout default 45s, configurable 30/45/60/90.

Delivery states: OFFERED → ACCEPTED → ARRIVING_AT_RESTAURANT → ARRIVED_AT_RESTAURANT → PICKED_UP → ON_THE_WAY → ARRIVED_AT_CUSTOMER → DELIVERED. Exceptions documented in `src/lib/rider/machine.ts`.

Example offer payload:

```json
{
  "id": "uuid",
  "orderCode": "RSH-2041",
  "restaurant": { "name": "The Spice House", "area": "Station Road", "address": "…" },
  "customer": { "area": "Longai Road" },
  "approxDistanceKm": 2.1,
  "expectedPayoutPaise": 4500,
  "cod": true,
  "codAmountPaise": 18500,
  "expiresAt": "2026-09-01T12:00:45.000Z",
  "dataMode": "SIMULATED"
}
```

Customer PII is minimized until pickup (`src/lib/rider/privacy.ts`).

## WINDOW 1 — Customer app

Consume events (do not call rider APIs):

- `RIDER_ASSIGNED` — no rider personal details beyond first name / vehicle type if policy allows
- `PICKED_UP`
- `ON_THE_WAY`
- `ARRIVING`
- `DELIVERED`

Customer supplies delivery OTP. Window 1 must not leak payment credentials into rider payloads.

## WINDOW 2 — Restaurant app

Events:

- `READY` / delayed ready time
- `RIDER_ASSIGNED`
- `RIDER_ARRIVING`
- `RIDER_ARRIVED`
- `PICKED_UP`

Restaurant may confirm pickup if the shared core chooses `RESTAURANT_CONFIRM` verification.

## WINDOW 4 — Admin / CEO

Read models this app already writes, scoped for ops:

- rider status, KYC, vehicle
- active deliveries, offers, exceptions
- earnings + cash reconciliation
- support tickets, safety incidents
- performance counts (not a public leaderboard)
- fraud_signals for review

KYC VERIFIED/REJECTED/SUSPENDED is an admin action — Window 3 never self-approves.

## Idempotency

Critical POSTs (accept, pickup, cash, deliver, tickets) key on `(user_id, idempotency_key)`. Replays return the first result. No double pickup, delivery, cash, or payout.

## Data mode

Until Window 5 is live, `platform_config.dataMode = SIMULATED`. UI always shows a SIMULATED banner. Do not claim real GPS, payouts, SMS, or customers.
