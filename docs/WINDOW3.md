# Roshoi Window 3 — Rider / Delivery Partner

Mobile-first PWA for delivery partners in Karimganj / Sribhumi. Stack is the workspace TanStack Start + Postgres (Neon / PGLite), not a separate Next.js app.

## What riders can do

Sign in (Google, X, email/password) → onboard + KYC states → go online (with confirm) → receive a timed offer → accept/decline → restaurant arrival & pickup code → navigate via OpenStreetMap → customer OTP + optional photo POD → COD collect-without-edit → earnings & settlements (SIMULATED ledger in paise) → support tickets → safety (manual emergency dial) → assistant that only reads authorized snapshots.

## What is simulated

Dispatch, orders, customers, OTP plaintext helper, payouts, GPS-as-duty-ping storage. Banner is always visible.

## Flags (`DEFAULT_FLAGS`)

rider_ai, live_tracking, cod, delivery_otp, pod_photo, qr_pickup, multi_order (off), incentives, safety_tools, whatsapp/sms/push (off until providers exist), offline_mode, advanced_dispatch (off).

## Tests

`src/lib/rider/engine.test.ts` covers the ten isolation / OTP / idempotency / COD / expiry / cancelled-order / immutable-earnings cases plus an end-to-end simulated run.
