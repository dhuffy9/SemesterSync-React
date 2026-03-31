import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const buildingTable = mysqlTable("buildings", {
	building_id: int().autoincrement().primaryKey(),
	building_name: varchar({ length: 255 }).notNull(),
	building_abbrev: varchar({ length: 50 }),
});

export type BuildingTableResult = typeof buildingTable.$inferSelect;
