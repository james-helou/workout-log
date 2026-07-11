-- Applied by hand, once per Neon database. Idempotent.

DO $$ BEGIN
  CREATE TYPE muscle_group AS ENUM (
    'shoulder', 'chest', 'back', 'bicep', 'tricep', 'core', 'legs'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS exercises (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  muscle_group muscle_group NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (name, muscle_group)
);

CREATE TABLE IF NOT EXISTS entries (
  id          SERIAL PRIMARY KEY,
  exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  weight      NUMERIC(6,2) NOT NULL CHECK (weight > 0),
  reps        INTEGER NOT NULL CHECK (reps > 0),
  logged_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS entries_exercise_logged
  ON entries (exercise_id, logged_at DESC);
