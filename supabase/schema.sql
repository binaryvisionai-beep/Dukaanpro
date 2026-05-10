create extension if not exists "pgcrypto";

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text not null unique,
  category text not null,
  unit text not null check (unit in ('kg', 'pcs', 'ltr', 'box')),
  cost_price numeric(12,2) not null default 0,
  selling_price numeric(12,2) not null default 0,
  stock integer not null default 0,
  low_stock_threshold integer not null default 5,
  barcode text,
  image_uri text,
  created_at timestamptz not null default now()
);

create table if not exists bills (
  id uuid primary key default gen_random_uuid(),
  bill_number text not null unique,
  customer_name text,
  subtotal numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  gst numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  payment_mode text not null check (payment_mode in ('cash', 'upi', 'card')),
  status text not null check (status in ('paid', 'pending')),
  created_at timestamptz not null default now()
);

create table if not exists bill_items (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid not null references bills(id) on delete cascade,
  product_id uuid not null references products(id),
  name text not null,
  qty integer not null default 1,
  unit_price numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0
);

create table if not exists stock_transactions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  type text not null check (type in ('purchase', 'sale', 'adjustment')),
  qty integer not null,
  cost_per_unit numeric(12,2),
  date timestamptz not null default now()
);

create table if not exists feed_items (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('reel', 'post', 'story', 'offer')),
  source text not null,
  source_logo text,
  title text not null,
  description text,
  media_url text,
  thumbnail_url text,
  likes integer not null default 0,
  tags text[] default '{}',
  language text not null default 'en',
  cta_label text,
  cta_url text,
  published_at timestamptz not null default now()
);

alter table products enable row level security;
alter table bills enable row level security;
alter table bill_items enable row level security;
alter table stock_transactions enable row level security;
alter table feed_items enable row level security;
