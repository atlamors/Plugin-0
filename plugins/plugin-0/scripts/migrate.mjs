import { Pool } from "pg"

const url = process.env.DATABASE_URL
if (!url) {
  console.log("DATABASE_URL not set; skipping migrations")
  process.exit(0)
}

const pool = new Pool({ connectionString: url })

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS plugin0_settings (
      id text PRIMARY KEY,
      data jsonb NOT NULL DEFAULT '{}'::jsonb,
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS plugin0_license (
      id text PRIMARY KEY,
      license_key text,
      status jsonb
    );
  `)
}

run().then(() => pool.end())



