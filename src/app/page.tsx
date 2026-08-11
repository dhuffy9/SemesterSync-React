import CalendarContainer from "@/components/calendar-container";
import AppHeader from "@/components/header/app-header";
import TabList from "@/components/tab-list";
import { ScrollArea } from "@/components/ui/scroll-area";

export default async function Page() {
	return (
		<div className="flex h-screen min-w-0 flex-col overflow-hidden">
			<AppHeader />

			<main className="flex-1 min-w-0 overflow-hidden">
				<TabList />

				<ScrollArea className="h-[89vh] rounded-t-lg">
					<CalendarContainer />
				</ScrollArea>
			</main>
		</div>
	);
}
