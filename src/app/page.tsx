import CalendarContainer from "@/components/calendar-container";
import AppHeader from "@/components/header/app-header";
import TabList from "@/components/tab-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAllCoursesWithMeetings } from "@/data/courses";

export default async function Page() {
	const courseResponse = await getAllCoursesWithMeetings();

	return (
		<div className="flex h-screen min-w-0 w-full flex-col overflow-hidden">
			<AppHeader />

			<main className="flex-1 min-w-0 overflow-hidden">
				<TabList />

				<ScrollArea className="h-[89vh] rounded-t-lg">
					<CalendarContainer courses={courseResponse} />
				</ScrollArea>
			</main>
		</div>
	);
}
