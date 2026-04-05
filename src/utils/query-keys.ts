export const QUERY_KEYS = {
	COURSES: ["courses"],
	COURSES_TERM: (term: string) => [...QUERY_KEYS.COURSES, term],
} as const;
