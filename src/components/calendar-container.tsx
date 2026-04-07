"use client";

import useUserStore from "@/stores/user-store";

export default function ClassList() {
	const cols = 7;
	const rows = 85;

	const start = 6; // 6 AM
	const end = 22; // 10 PM

	const formatHour = (hour: number) => {
		const period = hour > 12 ? "PM" : "AM";
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

	const activeTab = useUserStore((state) => state.getActiveTab());

	const today = activeTab.selectedDate
		? new Date(activeTab.selectedDate)
		: new Date();

	const firstWeek = new Date(today);
	firstWeek.setDate(today.getDate() - today.getDay()); // 6(1-31) - 1 (0-6)

	return (
		<div className="flex flex-row w-full overflow-hidden bg-accent pb-4">
			<div className="w-[80px]">
				<div className="h-[100px] border-b"></div>
				{Array.from({ length: end - start + 1 }).map((_, i) => {
					const hour = start + i;

					return (
						<div
							key={hour}
							className="h-25 flex justify-center text-xs text-muted-foreground"
						>
							{formatHour(hour)}
						</div>
					);
				})}
			</div>
			<div className="flex flex-col flex-1">
				<div className="w-full h-[100px] grid grid-cols-7 border-b">
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
								className={`${isToday ? "text-primary" : ""} flex flex-col justify-center items-center border-r`}
							>
								<span className="text-muted-foreground">{day}</span>
								<span
									className={`${isToday ? "bg-primary rounded-full px-2 text-primary-foreground" : ""}`}
								>
									{dataNumber}
								</span>
							</div>
						);
					})}
				</div>
				<div className="grid grid-cols-7 w-full">
					{Array.from({ length: rows * cols }).map((_, i) => {
						const col = i % cols;
						const row = Math.floor(i / cols);

						return (
							<div
								key={`${col}-${row}`}
								className={`${row % 5 === 0 && row !== 0 ? "border-t" : ""} border-x h-5 text-xs flex items-center justify-center`}
							></div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
