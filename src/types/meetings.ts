import type { DaysOfWeek } from "@/schemas/util";

export type MergedMeeting = {
	days: Array<DaysOfWeek>;
	startTime: Date;
	endTime: Date;
};
