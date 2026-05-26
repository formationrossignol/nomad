create table user_vehicles (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null default auth.uid(),
  marque                 text not null,
  libelle_modele         text not null,
  description_commerciale text,
  energie                text,
  conso_mixte            numeric,
  co2_mixte              numeric,
  conso_elec             numeric,
  puissance_maximale     integer,
  created_at             timestamptz default now(),
  unique (user_id)
);

alter table user_vehicles enable row level security;

create policy "Users manage own vehicles"
  on user_vehicles
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
