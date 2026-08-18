"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { UnlinkedEventFormFields } from "@/components/form/event/unlinked/unlinked";
import {
	AlertDialogAction,
	AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/toast";
import type { TermResponse } from "@/data/terms";
import { useAppForm } from "@/hooks/use-form";
import type { Event, UnlinkedEventVariantMeeting } from "@/schemas/events";
import {
	type MeetingAddType,
	type UnlinkedEventAddType,
	unlinkedEventAddSchema,
} from "@/schemas/unlinked-event";
import useUserStore from "@/stores/user-store";
import type { CourseResponse } from "@/types/courses";

type EditUnlinkedEventProps = {
	eventId: string;
	terms: TermResponse;
	courses: CourseResponse;

	cancelOnClick?: () => void;
	actionSecondaryOnClick?: () => void;
};

export default function EditUnlinkedEvent({
	eventId,
	terms,
	courses,

	cancelOnClick,
	actionSecondaryOnClick,
}: EditUnlinkedEventProps) {
	const termCode = useUserStore((state) => state.activeTerm);
	const tabId = useUserStore((state) => state.activeTab);
	const eventData = useUserStore((state) => state.getEvent(tabId, eventId));
	const updateEvent = useUserStore((state) => state.updateEvent);

	const [initialDate] = useState(() => new Date());

	const form = useAppForm({
		defaultValues:
			eventData && eventData.kind === "unlinked-course"
				? {
						termCode: termCode,
						courseTitle: eventData.courseTitle,
						courseCode: eventData.courseCode,
						color: eventData.color,
						credits: eventData.credits.toString(),
						endDate: eventData.endDate,
						section: {
							sectionCode: eventData.sectionCode,
							deliveryMethod: eventData.deliveryMethod,
							startDate: new Date(eventData.startDate),
							endDate: new Date(eventData.endDate),
							meetings: flattenMeetingsForForm(eventData.meetings),
						},
					}
				: ({
						termCode: termCode,
						courseTitle: "",
						courseCode: "",
						color: "#4285F4",
						startDate: initialDate,
						endDate: initialDate,
						credits: "",
						section: {
							sectionCode: "",
							startDate: initialDate,
							endDate: initialDate,
							deliveryMethod: "On Campus",
							meetings: [] as Array<MeetingAddType>,
						},
					} as UnlinkedEventAddType),
		validators: {
			onSubmit: unlinkedEventAddSchema,
		},
		onSubmitInvalid: () => {
			console.error("Form Error: ", form.getAllErrors());
		},
		onSubmit: (values) => {
			const formData = values.value;

			if (typeof terms === "number") return;

			const event: Event = {
				eventId: uuidv4(),
				color: formData.color,

				kind: "unlinked-course",
				startDate: formData.section.startDate,
				endDate: formData.section.endDate,

				courseTitle: formData.courseTitle,
				courseCode: formData.courseCode,
				sectionCode: formData.section.sectionCode,
				credits: parseFloat(formData.credits),
				deliveryMethod: formData.section.deliveryMethod,

				meetings: [],
			};

			const formattedMeetings: Array<UnlinkedEventVariantMeeting> = [];
			for (const meeting of formData.section.meetings) {
				for (const day of meeting.days) {
					formattedMeetings.push({
						day: day as UnlinkedEventVariantMeeting["day"],
						startTime: new Date(`2026-08-13T${meeting.startTime}`),
						endTime: new Date(`2026-08-13T${meeting.endTime}`),
						campus: meeting.campus,
						building: meeting.building,
						room: meeting.room,
						instructors: meeting.instructors,
					});
				}
			}
			event.meetings = formattedMeetings;

			updateEvent(tabId, event);
			toast.add({
				type: "success",
				description: "Event successfully updated",
			});
			form.reset();
			actionSecondaryOnClick ? actionSecondaryOnClick() : () => {};
		},
	});

	if (!eventData || typeof courses === "number" || typeof terms === "number")
		return null;

	return (
		<ScrollArea className="h-[60vh]">
			<form
				id="unlinked-edit-form"
				className="max-w-[calc(100%-1rem)]"
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<UnlinkedEventFormFields form={form} terms={terms} />

				<Separator className="my-2" />

				<div className="flex flex-row items-center justify-end gap-2">
					<AlertDialogCancel
						type="reset"
						onClick={() => {
							form.reset();

							cancelOnClick ? cancelOnClick() : () => {};
						}}
					>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction type="submit">Save Changes</AlertDialogAction>
				</div>
			</form>
		</ScrollArea>
	);
}

function flattenMeetingsForForm(meetings: Array<UnlinkedEventVariantMeeting>) {
	const newMeetings = new Map<string, MeetingAddType>();

	for (const meeting of meetings) {
		const startTime = new Date(meeting.startTime);
		const endTime = new Date(meeting.endTime);

		const key = `${startTime.getHours()}:${startTime.getMinutes()}-${endTime.getHours()}:${endTime.getMinutes()}`;

		if (newMeetings.has(key)) {
			// biome-ignore lint/style/noNonNullAssertion: Just checked its valid
			const existingMeeting = newMeetings.get(key)!;
			existingMeeting.days.push(meeting.day);
			newMeetings.set(key, existingMeeting);
		} else {
			newMeetings.set(key, {
				days: [meeting.day],
				startTime: `${startTime.getHours()}:${startTime.getMinutes().toString().padStart(2, "0")}`,
				endTime: `${endTime.getHours()}:${endTime.getMinutes().toString().padStart(2, "0")}`,
				campus: meeting.campus,
				building: meeting.building,
				room: meeting.room || "",
				instructors: meeting.instructors.map((instructor) => ({
					id: uuidv4(),
					firstName: instructor.firstName,
					lastName: instructor.lastName,
				})),
			});
		}
	}

	return newMeetings.values().toArray();
}
