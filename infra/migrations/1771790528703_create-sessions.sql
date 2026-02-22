-- Up Migration
CREATE TABLE "sessions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "token" VARCHAR(96) NOT NULL UNIQUE,
  "user_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  "expires_at" TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Down Migration
DROP TABLE "sessions";
