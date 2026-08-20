/** biome-ignore-all lint/correctness/noChildrenProp: This is required of the tanstack form */

"use client";

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
import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
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
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { TermResponse } from "@/data/terms";
import { withForm } from "@/hooks/use-form";
import { cn, defaultColors } from "@/lib/utils";
import type { PersonalEventMeetingAddType } from "@/schemas/personal-event";
import { personalEventFormOpts } from "./personal-opts";

export const PersonalEventFormFields = withForm({
	...personalEventFormOpts,
	props: {
		terms: [] as Exclude<TermResponse, number>,
	},
	render: ({ form, terms }) => {
		const [meetingsIsOpen, setMeetingsIsOpen] = useState(true);
		const [dateTemp, setDateTemp] = useState<DateRange | undefined>({
			from: form.state.values.startDate,
			to: form.state.values.endDate,
		});

		useEffect(() => {
			if (dateTemp?.from && dateTemp.to) {
				form.setFieldValue("startDate", dateTemp.from);
				form.setFieldValue("endDate", dateTemp.to);
			}
		}, [dateTemp, form.setFieldValue]);

		return (
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
										terms.find((term) => term.term_code === field.state.value)
											?.term_name
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
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
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
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
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
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
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

													<form.Field
														name={`meetings[${index}].location`}
														children={(field) => {
															const isInvalid =
																field.state.meta.isTouched &&
																!field.state.meta.isValid;

															return (
																<Field data-invalid={isInvalid}>
																	<FieldLabel htmlFor={field.name} optional>
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
																onChange: ({ value }: { value: string }) => {
																	if (value.length < 5) return undefined;

																	const endTime = form.getFieldValue(
																		`meetings[${index}].endTime`,
																	);
																	if (endTime.length < 5) return undefined;
																	const endTimeArr = endTime.split(":");
																	const endHour = parseInt(endTimeArr[0], 10);
																	const endMinute = parseInt(endTimeArr[1], 10);

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
																		<FieldLabel htmlFor={field.name} required>
																			Start Time
																		</FieldLabel>
																		<Input
																			type="time"
																			id={field.name}
																			name={field.name}
																			value={field.state.value}
																			onBlur={field.handleBlur}
																			onChange={(e) => {
																				field.handleChange(e.target.value);
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
																onChange: ({ value }: { value: string }) => {
																	if (value.length < 5) return undefined;

																	const startTime = form.getFieldValue(
																		`meetings[${index}].startTime`,
																	);
																	if (startTime.length < 5) return undefined;
																	const startTimeArr = startTime.split(":");
																	const startHour = parseInt(
																		startTimeArr[0],
																		10,
																	);
																	const startMinute = parseInt(
																		startTimeArr[1],
																		10,
																	);

																	const endTimeArr = value.split(":");
																	const endHour = parseInt(endTimeArr[0], 10);
																	const endMinute = parseInt(endTimeArr[1], 10);

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
																		<FieldLabel htmlFor={field.name} required>
																			End Time
																		</FieldLabel>
																		<Input
																			type="time"
																			id={field.name}
																			name={field.name}
																			value={field.state.value}
																			onBlur={field.handleBlur}
																			onChange={(e) => {
																				field.handleChange(e.target.value);
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
																	<FieldLabel htmlFor={field.name} required>
																		Days of the Week
																	</FieldLabel>
																	<FieldDescription>
																		What days of the week you would like this
																		time slot to repeat on.
																	</FieldDescription>

																	<ToggleGroup
																		defaultValue={field.state.value}
																		onValueChange={field.handleChange}
																		variant="primary"
																		multiple
																		className="w-full justify-between rounded-md border border-border p-2 bg-background"
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
												form.setFieldValue("meetings", [
													...form.getFieldValue("meetings"),
													{
														days: [] as Array<string>,
														startTime: "",
														endTime: "",
														location: "",
													} as PersonalEventMeetingAddType,
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

								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</FieldSet>
						);
					}}
				/>
			</FieldGroup>
		);
	},
});
