import { queryOptions } from "@tanstack/react-query";
import axios from "axios";
import { QUERY_KEYS } from "../../utils/query-keys";

export const termQueryOptions = queryOptions({
	queryKey: QUERY_KEYS.TERMS,
	queryFn: async () => await axios.get("/api/terms"),
});
