create table journeys (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  year          integer,
  destination   text,
  hero_image_url text,
  notes         text,
  created_at    timestamptz default now()
);

create table memories (
  id            uuid primary key default gen_random_uuid(),
  journey_id    uuid not null references journeys(id) on delete cascade,
  title         text,
  body          text,
  location_name text,
  lat           numeric,
  lng           numeric,
  created_at    timestamptz default now()
);

create table memory_photos (
  id           uuid primary key default gen_random_uuid(),
  memory_id    uuid not null references memories(id) on delete cascade,
  storage_url  text not null,
  caption      text,
  sort_order   integer default 0
);

-- phase 2: add user_id column + change unique to (user_id, village_slug)
create table visited_villages (
  id            uuid primary key default gen_random_uuid(),
  village_slug  text not null unique,
  visited_at    date,
  personal_note text
);

create table itineraries (
  id            uuid primary key default gen_random_uuid(),
  title         text,
  days          integer,
  pace          text check (pace in ('slow', 'moderate', 'intensive')),
  style         text[],
  village_slugs text[],
  created_at    timestamptz default now()
);

-- Storage buckets (run in Supabase Dashboard → Storage)
-- Create bucket "journey-heroes" with public access
-- Create bucket "memory-photos" with public access
