/** biome-ignore-all lint/correctness/noChildrenProp: Preferred method for using tanstack form */
"use client";

import { useForm } from "@tanstack/react-form";
import clsx from "clsx";
import { Check, ChevronDown, Palette, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import z from "zod";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import type { TermResponse } from "@/data/terms";
import { cn } from "@/lib/utils";
import useUserStore from "@/stores/user-store";
import type { CourseResponse } from "@/types/courses";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { ColorPicker } from "../../ui/color-picker";
import {
	DialogClose,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../../ui/dialog";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSeparator,
	FieldSet,
} from "../../ui/field";
import { Input } from "../../ui/input";
import { ScrollArea } from "../../ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../ui/select";
import CourseSearch from "./course-search";

const days = [
	{ label: "Monday", value: "mon" },
	{ label: "Tuesday", value: "tue" },
	{ label: "Wednesday", value: "wed" },
	{ label: "Thursday", value: "thu" },
	{ label: "Friday", value: "fri" },
	{ label: "Saturday", value: "sat" },
	{ label: "Sunday", value: "sun" },
];

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

const addCourseFormSchema = z.object({
	term: z.string(),
	startDate: z
		.string()
		.regex(/\d{4}-\d{2}-\d{2}/, "You must provide a start date"),
	endDate: z
		.string()
		.regex(/\d{4}-\d{2}-\d{2}/, "You must provide an end date"),
	startTime: z.string().regex(/\d{2}:\d{2}/, "You must provide a start time"),
	endTime: z.string().regex(/\d{2}:\d{2}/, "You must provide an end time"),
	days: z
		.array(z.string())
		.min(1, "You must select at least one day")
		.refine(
			(value) => value.every((day) => days.some((d) => d.value === day)),
			"Invalid day selected",
		),
	isOnline: z.boolean(),
	courseNumber: z.string(),
	// .min(3, "Course code must be a minimum of 3 characters")
	section: z.string(),
	// .number("You must provide a section")
	// .min(0, "You must provide a section number")
	courseTitle: z.string().min(1, "You must provide a course title"),
	instructorFirst: z.string(),
	instructorLast: z.string(),
	room: z.string(),
	// .min(1, "You must provide a location")
	credits: z.number(),
	color: z.string().min(1, "You must provide a color"),
});

export default function CourseAddModalClient({
	termsRes,
	courses,
}: {
	termsRes: TermResponse;
	courses: CourseResponse;
}) {
	const selectedTerm = useUserStore((state) => state.activeTerm);
	const currentTab = useUserStore((state) => state.activeTab);
	const addCourse = useUserStore((state) => state.addCourse);

	const [courseSpecificOpen, setCourseSpecificOpen] = useState(true);
	const [popoverOpen, setPopoverOpen] = useState(false);

	const form = useForm({
		defaultValues: {
			term: selectedTerm,
			startDate: "",
			endDate: "",
			startTime: "",
			endTime: "",
			days: [] as string[],
			isOnline: false,
			courseNumber: "",
			section: "",
			courseTitle: "",
			instructorFirst: "",
			instructorLast: "",
			room: "",
			credits: 0,
			color: "#4285F4",
		},
		validators: {
			onSubmit: addCourseFormSchema,
		},
		onSubmit: (formObj) => {
			console.log(formObj);
			const values = formObj.value;

			addCourse(currentTab, {
				id: uuidv4(),
				code: values.courseNumber,
				section: parseInt(values.section, 10),
				title: values.courseTitle,
				instructorFirst: values.instructorFirst,
				instructorLast: values.instructorLast,
				credits: values.credits,
				days: values.days,
				startDate: new Date(values.startDate),
				endDate: new Date(values.endDate),
				startTime: new Date(values.startTime),
				endTime: new Date(values.endTime),
				color: values.color,
				term: {
					code: values.term,
				},
				location: {
					building: values.room,
				},
			});
		},
	});

	const [terms, setTerms] = useState<Record<string, string>>({});
	const [isTermError, setIsTermError] = useState(false);

	useEffect(() => {
		if (typeof termsRes === "number") {
			setIsTermError(true);
			return;
		}

		setTerms(
			termsRes.reduce(
				(allTerms, term) => {
					allTerms[term.term_code] = term.term_name;
					return allTerms;
				},
				{} as Record<string, string>,
			),
		);
	}, [termsRes]);

	return (
		<AlertDialog>
			<AlertDialogTrigger render={<Button />}>
				<PlusIcon /> Add Course
			</AlertDialogTrigger>
			<AlertDialogContent>
				<DialogHeader>
					<DialogTitle>Add Course</DialogTitle>
				</DialogHeader>

				{isTermError && (
					<div className="w-full bg-destructive/20 rounded-md p-4 gap-2 flex flex-col items-center align-middle text-destructive border border-destructive">
						<p className="text-lg font-bold">Error Loading Terms</p>
						<p>There was an error loading the terms, please try again.</p>
						<p>If it continues please contact support.</p>
					</div>
				)}

				{!isTermError && (
					<ScrollArea
						className={clsx("max-h-[70vh] pr-4", {
							"[&_div]:overflow-y-hidden! [&_div]:data-[slot='scroll-area-scrollbar']:hidden!":
								popoverOpen,
						})}
					>
						<form
							id="course-add-form"
							onSubmit={(e) => {
								e.preventDefault();
								form.handleSubmit();
							}}
						>
							<CourseSearch
								courses={courses}
								popoverOpen={popoverOpen}
								setPopoverOpen={setPopoverOpen}
							/>
							{/* SECTION Course Info */}
							<FieldGroup>
								{/* SECTION Term */}
								<form.Field
									name="term"
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name} required>
													Term
												</FieldLabel>
												{/* {isLoading ? (
													<Skeleton className="w-full h-8" />
												) : ( */}
												<Select
													name={field.name}
													value={field.state.value}
													/* @ts-expect-error */
													onValueChange={field.handleChange}
													items={terms}
												>
													<SelectTrigger aria-invalid={isInvalid}>
														<SelectValue placeholder="Select Term" />
													</SelectTrigger>
													<SelectContent alignItemWithTrigger>
														{Object.keys(terms).map((termKey) => (
															<SelectItem key={termKey} value={termKey}>
																{terms[termKey]}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												{/* )} */}
												<FieldDescription>
													Auto populated from selected term. Course will only
													show when term is selected.
												</FieldDescription>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>
								{/* !SECTION Term */}

								<FieldSeparator />

								{/* SECTION Title */}
								<form.Field
									name="courseTitle"
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;

										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name} required>
													Course/Event Title
												</FieldLabel>
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
								{/* !SECTION Title */}

								{/* SECTION Location */}
								<form.Field
									name="room"
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;

										return (
											<Field data-invalid={isInvalid} className="-mt-2">
												<FieldLabel htmlFor={field.name}>Location</FieldLabel>
												<Input
													type="string"
													id={field.name}
													name={field.name}
													placeholder="George S. Klump Academic Center | 227 "
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
								{/* !SECTION Location */}

								<Collapsible
									open={courseSpecificOpen}
									onOpenChange={setCourseSpecificOpen}
									className="bg-accent rounded-lg p-2 [&_input]:bg-background"
								>
									<CollapsibleTrigger className="flex flex-row items-center justify-between gap-2 cursor-pointer">
										<div className="flex flex-col flex-1 items-start">
											<FieldLegend variant="label">
												Course Specific Fields
											</FieldLegend>
											<FieldDescription>
												Fill in the below fields if you are adding a course to
												the calendar.
											</FieldDescription>
										</div>
										<ChevronDown
											className={`transition-all ${courseSpecificOpen ? "rotate-180" : ""}`}
										/>
									</CollapsibleTrigger>
									<CollapsibleContent>
										<Separator className="my-4" />
										<FieldGroup>
											<Field
												orientation="responsive"
												className="@md/field-group:items-start"
											>
												{/* SECTION Code */}
												<form.Field
													name="courseNumber"
													children={(field) => {
														const isInvalid =
															field.state.meta.isTouched &&
															!field.state.meta.isValid;

														return (
															<Field
																data-invalid={isInvalid}
																className="flex-1"
															>
																<FieldLabel htmlFor={field.name}>
																	Course Code
																</FieldLabel>
																<Input
																	type="string"
																	id={field.name}
																	name={field.name}
																	placeholder="ENL111"
																	value={field.state.value}
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
												{/* !SECTION Code */}

												{/* SECTION Section */}
												<form.Field
													name="section"
													children={(field) => {
														const isInvalid =
															field.state.meta.isTouched &&
															!field.state.meta.isValid;

														return (
															<Field
																data-invalid={isInvalid}
																className="flex-1"
															>
																<FieldLabel htmlFor={field.name}>
																	Course Section
																</FieldLabel>
																<Input
																	type="number"
																	placeholder="21"
																	id={field.name}
																	name={field.name}
																	value={field.state.value}
																	min={0}
																	onBlur={field.handleBlur}
																	onKeyDown={(e) => {
																		const keys = [
																			"Backspace",
																			"Delete",
																			"ArrowLeft",
																			"ArrowRight",
																			"Tab",
																		];
																		if (keys.includes(e.key)) return;

																		// prevents non-numeric from going to onChange event
																		if (!/^\d/.test(e.key)) e.preventDefault();
																	}}
																	onChange={(e) => {
																		const val = e.target.valueAsNumber;

																		field.handleChange(
																			Number.isNaN(val)
																				? ""
																				: (val as unknown as string),
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
												{/* !SECTION Section */}
											</Field>

											{/* SECTION Instructor */}
											<Field
												orientation="responsive"
												className="@md/field-group:items-start"
											>
												<form.Field
													name="instructorFirst"
													children={(field) => {
														const isInvalid =
															field.state.meta.isTouched &&
															!field.state.meta.isValid;

														return (
															<Field
																data-invalid={isInvalid}
																className="flex-1"
															>
																<FieldLabel htmlFor={field.name}>
																	Instructor First Name
																</FieldLabel>
																<Input
																	type="string"
																	id={field.name}
																	name={field.name}
																	placeholder="John"
																	value={field.state.value}
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

												<form.Field
													name="instructorLast"
													children={(field) => {
														const isInvalid =
															field.state.meta.isTouched &&
															!field.state.meta.isValid;

														return (
															<Field
																data-invalid={isInvalid}
																className="flex-1"
															>
																<FieldLabel htmlFor={field.name}>
																	Instructor Last Name
																</FieldLabel>
																<Input
																	type="string"
																	id={field.name}
																	name={field.name}
																	placeholder="Doe"
																	value={field.state.value}
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
											</Field>
											{/* !SECTION Instructor */}

											{/* SECTION Credits */}
											<form.Field
												name="credits"
												children={(field) => {
													const isInvalid =
														field.state.meta.isTouched &&
														!field.state.meta.isValid;

													return (
														<Field data-invalid={isInvalid} className="flex-1">
															<FieldLabel htmlFor={field.name}>
																Course Credits
															</FieldLabel>
															<Input
																type="number"
																placeholder="21"
																id={field.name}
																name={field.name}
																value={field.state.value}
																min={0}
																step={0.5}
																onBlur={field.handleBlur}
																onKeyDown={(e) => {
																	const keys = [
																		"Backspace",
																		"Delete",
																		"ArrowLeft",
																		"ArrowRight",
																		"Tab",
																	];
																	if (keys.includes(e.key)) return;

																	// prevents non-numeric non decimal from going to onChange event
																	if (!/^\d|^\./.test(e.key))
																		e.preventDefault();
																}}
																onChange={(e) => {
																	const val = e.target.valueAsNumber;

																	field.handleChange(
																		Number.isNaN(val) ? 0 : val,
																	);
																}}
																aria-invalid={isInvalid}
															/>
															{isInvalid && (
																<FieldError errors={field.state.meta.errors} />
															)}
														</Field>
													);
												}}
											/>
											{/* !SECTION Credits */}
										</FieldGroup>
									</CollapsibleContent>
								</Collapsible>
							</FieldGroup>
							{/* !SECTION Course Info */}

							<FieldSeparator className="my-2" />

							{/* SECTION Event Date/Time */}
							<FieldGroup>
								<FieldSet>
									<FieldLegend variant="label">Start and End Dates</FieldLegend>
									<FieldDescription>
										Course will only appear in the calendar between the selected
										start and end dates.
									</FieldDescription>

									{/* SECTION Start/End Dates */}
									<Field
										orientation="responsive"
										className="@md/field-group:items-start"
									>
										<form.Field
											name="startDate"
											children={(field) => {
												const isInvalid =
													field.state.meta.isTouched &&
													!field.state.meta.isValid;

												return (
													<Field data-invalid={isInvalid} className="flex-1">
														<FieldLabel htmlFor={field.name} required>
															Start Date
														</FieldLabel>
														<Input
															type="date"
															id={field.name}
															name={field.name}
															value={field.state.value}
															onBlur={field.handleBlur}
															onChange={(e) =>
																field.handleChange(e.target.value)
															}
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
											name="endDate"
											children={(field) => {
												const isInvalid =
													field.state.meta.isTouched &&
													!field.state.meta.isValid;

												return (
													<Field data-invalid={isInvalid} className="flex-1">
														<FieldLabel htmlFor={field.name} required>
															End Date
														</FieldLabel>
														<Input
															type="date"
															id={field.name}
															name={field.name}
															value={field.state.value}
															onBlur={field.handleBlur}
															onChange={(e) =>
																field.handleChange(e.target.value)
															}
															aria-invalid={isInvalid}
														/>
														{isInvalid && (
															<FieldError errors={field.state.meta.errors} />
														)}
													</Field>
												);
											}}
										/>
									</Field>
									{/* !SECTION Start/End Dates */}

									{/* SECTION Start/End Time */}
									<Field
										orientation="responsive"
										className="@md/field-group:items-start"
									>
										<form.Field
											name="startTime"
											children={(field) => {
												const isInvalid =
													field.state.meta.isTouched &&
													!field.state.meta.isValid;

												return (
													<Field data-invalid={isInvalid} className="flex-1">
														<FieldLabel htmlFor={field.name} required>
															Start Time
														</FieldLabel>
														<Input
															type="time"
															id={field.name}
															name={field.name}
															value={field.state.value}
															onBlur={field.handleBlur}
															onChange={(e) =>
																field.handleChange(e.target.value)
															}
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
											name="endTime"
											children={(field) => {
												const isInvalid =
													field.state.meta.isTouched &&
													!field.state.meta.isValid;

												return (
													<Field data-invalid={isInvalid} className="flex-1">
														<FieldLabel htmlFor={field.name} required>
															End Time
														</FieldLabel>
														<Input
															type="time"
															id={field.name}
															name={field.name}
															value={field.state.value}
															onBlur={field.handleBlur}
															onChange={(e) =>
																field.handleChange(e.target.value)
															}
															aria-invalid={isInvalid}
														/>
														{isInvalid && (
															<FieldError errors={field.state.meta.errors} />
														)}
													</Field>
												);
											}}
										/>
									</Field>
									{/* !SECTION Start/End Time */}
								</FieldSet>

								{/* SECTION Days */}
								<form.Field
									name="days"
									mode="array"
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;

										return (
											<FieldSet data-invalid={isInvalid}>
												<FieldLegend variant="label" required>
													Days of the Week
												</FieldLegend>
												<FieldDescription>
													What days of the week the course occurs on.
												</FieldDescription>

												<FieldGroup
													data-slot="checkbox-group"
													className="grid grid-cols-4"
												>
													{days.map((day) => (
														<Field
															key={day.value}
															data-invalid={isInvalid}
															orientation="horizontal"
															className="flex-1"
														>
															<Checkbox
																id={`course-day-${day.value}`}
																name={field.name}
																aria-invalid={isInvalid}
																checked={field.state.value.includes(day.value)}
																onCheckedChange={(checked) => {
																	if (checked) {
																		field.pushValue(day.value);
																	} else {
																		const index = field.state.value.indexOf(
																			day.value,
																		);
																		if (index > -1) {
																			field.removeValue(index);
																		}
																	}
																}}
															/>
															<FieldLabel htmlFor={`course-day-${day.value}`}>
																{day.label}
															</FieldLabel>
														</Field>
													))}
												</FieldGroup>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</FieldSet>
										);
									}}
								/>
								{/* !SECTION Days */}

								{/* SECTION Online */}
								<form.Field
									name="isOnline"
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;

										return (
											<Field data-invalid={isInvalid} orientation="horizontal">
												<Checkbox
													id={field.name}
													name={field.name}
													aria-invalid={isInvalid}
													checked={field.state.value}
													onCheckedChange={(checked) => {
														field.setValue(checked);
													}}
												/>
												<FieldLabel htmlFor={field.name}>
													Course is Online
												</FieldLabel>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>
								{/* !SECTION Online */}

								<FieldSeparator />

								{/* SECTION Color */}
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
															<Check className="text-white size-4" />
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
								{/* !SECTION Color */}
							</FieldGroup>
							{/* !SECTION Event Date/Time */}
						</form>
					</ScrollArea>
				)}

				<DialogFooter className="gap-2">
					<DialogClose
						onClick={() => {
							form.reset();
							setCourseSpecificOpen(true);
						}}
						render={<Button variant="outline" />}
					>
						Cancel
					</DialogClose>
					<Button disabled={isTermError} type="submit" form="course-add-form">
						Add Course
					</Button>
				</DialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
