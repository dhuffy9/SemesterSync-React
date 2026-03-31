import { Sidebar, SidebarContent, SidebarHeader } from "../ui/sidebar";
import CourseAddModal from "./courseAdd/course-add";
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
			</SidebarContent>
		</Sidebar>
	);
}
