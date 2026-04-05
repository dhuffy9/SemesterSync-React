import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const instructorsTable = mysqlTable("instructors", {
	instructor_id: int().autoincrement().primaryKey(),
	instructor_name: varchar({ length: 255 }).notNull(),
});

export type InstructorTableResult = typeof instructorsTable.$inferSelect;
