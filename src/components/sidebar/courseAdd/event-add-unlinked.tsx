/** biome-ignore-all lint/correctness/noChildrenProp: This is required of the tanstack form */

"use client";
import { ChevronDown, Plus } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { forwardRef, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { UnlinkedEventFormFields } from "@/components/form/event/unlinked/unlinked";
import { unlinkedEventFormOpts } from "@/components/form/event/unlinked/unlinked-opts";
import DangerModal from "@/components/modals/danger";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/toast";
import type { TermResponse } from "@/data/terms";
import { useAppForm } from "@/hooks/use-form";
import { createSwipeRightVariant, TRANSITION } from "@/lib/animation";
import type { Event, UnlinkedEventVariantMeeting } from "@/schemas/events";
import {
	type MeetingAddType,
	unlinkedEventAddSchema,
} from "@/schemas/unlinked-event";
import useUserStore from "@/stores/user-store";
import type {
	AssembledCourseSingleSection,
	CourseResponse,
} from "@/types/courses";
import CourseAddList, { mergeMeetings } from "./course-add-list";

type EventAddUnlinkedProps = {
	terms: TermResponse;
	courses: CourseResponse;
	setSelectedOption: React.Dispatch<React.SetStateAction<string>>;
	closeParentModal: React.Dispatch<React.SetStateAction<boolean>>;
};

const EventAddUnlinked = forwardRef<HTMLDivElement, EventAddUnlinkedProps>(
	({ terms, courses, setSelectedOption, closeParentModal }, ref) => {
		const [selectedCourse, setSelectedCourse] = useState<
			Array<AssembledCourseSingleSection>
		>([]);
		const [initialDate] = useState(() => new Date());
		const [isResetModalOpen, setIsResetModalOpen] = useState(false);
		const [isBackResetModalOpen, setIsBackResetModalOpen] = useState(false);

		const tab = useUserStore((state) => state.getActiveTab());
		const term = useUserStore((state) => state.activeTerm);
		const eventAdd = useUserStore((state) => state.addEvent);

		const shouldReduceMotion = useReducedMotion();
		const swipeRightVariant = createSwipeRightVariant(shouldReduceMotion);

		const form = useAppForm({
			...unlinkedEventFormOpts,
			defaultValues: {
				...unlinkedEventFormOpts.defaultValues,
				termCode: term,
				section: {
					...unlinkedEventFormOpts.defaultValues.section,
					startDate: initialDate,
					endDate: initialDate,
				},
			},
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

				eventAdd(tab.id, event);
				toast.add({
					type: "success",
					description: "Event added to calendar",
				});
				form.reset();
				setSelectedCourse([]);
				setSelectedOption("none");
			},
		});

		useEffect(() => {
			if (selectedCourse.length !== 1) return;

			const course = selectedCourse[0];
			form.setFieldValue("courseCode", course.course_code);
			form.setFieldValue("courseTitle", course.course_title);
			form.setFieldValue("credits", course.credits);
			form.setFieldValue("section.sectionCode", course.section.section_code);
			form.setFieldValue(
				"section.deliveryMethod",
				course.section.delivery_method,
			);
			form.setFieldValue("section.startDate", course.section.start_date);
			form.setFieldValue("section.endDate", course.section.end_date);

			const meetings = mergeMeetings(course.section.meetings);
			const formattedMeetings: Array<MeetingAddType> = [];
			for (const meeting of meetings) {
				formattedMeetings.push({
					days: meeting.days,
					startTime: meeting.start_time.toTimeString().slice(0, 5),
					endTime: meeting.end_time.toTimeString().slice(0, 5),
					campus: meeting.campus,
					building: meeting.building.long,
					room: meeting.room.name || "",
					instructors: meeting.instructors.map((instructor) => ({
						id: uuidv4(),
						firstName: instructor.first_name,
						lastName: instructor.last_name,
					})),
				});
			}
			form.setFieldValue("section.meetings", formattedMeetings);
		}, [selectedCourse, form.setFieldValue]);

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
					<p>Add Course Event Manually</p>

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
										setSelectedCourse([]);
										setSelectedOption("none");
									} else {
										closeParentModal(true);
									}
								}}
								cancelOnClick={() => closeParentModal(false)}
								actionOnClick={() => {
									form.reset();
									setSelectedCourse([]);
									setIsBackResetModalOpen(false);
									closeParentModal(false);
									setTimeout(() => setSelectedOption("none"), 150);
								}}
							/>
						)}
					</form.Subscribe>
				</div>

				<div className="flex flex-row items-center gap-2">
					<Popover>
						<PopoverTrigger className="text-left rounded-md p-1 border border-border hover:bg-accent cursor-pointer flex flex-row flex-1 items-center gap-2 justify-between">
							Pre-fill Course Information
							<ChevronDown />
						</PopoverTrigger>
						<PopoverContent
							side="bottom"
							align="start"
							className="w-(--anchor-width)"
						>
							<CourseAddList
								courses={courses}
								selectedCourse={selectedCourse}
								setSelectedCourse={setSelectedCourse}
							/>
						</PopoverContent>
					</Popover>

					<DangerModal
						type="reset"
						isModalOpen={isResetModalOpen}
						onOpenChange={setIsResetModalOpen}
						triggerOnClick={() => {
							closeParentModal(true);
						}}
						cancelOnClick={() => closeParentModal(false)}
						actionOnClick={() => {
							form.reset();
							setSelectedCourse([]);
							setIsResetModalOpen(false);
							closeParentModal(false);
						}}
					/>
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
						<UnlinkedEventFormFields form={form} terms={terms} />

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
									setSelectedCourse([]);
									setIsResetModalOpen(false);
									closeParentModal(false);
								}}
							/>

							<Button type="submit">
								<Plus /> Add Course
							</Button>
						</div>
					</form>
				</ScrollArea>
			</motion.div>
		);
	},
);

EventAddUnlinked.displayName = "EventAddUnlinked";
export default EventAddUnlinked;
