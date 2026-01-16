import { createPool } from "@vercel/postgres";

export function getConnectionString(): string | null {
  return (
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL ||
    process.env.NEON_DATABASE_URL ||
    null
  );
}

let pool: ReturnType<typeof createPool> | null = null;

export function getDb() {
  const connectionString = getConnectionString();
  if (!connectionString) return null;

  if (!pool) pool = createPool({ connectionString });
  return pool;
}
