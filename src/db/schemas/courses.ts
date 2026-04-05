import { decimal, int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const courseTable = mysqlTable("courses", {
	course_id: int().autoincrement().primaryKey().notNull(),
	course_code: varchar({ length: 30 }).notNull(),
	course_title: varchar({ length: 255 }).notNull(),
	credits: decimal({ precision: 5, scale: 2 }).notNull(),
});

export type CourseTableResult = typeof courseTable.$inferSelect;
