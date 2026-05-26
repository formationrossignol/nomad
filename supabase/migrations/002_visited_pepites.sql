create table visited_pepites (
  id           uuid primary key default gen_random_uuid(),
  pepite_slug  text not null unique,
  visited_at   date,
  personal_note text
);
