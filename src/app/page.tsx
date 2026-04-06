import AppHeader from "@/components/header/app-header";
import TabList from "@/components/tab-list";
import CalendarContainer from "@/components/calendar-container";

export default async function Page() {
	return (
		<div>
			<AppHeader />

			<main>
				<TabList />
			    <CalendarContainer/>
			</main>
		</div>
	);
}
