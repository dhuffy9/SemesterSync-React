/** biome-ignore-all lint/correctness/noChildrenProp: This is required of the tanstack form */

"use client";
import { useForm } from "@tanstack/react-form";
import clsx from "clsx";
import { format } from "date-fns";
import {
	CalendarIcon,
	Check,
	ChevronDown,
	Palette,
	Plus,
	Trash,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { forwardRef, useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { v4 as uuidv4 } from "uuid";
import DangerModal from "@/components/modals/danger";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ColorPicker } from "@/components/ui/color-picker";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { TermResponse } from "@/data/terms";
import { createSwipeRightVariant, TRANSITION } from "@/lib/animation";
import { cn } from "@/lib/utils";
import { courseAddSchema, type MeetingAddType } from "@/schemas/course-event";
import type { Event, UnlinkedEventVariantMeeting } from "@/schemas/events";
import useUserStore from "@/stores/user-store";
import type {
	AssembledCourseSingleSection,
	CourseResponse,
} from "@/types/courses";
import CourseAddList, { mergeMeetings } from "./course-add-list";

const defaultColors = [
	"#c22727",
	"#873d16",
	"#278716",
	"#168776",
	"#4285F4",
	"#181687",
	"#561687",
	"#871663",
];

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
		const [dateTemp, setDateTemp] = useState<DateRange | undefined>({
			from: initialDate,
			to: initialDate,
		});
		const [meetingsIsOpen, setMeetingsIsOpen] = useState(true);
		const [isResetModalOpen, setIsResetModalOpen] = useState(false);
		const [isBackResetModalOpen, setIsBackResetModalOpen] = useState(false);

		const tab = useUserStore((state) => state.getActiveTab());
		const term = useUserStore((state) => state.activeTerm);
		const eventAdd = useUserStore((state) => state.addEvent);

		const shouldReduceMotion = useReducedMotion();
		const swipeRightVariant = createSwipeRightVariant(shouldReduceMotion);

		const form = useForm({
			defaultValues: {
				termCode: term,
				courseCode: "",
				courseTitle: "",
				credits: "",
				color: "#4285F4",
				section: {
					sectionCode: "",
					startDate: initialDate,
					endDate: initialDate,
					deliveryMethod: "On Campus",
					meetings: [] as Array<MeetingAddType>,
				},
			},
			validators: {
				onSubmit: courseAddSchema,
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
			if (dateTemp?.from && dateTemp.to) {
				form.setFieldValue("section.startDate", dateTemp.from);
				form.setFieldValue("section.endDate", dateTemp.to);
			}
		}, [dateTemp, form.setFieldValue]);

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

			setDateTemp({
				from: course.section.start_date,
				to: course.section.end_date,
			});

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
								externalSelectedCourse={selectedCourse}
								setExternalSelectedCourse={setSelectedCourse}
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
						<FieldGroup>
							<form.Field
								name="termCode"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;

									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel>Term</FieldLabel>
											<Input
												value={
													terms.find(
														(term) => term.term_code === field.state.value,
													)?.term_name
												}
												readOnly
												disabled
											/>
											<input
												className="hidden"
												type="text"
												placeholder="Term"
												readOnly
												value={field.state.value}
											/>
										</Field>
									);
								}}
							/>

							<form.Field
								name="courseTitle"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;

									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel required>Course Title</FieldLabel>
											<Input
												type="string"
												id={field.name}
												name={field.name}
												placeholder="English Composition I"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>

							<FieldSet className="flex-row">
								<form.Field
									name="courseCode"
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;

										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel required>Course Code</FieldLabel>
												<Input
													type="string"
													id={field.name}
													name={field.name}
													placeholder="ENL111"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>

								<form.Field
									name="section.sectionCode"
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;

										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel required>Section Code</FieldLabel>
												<Input
													type="string"
													id={field.name}
													name={field.name}
													placeholder="21"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>
							</FieldSet>

							<form.Field
								name="credits"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;

									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel required>Credits</FieldLabel>
											<Input
												type="number"
												id={field.name}
												name={field.name}
												placeholder="3"
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>

							<form.Field
								name="section.startDate"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;

									return (
										<Field data-invalid={isInvalid} className="flex-1">
											<FieldLabel htmlFor={field.name} required>
												Course Start & End Dates
											</FieldLabel>
											<Popover>
												<PopoverTrigger
													render={
														<Button
															variant="outline"
															id={field.name}
															className="justify-start font-normal"
														/>
													}
												>
													<CalendarIcon />
													<span>
														{dateTemp?.from && dateTemp.to
															? `${format(dateTemp.from, "LLL dd, y")} - ${format(dateTemp.to, "LLL dd, y")}`
															: "Select Dates"}
													</span>
												</PopoverTrigger>
												<PopoverContent className="w-auto h-78" align="start">
													<Calendar
														mode="range"
														defaultMonth={dateTemp?.from}
														selected={dateTemp}
														onSelect={setDateTemp}
														numberOfMonths={2}
													/>
												</PopoverContent>
											</Popover>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>

							<form.Field
								name="section.deliveryMethod"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;

									return (
										<Field data-invalid={isInvalid} orientation="horizontal">
											<FieldContent>
												<FieldLabel htmlFor={field.name} required>
													Is A Remote Class
												</FieldLabel>
												<FieldLabel htmlFor={field.name}>
													<FieldDescription>
														Toggle this setting on if the course is a class that
														does not take place in a location.
													</FieldDescription>
												</FieldLabel>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</FieldContent>
											<Switch
												id={field.name}
												name={field.name}
												checked={field.state.value === "remote"}
												onCheckedChange={(checked) => {
													field.setValue(checked ? "remote" : "On Campus");
												}}
											/>
										</Field>
									);
								}}
							/>

							<form.Field
								name="section.meetings"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;

									return (
										<Collapsible
											open={meetingsIsOpen}
											onOpenChange={setMeetingsIsOpen}
											className={clsx(
												"bg-accent rounded-lg p-2 [&_input]:bg-background border border-border",
												{ "border-destructive": isInvalid },
											)}
										>
											<CollapsibleTrigger
												className={clsx(
													"flex flex-col gap-1 text-left cursor-pointer w-full",
													{ "text-destructive": isInvalid },
												)}
											>
												<div className="flex flex-row items-center justify-between">
													<div className="flex flex-row gap-1">
														Course Meetings
														<span className="text-destructive text-sm">*</span>
													</div>
													<ChevronDown
														className={`transition-all size-4 ${meetingsIsOpen ? "rotate-180" : ""}`}
													/>
												</div>
												<FieldError errors={field.state.meta.errors} />
											</CollapsibleTrigger>
											<CollapsibleContent className="mt-2">
												<form.Subscribe
													selector={(state) => state.values.section.meetings}
													children={(meetings) =>
														meetings.map((meeting, index) => (
															<div
																key={`meeting-${index}-${meeting.days.join("-")}`}
																className="flex flex-col gap-2"
															>
																<Separator className="mt-2" />
																<div className="flex flex-row items-center gap-2 w-full justify-between">
																	<span>Meeting Slot #{index + 1}</span>
																	<Button
																		variant="destructive"
																		size="icon"
																		onClick={() => {
																			form.setFieldValue(
																				"section.meetings",
																				form
																					.getFieldValue("section.meetings")
																					.toSpliced(index, 1),
																			);
																		}}
																	>
																		<Trash />
																	</Button>
																</div>

																{/* <Separator /> */}

																<div className="flex flex-col gap-2">
																	<div className="flex flex-col">
																		<p>Instructors</p>
																		<span className="text-muted-foreground text-sm">
																			Add the instructor names who teach this
																			section.
																		</span>
																	</div>
																	{form
																		.getFieldValue(
																			`section.meetings[${index}].instructors`,
																		)
																		.map((instructor, instructorIndex) => (
																			<div key={`instructor-${instructor.id}`}>
																				<Field
																					orientation={"responsive"}
																					className="@md/field-group:items-end"
																				>
																					<form.Field
																						name={`section.meetings[${index}].instructors[${instructorIndex}].firstName`}
																						children={(field) => {
																							const isInvalid =
																								field.state.meta.isTouched &&
																								!field.state.meta.isValid;

																							return (
																								<Field data-invalid={isInvalid}>
																									<FieldLabel
																										htmlFor={field.name}
																										required
																									>
																										First Name
																									</FieldLabel>
																									<Input
																										type="string"
																										id={field.name}
																										name={field.name}
																										placeholder="John"
																										value={field.state.value}
																										onBlur={field.handleBlur}
																										onChange={(e) =>
																											field.handleChange(
																												e.target.value,
																											)
																										}
																										aria-invalid={isInvalid}
																									/>
																									{isInvalid && (
																										<FieldError
																											errors={
																												field.state.meta.errors
																											}
																										/>
																									)}
																								</Field>
																							);
																						}}
																					/>

																					<form.Field
																						name={`section.meetings[${index}].instructors[${instructorIndex}].lastName`}
																						children={(field) => {
																							const isInvalid =
																								field.state.meta.isTouched &&
																								!field.state.meta.isValid;

																							return (
																								<Field data-invalid={isInvalid}>
																									<FieldLabel
																										htmlFor={field.name}
																										required
																									>
																										Last Name
																									</FieldLabel>
																									<Input
																										type="string"
																										id={field.name}
																										name={field.name}
																										placeholder="Doe"
																										value={field.state.value}
																										onBlur={field.handleBlur}
																										onChange={(e) =>
																											field.handleChange(
																												e.target.value,
																											)
																										}
																										aria-invalid={isInvalid}
																									/>
																									{isInvalid && (
																										<FieldError
																											errors={
																												field.state.meta.errors
																											}
																										/>
																									)}
																								</Field>
																							);
																						}}
																					/>

																					{form.getFieldValue(
																						`section.meetings[${index}].instructors`,
																					).length > 1 && (
																						<Button
																							variant={"destructive"}
																							size={"icon"}
																							className={"w-8!"}
																							onClick={() => {
																								form.setFieldValue(
																									`section.meetings[${index}].instructors`,
																									form
																										.getFieldValue(
																											`section.meetings[${index}].instructors`,
																										)
																										.toSpliced(
																											instructorIndex,
																											1,
																										),
																								);
																							}}
																						>
																							<Trash />
																						</Button>
																					)}
																				</Field>
																			</div>
																		))}

																	<Button
																		variant={"outline"}
																		className={"mb-2"}
																		onClick={() => {
																			form.setFieldValue(
																				`section.meetings[${index}].instructors`,
																				[
																					...form.getFieldValue(
																						`section.meetings[${index}].instructors`,
																					),
																					{
																						id: uuidv4(),
																						firstName: "",
																						lastName: "",
																					},
																				],
																			);
																		}}
																	>
																		Add Instructor <Plus />
																	</Button>
																</div>

																<form.Subscribe
																	selector={(state) =>
																		state.values.section.deliveryMethod
																	}
																	children={(deliveryMethod) =>
																		deliveryMethod !== "remote" && (
																			<div className="space-y-2">
																				<form.Field
																					name={`section.meetings[${index}].campus`}
																					children={(field) => {
																						const isInvalid =
																							field.state.meta.isTouched &&
																							!field.state.meta.isValid;

																						return (
																							<Field data-invalid={isInvalid}>
																								<FieldLabel
																									htmlFor={field.name}
																									required
																								>
																									Campus
																								</FieldLabel>
																								<Input
																									type="string"
																									id={field.name}
																									name={field.name}
																									placeholder="Main Campus"
																									value={
																										field.state.value || ""
																									}
																									onBlur={field.handleBlur}
																									onChange={(e) =>
																										field.handleChange(
																											e.target.value,
																										)
																									}
																									aria-invalid={isInvalid}
																								/>
																								{isInvalid && (
																									<FieldError
																										errors={
																											field.state.meta.errors
																										}
																									/>
																								)}
																							</Field>
																						);
																					}}
																				/>

																				<div className="flex flex-row items-center gap-2">
																					<form.Field
																						name={`section.meetings[${index}].building`}
																						children={(field) => {
																							const isInvalid =
																								field.state.meta.isTouched &&
																								!field.state.meta.isValid;

																							return (
																								<Field data-invalid={isInvalid}>
																									<FieldLabel
																										htmlFor={field.name}
																										required
																									>
																										Building
																									</FieldLabel>
																									<Input
																										type="string"
																										id={field.name}
																										name={field.name}
																										placeholder="George S. Klump Academic Center"
																										value={
																											field.state.value || ""
																										}
																										onBlur={field.handleBlur}
																										onChange={(e) =>
																											field.handleChange(
																												e.target.value,
																											)
																										}
																										aria-invalid={isInvalid}
																									/>
																									{isInvalid && (
																										<FieldError
																											errors={
																												field.state.meta.errors
																											}
																										/>
																									)}
																								</Field>
																							);
																						}}
																					/>

																					<form.Field
																						name={`section.meetings[${index}].room`}
																						children={(field) => {
																							const isInvalid =
																								field.state.meta.isTouched &&
																								!field.state.meta.isValid;

																							return (
																								<Field
																									data-invalid={isInvalid}
																									className="w-2/6"
																								>
																									<FieldLabel
																										htmlFor={field.name}
																										required
																									>
																										Room
																									</FieldLabel>
																									<Input
																										type="string"
																										id={field.name}
																										name={field.name}
																										placeholder="202"
																										value={
																											field.state.value || ""
																										}
																										onBlur={field.handleBlur}
																										onChange={(e) =>
																											field.handleChange(
																												e.target.value,
																											)
																										}
																										aria-invalid={isInvalid}
																									/>
																									{isInvalid && (
																										<FieldError
																											errors={
																												field.state.meta.errors
																											}
																										/>
																									)}
																								</Field>
																							);
																						}}
																					/>
																				</div>
																			</div>
																		)
																	}
																/>

																<Field
																	orientation="responsive"
																	className="@md/field-group:items-start"
																>
																	<form.Field
																		name={`section.meetings[${index}].startTime`}
																		validators={{
																			onChange: ({ value }) => {
																				if (value.length < 5) return undefined;

																				const endTime = form.getFieldValue(
																					`section.meetings[${index}].endTime`,
																				);
																				if (endTime.length < 5)
																					return undefined;
																				const endTimeArr = endTime.split(":");
																				const endHour = parseInt(
																					endTimeArr[0],
																					10,
																				);
																				const endMinute = parseInt(
																					endTimeArr[1],
																					10,
																				);

																				const startTimeArr = value.split(":");
																				const startHour = parseInt(
																					startTimeArr[0],
																					10,
																				);
																				const startMinute = parseInt(
																					startTimeArr[1],
																					10,
																				);

																				return (startHour === endHour &&
																					startMinute >= endMinute) ||
																					startHour > endHour
																					? {
																							message:
																								"Start time must be before end time",
																						}
																					: undefined;
																			},
																		}}
																		children={(field) => {
																			const isInvalid =
																				field.state.meta.isTouched &&
																				!field.state.meta.isValid;

																			return (
																				<Field
																					data-invalid={isInvalid}
																					className="flex-1"
																				>
																					<FieldLabel
																						htmlFor={field.name}
																						required
																					>
																						Start Time
																					</FieldLabel>
																					<Input
																						type="time"
																						id={field.name}
																						name={field.name}
																						value={field.state.value}
																						onBlur={field.handleBlur}
																						onChange={(e) => {
																							field.handleChange(
																								e.target.value,
																							);

																							form.validateField(
																								`section.meetings[${index}].endTime`,
																								"change",
																							);
																						}}
																						aria-invalid={isInvalid}
																					/>
																					{isInvalid && (
																						<FieldError
																							errors={field.state.meta.errors}
																						/>
																					)}
																				</Field>
																			);
																		}}
																	/>

																	<form.Field
																		name={`section.meetings[${index}].endTime`}
																		validators={{
																			onChange: ({ value }) => {
																				if (value.length < 5) return undefined;

																				const startTime = form.getFieldValue(
																					`section.meetings[${index}].startTime`,
																				);
																				if (startTime.length < 5)
																					return undefined;
																				const startTimeArr =
																					startTime.split(":");
																				const startHour = parseInt(
																					startTimeArr[0],
																					10,
																				);
																				const startMinute = parseInt(
																					startTimeArr[1],
																					10,
																				);

																				const endTimeArr = value.split(":");
																				const endHour = parseInt(
																					endTimeArr[0],
																					10,
																				);
																				const endMinute = parseInt(
																					endTimeArr[1],
																					10,
																				);

																				return (endHour === startHour &&
																					endMinute <= startMinute) ||
																					endHour < startHour
																					? {
																							message:
																								"End time must be after start time",
																						}
																					: undefined;
																			},
																		}}
																		children={(field) => {
																			const isInvalid =
																				field.state.meta.isTouched &&
																				!field.state.meta.isValid;

																			return (
																				<Field
																					data-invalid={isInvalid}
																					className="flex-1"
																				>
																					<FieldLabel
																						htmlFor={field.name}
																						required
																					>
																						End Time
																					</FieldLabel>
																					<Input
																						type="time"
																						id={field.name}
																						name={field.name}
																						value={field.state.value}
																						onBlur={field.handleBlur}
																						onChange={(e) => {
																							field.handleChange(
																								e.target.value,
																							);

																							form.validateField(
																								`section.meetings[${index}].startTime`,
																								"change",
																							);
																						}}
																						aria-invalid={isInvalid}
																					/>
																					{isInvalid && (
																						<FieldError
																							errors={field.state.meta.errors}
																						/>
																					)}
																				</Field>
																			);
																		}}
																	/>
																</Field>

																<form.Field
																	name={`section.meetings[${index}].days`}
																	children={(field) => {
																		const isInvalid =
																			field.state.meta.isTouched &&
																			!field.state.meta.isValid;

																		return (
																			<Field data-invalid={isInvalid}>
																				<FieldLabel
																					htmlFor={field.name}
																					required
																				>
																					Days of the Week
																				</FieldLabel>
																				<FieldDescription>
																					What days of the week the course
																					occurs on.
																				</FieldDescription>

																				<ToggleGroup
																					defaultValue={field.state.value}
																					onValueChange={field.handleChange}
																					variant="primary"
																					multiple
																					className={
																						"w-full justify-between rounded-md border border-border p-2 bg-background"
																					}
																				>
																					<ToggleGroupItem value="Monday">
																						Mon
																					</ToggleGroupItem>
																					<ToggleGroupItem value="Tuesday">
																						Tue
																					</ToggleGroupItem>
																					<ToggleGroupItem value="Wednesday">
																						Wed
																					</ToggleGroupItem>
																					<ToggleGroupItem value="Thursday">
																						Thur
																					</ToggleGroupItem>
																					<ToggleGroupItem value="Friday">
																						Fri
																					</ToggleGroupItem>
																					<ToggleGroupItem value="Saturday">
																						Sat
																					</ToggleGroupItem>
																					<ToggleGroupItem value="Sunday">
																						Sun
																					</ToggleGroupItem>
																				</ToggleGroup>
																			</Field>
																		);
																	}}
																/>
															</div>
														))
													}
												/>

												<div className="w-full flex flex-row justify-around mt-4">
													<Button
														variant="outline"
														onClick={() =>
															form.setFieldValue("section.meetings", [
																...form.getFieldValue("section.meetings"),
																{
																	days: [] as Array<string>,
																	instructors: [
																		{
																			firstName: "",
																			lastName: "",
																		},
																	],
																	startTime: "",
																	endTime: "",
																	campus: "Main Campus",
																} as MeetingAddType,
															])
														}
													>
														Add Meeting Slot <Plus />
													</Button>
												</div>
											</CollapsibleContent>
										</Collapsible>
									);
								}}
							/>

							<form.Field
								name="color"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;

									return (
										<FieldSet>
											<FieldLegend required>Course Color</FieldLegend>
											<FieldDescription>
												The color of the course on your calendar.
											</FieldDescription>

											<div className="flex flex-row gap-2">
												{defaultColors.map((color) => (
													<div key={color}>
														<button
															type="button"
															className={cn(
																"size-6 rounded-full flex items-center justify-center outline-transparent outline-2 cursor-pointer",
																field.state.value === color &&
																	"cursor-pointer outline-border",
															)}
															style={{ backgroundColor: color }}
															disabled={field.state.value === color}
															onClick={() => field.setValue(color)}
														>
															{field.state.value === color && (
																<Check className="text-white size-4" />
															)}
														</button>
													</div>
												))}

												<ColorPicker
													className="size-6 rounded-full flex items-center justify-center outline-transparent outline-2"
													value={field.state.value}
													onChange={(v) =>
														field.handleChange(
															typeof v === "string" ? v : v.target.value,
														)
													}
												>
													{defaultColors.includes(field.state.value) ? (
														<Palette className="text-white size-4" />
													) : (
														<Check
															className="size-4"
															style={{
																color: `contrast-color(${field.state.value})`,
															}}
														/>
													)}
												</ColorPicker>
											</div>

											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</FieldSet>
									);
								}}
							/>

							<Separator />

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
						</FieldGroup>
					</form>
				</ScrollArea>
			</motion.div>
		);
	},
);

EventAddUnlinked.displayName = "EventAddUnlinked";
export default EventAddUnlinked;
