"use client";

import clsx from "clsx";
import { Fragment } from "react/jsx-runtime";
import useUserStore from "@/stores/user-store";

const startHour = 6; // Inclusive, 6 AM
const endHour = 23; // Exclusive, 11 PM (up until 22:59)

const slots = 12; // 5 min per slot
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

	const today = new Date();
	const selectedDate = activeTab.selectedDate
		? new Date(activeTab.selectedDate)
		: new Date();

	const firstWeek = new Date(selectedDate);
	firstWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
	// ^ sets day of month to the "selected day of month - # days from Sunday"

	console.log({ today, selectedDate, firstWeek });

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
					const currentDate = new Date(firstWeek);
					currentDate.setDate(firstWeek.getDate() + i);

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
			<div className="col-start-2 row-start-2 col-span-full row-span-full grid grid-cols-subgrid grid-rows-subgrid"></div>
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
