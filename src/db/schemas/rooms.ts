import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { buildingTable } from "./buildings";

export const roomTable = mysqlTable("rooms", {
	room_id: int().autoincrement().primaryKey(),
	building_id: int()
		.notNull()
		.references(() => buildingTable.building_id),
	room: varchar({ length: 100 }).notNull(),
});

export type RoomTableResult = typeof roomTable.$inferSelect;
