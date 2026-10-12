import {
  pgTable,
  serial,
  text,
  interval,
  timestamp,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";

export const worklog = pgTable("worklog", {
  id: serial("id").primaryKey(),
  user: text("user"),
  name: text("name").notNull(),
  notes: text("notes"),
  time: timestamp("time", { withTimezone: true }).notNull(),
  duration: interval("duration"),
});

export const label = pgTable("label", {
  id: serial("id").primaryKey(),
  user: text("user"),
  name: text("name").notNull(),
});

export const worklogLabel = pgTable(
  "worklog_label",
  {
    worklogId: integer("worklog_id")
      .notNull()
      .references(() => worklog.id, { onDelete: "cascade" }),
    labelId: integer("label_id")
      .notNull()
      .references(() => label.id),
  },
  (table) => [primaryKey({ columns: [table.worklogId, table.labelId] })],
);
