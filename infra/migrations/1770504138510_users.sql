-- Up Migration
CREATE TABLE "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "username" VARCHAR(30) NOT NULL UNIQUE,
  "email" VARCHAR(254) NOT NULL UNIQUE,
  "password" VARCHAR(60) NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Down Migration
DROP TABLE "users";
