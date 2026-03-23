"use client";

import { TanStackDevtools } from "@tanstack/react-devtools";
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 60 * 1000,
		},
	},
});

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<TanStackDevtools
				plugins={[
					{
						name: "Tanstack Query",
						render: <ReactQueryDevtoolsPanel />,
					},
					formDevtoolsPlugin(),
				]}
			/>
			<TooltipProvider>
				<SidebarProvider>{children}</SidebarProvider>
			</TooltipProvider>
		</QueryClientProvider>
	);
}
