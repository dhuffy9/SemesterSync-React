import { ChevronLeft, ChevronRight, Share } from "lucide-react";
import { Button } from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";

export default function AppHeader() {
	return (
		<nav className="flex flex-row items-center justify-between gap-2 p-2 border-b border-border w-full">
			<div className="flex flex-row items-center gap-2">
				<SidebarTrigger variant="outline" />

				<div className="flex flx-row items-center gap-2">
					<Button variant="outline" size="icon">
						<ChevronLeft />
					</Button>
					<Button variant="ghost">March 4, 2026</Button>
					<Button variant="outline" size="icon">
						<ChevronRight />
					</Button>
				</div>
			</div>

			<div className="flex flex-row items-center gap-2">
				<Button>
					<Share />
          <span className="hidden sm:inline">Share</span>
				</Button>
				<Button>Teacher <span className="hidden sm:inline">Schedules </span></Button>
			</div>
		</nav>
	);
}
