import { formOptions } from "@tanstack/react-form";
import type {
	PersonalEventAddType,
	PersonalEventMeetingAddType,
} from "@/schemas/personal-event";

export const personalEventFormOpts = formOptions({
	defaultValues: {
		termCode: "",
		title: "",
		description: "",
		color: "#4285F4",
		startDate: new Date(),
		endDate: new Date(),
		meetings: [] as Array<PersonalEventMeetingAddType>,
	} as PersonalEventAddType,
});
