import CalendarContainer from "@/components/calendar-container";
import AppHeader from "@/components/header/app-header";
import TabList from "@/components/tab-list";

export default async function Page() {
	return (
		<div>
			<AppHeader />

			<main>
				<TabList />
				<CalendarContainer />
			</main>
		</div>
	);
}
