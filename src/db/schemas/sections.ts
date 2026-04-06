import {
	date,
	int,
	longtext,
	mysqlTable,
	varchar,
} from "drizzle-orm/mysql-core";
import { courseTable } from "./courses";
import {
	primaryInstructorsTable,
	secondaryInstructorsTable,
} from "./instructors";
import { termTable } from "./terms";

export const sectionTable = mysqlTable("sections", {
	section_id: int().autoincrement().primaryKey(),
	term_id: int()
		.notNull()
		.references(() => termTable.term_id),
	course_id: int()
		.notNull()
		.references(() => courseTable.course_id),
	primary_instructor_id: int()
		.notNull()
		.references(() => primaryInstructorsTable.instructor_id),
	secondary_instructor_id: int()
		.notNull()
		.references(() => secondaryInstructorsTable.instructor_id),
	section_code: varchar({ length: 50 }).notNull(),
	start_date: date().notNull(),
	end_date: date().notNull(),
	delivery_method: varchar({ length: 50 }).notNull(),
	class_type: varchar({ length: 100 }),
	course_attribute: varchar({ length: 100 }).notNull(),
	class_comments: longtext(),
	avail_seats: varchar({ length: 100 }).notNull(),
});

export type SectionTableResult = typeof sectionTable.$inferSelect;
