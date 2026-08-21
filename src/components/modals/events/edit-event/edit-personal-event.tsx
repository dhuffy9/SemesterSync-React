"use client";

import { useState } from "react";
import { PersonalEventFormFields } from "@/components/form/event/personal/personal";
import {
	AlertDialogAction,
	AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/toast";
import type { TermResponse } from "@/data/terms";
import { useAppForm } from "@/hooks/use-form";
import type { Event, PersonalEventVariantMeeting } from "@/schemas/events";
import {
	type PersonalEventAddType,
	type PersonalEventMeeting,
	type PersonalEventMeetingAddType,
	personalEventAddSchema,
} from "@/schemas/personal-event";
import useUserStore from "@/stores/user-store";
import type { CourseResponse } from "@/types/courses";

type EditPersonalEventProps = {
	eventId: string;
	terms: TermResponse;
	courses: CourseResponse;

	cancelOnClick?: () => void;
	actionSecondaryOnClick?: () => void;
};

export default function EditPersonalEvent({
	eventId,
	terms,
	courses,

	cancelOnClick,
	actionSecondaryOnClick,
}: EditPersonalEventProps) {
	const termCode = useUserStore((state) => state.activeTerm);
	const tabId = useUserStore((state) => state.activeTab);
	const eventData = useUserStore((state) => state.getEvent(tabId, eventId));
	const updateEvent = useUserStore((state) => state.updateEvent);

	const [initialDate] = useState(() => new Date());

	const form = useAppForm({
		defaultValues:
			eventData && eventData.kind === "personal"
				? {
						termCode: termCode,
						title: eventData.title,
						description: eventData.description,
						color: eventData.color,
						startDate: new Date(eventData.startDate),
						endDate: new Date(eventData.endDate),
						meetings: flattenMeetingsForForm(
							eventData.meetings as unknown as Array<PersonalEventMeeting>,
						),
					}
				: ({
						termCode: termCode,
						title: "",
						description: "",
						color: "#4285F4",
						startDate: initialDate,
						endDate: initialDate,
						meetings: [] as Array<PersonalEventMeetingAddType>,
					} as PersonalEventAddType),
		validators: {
			onSubmit: personalEventAddSchema,
		},
		onSubmitInvalid: () => {
			console.error("Form Error: ", form.getAllErrors());
		},
		onSubmit: (values) => {
			const formData = values.value;

			if (typeof terms === "number") return;

			const event: Event = {
				eventId: eventData?.eventId || "",
				color: formData.color,

				kind: "personal",
				startDate: formData.startDate,
				endDate: formData.endDate,

				title: formData.title,
				description: formData.description,

				meetings: [],
			};

			const formattedMeetings: Array<PersonalEventVariantMeeting> = [];
			for (const meeting of formData.meetings) {
				for (const day of meeting.days) {
					formattedMeetings.push({
						day: day as PersonalEventVariantMeeting["day"],
						startTime: new Date(`2026-08-13T${meeting.startTime}`),
						endTime: new Date(`2026-08-13T${meeting.endTime}`),
						location: meeting.location,
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
				id="personal-edit-form"
				className="max-w-[calc(100%-1rem)]"
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<PersonalEventFormFields form={form} terms={terms} />

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

function flattenMeetingsForForm(meetings: Array<PersonalEventMeeting>) {
	const newMeetings = new Map<string, PersonalEventMeetingAddType>();

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
				location: meeting.location,
			});
		}
	}

	return newMeetings.values().toArray();
}
