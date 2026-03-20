export const QUERY_KEYS = {
	TERMS: ["terms"],

	COURSES: ["courses"],
	COURSES_TERM: (term: string) => [...QUERY_KEYS.COURSES, term],
} as const;
