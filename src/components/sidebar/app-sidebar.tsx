import { Sidebar, SidebarContent, SidebarHeader } from "../ui/sidebar";
import CourseAddModal from "./course-add";
import TermDropdown from "./term-dropdown";
import MiniCalendar from "./mini-calendar";
import ClassList from "./class-list";

export default function AppSidebar() {
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

				<MiniCalendar/>

				<ClassList/>
			</SidebarContent>
		</Sidebar>
	);
}
