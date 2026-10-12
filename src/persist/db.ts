import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePGlite } from "drizzle-orm/pglite";
import { neon } from "@neondatabase/serverless";
import { relations } from "@/../drizzle/relations";

export type LoadDB = (env?: { DATABASE_URL: string }) => Promise<DB>;

export const remoteDB: LoadDB = async (env?: { DATABASE_URL: string }) => {
  const client = neon(env!.DATABASE_URL);
  return drizzleNeon({ client, relations });
};

export type DB =
  | ReturnType<typeof drizzleNeon<typeof relations>>
  | ReturnType<typeof drizzlePGlite<typeof relations>>;
