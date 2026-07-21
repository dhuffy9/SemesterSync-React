"use client";

import clsx from "clsx";
import { ArrowLeft, ChevronRightIcon, PlusIcon, XIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { TermResponse } from "@/data/terms";
import { cn } from "@/lib/utils";
import type {
	AssembledCourseSingleSection,
	CourseResponse,
} from "@/types/courses";
import CourseAddList, { MeetingsDisplay } from "./course-add-list";

const createCourseVariants = (shouldReduceMotion: boolean | null) => ({
	initial: shouldReduceMotion
		? { opacity: 1, x: 0 }
		: { opacity: 0, x: "-100%" },
	animate: { opacity: 1, x: 0 },
	exit: shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: "-100%" },
});

const createSectionVariants = (shouldReduceMotion: boolean | null) => ({
	initial: shouldReduceMotion
		? { opacity: 1, x: 0 }
		: { opacity: 0, x: "100%" },
	animate: { opacity: 1, x: 0 },
	exit: shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: "100%" },
});

const TRANSITION = { duration: 0.2, type: "spring" as const, bounce: 0.1 };

const selectOptions = [
	{
		title: "Quick Add Course",
		description:
			"All the details from the course and section you select will automatically be added to your schedule.",
		key: "quick",
	},
	{
		title: "Manually Add Course",
		description:
			"Gives you the ability to fill in all of the course details, you can still search for existing courses to prefill the inputs.",
		key: "manual",
	},
	{
		title: "Add Non-Course Event",
		description:
			"Ability to add non-course events such as when you have work, requires less information.",
		key: "event",
	},
];

export default function EventAddModalClient({
	termsRes,
	courses,
}: {
	termsRes: TermResponse;
	courses: CourseResponse;
}) {
	const [selectedOption, setSelectedOption] = useState("none");
	const [selectedCourse, setSelectedCourse] = useState<
		Array<AssembledCourseSingleSection>
	>([]);
	const [popoverOpen, setPopoverOpen] = useState(false);

	const shouldReduceMotion = useReducedMotion();
	const courseVariants = createCourseVariants(shouldReduceMotion);
	const sectionVariants = createSectionVariants(shouldReduceMotion);

	return (
		<AlertDialog>
			<AlertDialogTrigger render={<Button />}>
				<PlusIcon /> Add Event
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader className="flex flex-row items-center gap-2 justify-between">
					<AlertDialogTitle className="pt-1">Add Event</AlertDialogTitle>
					<AlertDialogCancel size={"icon-sm"} variant={"ghost"}>
						<XIcon />
					</AlertDialogCancel>
				</AlertDialogHeader>

				<div className="relative pb-2 overflow-hidden">
					<AnimatePresence initial={false} mode="popLayout">
						{selectedOption === "none" && (
							<motion.div
								animate="animate"
								initial="initial"
								exit="exit"
								key="none"
								variants={courseVariants}
								transition={TRANSITION}
								className="flex flex-col gap-2"
							>
								{selectOptions.map((option) => (
									<motion.button
										className="rounded-md border border-border p-2 text-left hover:shadow flex flex-row items-center gap-2 cursor-pointer"
										key={option.key}
										onClick={() => setSelectedOption(option.key)}
										whileTap={{ scale: shouldReduceMotion ? 1 : 0.98 }}
									>
										<div>
											<p>{option.title}</p>
											<p className="text-muted-foreground text-sm">
												{option.description}
											</p>
										</div>
										<ChevronRightIcon className="size-8" />
									</motion.button>
								))}
							</motion.div>
						)}

						{selectedOption === "quick" && (
							<motion.div
								animate="animate"
								initial="initial"
								exit="exit"
								key="quick"
								variants={sectionVariants}
								transition={TRANSITION}
								className="flex flex-col gap-2"
							>
								<div className="flex flex-row items-center gap-2 justify-between">
									<p>Quick Add</p>
									<Button
										onClick={() => {
											setSelectedOption("none");
											setSelectedCourse([]);
										}}
										variant="secondary"
									>
										<ArrowLeft /> Back
									</Button>
								</div>

								<div className="flex flex-col gap-2 rounded-md border border-border p-2">
									<div className="flex flex-col gap-2">
										<ScrollArea className="h-24">
											{selectedCourse.length === 0 ? (
												<div className="flex flex-col gap-1 h-24 justify-center text-center">
													<p className="">No Courses Selected</p>
													<p className="text-muted-foreground">
														Select some from the list below to get started!
													</p>
												</div>
											) : (
												selectedCourse.map((course) => (
													<Popover
														key={`${course.course_id}-${course.section.section_id}`}
													>
														<PopoverTrigger className="cursor-pointer w-full text-left">
															{course.course_code}-{course.section.section_code}
															: {course.course_title}
														</PopoverTrigger>
														<PopoverContent className="sm:w-md">
															<div className="flex flex-col gap-2">
																<div className="flex flex-row items-baseline gap-1 justify-between">
																	<p>{course.course_title}</p>
																	<p>
																		{course.course_code}-
																		{course.section.section_code}
																	</p>
																</div>
																<div className="flex flex-row items-baseline gap-1">
																	<p>
																		{course.credits}{" "}
																		<span className="text-muted-foreground">
																			credits
																		</span>
																	</p>

																	<Separator orientation="vertical" />

																	{course.section.seats_available > -1 ? (
																		<p
																			className={cn(
																				clsx("", {
																					"text-yellow-600":
																						course.section.seats_available /
																							course.section.seats_total <
																						0.5,
																					"text-destructive":
																						course.section.seats_available /
																							course.section.seats_total <
																						0.25,
																				}),
																			)}
																		>
																			{course.section.seats_available} /{" "}
																			{course.section.seats_total}{" "}
																			<span className="text-muted-foreground">
																				{course.section.seats_available > -1
																					? "seats"
																					: "on waitlist"}
																			</span>
																		</p>
																	) : (
																		<p className="text-destructive">
																			{Math.abs(course.section.seats_available)}{" "}
																			on waitlist
																		</p>
																	)}
																</div>
															</div>

															<Separator />

															<MeetingsDisplay section={course.section} />
														</PopoverContent>
													</Popover>
												))
											)}
										</ScrollArea>
										<div className="flex flex-row items-center gap-1 w-full">
											<Button
												disabled={selectedCourse.length === 0}
												variant={
													selectedCourse.length === 0 ? "secondary" : "default"
												}
												className="flex-1"
											>
												<PlusIcon /> Quick Add
											</Button>
											<Button
												disabled
												variant="secondary"
												className={clsx("", {
													"text-yellow-600":
														selectedCourse.reduce(
															(acc, curr) => acc + parseFloat(curr.credits),
															0,
														) > 18,
												})}
											>
												{selectedCourse.reduce(
													(acc, curr) => acc + parseFloat(curr.credits),
													0,
												)}{" "}
												credits
											</Button>
										</div>
									</div>
								</div>

								<CourseAddList
									courses={courses}
									externalSelectedCourse={selectedCourse}
									setExternalSelectedCourse={setSelectedCourse}
									multiple
								/>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	);
}
