"use client";

import clsx from "clsx";
import { Edit, Palette, Replace, Trash } from "lucide-react";
import { Fragment } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
import useUserStore from "@/stores/user-store";
import type { CourseResponse } from "@/types/courses";
import type { EventCard, EventCardsObjectType } from "@/types/events";
import type { CourseEvent, NonCourseEvent } from "@/types/user-store";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuRadioGroup,
	ContextMenuRadioItem,
	ContextMenuSeparator,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from "./ui/context-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { Separator } from "./ui/separator";

const startHour = 6; // Inclusive, 6 AM
const endHour = 23; // Exclusive, 11 PM (up until 22:59)

const slots = 12; // 5 min per slot
const minsPerSlot = 60 / slots;
const cols = 7;
const rows = (endHour - startHour) * slots;
// ^ total hours * number of slots per hour to get total slots across all hours

const days = [
	{ long: "Sunday", short: "Sun" },
	{ long: "Monday", short: "Mon" },
	{ long: "Tuesday", short: "Tue" },
	{ long: "Wednesday", short: "Wed" },
	{ long: "Thursday", short: "Thu" },
	{ long: "Friday", short: "Fri" },
	{ long: "Saturday", short: "Sat" },
];

export default function ClassList({ courses }: { courses: CourseResponse }) {
	const activeTab = useUserStore((state) => state.getActiveTab());
	const unstructuredEvents = [
		...(activeTab.courseEvents || []),
		...(activeTab.nonCourseEvents || []),
	];
	const structuredEvents = transformEvents(unstructuredEvents);

	const today = new Date();
	const selectedDate = activeTab.selectedDate
		? new Date(activeTab.selectedDate)
		: new Date();

	const firstDayOfWeek = new Date(selectedDate);
	firstDayOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
	// ^ sets day of month to the "selected day of month - # days from Sunday"

	return (
		<div
			className="grid w-full max-w-full mb-4"
			style={{
				gridTemplateColumns: `5rem repeat(${cols},minmax(0, 1fr))`,
				gridTemplateRows: `3.25rem repeat(${rows},minmax(0, 1.25rem))`,
			}}
		>
			{/* Time sidebar */}
			<div className="row-start-2 row-span-full grid grid-rows-subgrid border-r">
				{Array.from({ length: endHour - startHour }).map((_, i) => {
					const hour = startHour + i;
					const hourPair = formatHourPair(hour);

					return (
						<Fragment key={hour}>
							<div
								className={clsx(
									"text-xs text-muted-foreground text-center",
									{ "border-t": i > 0 }, // skip border on first row
								)}
								style={{
									gridRow: `span ${slots / 2} / span ${slots / 2}`,
								}}
							>
								{hourPair.onHour}
							</div>

							<div
								className="text-xs text-muted-foreground text-center border-t"
								style={{
									gridRow: `span ${slots / 2} / span ${slots / 2}`,
								}}
							>
								{hourPair.onHalf}
							</div>
						</Fragment>
					);
				})}
			</div>

			{/* Day Header Bar */}
			<div className="col-span-full grid grid-cols-subgrid border-b bg-background sticky top-0">
				<span id="empty-day-spacer" className="border-r"></span>
				{days.map((day, i) => {
					const currentDate = new Date(firstDayOfWeek);
					currentDate.setDate(firstDayOfWeek.getDate() + i);

					const dataNumber = currentDate.getDate();

					const isToday =
						currentDate.getDate() === today.getDate() &&
						currentDate.getMonth() === today.getMonth() &&
						currentDate.getFullYear() === today.getFullYear();

					return (
						<div
							key={day.long}
							className={clsx(
								"flex justify-center items-center border-r text-sm gap-2",
								{ "text-primary": isToday },
							)}
						>
							<span className={!isToday ? "text-muted-foreground" : ""}>
								{day.short}
							</span>

							{dataNumber}
						</div>
					);
				})}
			</div>

			{/* Inner Grid Borders */}
			<div className="col-start-2 row-start-2 col-span-full row-span-full grid grid-cols-subgrid grid-rows-subgrid">
				{Array.from({ length: (endHour - startHour) * cols * 2 }).map(
					(_, i) => {
						const col = i % cols;
						const row = Math.floor(i / cols);

						return (
							<span
								key={`${col}-${row}`}
								className={clsx("border-r", {
									"border-t": row > 0, // skip top border so no double
								})}
								style={{
									gridRow: `span ${slots / 2} / span ${slots / 2}`,
								}}
							></span>
						);
					},
				)}
			</div>

			{/* Event Grid */}
			<div className="col-start-2 row-start-2 col-span-full row-span-full grid grid-cols-subgrid grid-rows-subgrid">
				{Object.keys(structuredEvents).map((key, i) =>
					structuredEvents[key as keyof EventCardsObjectType].map((event) => {
						const d = new Date(firstDayOfWeek);
						d.setDate(firstDayOfWeek.getDate() + i);

						if (d >= event.startDate && d <= event.endDate) {
							return (
								<HoverCard key={event.eventId}>
									<ContextMenu>
										<HoverCardTrigger
											render={
												<ContextMenuTrigger
													render={
														<div
															className="border-l-2 rounded-sm p-2 wrap-break-word overflow-y-scroll"
															style={{
																gridArea: `${event.cardTimeOffset} / ${event.cardDayOffset} / span ${event.cardSpanHeight} / ${event.cardDayOffset}`,
																backgroundColor: `color-mix(in oklab, ${event.color} 20%, transparent)`,
																borderColor: event.color,
															}}
														/>
													}
												/>
											}
										>
											<div className="flex flex-col gap-2">
												<p>{event.title}</p>
												<p
													className={clsx("text-sm", {
														"italic text-muted-foreground":
															event.description.length === 0,
													})}
												>
													{event.description.length === 0
														? "No Description"
														: event.description}
												</p>

												<Separator className="bg-black/20" />

												<div className="text-sm text-muted-foreground flex flex-col items-center gap-1">
													<span className="text-foreground">
														{event.startTime.toLocaleTimeString("en-US", {
															hour12: true,
															hour: "2-digit",
															minute: "2-digit",
														})}
													</span>
													to
													<span className="text-foreground">
														{event.endTime.toLocaleTimeString("en-US", {
															hour12: true,
															hour: "2-digit",
															minute: "2-digit",
														})}
													</span>
												</div>
											</div>
										</HoverCardTrigger>
										<HoverCardContent
											side="right"
											className="flex flex-col gap-1"
										>
											{event.isCourse ? (
												<>
													<p>
														<PrimaryText>Course: </PrimaryText>
														{event.title}
													</p>
													<p>
														<PrimaryText>Credits: </PrimaryText>
														{event.credits}
													</p>
													{event.seatsAvailable === -1 &&
													event.seatsTotal === -1 ? (
														<p>
															<PrimaryText>Seats: </PrimaryText>{" "}
															<span className="italic text-muted-foreground">
																information not available
															</span>
														</p>
													) : (
														<p>
															<PrimaryText>Seats: </PrimaryText>
															{event.seatsAvailable}/{event.seatsTotal}
														</p>
													)}
													<p>
														<PrimaryText>Section: </PrimaryText>
														{event.sectionCode}
													</p>
													<p>
														<PrimaryText>Campus: </PrimaryText>
														{event.campus}
													</p>
													<p>
														<PrimaryText>Building: </PrimaryText>
														{event.building.long}
													</p>
													<p>
														<PrimaryText>Room: </PrimaryText>
														{event.room}
													</p>
													<Separator className="bg-black/20" />
													<p>
														<PrimaryText>Instructors: </PrimaryText>
														{event.instructors.map((instructor) => (
															<Fragment
																key={`${instructor.firstName}-${instructor.lastName}`}
															>
																{instructor.firstName} {instructor.lastName}
															</Fragment>
														))}
													</p>
												</>
											) : (
												<p>
													<PrimaryText>Location: </PrimaryText>
													{event.location}
												</p>
											)}
										</HoverCardContent>
										<ContextMenuContent>
											<ContextMenuItem disabled>
												<Edit /> Edit
											</ContextMenuItem>

											<ContextMenuItem disabled>
												<Palette /> Change Color
											</ContextMenuItem>

											{event.isCourse && event.seatsTotal !== -1 && (
												<ContextMenuSub>
													<ContextMenuSubTrigger>
														<Replace /> Swap Section
													</ContextMenuSubTrigger>
													<ContextMenuSubContent>
														<ContextMenuRadioGroup>
															<ContextMenuRadioItem value={"section1"}>
																1
															</ContextMenuRadioItem>
														</ContextMenuRadioGroup>
													</ContextMenuSubContent>
												</ContextMenuSub>
											)}

											<ContextMenuSeparator />

											<ContextMenuItem variant="destructive">
												<Trash /> Delete
											</ContextMenuItem>
										</ContextMenuContent>
									</ContextMenu>
								</HoverCard>
							);
						} else {
							return null;
						}
					}),
				)}
			</div>
		</div>
	);
}

