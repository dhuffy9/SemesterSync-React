import type { termTable } from "@/db/schemas/terms";

export type TermTableResult = typeof termTable.$inferSelect;
