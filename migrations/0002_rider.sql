-- Window 3 rider / delivery operations schema.
-- Compatible with a future shared core: snake_case, text user_id, integer paise.
-- Do not treat this as a second product database — Window 5 should absorb these.

create table if not exists platform_config (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists riders (
  id text primary key,
  user_id text not null unique,
  full_name text not null,
  phone text not null default '',
  email text not null default '',
  photo_url text,
  address text not null default '',
  emergency_name text not null default '',
  emergency_phone text not null default '',
  date_of_birth text,
  government_id_type text,
  government_id_last4 text,
  kyc_status text not null default 'DRAFT',
  kyc_reject_reason text,
  rider_type text not null default 'DELIVERY_PARTNER',
  vehicle_type text not null default 'MOTORCYCLE',
  vehicle_registration text,
  licence_number text,
  insurance_ref text,
  payout_upi text,
  payout_bank_last4 text,
  preferred_zones text not null default '[]',
  availability_notes text not null default '',
  status text not null default 'OFFLINE',
  online_since timestamptz,
  locale text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  data_mode text not null default 'SIMULATED'
);
create index if not exists riders_user_id_idx on riders (user_id);
create index if not exists riders_status_idx on riders (status);

create table if not exists rider_documents (
  id text primary key,
  rider_id text not null references riders (id) on delete cascade,
  user_id text not null,
  kind text not null,
  content_type text not null,
  byte_size integer not null,
  data_url text,
  status text not null default 'SUBMITTED',
  created_at timestamptz not null default now()
);
create index if not exists rider_documents_user_idx on rider_documents (user_id);

create table if not exists dispatch_offers (
  id text primary key,
  rider_id text not null,
  user_id text not null,
  order_code text not null,
  payload jsonb not null,
  status text not null default 'OPEN',
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  data_mode text not null default 'SIMULATED'
);
create index if not exists dispatch_offers_rider_idx on dispatch_offers (rider_id, status);

create table if not exists deliveries (
  id text primary key,
  offer_id text not null,
  rider_id text not null,
  user_id text not null,
  order_id text not null,
  order_code text not null,
  state text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  data_mode text not null default 'SIMULATED'
);
create index if not exists deliveries_user_idx on deliveries (user_id, state);
create index if not exists deliveries_rider_idx on deliveries (rider_id);

create table if not exists delivery_events (
  id text primary key,
  delivery_id text not null,
  user_id text not null,
  previous_state text,
  new_state text not null,
  actor text not null,
  actor_id text not null,
  reason text,
  at timestamptz not null default now()
);
create index if not exists delivery_events_delivery_idx on delivery_events (delivery_id);

create table if not exists delivery_otps (
  delivery_id text primary key,
  user_id text not null,
  hash text not null,
  salt text not null,
  attempts integer not null default 0,
  verified_at timestamptz,
  simulated_plain text
);

create table if not exists proof_of_delivery (
  id text primary key,
  delivery_id text not null,
  rider_id text not null,
  user_id text not null,
  method text not null,
  photo_content_type text,
  photo_bytes integer,
  photo_data_url text,
  captured_at timestamptz not null default now(),
  data_mode text not null default 'SIMULATED'
);
create index if not exists pod_user_idx on proof_of_delivery (user_id);

create table if not exists cash_reconciliation (
  delivery_id text primary key,
  rider_id text not null,
  user_id text not null,
  expected_paise integer not null,
  collected_paise integer,
  state text not null default 'EXPECTED',
  exception_reason text,
  updated_at timestamptz not null default now()
);

create table if not exists rider_earnings (
  id text primary key,
  rider_id text not null,
  user_id text not null,
  delivery_id text,
  order_code text,
  kind text not null,
  amount_paise integer not null,
  note text not null default '',
  at timestamptz not null default now(),
  data_mode text not null default 'SIMULATED'
);
create index if not exists rider_earnings_user_idx on rider_earnings (user_id, at);

create table if not exists settlement_lines (
  id text primary key,
  rider_id text not null,
  user_id text not null,
  period_start date not null,
  period_end date not null,
  amount_paise integer not null,
  status text not null default 'PAYABLE',
  confirmed_paid_at timestamptz,
  data_mode text not null default 'SIMULATED'
);
create index if not exists settlement_user_idx on settlement_lines (user_id);

create table if not exists support_tickets (
  id text primary key,
  rider_id text not null,
  user_id text not null,
  delivery_id text,
  topic text not null,
  message text not null,
  status text not null default 'OPEN',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists support_user_idx on support_tickets (user_id);

create table if not exists safety_incidents (
  id text primary key,
  rider_id text not null,
  user_id text not null,
  delivery_id text,
  kind text not null,
  note text not null default '',
  lat double precision,
  lng double precision,
  created_at timestamptz not null default now(),
  emergency_dispatched boolean not null default false
);

create table if not exists notifications (
  id text primary key,
  user_id text not null,
  title text not null,
  body text not null,
  kind text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on notifications (user_id, created_at);

create table if not exists audit_logs (
  id text primary key,
  actor_id text not null,
  action text not null,
  resource text not null,
  resource_id text not null,
  at timestamptz not null default now(),
  meta text not null default ''
);
create index if not exists audit_actor_idx on audit_logs (actor_id, at);

create table if not exists fraud_signals (
  id text primary key,
  rider_id text not null,
  user_id text not null,
  delivery_id text,
  kind text not null,
  detail text not null,
  stage text not null default 'SIGNAL',
  created_at timestamptz not null default now()
);

create table if not exists idempotency_keys (
  user_id text not null,
  key text not null,
  action text not null,
  resource_id text not null,
  response_json text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, key)
);

create table if not exists location_pings (
  id text primary key,
  rider_id text not null,
  user_id text not null,
  delivery_id text,
  lat double precision not null,
  lng double precision not null,
  accuracy_m double precision,
  at timestamptz not null default now()
);
create index if not exists location_user_idx on location_pings (user_id, at);

create table if not exists rate_limit_hits (
  user_id text not null,
  action text not null,
  at timestamptz not null default now()
);
create index if not exists rate_limit_idx on rate_limit_hits (user_id, action, at);
