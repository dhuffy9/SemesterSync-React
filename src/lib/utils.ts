import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { daysOfWeekSchema } from "@/schemas/util";
import type { MergedMeeting } from "@/types/meetings";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function singleLetterDay(day: string) {
	if (day === "Thursday") return "R";
	if (day === "Sunday") return "U";
	return day.slice(0, 1).toUpperCase();
}

export function mergeMeetings(meetings: Array<object>) {
	const newMeetings = [] as Array<MergedMeeting>;

	console.log(meetings);

	for (const meeting of meetings) {
		if (
			"day" in meeting &&
			typeof meeting.day === "string" &&
			"startTime" in meeting &&
			typeof meeting.startTime === "string" &&
			"endTime" in meeting &&
			typeof meeting.endTime === "string"
		) {
			const dayRes = daysOfWeekSchema.safeParse(meeting.day);
			if (dayRes.success === false) continue;
			const day = dayRes.data;

			const startTime = new Date(meeting.startTime);
			const endTime = new Date(meeting.endTime);

			if (newMeetings.length === 0) {
				newMeetings.push({
					days: [day],
					startTime,
					endTime,
				});
			} else {
				let found = false;

				for (const meetingItem of newMeetings) {
					if (
						meetingItem.startTime.getTime() === startTime.getTime() &&
						meetingItem.endTime.getTime() === endTime.getTime()
					) {
						meetingItem.days.push(day);

						found = true;
						break;
					}
				}

				if (!found) {
					newMeetings.push({
						days: [day],
						startTime,
						endTime,
					});
				}
			}
		}
	}

	return newMeetings;
}
