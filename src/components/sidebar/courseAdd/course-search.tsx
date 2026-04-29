"use client";

import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import useUserStore from "@/stores/user-store";
import type { AssembledCourse, CourseResponse, Meeting } from "@/types/courses";

export default function CourseSearch({ courses }: { courses: CourseResponse }) {
	const selectedTerm = useUserStore((state) => state.activeTerm);
	const [coursesByTerm, setCoursesByTerm] = useState<Array<AssembledCourse>>(
		[],
	);
	const [showingCourses, setShowingCourses] = useState(true);
	const [sectionsCourseIndex, setSectionsCourseIndex] = useState(-1);

	useEffect(() => {
		if (typeof courses === "number") return;

		setCoursesByTerm(courses[selectedTerm] || []);
	}, [selectedTerm, courses]);

	if (typeof courses === "number")
		return (
			<p className="text-destructive bg-destructive/20 rounded-lg text-xs py-2 w-full text-center">
				Error Loading Courses
			</p>
		);

	if (coursesByTerm.length === 0)
		return (
			<p className="text-destructive bg-destructive/20 rounded-lg text-xs py-2 w-full text-center">
				Error Loading Courses
			</p>
		);

	return (
		<div>
			<Popover>
				<PopoverTrigger className="w-full rounded-lg border border-input text-left text-sm text-muted-foreground px-2 py-1 cursor-pointer">
					Select A {coursesByTerm[0].term_name} Course
				</PopoverTrigger>
				<PopoverContent align="start" style={{ width: "var(--anchor-width)" }}>
					{showingCourses && (
						<Fragment>
							<Input
								placeholder={`Search ${coursesByTerm[0].term_name} Courses...`}
							/>
							<Separator />
						</Fragment>
					)}
					<ScrollArea className="h-96">
						{showingCourses &&
							coursesByTerm.map((course, index) => (
								<button
									onClick={() => {
										setShowingCourses(false);
										setSectionsCourseIndex(index);
									}}
									key={`${course.course_id}-${course.course_code}`}
									type="button"
									className={clsx(
										"rounded-lg border border-border p-2 flex flex-row gap-2 items-center justify-between cursor-pointer w-full text-left",
										{
											"my-2": index !== 0,
										},
									)}
								>
									<div className="flex flex-col gap-2">
										<p>{course.course_title}</p>

										<div className="flex flex-row items-center text-muted-foreground gap-2">
											<p>{course.course_code.replaceAll("#", "")}</p>
											<Separator orientation="vertical" />
											<p>
												{course.credits} Credit
												{parseFloat(course.credits) > 1 && "s"}
											</p>
											<Separator orientation="vertical" />
											<p>
												{course.sections.length} Section
												{course.sections.length > 1 && "s"}
											</p>
										</div>
									</div>
									<ChevronRight className="size-4" />
								</button>
							))}

						{!showingCourses && (
							<Fragment>
								<div className="absolute top-0 left-0 p-2 rounded-b-md bg-accent border border-b-border w-full">
									<Button
										variant={"outline"}
										className={"w-full"}
										onClick={() => {
											setShowingCourses(true);
										}}
									>
										<ChevronLeft /> Back
									</Button>
								</div>

								{coursesByTerm[sectionsCourseIndex].sections
									.sort(
										(a, b) =>
											parseInt(a.section_code, 10) -
											parseInt(b.section_code, 10),
									)
									.map((section, index) => (
										<button
											type="button"
											key={section.section_id}
											className={cn(
												clsx(
													"rounded-lg border border-border p-2 flex flex-col gap-2 w-full text-left cursor-pointer",
													{
														"my-2": index !== 0,
														"mt-14": index === 0,
														// "border-yellow-500":
														// 	section.seats_available / section.seats_total <
														// 	0.5,
														// "border-destructive":
														// 	section.seats_available / section.seats_total <
														// 	0.25,
													},
												),
											)}
										>
											<div className="flex flex-row items-center gap-2 justify-between">
												<p>
													<span className="text-muted-foreground">
														Section:
													</span>{" "}
													{section.section_code}
												</p>

												{section.seats_available < 0 ? (
													<p className="text-destructive">
														<span>Waitlist:</span>{" "}
														{Math.abs(section.seats_available)}
													</p>
												) : (
													<p
														className={cn(
															clsx("", {
																"text-yellow-600":
																	section.seats_available /
																		section.seats_total <
																	0.5,
																"text-destructive":
																	section.seats_available /
																		section.seats_total <
																	0.25,
															}),
														)}
													>
														{section.seats_available} / {section.seats_total}{" "}
														<span className="text-muted-foreground">seats</span>
													</p>
												)}
											</div>

											<div>
												<p className="text-md font-bold w-full border border-transparent border-b-border pb-1 mb-1">
													Meetings:
												</p>
												{mergeMeetings(section.meetings).map((meeting) => (
													<div
														key={`${section.section_id}-${meeting.id}`}
														className="border border-transparent border-b-border border-dashed pb-1 mb-1 last:border-b-0 last:pb-0 last:mb-0"
													>
														<div className="flex flex-row items-center gap-1">
															<p>
																{meeting.days.map((day, index) => (
																	<Fragment key={day}>
																		{day}
																		{meeting.days.length === 2 &&
																			index === 0 && <span> & </span>}
																		{meeting.days.length >= 3 &&
																			index < meeting.days.length - 1 && (
																				<span>, </span>
																			)}
																	</Fragment>
																))}
															</p>
															<p className="text-muted-foreground">in</p>
															<Tooltip>
																<TooltipTrigger render={<p />}>
																	{meeting.building.short}
																</TooltipTrigger>
																<TooltipContent>
																	{meeting.building.long}
																</TooltipContent>
															</Tooltip>
															<p>{meeting.room.name}</p>
														</div>

														<div className="flex flex-row items-center gap-1">
															<p className="text-muted-foreground">From</p>
															<p>{meeting.start_time}</p>
															<p className="text-muted-foreground">to</p>
															<p>{meeting.end_time}</p>
														</div>

														<div className="flex flex-row items-center gap-1">
															<p className="text-muted-foreground">
																Instructed by{" "}
															</p>
															<p>
																{meeting.instructors
																	.map(
																		(instructor) =>
																			`${instructor.first_name} ${instructor.last_name}`,
																	)
																	.map((instructor, index) => (
																		<Fragment key={instructor}>
																			{instructor}
																			{meeting.instructors.length === 2 &&
																				index === 0 && <span> & </span>}
																			{meeting.instructors.length >= 3 &&
																				index <
																					meeting.instructors.length - 1 && (
																					<span>, </span>
																				)}
																		</Fragment>
																	))}
															</p>
														</div>
													</div>
												))}
											</div>
										</button>
									))}
							</Fragment>
						)}
					</ScrollArea>
				</PopoverContent>
			</Popover>
		</div>
	);
}

function mergeMeetings(meetings: Array<Meeting>) {
	const meetingsByTime: Array<Omit<Meeting, "day"> & { days: Array<string> }> =
		[];

	for (const meeting of meetings) {
		const startTime = meeting.start_time.slice(0, 5);
		const endTime = meeting.end_time.slice(0, 5);
		const building = meeting.building.short;
		const room = meeting.room.name;
		const instructors = meeting.instructors
			.flatMap(
				(instructor) => `${instructor.first_name}${instructor.last_name}`,
			)
			.join("");

		const meetingItem = meetingsByTime.find(
			(findMeeting) =>
				findMeeting.start_time === startTime &&
				findMeeting.end_time === endTime &&
				findMeeting.building.short === building &&
				findMeeting.room.name === room &&
				findMeeting.instructors
					.flatMap(
						(instructor) => `${instructor.first_name}${instructor.last_name}`,
					)
					.join("") === instructors,
		);

		if (!meetingItem) {
			meetingsByTime.push({
				...meeting,
				days: [meeting.day],
				start_time: startTime,
				end_time: endTime,
			});
		} else {
			meetingItem.days.push(meeting.day);
		}
	}

	return meetingsByTime;
}
