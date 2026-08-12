"use client";

import clsx from "clsx";
import { Fragment } from "react/jsx-runtime";
import useUserStore from "@/stores/user-store";
import type { EventCardGenerics, EventCardsObjectType } from "@/types/events";
import type { CourseEvent, NonCourseEvent } from "@/types/user-store";

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

export default function ClassList() {
	const activeTab = useUserStore((state) => state.getActiveTab());
	const unstructuredEvents = [
		...(activeTab.courseEvents || []),
		...(activeTab.nonCourseEvents || []),
	];
	const structuredEvents = transformEvents(unstructuredEvents);

	console.log(structuredEvents);

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

						console.log(event);

						if (d >= event.startDate && d <= event.endDate) {
							return (
								<div
									key={event.eventId}
									className="border-l-2 rounded-sm"
									style={{
										gridArea: `${event.cardTimeOffset} / ${event.cardDayOffset} / span ${event.cardSpanHeight} / ${event.cardDayOffset}`,
										backgroundColor: `color-mix(in oklab, ${event.color} 20%, transparent)`,
										borderColor: event.color,
									}}
								>
									{event.eventId}
								</div>
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
				} as EventCardGenerics;

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
				} as EventCardGenerics;

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
	console.log(day);
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
