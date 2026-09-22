import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { relations } from "@/../drizzle/relations";
import { type LoadDB } from "@/db";
import { PGlite } from "@electric-sql/pglite";

let snapshot: File | Blob | undefined = undefined;
export const inMemoryDB: LoadDB = async () => {
  if (snapshot) {
    const client = new PGlite({ loadDataDir: snapshot });
    return drizzle({ client, relations });
  }

  const client = new PGlite();
  const db = drizzle({ client, relations });

  await migrate(db, {
    migrationsFolder: "./drizzle",
  });
  snapshot = await client.dumpDataDir("none");

  return db;
};
