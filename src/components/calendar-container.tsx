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
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
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
			className="grid grid-cols-[5rem_repeat(7,minmax(0,1fr))] w-full mb-4"
			style={{
				gridTemplateRows: `6.25rem repeat(${rows},minmax(0, 1.25rem))`,
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
							key={day}
							className={clsx(
								"flex flex-col justify-center items-center border-r",
								{ "text-primary": isToday },
							)}
						>
							<span className="text-muted-foreground">{day}</span>
							<span
								className={clsx("", {
									"bg-primary rounded-full size-6 text-center text-primary-foreground":
										isToday,
								})}
							>
								{dataNumber}
							</span>
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
