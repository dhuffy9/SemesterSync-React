/** biome-ignore-all lint/correctness/noChildrenProp: This is required of the tanstack form */

"use client";
import { useForm } from "@tanstack/react-form";
import clsx from "clsx";
import { format } from "date-fns";
import {
	ArrowLeft,
	CalendarIcon,
	Check,
	ChevronDown,
	Palette,
	Plus,
	RotateCw,
	Trash,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { forwardRef, useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { v4 as uuidv4 } from "uuid";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { toast } from "@/components/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { TermResponse } from "@/data/terms";
import { createSwipeRightVariant, TRANSITION } from "@/lib/animation";
import { cn } from "@/lib/utils";
import {
	type NonCourseAddType,
	type NonCourseMeeting,
	type NonCourseMeetingAddType,
	nonCourseAddSchema,
} from "@/schemas/non-course-event";
import useUserStore from "@/stores/user-store";
import type { NonCourseEvent } from "@/types/user-store";

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

type EventAddManualProps = {
	terms: TermResponse;
	setSelectedOption: React.Dispatch<React.SetStateAction<string>>;
	closeParentModal: React.Dispatch<React.SetStateAction<boolean>>;
};

const EventAddManual = forwardRef<HTMLDivElement, EventAddManualProps>(
	({ terms, setSelectedOption, closeParentModal }, ref) => {
		const [dateTemp, setDateTemp] = useState<DateRange | undefined>({
			from: new Date(),
			to: new Date(),
		});
		const [meetingsIsOpen, setMeetingsIsOpen] = useState(true);
		const [isResetModalOpen, setIsResetModalOpen] = useState(false);
		const [isBackResetModalOpen, setIsBackResetModalOpen] = useState(false);

		const tab = useUserStore((state) => state.getActiveTab());
		const term = useUserStore((state) => state.activeTerm);
		const nonCourseEventAdd = useUserStore((state) => state.addNonCourseEvent);

		const shouldReduceMotion = useReducedMotion();
		const swipeRightVariant = createSwipeRightVariant(shouldReduceMotion);

		const form = useForm({
			defaultValues: {
				termCode: term,
				title: "",
				description: "",
				credits: "",
				color: "#4285F4",
				startDate: new Date(),
				endDate: new Date(),
				meetings: [] as Array<NonCourseMeetingAddType>,
			} as NonCourseAddType,
			validators: {
				onSubmit: nonCourseAddSchema,
			},
			onSubmitInvalid: () => {
				console.error("Form Error: ", form.getAllErrors());
			},
			onSubmit: (values) => {
				const formData = values.value;

				if (typeof terms === "number") return;

				const event: NonCourseEvent = {
					eventId: uuidv4(),
					color: formData.color,
					title: formData.title,
					description: formData.description,
					credits: formData.credits,
					term_code: formData.termCode,
					term_name:
						terms.find((term) => term.term_code === formData.termCode)
							?.term_name || "",
					startDate: formData.startDate,
					endDate: formData.endDate,
					meetings: [],
				};

				const formattedMeetings: Array<NonCourseMeeting> = [];
				for (const meeting of formData.meetings) {
					for (const day of meeting.days) {
						formattedMeetings.push({
							id: uuidv4(),
							day: day,
							start_time: meeting.startTime,
							end_time: meeting.endTime,
							location: meeting.location,
						});
					}
				}

				event.meetings = formattedMeetings;

				nonCourseEventAdd(tab.id, event);
				toast.add({
					type: "success",
					description: "Event added to calendar",
				});
				form.reset();
				setSelectedOption("none");
			},
		});

		useEffect(() => {
			if (dateTemp?.from && dateTemp.to) {
				form.setFieldValue("startDate", dateTemp.from);
				form.setFieldValue("endDate", dateTemp.to);
			}
		}, [dateTemp, form.setFieldValue]);

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
					<p>Non-course Manual Add</p>
					<AlertDialog open={isBackResetModalOpen}>
						<AlertDialogTrigger
							render={<Button variant="secondary" />}
							onClick={() => {
								setIsBackResetModalOpen(true);
								closeParentModal(true);
							}}
						>
							<ArrowLeft /> Back
						</AlertDialogTrigger>
						<AlertDialogContent size="sm">
							<AlertDialogHeader>
								<AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
									<RotateCw />
								</AlertDialogMedia>
								<AlertDialogTitle>Reset Entered Information</AlertDialogTitle>
								<AlertDialogDescription>
									Going back will clear the entered information, are you sure
									you would like to proceed?
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel
									onClick={() => {
										setIsBackResetModalOpen(false);
										closeParentModal(false);
									}}
								>
									Cancel
								</AlertDialogCancel>
								<AlertDialogAction
									variant="destructive"
									onClick={() => {
										setIsBackResetModalOpen(false);
										closeParentModal(false);
										form.reset();
										setTimeout(() => setSelectedOption("none"), 150);
									}}
								>
									Proceed & Reset
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
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
								name="title"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;

									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel required>Event Title</FieldLabel>
											<Input
												type="string"
												id={field.name}
												name={field.name}
												placeholder="Workout"
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
								name="description"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;

									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel optional>Event Description</FieldLabel>
											<Input
												type="string"
												id={field.name}
												name={field.name}
												placeholder="Description of the event"
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
								name="credits"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;

									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel optional>Credits</FieldLabel>
											<FieldDescription>
												If you would like this event to add a number of credits
												to the credit total for the tab, input a number here.
											</FieldDescription>
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
								name="startDate"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;

									return (
										<Field data-invalid={isInvalid} className="flex-1">
											<FieldLabel htmlFor={field.name} required>
												Event Start & End Dates
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
								name="meetings"
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
														Event Times
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
													selector={(state) => state.values.meetings}
													children={(meetings) =>
														meetings.map((meeting, index) => (
															<div
																key={`meeting-${index}-${meeting.days.join("-")}`}
																className="flex flex-col gap-2"
															>
																<Separator className="mt-2" />
																<div className="flex flex-row items-center gap-2 w-full justify-between">
																	<span>Time Slot #{index + 1}</span>
																	<Button
																		variant="destructive"
																		size="icon"
																		onClick={() => {
																			form.setFieldValue(
																				"meetings",
																				form
																					.getFieldValue("meetings")
																					.toSpliced(index, 1),
																			);
																		}}
																	>
																		<Trash />
																	</Button>
																</div>

																{/* <Separator /> */}

																<form.Field
																	name={`meetings[${index}].location`}
																	children={(field) => {
																		const isInvalid =
																			field.state.meta.isTouched &&
																			!field.state.meta.isValid;

																		return (
																			<Field data-invalid={isInvalid}>
																				<FieldLabel
																					htmlFor={field.name}
																					optional
																				>
																					Event Location
																				</FieldLabel>
																				<Input
																					type="string"
																					id={field.name}
																					name={field.name}
																					placeholder="1600 Pennsylvania Avenue NW, Washington, DC 20500"
																					value={field.state.value || ""}
																					onBlur={field.handleBlur}
																					onChange={(e) =>
																						field.handleChange(e.target.value)
																					}
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

																<Field
																	orientation="responsive"
																	className="@md/field-group:items-start"
																>
																	<form.Field
																		name={`meetings[${index}].startTime`}
																		validators={{
																			onChange: ({ value }) => {
																				if (value.length < 5) return undefined;

																				const endTime = form.getFieldValue(
																					`meetings[${index}].endTime`,
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
																								`meetings[${index}].endTime`,
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
																		name={`meetings[${index}].endTime`}
																		validators={{
																			onChange: ({ value }) => {
																				if (value.length < 5) return undefined;

																				const startTime = form.getFieldValue(
																					`meetings[${index}].startTime`,
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
																								`meetings[${index}].startTime`,
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
																	name={`meetings[${index}].days`}
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
																					What days of the week you would like
																					this time slot to repeat on.
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
																					<ToggleGroupItem value="mon">
																						Mon
																					</ToggleGroupItem>
																					<ToggleGroupItem value="tue">
																						Tue
																					</ToggleGroupItem>
																					<ToggleGroupItem value="wed">
																						Wed
																					</ToggleGroupItem>
																					<ToggleGroupItem value="thu">
																						Thur
																					</ToggleGroupItem>
																					<ToggleGroupItem value="fri">
																						Fri
																					</ToggleGroupItem>
																					<ToggleGroupItem value="sat">
																						Sat
																					</ToggleGroupItem>
																					<ToggleGroupItem value="sun">
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
															form.setFieldValue("meetings", [
																...form.getFieldValue("meetings"),
																{
																	days: [] as Array<string>,
																	startTime: "",
																	endTime: "",
																	location: "",
																} as NonCourseMeetingAddType,
															])
														}
													>
														Add Time Slot <Plus />
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
											<FieldLegend required>Event Color</FieldLegend>
											<FieldDescription>
												The color of the event on your calendar.
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
								<AlertDialog
									open={isResetModalOpen}
									onOpenChange={setIsResetModalOpen}
								>
									<AlertDialogTrigger
										render={<Button variant="secondary" />}
										onClick={() => {
											setIsResetModalOpen(true);
											closeParentModal(true);
										}}
									>
										Reset
									</AlertDialogTrigger>
									<AlertDialogContent size="sm">
										<AlertDialogHeader>
											<AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
												<RotateCw />
											</AlertDialogMedia>
											<AlertDialogTitle>
												Reset Entered Information
											</AlertDialogTitle>
											<AlertDialogDescription>
												Are you sure you want to reset all the entered
												information?
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel
												onClick={() => {
													setIsResetModalOpen(false);
													closeParentModal(false);
												}}
											>
												Cancel
											</AlertDialogCancel>
											<AlertDialogAction
												variant="destructive"
												onClick={() => {
													form.reset();
													setIsResetModalOpen(false);
													closeParentModal(false);
												}}
											>
												Reset
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
								<Button type="submit">
									<Plus /> Add Event
								</Button>
							</div>
						</FieldGroup>
					</form>
				</ScrollArea>
			</motion.div>
		);
	},
);

EventAddManual.displayName = "EventAddManual";
export default EventAddManual;
