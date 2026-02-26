import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Sidebar, SidebarContent, SidebarHeader } from "./ui/sidebar";

export default function AppSidebar() {
	return (
		<Sidebar>
			<SidebarHeader>
				<p className="text-primary text-xl font-bold text-center">
					SemesterSync
				</p>
			</SidebarHeader>
			<SidebarContent className="p-2">
				<Button>
					<Plus /> New Course
				</Button>
			</SidebarContent>
		</Sidebar>
	);
}
