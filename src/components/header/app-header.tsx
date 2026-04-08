"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import useUserStore from "@/stores/user-store";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { SidebarTrigger } from "../ui/sidebar";
import ShareDropdown from "./share-dropdown";
import MiniCalendar from "../sidebar/miniCalendar/mini-calendar";
export default function AppHeader() {
	const activeTab = useUserStore((state) => state.getActiveTab());
	const updataTabData = useUserStore((state) => state.updateTabDate);

	if(!activeTab) {
		return null
	}

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
	
	const selectedDate = activeTab.selectedDate ? new Date(activeTab.selectedDate) : new Date();

	const year = selectedDate.getFullYear();
	const month = selectedDate.getMonth();


	const changeWeek = (direction: number) => {
		const nextDate = new Date(selectedDate);
		nextDate.setDate(selectedDate.getDate() + direction * 7);
		updataTabData(activeTab.id, nextDate);
	};

	const goToToday = () =>{
		updataTabData(activeTab.id, new Date());
		console.log(activeTab.selectedDate)
	}

	const nextMonth = () => {
		const nextDate = new Date(selectedDate);
		nextDate.setMonth(nextDate.getMonth() + 1, selectedDate.getDay())
		updataTabData(activeTab.id, nextDate);
	}


	// nextSemester

	// nextYear
	
	return (
		<nav className="flex flex-row items-center justify-between gap-2 p-2 border-b border-border w-full">
			<div className="flex flex-row items-center gap-2">
				<SidebarTrigger variant="outline" />

				<div className="flex flx-row items-center gap-2">
					<Button variant="outline" size="icon" onClick={() => changeWeek(-1)}>
						<ChevronLeft />
					</Button>
					<Popover>
						<PopoverTrigger render={<Button variant="ghost" />}>
							{`${monthNames[month]} ${year}`}
						</PopoverTrigger>
						<PopoverContent className="flex flex-row gap-2 p-0 w-auto">
							<div className="flex flex-col gap-2 bg-accent rounded-l-lg p-2 border-r border-border">
								<Button variant="outline" onClick={() => goToToday()}>Today</Button>
								<Button variant="outline" onClick={nextMonth}>Next Month</Button>
								<Button variant="outline">Next Semester</Button>
								<Button variant="outline">Next Year</Button> 	
							</div>

							<div className="p-2 rounded-r-lg">
								<MiniCalendar/>
							</div>
						</PopoverContent>
					</Popover>
					<Button variant="outline" size="icon" onClick={() => changeWeek(1)}>
						<ChevronRight />
					</Button>
				</div>
			</div>

			<div className="flex flex-row items-center gap-2">
				<Button>
					Teacher <span className="hidden sm:inline">Schedules </span>
				</Button>
				<ShareDropdown />
			</div>
		</nav>
	);
}
