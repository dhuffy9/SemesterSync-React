import { queryOptions } from "@tanstack/react-query";
import axios from "axios";
import type { CourseAPIResponse } from "@/types/courses";
import { QUERY_KEYS } from "@/utils/query-keys";

export const classQuery = queryOptions({
	queryKey: QUERY_KEYS.COURSES,
	queryFn: async () => await axios.get<CourseAPIResponse>("/api/v2/classes"),
});

export const classByTermQuery = (term: string) =>
	queryOptions({
		queryKey: QUERY_KEYS.COURSES_TERM(term),
		queryFn: async () =>
			await axios.get<CourseAPIResponse>(`/api/v2/classes?term=${term}`),
	});
