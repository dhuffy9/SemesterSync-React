"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import useUserStore from "@/stores/user-store";

export default function MiniCalendar() {
	const activeTab = useUserStore((state) => state.getActiveTab());
	const updataTabData = useUserStore((state) => state.updateTabDate);

	const [selectedDay, setSelectedDay] =  useState<number | null>(null)


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

	const today = new Date();

	const changeMonth = (direction: number) => {
		const nextDate = new Date(selectedDate);
		nextDate.setMonth(nextDate.getMonth() + direction, selectedDate.getDay())
		updataTabData(activeTab.id, nextDate);
	}

	const getDaysInMonth = (year: number, month: number) =>{
		return new Date(year, month + 1, 0).getDate(); // months start at 0
	}

	const getFirstDayOfMonth = (year: number, month: number) =>{
		return new Date(year, month, 1).getDay();
	}

	const goToDay = (day : number) => {
		setSelectedDay(day);
		updataTabData(activeTab.id, new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day));
	}


	const selectedDate = activeTab.selectedDate ? new Date(activeTab.selectedDate) : new Date();

	const year = selectedDate.getFullYear();
	const month = selectedDate.getMonth();

	const daysInMonth = getDaysInMonth(year, month);
	const firstDay = getFirstDayOfMonth(year, month);

	const calendarDays = [];

	for (let i = 0; i < firstDay; i++) {
		calendarDays.push(null);
	}

	for (let i = 1; i <= daysInMonth; i++) {
		calendarDays.push(i);
	}

	return (
		<div className="">
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
			<div className="grid grid-cols-7  text-center">
				{calendarDays.map((day, index) => {

					const isSelected =
						day === today.getDate() &&
						month === today.getMonth() &&
						year === today.getFullYear();

					if(day == null){
						return (<span key={`${index}_${day}`}></span>)
					}

					return (
						<Button
							key={`${index}_${day}`}
							variant={isSelected ? "default" : "ghost"}
							size={"lg"}
							className={`${selectedDay === day? "border-dashed border-primary" : "" }rounded-full font-normal`}


							onClick={() => goToDay(day)}
						>
							{day}
						</Button>
					);
				})}
			</div>
		</div>
	);
}
