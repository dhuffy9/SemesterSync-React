"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Fragment, useCallback, useEffect, useState } from "react";
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

	const [searchQuery, setSearchQuery] = useState("");
	const [filteredCourses, setFilteredCourses] = useState<
		Array<AssembledCourse>
	>([]);

	const [coursesByTerm, setCoursesByTerm] = useState<Array<AssembledCourse>>(
		[],
	);
	const [showingCourses, setShowingCourses] = useState(true);

	useEffect(() => {
		if (typeof courses === "number") return;

		setCoursesByTerm(courses[selectedTerm] || []);
		setFilteredCourses(courses[selectedTerm] || []);
	}, [selectedTerm, courses]);

	useEffect(() => {
		if (searchQuery === "") return;

		const filteredCourses = coursesByTerm.filter(
			(course) =>
				course.course_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				course.course_code.toLowerCase().includes(searchQuery.toLowerCase()),
		);

		setFilteredCourses(filteredCourses);
	}, [searchQuery, coursesByTerm.filter]);

	const [showCourseSectionId, setShowCourseSectionId] = useState(-1);
	const [selectedCourse, setSelectedCourse] = useState(-1);
	const [selectedSection, setSelectedSection] = useState(-1);
	const [popoverOpen, setPopoverOpen] = useState(false);

	const [scrollParentRef, setScrollParentRef] = useState<HTMLDivElement | null>(
		null,
	);
	const virtualizer = useVirtualizer({
		count: filteredCourses.length,
		getScrollElement: () => scrollParentRef,
		estimateSize: () => 75,
		measureElement: (element) => element.getBoundingClientRect().height,
		gap: 8,
		overscan: 2,
	});
	const virtualItems = virtualizer.getVirtualItems();

	const refCallback = useCallback((node: HTMLDivElement) => {
		if (node) {
			setScrollParentRef(node);
		}
	}, []);

	const getCourse = () => {
		return coursesByTerm.find((course) => course.course_id === selectedCourse);
	};

	const getSection = () => {
		return getCourse()?.sections.find(
			(section) => section.section_id === selectedSection,
		);
	};

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
			<Popover onOpenChange={setPopoverOpen} open={popoverOpen}>
				<PopoverTrigger className="w-full rounded-lg border border-input text-left text-sm text-muted-foreground px-2 py-1 cursor-pointer">
					{selectedCourse > -1
						? `${getCourse()?.course_code}-${getSection()?.section_code}: ${getCourse()?.course_title}`
						: `Select A ${coursesByTerm[0].term_name} Course`}
				</PopoverTrigger>
				<PopoverContent align="start" style={{ width: "var(--anchor-width)" }}>
					{showingCourses && (
						<Fragment>
							<Input
								placeholder={`Search ${coursesByTerm[0].term_name} Courses...`}
								value={searchQuery}
								onChange={(e) => {
									setSearchQuery(e.target.value);
								}}
							/>
							<Separator />
						</Fragment>
					)}
					<ScrollArea className="h-96" ref={refCallback}>
						{filteredCourses.length === 0 && (
							<div className="text-center w-full text-muted-foreground">
								<p>No Courses Found.</p>
								<p className="text-xs">
									Tip: you can search for either the course code or course title
								</p>
							</div>
						)}
						{showingCourses && (
							<div
								style={{ height: `${virtualizer.getTotalSize()}px` }}
								className="relative w-full"
							>
								{virtualItems.map((vItem) => {
									const course = filteredCourses[vItem.index];

									return (
										<div
											key={vItem.key}
											className="absolute top-0 left-0 w-full"
											style={{
												transform: `translateY(${vItem.start}px)`,
												height: `${vItem.size}px`,
											}}
										>
											<button
												ref={virtualizer.measureElement}
												data-index={vItem.index}
												onClick={() => {
													setShowingCourses(false);
													setShowCourseSectionId(course.course_id);
												}}
												key={`${course.course_id}-${course.course_code}`}
												type="button"
												className={clsx(
													"rounded-lg border border-border p-2 flex flex-row gap-2 items-center justify-between cursor-pointer w-full text-left",
													{
														// "my-2": vItem.index !== 0,
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
										</div>
									);
								})}
							</div>
						)}

						{!showingCourses && (
							<Fragment>
								<div className="absolute top-0 left-0 p-2 rounded-b-md bg-accent border border-b-border w-full">
									<Button
										variant={"outline"}
										className={"w-full"}
										onClick={() => {
											setShowingCourses(true);
											virtualizer.scrollToIndex(
												filteredCourses.findIndex(
													(course) => course.course_id === showCourseSectionId,
												) + 4,
											);
										}}
									>
										<ChevronLeft /> Back
									</Button>
								</div>

								{coursesByTerm
									.find((course) => course.course_id === showCourseSectionId)
									?.sections.sort(
										(a, b) =>
											parseInt(a.section_code, 10) -
											parseInt(b.section_code, 10),
									)
									.map((section, index) => (
										<button
											type="button"
											key={section.section_id}
											onClick={() => {
												setSelectedCourse(showCourseSectionId);
												setSelectedSection(section.section_id);
												setShowingCourses(true);
												setPopoverOpen(false);
											}}
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
														{Math.abs(section.seats_available)}
														<span> on waitlist</span>
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
																			index < meeting.days.length - 2 && (
																				<span>, </span>
																			)}
																		{meeting.days.length >= 3 &&
																			index === meeting.days.length - 2 && (
																				<span> & </span>
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
															<p>
																{meeting.start_time.toLocaleTimeString(
																	"en-US",
																	{ hour: "2-digit", minute: "2-digit" },
																)}
															</p>
															<p className="text-muted-foreground">to</p>
															<p>
																{meeting.end_time.toLocaleTimeString("en-US", {
																	hour: "2-digit",
																	minute: "2-digit",
																})}
															</p>
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
	const meetingsByTime: Array<
		Omit<Meeting, "day" | "start_time" | "end_time"> & {
			days: Array<string>;
			start_time: Date;
			end_time: Date;
		}
	> = [];

	for (const meeting of meetings) {
		const startTime = new Date(`2026-04-29T${meeting.start_time}`);
		const endTime = new Date(`2026-04-29T${meeting.end_time}`);
		const building = meeting.building.short;
		const room = meeting.room.name;
		const instructors = meeting.instructors
			.flatMap(
				(instructor) => `${instructor.first_name}${instructor.last_name}`,
			)
			.join("");

		const meetingItem = meetingsByTime.find(
			(findMeeting) =>
				findMeeting.start_time.toString() === startTime.toString() &&
				findMeeting.end_time.toString() === endTime.toString() &&
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
