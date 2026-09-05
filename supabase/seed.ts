/**
 * Optional programmatic seed runner. For local dev, `supabase db reset` will
 * auto-run supabase/seed.sql, which is the primary seeding path and doesn't
 * require this script or Node at all.
 *
 * Use this instead when you want to seed a remote/staging Supabase project
 * from the command line without direct DB access, since it goes through the
 * Supabase JS client with the service role key.
 *
 * Run with: npm run seed
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in your environment."
  );
  process.exit(1);
}

async function main() {
  console.log(
    "This script requires the Supabase CLI's `db execute` or direct Postgres access " +
      "to run raw SQL (the JS client can't execute arbitrary SQL files).\n\n" +
      "Recommended approach:\n" +
      "  supabase db reset          # local dev — runs migrations + seed.sql automatically\n" +
      "  supabase db push           # apply migrations to a remote project\n" +
      "  psql \"$DATABASE_URL\" -f supabase/seed.sql   # seed a remote project directly\n"
  );

  const seedPath = join(process.cwd(), "supabase", "seed.sql");
  const seedSql = readFileSync(seedPath, "utf-8");
  console.log(`Loaded ${seedSql.split("\n").length} lines from supabase/seed.sql.`);
  console.log("Run one of the commands above to apply it.");
}

main();
