/** biome-ignore-all lint/correctness/noChildrenProp: Preferred method for using tanstack form */
"use client";

import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import z from "zod";
import { termQueryOptions } from "@/queries/terms";
import useUserStore from "@/stores/user-store";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "../ui/field";
import { Input } from "../ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Skeleton } from "../ui/skeleton";

const days = [
	{ label: "Monday", value: "mon" },
	{ label: "Tuesday", value: "tue" },
	{ label: "Wednesday", value: "wed" },
	{ label: "Thursday", value: "thu" },
	{ label: "Friday", value: "fri" },
	{ label: "Saturday", value: "sat" },
	{ label: "Sunday", value: "sun" },
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
	section: z.number(),
	courseTitle: z.string(),
	instructor: z.string(),
	room: z.string(),
	credits: z.number(),
	color: z.string(),
});

export default function CourseAddModal() {
	const selectedTerm = useUserStore((state) => state.activeTerm);

	const form = useForm({
		defaultValues: {
			term: selectedTerm,
			startDate: "",
			endDate: "",
			courseNumber: "",
			section: 0,
			courseTitle: "",
			instructor: "",
			room: "",
			days: [] as string[],
			credits: 0,
			startTime: "",
			endTime: "",
			isOnline: false,
			color: "#4285F4",
		},
		validators: {
			onSubmit: addCourseFormSchema,
		},
		onSubmit: (values) => {
			console.log(values);
		},
	});

	const { data, isLoading, isError } = useQuery(termQueryOptions);
	const [terms, setTerms] = useState<Record<string, string>>({});

	useEffect(() => {
		if (data?.data.terms) {
			setTerms(
				data.data.terms.reduce(
					(allTerms, term) => {
						allTerms[term.termCode] = term.displayName;
						return allTerms;
					},
					{} as Record<string, string>,
				),
			);
		}
	}, [data]);

	return (
		<Dialog>
			<DialogTrigger render={<Button />}>
				<PlusIcon /> Add Course
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Course</DialogTitle>
				</DialogHeader>

				{isError && (
					<div className="w-full bg-destructive/20 rounded-md p-4 gap-2 flex flex-col items-center align-middle text-destructive border border-destructive">
						<p className="text-lg font-bold">Error Loading Terms</p>
						<p>There was an error loading the terms, please try again.</p>
						<p>If it continues please contact support.</p>
					</div>
				)}

				{!isError && (
					<form
						id="course-add-form"
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
					>
						<FieldGroup>
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
											{isLoading ? (
												<Skeleton className="w-full h-8" />
											) : (
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
											)}
											<FieldDescription>
												Auto populated from selected term. Course will only show
												when term is selected.
											</FieldDescription>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>

							<FieldSet>
								<FieldLegend variant="label">Start and End Dates</FieldLegend>
								<FieldDescription>
									Course will only appear in the calendar between the selected
									start and end dates.
								</FieldDescription>

								<Field
									orientation="responsive"
									className="@md/field-group:items-start"
								>
									<form.Field
										name="startDate"
										children={(field) => {
											const isInvalid =
												field.state.meta.isTouched && !field.state.meta.isValid;

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
										name="endDate"
										children={(field) => {
											const isInvalid =
												field.state.meta.isTouched && !field.state.meta.isValid;

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
								</Field>

								<Field
									orientation="responsive"
									className="@md/field-group:items-start"
								>
									<form.Field
										name="startTime"
										children={(field) => {
											const isInvalid =
												field.state.meta.isTouched && !field.state.meta.isValid;

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
										name="endTime"
										children={(field) => {
											const isInvalid =
												field.state.meta.isTouched && !field.state.meta.isValid;

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
								</Field>
							</FieldSet>

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
						</FieldGroup>
					</form>
				)}

				<DialogFooter className="gap-2">
					<DialogClose
						onClick={() => form.reset()}
						render={<Button variant="outline" />}
					>
						Cancel
					</DialogClose>
					<Button disabled={isError} type="submit" form="course-add-form">
						Add Course
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
