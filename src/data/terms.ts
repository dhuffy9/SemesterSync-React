import "server-only";

import { db } from "@/db/connection";
import { type TermTableResult, termTable } from "@/db/schemas/terms";

type TermList = Array<TermTableResult>;

type TermError = number;

export type TermResponse = TermList | TermError;

export async function getTerms(): Promise<TermResponse> {
	try {
		const data = await db.select().from(termTable);

		return data;
	} catch (error) {
		console.error(error);

		return -1;
	}
}
