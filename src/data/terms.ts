import "server-only";
import { db } from "@/db/connection";
import { termTable } from "@/db/schemas/terms";

export async function getTerms() {
	const data = await db.select().from(termTable);

	return data;
}
