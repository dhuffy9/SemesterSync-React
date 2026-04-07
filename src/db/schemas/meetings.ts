import { int, mysqlTable, time, varchar } from "drizzle-orm/mysql-core";
import { buildingTable } from "./buildings";
import {
	primaryInstructorsTable,
	secondaryInstructorsTable,
} from "./instructors";
import { roomTable } from "./rooms";
import { sectionTable } from "./sections";

export const meetingTable = mysqlTable("meetings", {
	meeting_id: int().autoincrement().primaryKey(),
	section_id: int()
		.notNull()
		.references(() => sectionTable.section_id),
	building_id: int()
		.notNull()
		.references(() => buildingTable.building_id),
	room_id: int()
		.notNull()
		.references(() => roomTable.room_id),
	primary_instructor_id: int()
		.notNull()
		.references(() => primaryInstructorsTable.instructor_id),
	secondary_instructor_id: int()
		.notNull()
		.references(() => secondaryInstructorsTable.instructor_id),
	day: varchar({ length: 30 }).notNull(),
	start_time: time().notNull(),
	end_time: time().notNull(),
	location: varchar({ length: 255 }).notNull(),
});

export type MeetingTableResult = typeof meetingTable.$inferSelect;
