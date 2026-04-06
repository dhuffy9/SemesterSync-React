import { alias, int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const primaryInstructorsTable = mysqlTable("instructors", {
	instructor_id: int().autoincrement().primaryKey(),
	instructor_name: varchar({ length: 255 }).notNull(),
});

export const secondaryInstructorsTable = alias(
	primaryInstructorsTable,
	"secondary",
);

export type InstructorTableResult = typeof primaryInstructorsTable.$inferSelect;
