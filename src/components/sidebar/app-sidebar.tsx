import { Sidebar, SidebarContent, SidebarHeader } from "../ui/sidebar";
import ClassList from "./class-list";
import CourseAddModal from "./courseAdd/course-add";
import MiniCalendar from "./mini-calendar";
import TermDropdown from "./terms/term-dropdown";

export default async function AppSidebar() {
	return (
		<Sidebar>
			<SidebarHeader>
				<p className="text-primary text-xl font-bold text-center">
					SemesterSync
				</p>
			</SidebarHeader>
			<SidebarContent className="p-2 gap-2">
				<CourseAddModal />

				<TermDropdown />

				<MiniCalendar />

				<ClassList />
			</SidebarContent>
		</Sidebar>
	);
}
