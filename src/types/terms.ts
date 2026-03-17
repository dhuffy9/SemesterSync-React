export interface Term {
	termCode: string;
	termSlug: string;
	displayName: string;
	termName: string;
	startDate: string | null;
	endDate: string | null;
	latestFile: string;
	updatedAt: string;
}

export interface TermAPIResponse {
	ok: boolean;
	terms: Array<Term>;
}
