"use client";

import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import useUserStore from "@/stores/user-store";

const monthNames = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

export default function MiniCalendar() {
	const activeTab = useUserStore((state) => state.getActiveTab());
	const updataTabDate = useUserStore((state) => state.updateTabDate);

	const [selectedDate, setSelectedDate] = useState<Date>(
		activeTab.selectedDate ? new Date(activeTab.selectedDate) : new Date(),
	);
	const today = new Date();

	useEffect(() => {
		if (activeTab.selectedDate) {
			setSelectedDate(new Date(activeTab.selectedDate));
		}
	}, [activeTab.selectedDate]);

	const changeMonth = (direction: number) => {
		const nextDate = new Date(selectedDate);

		let day = nextDate.getDate();
		if (day === getDaysInMonth(nextDate.getMonth()))
			day = getDaysInMonth(nextDate.getMonth() + direction);

		nextDate.setMonth(nextDate.getMonth() + direction, day);

		setSelectedDate(nextDate);
		updataTabDate(activeTab.id, nextDate);
	};

	const goToDay = (day: number) => {
		const date = new Date(
			selectedDate.getFullYear(),
			selectedDate.getMonth(),
			day,
		);
		setSelectedDate(date);
		updataTabDate(activeTab.id, date);
	};

	const year = selectedDate.getFullYear();
	const month = selectedDate.getMonth();

	const daysInMonth = getDaysInMonth(month);

	const calendarDays = [];
	const dateToRow = new Map<number, number>();

	let row = 1;
	for (let i = 1; i <= daysInMonth; i++) {
		const date = new Date(year, month, i);
		dateToRow.set(i, row);
		calendarDays.push(date);
		if (date.getDay() === 6) row++;
	}

	return (
		<div>
			<div className="flex justify-between pt-2 pb-2">
				<Button
					onClick={() => changeMonth(-1)}
					variant={"outline"}
					size={"icon-sm"}
				>
					<ChevronLeft />
				</Button>
				<span>
					{monthNames[month]} {year}
				</span>
				<Button
					onClick={() => changeMonth(1)}
					variant={"outline"}
					size={"icon-sm"}
				>
					<ChevronRight />
				</Button>
			</div>
			<div className="flex justify-around text-base text-muted-foreground">
				{weekDays.map((day, index) => (
					<span key={`${index}_${day}`}>{day}</span>
				))}
			</div>
			<div
				className="grid grid-cols-7 text-center"
				style={{
					gridTemplateRows: `repeat(${dateToRow
						.entries()
						.toArray()
						.pop()}, mix-max(0, 1fr))`,
				}}
			>
				<div
					className="col-span-full border border-muted-foreground/40 border-dashed rounded-md"
					style={{
						gridRowStart: dateToRow.get(selectedDate.getDate()),
					}}
				/>
				{calendarDays.map((day, index) => {
					const isSelected =
						day.getDate() === today.getDate() &&
						month === today.getMonth() &&
						year === today.getFullYear();

					return (
						<Button
							key={`${index}_${day}`}
							variant={isSelected ? "default" : "ghost"}
							size={"lg"}
							className={clsx("font-normal rounded-full", {
								"border-dashed border-primary rounded-md":
									selectedDate.getDate() === day.getDate(),
							})}
							style={{
								gridColumnStart: day.getDay() + 1,
								gridRowStart: dateToRow.get(day.getDate()),
							}}
							onClick={() => goToDay(day.getDate())}
						>
							{day.getDate()}
						</Button>
					);
				})}
			</div>
		</div>
	);
}

function getDaysInMonth(month: number) {
	return new Date(2026, month + 1, 0).getDate();
	// wtf? setting day to 0 bumps you to last day of previous month
}
