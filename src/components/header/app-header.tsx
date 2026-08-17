"use client";

import MiniCalendar from "../sidebar/miniCalendar/mini-calendar";
import { Button } from "../ui/button";
import { SidebarTrigger, useSidebar } from "../ui/sidebar";
import ShareDropdown from "./share-dropdown";

export default function AppHeader() {
	const sidebar = useSidebar();

	return (
		<nav className="flex flex-row items-center justify-between gap-2 p-2 border-b border-border w-full">
			<div className="flex flex-row items-center gap-2">
				<SidebarTrigger variant="outline" />

				{!sidebar.open && <MiniCalendar collapsed />}
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
