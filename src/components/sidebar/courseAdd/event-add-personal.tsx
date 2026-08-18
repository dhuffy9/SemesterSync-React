/** biome-ignore-all lint/correctness/noChildrenProp: This is required of the tanstack form */

"use client";
import { Plus } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { forwardRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { PersonalEventFormFields } from "@/components/form/event/personal/personal";
import DangerModal from "@/components/modals/danger";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/toast";
import type { TermResponse } from "@/data/terms";
import { useAppForm } from "@/hooks/use-form";
import { createSwipeRightVariant, TRANSITION } from "@/lib/animation";
import type { Event, PersonalEventVariantMeeting } from "@/schemas/events";
import {
	type PersonalEventAddType,
	type PersonalEventMeetingAddType,
	personalEventAddSchema,
} from "@/schemas/personal-event";
import useUserStore from "@/stores/user-store";

type EventAddPersonalProps = {
	terms: TermResponse;
	setSelectedOption: React.Dispatch<React.SetStateAction<string>>;
	closeParentModal: React.Dispatch<React.SetStateAction<boolean>>;
};

const EventAddPersonal = forwardRef<HTMLDivElement, EventAddPersonalProps>(
	({ terms, setSelectedOption, closeParentModal }, ref) => {
		const [initialDate] = useState(() => new Date());
		const [isBackResetModalOpen, setIsBackResetModalOpen] = useState(false);
		const [isResetModalOpen, setIsResetModalOpen] = useState(false);

		const tab = useUserStore((state) => state.getActiveTab());
		const term = useUserStore((state) => state.activeTerm);
		const eventAdd = useUserStore((state) => state.addEvent);

		const shouldReduceMotion = useReducedMotion();
		const swipeRightVariant = createSwipeRightVariant(shouldReduceMotion);

		const form = useAppForm({
			defaultValues: {
				termCode: term,
				title: "",
				description: "",
				color: "#4285F4",
				startDate: initialDate,
				endDate: initialDate,
				meetings: [] as Array<PersonalEventMeetingAddType>,
			} as PersonalEventAddType,
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
					eventId: uuidv4(),
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

				eventAdd(tab.id, event);
				toast.add({
					type: "success",
					description: "Event added to calendar",
				});
				form.reset();
				setSelectedOption("none");
			},
		});

		if (typeof terms === "number") return null;

		return (
			<motion.div
				animate="animate"
				initial="initial"
				exit="exit"
				key="quick"
				variants={swipeRightVariant}
				transition={TRANSITION}
				ref={ref}
				className="flex flex-col gap-2"
			>
				<div className="flex flex-row items-center gap-2 justify-between">
					<p>Add Personal Event</p>

					<form.Subscribe selector={(state) => state.isDefaultValue}>
						{(isDefaultValue) => (
							<DangerModal
								type="proceedReset"
								isModalOpen={isBackResetModalOpen}
								onOpenChange={setIsBackResetModalOpen}
								triggerDestructive={!isDefaultValue}
								triggerOnClick={() => {
									if (isDefaultValue) {
										form.reset();
										setSelectedOption("none");
									} else {
										closeParentModal(true);
									}
								}}
								cancelOnClick={() => closeParentModal(false)}
								actionOnClick={() => {
									setIsBackResetModalOpen(false);
									closeParentModal(false);
									form.reset();
									setTimeout(() => setSelectedOption("none"), 150);
								}}
							/>
						)}
					</form.Subscribe>
				</div>

				<Separator />

				<ScrollArea className="h-[60vh]">
					<form
						id="course-add-form"
						className="max-w-[calc(100%-1rem)]"
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
					>
						<PersonalEventFormFields form={form} terms={terms} />

						<Separator className="my-2" />

						<div className="flex flex-row justify-end items-center gap-2">
							<DangerModal
								type="reset"
								triggerChildren="Reset"
								triggerVariant="secondary"
								isModalOpen={isResetModalOpen}
								onOpenChange={setIsResetModalOpen}
								triggerOnClick={() => {
									closeParentModal(true);
								}}
								cancelOnClick={() => closeParentModal(false)}
								actionOnClick={() => {
									form.reset();
									setIsResetModalOpen(false);
									closeParentModal(false);
								}}
							/>

							<Button type="submit">
								<Plus /> Add Event
							</Button>
						</div>
					</form>
				</ScrollArea>
			</motion.div>
		);
	},
);

EventAddPersonal.displayName = "EventAddPersonal";
export default EventAddPersonal;
