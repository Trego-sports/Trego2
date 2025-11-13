import { env } from "cloudflare:workers";
import { createMiddleware, createServerOnlyFn } from "@tanstack/react-start";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as relations from "@/db/relations";
import * as tables from "@/db/tables";

const makeDb = createServerOnlyFn(() => {
  const connectionString = env.CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE
    ? env.CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE
    : env.HYPERDRIVE.connectionString;
  const pool = new Pool({ connectionString, max: 5 });
  return drizzle(pool, { schema: { ...tables, ...relations } });
});
export type DBContext = ReturnType<typeof makeDb>;

export const dbMiddleware = createMiddleware().server(async ({ next }) => {
  return next({ context: { db: makeDb() } });
});
