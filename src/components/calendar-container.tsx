"use client";

import clsx from "clsx";
import { Edit, Palette, Trash } from "lucide-react";
import { useState } from "react";
import { Fragment } from "react/jsx-runtime";
import type { TermResponse } from "@/data/terms";
import { cn } from "@/lib/utils";
import type { Event } from "@/schemas/events";
import useUserStore from "@/stores/user-store";
import type { AssembledCourse, CourseResponse } from "@/types/courses";
import type { CalendarCard, CalendarCards } from "@/types/events";
import { CalendarCardUI } from "./events/calendar-card";
import DangerModal from "./modals/danger";
import EditColorModal from "./modals/events/edit-color";
import EditEventModal from "./modals/events/edit-event/edit-event";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "./ui/context-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { Separator } from "./ui/separator";
import { toast } from "./ui/toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const startHour = 6; // Inclusive, 6 AM
const endHour = 23; // Exclusive, 11 PM (up until 22:59)

const slots = 6; // 10 min per slot
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

export default function ClassList({
	terms,
	courses,
}: {
	terms: TermResponse;
	courses: CourseResponse;
}) {
	const activeTab = useUserStore((state) => state.getActiveTab());
	const activeTerm = useUserStore((state) => state.activeTerm);
	const events = useUserStore((state) => state.getEvents(state.activeTab));
	const removeEvent = useUserStore((state) => state.removeEvent);

	const today = new Date();
	const selectedDate = activeTab.selectedDate
		? new Date(activeTab.selectedDate)
		: new Date();

	const firstDayOfWeek = new Date(selectedDate);
	firstDayOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
	// ^ sets day of month to the "selected day of month - # days from Sunday"

	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isColorModalOpen, setIsColorModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [modalEvent, setModalEvent] = useState<CalendarCard>();

	if (typeof courses === "number" || typeof terms === "number")
		return <p>Error loading course/terms</p>;

	const structuredEvents = structureEventCards(events, activeTerm, courses);

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
				{structuredEvents.map((event) => {
					const d = new Date(firstDayOfWeek);
					d.setDate(firstDayOfWeek.getDate() + event.columnOffset);

					if (d <= event.startDate || d >= event.endDate) return null;

					return (
						<HoverCard key={event.key}>
							<ContextMenu>
								<HoverCardTrigger
									render={
										<ContextMenuTrigger
											style={{
												gridArea: `${event.rowOffset} / ${event.columnOffset} / span ${event.spanHeight} / ${event.columnOffset}`,
											}}
										>
											<CalendarCardUI
												event={{
													title: event.title,
													description: event.description,
													startTime: event.startTime,
													endTime: event.endTime,
													color: event.color,
												}}
											/>
										</ContextMenuTrigger>
									}
								/>

								<HoverCardContent side="right" className="flex flex-col gap-1">
									{event.kind !== "personal" ? (
										<>
											<p>
												<PrimaryText>Course: </PrimaryText>
												{event.title}
											</p>
											<p>
												<PrimaryText>Credits: </PrimaryText>
												{event.credits}
											</p>
											{event.kind === "linked-course" && (
												<p
													className={cn(
														clsx("", {
															"text-yellow-600":
																event.seatsAvailable / event.seatsTotal < 0.5,
															"text-destructive":
																event.seatsAvailable / event.seatsTotal < 0.25,
														}),
													)}
												>
													<PrimaryText>Seats: </PrimaryText>
													{event.seatsAvailable > -1
														? `${event.seatsAvailable}/${event.seatsTotal}`
														: `${Math.abs(event.seatsAvailable)} on waitlist`}
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
											{event.kind === "linked-course" ? (
												<span>
													<PrimaryText>Building: </PrimaryText>
													<Tooltip>
														<TooltipTrigger>
															{event.building.short}
														</TooltipTrigger>
														<TooltipContent>
															{event.building.long}
														</TooltipContent>
													</Tooltip>
												</span>
											) : (
												<p>
													<PrimaryText>Building: </PrimaryText>
													{event.building}
												</p>
											)}
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
											<span
												className={
													event.location ? "" : "italic text-muted-foreground"
												}
											>
												{event.location
													? event.location
													: "No location provided"}
											</span>
										</p>
									)}
								</HoverCardContent>

								<ContextMenuContent>
									<ContextMenuItem
										onClick={() => {
											setIsEditModalOpen(true);
											setModalEvent(event);
										}}
									>
										<Edit /> Edit
									</ContextMenuItem>

									<ContextMenuItem
										onClick={() => {
											setIsColorModalOpen(true);
											setModalEvent(event);
										}}
									>
										<Palette /> Change Color
									</ContextMenuItem>

									<ContextMenuSeparator />

									<ContextMenuItem
										variant="destructive"
										onClick={(e) => {
											if (e.shiftKey) {
												removeEvent(activeTab.id, event.id);
												toast.add({
													title: "Event Deleted Successfully",
													type: "success",
												});
											} else {
												setIsDeleteModalOpen(true);
												setModalEvent(event);
											}
										}}
									>
										<Trash /> Delete
									</ContextMenuItem>
								</ContextMenuContent>
							</ContextMenu>
						</HoverCard>
					);
				})}
			</div>

			{modalEvent && (
				<EditEventModal
					terms={terms}
					courses={courses}
					eventId={modalEvent.id}
					open={isEditModalOpen}
					onOpenChange={setIsEditModalOpen}
					cancelOnClick={() => setModalEvent(undefined)}
					actionSecondaryOnClick={() => setModalEvent(undefined)}
				/>
			)}

			{modalEvent && (
				<DangerModal
					type="delete"
					isModalOpen={isDeleteModalOpen}
					onOpenChange={setIsDeleteModalOpen}
					trigger={null}
					titleChildren={`Delete ${modalEvent.title}`}
					descriptionChildren={
						<>
							You are about to delete this time slot
							{modalEvent.meetingCount > 1 && (
								<>
									, and{" "}
									<span className="font-bold">
										{modalEvent.meetingCount - 1} other
									</span>{" "}
									associated time slot
									{modalEvent.meetingCount > 2 && "s"}
								</>
							)}
						</>
					}
					cancelOnClick={() => setModalEvent(undefined)}
					actionChildren="Delete Event"
					actionOnClick={() => {
						removeEvent(activeTab.id, modalEvent.id);
						setModalEvent(undefined);
						toast.add({
							title: "Event Deleted Successfully",
							type: "success",
						});
					}}
				/>
			)}

			{modalEvent && (
				<EditColorModal
					courses={courses}
					eventId={modalEvent.id}
					open={isColorModalOpen}
					onOpenChange={setIsColorModalOpen}
					cancelOnClick={() => setModalEvent(undefined)}
					actionSecondaryOnClick={() => setModalEvent(undefined)}
				/>
			)}
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

function structureEventCards(
	events: Array<Event>,
	activeTerm: string,
	courses: Record<string, Array<AssembledCourse>>,
) {
	const structuredEvents: CalendarCards = [];

	for (const event of events) {
		switch (event.kind) {
			case "linked-course": {
				if (event.termCode !== activeTerm) continue;
				const courseData = courses[activeTerm].find(
					(course) => course.course_id === event.courseId,
				);
				if (!courseData) continue;
				const sectionData = courseData.sections.find(
					(section) => section.section_id === event.sectionId,
				);
				if (!sectionData) continue;

				for (const meeting of sectionData.meetings) {
					const startDate = new Date(sectionData.start_date);
					const endDate = new Date(sectionData.end_date);
					const startTime = new Date(`2026-08-13T${meeting.start_time}`);
					const endTime = new Date(`2026-08-13T${meeting.end_time}`);

					if (startTime.getHours() >= endHour) continue;
					if (endTime.getHours() < startHour) continue;

					const columnOffset = determineCardColumnOffset(meeting.day);
					const rowOffset = determineCardRowOffset(startTime);
					const spanHeight = determineCardSpanHeight(startTime, endTime);

					if (columnOffset === -1) continue;

					structuredEvents.push({
						id: event.eventId,
						key: `${event.eventId}-${meeting.day}-${startTime.toString()}-${endTime.toString()}`,
						meetingCount: sectionData.meetings.length,

						title: `${courseData.course_code}-${sectionData.section_code}`,
						description: `${courseData.course_title}`,

						startDate,
						endDate,
						startTime,
						endTime,

						rowOffset: rowOffset,
						columnOffset: columnOffset,
						spanHeight: spanHeight,

						color: event.color,

						kind: "linked-course",
						sectionCode: sectionData.section_code,
						courseId: courseData.course_id,
						sectionId: sectionData.section_id,

						seatsAvailable: sectionData.seats_available,
						seatsTotal: sectionData.seats_total,

						credits: parseFloat(courseData.credits),

						campus: meeting.campus,
						building: meeting.building,
						room: meeting.room.name || "",
						instructors: meeting.instructors.map((i) => ({
							firstName: i.first_name,
							lastName: i.last_name,
						})),
					});
				}
				break;
			}
			case "unlinked-course": {
				for (const meeting of event.meetings) {
					const startDate = new Date(event.startDate);
					const endDate = new Date(event.endDate);
					const startTime = new Date(meeting.startTime);
					const endTime = new Date(meeting.endTime);

					if (startTime.getHours() >= endHour) continue;
					if (endTime.getHours() < startHour) continue;

					const columnOffset = determineCardColumnOffset(meeting.day);
					const rowOffset = determineCardRowOffset(startTime);
					const spanHeight = determineCardSpanHeight(startTime, endTime);

					if (columnOffset === -1) continue;

					structuredEvents.push({
						id: event.eventId,
						key: `${event.eventId}-${meeting.day}-${meeting.startTime}-${meeting.endTime}`,
						meetingCount: event.meetings.length,

						title: `${event.courseCode}-${event.sectionCode}`,
						description: `${event.courseTitle}`,

						startDate,
						endDate,
						startTime,
						endTime,

						rowOffset: rowOffset,
						columnOffset: columnOffset,
						spanHeight: spanHeight,

						color: event.color,

						kind: "unlinked-course",
						sectionCode: event.sectionCode,

						credits: event.credits,

						campus: meeting.campus,
						building: meeting.building,
						room: meeting.room,
						instructors: meeting.instructors,
					});
				}
				break;
			}
			case "personal": {
				for (const meeting of event.meetings) {
					const startDate = new Date(event.startDate);
					const endDate = new Date(event.endDate);
					const startTime = new Date(meeting.startTime);
					const endTime = new Date(meeting.endTime);

					if (startTime.getHours() >= endHour) continue;
					if (endTime.getHours() < startHour) continue;

					const columnOffset = determineCardColumnOffset(meeting.day);
					const rowOffset = determineCardRowOffset(startTime);
					const spanHeight = determineCardSpanHeight(startTime, endTime);

					if (columnOffset === -1) continue;

					structuredEvents.push({
						id: event.eventId,
						key: `${event.eventId}-${meeting.day}-${meeting.startTime}-${meeting.endTime}`,
						meetingCount: event.meetings.length,

						title: event.title,
						description: event.description,

						startDate,
						endDate,
						startTime,
						endTime,

						rowOffset: rowOffset,
						columnOffset: columnOffset,
						spanHeight: spanHeight,

						color: event.color,

						kind: "personal",
						location: meeting.location,
					});
				}
				break;
			}
		}
	}

	return structuredEvents;
}

function roundMinutes(minutes: number) {
	return Math.round(minutes / minsPerSlot) * minsPerSlot;
	// ^ minutes rounded to nearest incr of slot (ie w/ 12 slots, mins will round to nearest multiple of 5)
}

function determineCardRowOffset(time: Date) {
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

function determineCardColumnOffset(day: string) {
	switch (day) {
		case "Sunday":
			return 1;
		case "Monday":
			return 2;
		case "Tuesday":
			return 3;
		case "Wednesday":
			return 4;
		case "Thursday":
			return 5;
		case "Friday":
			return 6;
		case "Saturday":
			return 7;
	}
	return -1;
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
