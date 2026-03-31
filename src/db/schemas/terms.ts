import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const termTable = mysqlTable("terms", {
	term_id: int().autoincrement().primaryKey(),
	term_code: varchar({ length: 20 }).notNull(),
	term_name: varchar({ length: 100 }).notNull(),
});
