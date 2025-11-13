import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './src/db/migrations',
  schema: './src/db/tables.ts',
  dialect: 'postgresql',
  extensionsFilters: ["postgis"],
  migrations: { table: "migrations" },
  dbCredentials: {
    url: process.env.CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE,
  },
});
