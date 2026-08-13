import z from "zod";

export const daysOfWeekSchema = z.enum([
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
]);

export type DaysOfWeek = z.infer<typeof daysOfWeekSchema>;
