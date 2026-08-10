"use client";

import { TanStackDevtools } from "@tanstack/react-devtools";
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<>
			<TanStackDevtools plugins={[formDevtoolsPlugin()]} />
			<TooltipProvider>
				<SidebarProvider>
					{children}
					<Toaster />
				</SidebarProvider>
			</TooltipProvider>
		</>
	);
}
