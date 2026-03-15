import {
	ChevronLeft,
	ChevronRight
} from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { SidebarTrigger } from "../ui/sidebar";
import ShareDropdown from "./share-dropdown";

export default function AppHeader() {
	return (
		<nav className="flex flex-row items-center justify-between gap-2 p-2 border-b border-border w-full">
			<div className="flex flex-row items-center gap-2">
				<SidebarTrigger variant="outline" />

				<div className="flex flx-row items-center gap-2">
					<Button variant="outline" size="icon">
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
					<Button variant="outline" size="icon">
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
