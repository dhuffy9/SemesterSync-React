import { formOptions } from "@tanstack/react-form";
import type {
	MeetingAddType,
	UnlinkedEventAddType,
} from "@/schemas/unlinked-event";

export const unlinkedEventFormOpts = formOptions({
	defaultValues: {
		termCode: "",
		courseTitle: "",
		courseCode: "",
		color: "#4285F4",
		credits: "",
		section: {
			sectionCode: "",
			startDate: new Date(),
			endDate: new Date(),
			deliveryMethod: "On Campus",
			meetings: [] as Array<MeetingAddType>,
		},
	} as UnlinkedEventAddType,
});
