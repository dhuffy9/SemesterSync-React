import CalendarContainer from "@/components/calendar-container";
import AppHeader from "@/components/header/app-header";
import TabList from "@/components/tab-list";
import { ScrollArea } from "@/components/ui/scroll-area";

export default async function Page() {
	return (
		<div>
			<AppHeader />

			<main>
				<TabList />
				<ScrollArea className="h-[89vh] px-8 pt-4 rounded-t-lg">
					<CalendarContainer />
				</ScrollArea>
			</main>
		</div>
	);
}