function formatHourPair(hour: number) {
	const period = hour >= 12 ? "PM" : "AM";
	const displayHour = hour % 12 === 0 ? 12 : hour % 12;
	return {
		onHour: `${displayHour}:00 ${period}`,
		onHalf: `${displayHour}:30 ${period}`,
	};
}

function transformEvents(events: Array<CourseEvent | NonCourseEvent>) {
	const transformedEvents = {
		sunday: [],
		monday: [],
		tuesday: [],
		wednesday: [],
		thursday: [],
		friday: [],
		saturday: [],
	} as EventCardsObjectType;

	events.forEach((event) => {
		if ("section" in event) {
			event.section.meetings.forEach((meeting) => {
				const startTime = new Date(`2026-08-11T${meeting.start_time}`);
				const endTime = new Date(`2026-08-11T${meeting.end_time}`);
				const determinedDayOffset = determineCardDayOffset(meeting.day);

				// outside of cal boundaries
				if (startTime.getHours() >= endHour) return;
				if (endTime.getHours() < startHour) return;
				if (determinedDayOffset === -1) return;

				const eventGeneric = {
					eventId: `${event.eventId}-${meeting.id}-${meeting.day}-${meeting.start_time}-${meeting.end_time}`,
					startDate: new Date(event.section.start_date),
					endDate: new Date(event.section.end_date),
					startTime,
					endTime,
					cardTimeOffset: determineCardTimeOffset(startTime),
					cardDayOffset: determinedDayOffset,
					cardSpanHeight: determineCardSpanHeight(startTime, endTime),
					color: event.color,

					title: `${event.course_code}-${event.section.section_code}`,
					description: `${event.course_title}`,
					isCourse: true,
					credits: parseFloat(event.credits),
					seatsAvailable: event.section.seats_available,
					seatsTotal: event.section.seats_total,
					sectionCode: event.section.section_code,
					campus: meeting.campus,
					building: {
						long: meeting.building.long,
						short: meeting.building.short,
					},
					room: meeting.room.name || "",
					instructors: meeting.instructors.map((i) => {
						return { firstName: i.first_name, lastName: i.last_name };
					}),
					courseId: event.course_id,
					sectionId: event.section.section_id,
				} as EventCard;

				transformedEvents[determineCardDay(meeting.day)].push(eventGeneric);
			});
		} else {
			event.meetings.forEach((meeting) => {
				const startTime = new Date(`2026-08-11T${meeting.start_time}`);
				const endTime = new Date(`2026-08-11T${meeting.end_time}`);
				const determinedDayOffset = determineCardDayOffset(meeting.day);

				// outside of cal boundaries
				if (startTime.getHours() >= endHour) return;
				if (endTime.getHours() < startHour) return;
				if (determinedDayOffset === -1) return;

				const eventGeneric = {
					eventId: `${event.eventId}-${meeting.id}-${meeting.day}-${meeting.start_time}-${meeting.end_time}`,
					startDate: new Date(event.startDate),
					endDate: new Date(event.endDate),
					startTime,
					endTime,
					cardTimeOffset: determineCardTimeOffset(startTime),
					cardDayOffset: determinedDayOffset,
					cardSpanHeight: determineCardSpanHeight(startTime, endTime),
					color: event.color,

					title: event.title,
					description: event.description || "",
					isCourse: false,
					credits: event.credits,
					location: meeting.location || "",
				} as EventCard;

				transformedEvents[determineCardDay(meeting.day)].push(eventGeneric);
			});
		}
	});

	return transformedEvents;
}

