"use client";

import clsx from "clsx";
import useUserStore from "@/stores/user-store";

export default function ClassList() {
	const cols = 7;
	const rows = 85;

	const start = 6; // 6 AM
	const end = 22; // 10 PM

	const formatHour = (hour: number) => {
		const period = hour >= 12 ? "PM" : "AM";
		const displayHour = hour % 12 === 0 ? 12 : hour % 12;
		return `${displayHour}:00 ${period}`;
	};

	const days = [
		{ long: "Sunday", short: "Sun" },
		{ long: "Monday", short: "Mon" },
		{ long: "Tuesday", short: "Tue" },
		{ long: "Wednesday", short: "Wed" },
		{ long: "Thursday", short: "Thu" },
		{ long: "Friday", short: "Fri" },
		{ long: "Saturday", short: "Sat" },
	];

	const today = new Date();

	const activeTab = useUserStore((state) => state.getActiveTab());

	const selectedDate = activeTab.selectedDate
		? new Date(activeTab.selectedDate)
		: new Date();

	const firstWeek = new Date(selectedDate);
	firstWeek.setDate(selectedDate.getDate() - selectedDate.getDay()); // 6(1-31) - 1 (0-6)

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
				{Array.from({ length: end - start + 1 }).map((_, i) => {
					const hour = start + i;

					return (
						<div
							key={hour}
							className={clsx(
								"row-span-5 text-xs text-muted-foreground text-center",
								{ "border-t": i > 0 }, // skip border on first row
							)}
						>
							{formatHour(hour)}
						</div>
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
				{Array.from({ length: (end - start + 1) * cols }).map((_, i) => {
					const col = i % cols;
					const row = Math.floor(i / cols);

					return (
						<span
							key={`${col}-${row}`}
							className={clsx("row-span-5 border-r", {
								"border-t": row > 0, // skip top border so no double
							})}
						></span>
					);
				})}
			</div>
		</div>
	);
}
