-- Reference baseline of the production schema, hand-written from backend/src/models and the
-- Alembic migrations in backend/alembic/versions. Used by tests and CI only.
-- Check against `pg_dump --schema-only` from Supabase before relying on it.

CREATE TYPE program AS ENUM (
  'Software', 'Electrical', 'Computer', 'Mechanical', 'Mechatronics',
  'Civil', 'Chemical', 'Materials', 'Engineering Physics'
);

CREATE TABLE users (
  id serial PRIMARY KEY,
  email varchar(255) NOT NULL,
  supabase_user_id varchar(255) NOT NULL,
  name varchar(255) NOT NULL,
  program program NOT NULL,
  graduation_year integer NOT NULL,
  is_verified boolean NOT NULL,
  created_at timestamp NOT NULL,
  updated_at timestamp NOT NULL
);
CREATE UNIQUE INDEX ix_users_email ON users (email);
CREATE INDEX ix_users_id ON users (id);
CREATE UNIQUE INDEX ix_users_supabase_user_id ON users (supabase_user_id);

CREATE TABLE companies (
  id serial PRIMARY KEY,
  name varchar(255) NOT NULL,
  industries varchar(100)[] NOT NULL,
  rating double precision NOT NULL,
  created_at timestamp NOT NULL,
  updated_at timestamp NOT NULL
);
CREATE INDEX ix_companies_id ON companies (id);

CREATE TABLE experiences (
  id serial PRIMARY KEY,
  user_id integer REFERENCES users (id),
  company_id integer REFERENCES companies (id),
  new_company_name varchar(255),
  submitter_email varchar(255) NOT NULL,
  position varchar(255) NOT NULL,
  term varchar(50) NOT NULL,
  offer_received boolean NOT NULL,
  difficulty integer NOT NULL,
  stages json NOT NULL,
  tips text,
  interview_acquisition varchar(255),
  status varchar(20) NOT NULL DEFAULT 'pending',
  created_at timestamp NOT NULL,
  updated_at timestamp NOT NULL
);
CREATE INDEX ix_experiences_id ON experiences (id);

CREATE TABLE company_requests (
  id serial PRIMARY KEY,
  name varchar(255) NOT NULL,
  requester_email varchar(255),
  status varchar(20) NOT NULL DEFAULT 'pending',
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX ix_company_requests_id ON company_requests (id);

CREATE TABLE design_teams (
  id serial PRIMARY KEY,
  name varchar(255) NOT NULL,
  description text,
  categories varchar(100)[] NOT NULL,
  website_url varchar(500),
  created_at timestamp NOT NULL,
  updated_at timestamp NOT NULL
);
CREATE INDEX ix_design_teams_id ON design_teams (id);

CREATE TABLE design_team_reviews (
  id serial PRIMARY KEY,
  design_team_id integer NOT NULL REFERENCES design_teams (id),
  submitter_email varchar(255) NOT NULL,
  position varchar(255) NOT NULL,
  term varchar(50) NOT NULL,
  accepted boolean NOT NULL,
  difficulty integer NOT NULL,
  description text,
  tips text,
  interview_acquisition varchar(500),
  status varchar(20) NOT NULL,
  created_at timestamp NOT NULL,
  updated_at timestamp NOT NULL
);
CREATE INDEX ix_design_team_reviews_id ON design_team_reviews (id);

CREATE TABLE design_team_requests (
  id serial PRIMARY KEY,
  name varchar(255) NOT NULL,
  requester_email varchar(255),
  status varchar(20) NOT NULL,
  created_at timestamp NOT NULL
);
CREATE INDEX ix_design_team_requests_id ON design_team_requests (id);