function roundMinutes(minutes: number) {
	return Math.round(minutes / minsPerSlot) * minsPerSlot;
	// ^ minutes rounded to nearest incr of slot (ie w/ 12 slots, mins will round to nearest multiple of 5)
}

function determineCardTimeOffset(time: Date) {
	const timeHour = time.getHours();
	const timeMinutes = roundMinutes(time.getMinutes());

	const adjustedHour = timeHour - startHour;
	const hourOffset = adjustedHour * slots; // top slot of hour

	const minutesOffset = timeMinutes / minsPerSlot;

	return hourOffset + minutesOffset + 1;
}

function determineCardSpanHeight(startTime: Date, endTime: Date) {
	const startHour = startTime.getHours();
	const endHour = endTime.getHours();
	const startMinutes = roundMinutes(startTime.getMinutes());
	const endMinutes = roundMinutes(endTime.getMinutes());

	const hourSpan = (endHour - startHour) * slots;

	const minutesDiff = Math.abs(endMinutes - startMinutes);
	const minutesSpan = minutesDiff / minsPerSlot;

	return hourSpan + minutesSpan;
}

function determineCardDayOffset(day: string) {
	switch (day) {
		case "Sunday":
		case "sun":
			return 1;
		case "Monday":
		case "mon":
			return 2;
		case "Tuesday":
		case "tue":
			return 3;
		case "Wednesday":
		case "wed":
			return 4;
		case "Thursday":
		case "thu":
			return 5;
		case "Friday":
		case "fri":
			return 6;
		case "Saturday":
		case "sat":
			return 7;
	}
	return -1;
}

function determineCardDay(day: string) {
	switch (day) {
		case "Sunday":
		case "sun":
			return "sunday";
		case "Monday":
		case "mon":
			return "monday";
		case "Tuesday":
		case "tue":
			return "tuesday";
		case "Wednesday":
		case "wed":
			return "wednesday";
		case "Thursday":
		case "thu":
			return "thursday";
		case "Friday":
		case "fri":
			return "friday";
		case "Saturday":
		case "sat":
			return "saturday";
	}
	return "sunday";
}

function PrimaryText({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return <span className={cn("text-primary", className)}>{children}</span>;
}
