"use client"

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { SidebarTrigger } from "../ui/sidebar";
import ShareDropdown from "./share-dropdown";
import useUserStore from "@/stores/user-store";


export default function AppHeader() {

	const activeTab = useUserStore((state) => state.getActiveTab());
    const updataTabData = useUserStore((state) => state.updateTabDate);

	updataTabData(activeTab.id, new Date());

    const today = activeTab.selectedDate ? new Date(activeTab.selectedDate) : new Date();


    const changeWeek = (direction: number) => {
        if(!activeTab) return

        const nextData = new Date(today);
        nextData.setDate(today.getDate() + direction * 7);
        updataTabData(activeTab.id, nextData);
    }

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
							March 4, 2026
						</PopoverTrigger>
						<PopoverContent className="flex flex-row gap-2 p-0">
							<div className="flex flex-col gap-2 bg-accent rounded-l-lg p-2 border-r border-border">
								<Button variant="outline">Today</Button>
								<Button variant="outline">Next Month</Button>
								<Button variant="outline">Next Semester</Button>
								<Button variant="outline">Next Year</Button>
							</div>

							<div className="p-2 rounded-r-lg">
								<p>Calendar will go here</p>
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
