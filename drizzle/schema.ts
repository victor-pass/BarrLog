import { pgSchema, pgTable, integer, text, timestamp, interval, foreignKey, primaryKey, pgSequence } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const neonAuth = pgSchema("neon_auth");

export const worklogIdSeq = pgSequence("worklog_id_seq", { startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false, })

export const label = pgTable("label", {
	id: integer().generatedAlwaysAsIdentity({ name: "Label_id_seq" }),
	name: text(),
	user: text(),
}, (table) => [
	primaryKey({ columns: [table.id], name: "Label_pkey"}),
]);

export const worklog = pgTable("worklog", {
	id: integer().generatedAlwaysAsIdentity({ name: "WorkLog_id_seq" }),
	name: text().notNull(),
	notes: text(),
	time: timestamp({ withTimezone: true }).notNull(),
	duration: interval(),
	user: text(),
}, (table) => [
	primaryKey({ columns: [table.id], name: "WorkLog_pkey"}),
]);

export const worklogLabel = pgTable("worklog_label", {
	worklogId: integer("worklog_id").notNull().references(() => worklog.id, { onDelete: "cascade" } ),
	labelId: integer("label_id").notNull().references(() => label.id),
}, (table) => [
	primaryKey({ columns: [table.worklogId, table.labelId], name: "worklog_label_pkey"}),
]);
