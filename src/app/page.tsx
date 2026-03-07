"use client";

import clsx from "clsx";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import AppHeader from "@/components/app-header";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import useUserStore from "@/stores/user-store";

export default function Page() {
	const tabs = useUserStore((state) => state.tabs);
	const activeTabId = useUserStore((state) => state.activeTab);
	const addTab = useUserStore((state) => state.addTab);
	const selectTab = useUserStore((state) => state.setActiveTab);
	const removeTab = useUserStore((state) => state.removeTab);

	const [alertOpen, setAlertOpen] = useState<Record<string, boolean>>({});
	const sidebar = useSidebar();

	useEffect(() => {
		const openDict: Record<string, boolean> = {};
		tabs.forEach((tab) => {
			openDict[tab.id] = false;
		});
		setAlertOpen(openDict);
	}, [tabs]);

	const setTabDeleteModal = (tabId: string, bool: boolean) => {
		setAlertOpen((prev) => ({ ...prev, [tabId]: bool }));
	};

	return (
		<div className="w-full">
			<AppHeader />

			<main>
				<div
					className={clsx(
						"flex flex-row items-center gap-2 bg-accent p-2 pb-0",
						{
							"w-[calc(100dvw-var(--sidebar-width))]":
								sidebar.open && !sidebar.isMobile,
						},
					)}
				>
					<ScrollArea className="min-w-0 flex-1">
						<div className="flex flex-row items-center gap-2">
							{tabs.map((tab) => (
								<button
									key={tab.id}
									onClick={() => selectTab(tab.id)}
									className={clsx(
										"flex flex-row shrink-0 items-center gap-2 p-2 rounded-t-lg transition-all",
										{
											"bg-background": tab.id === activeTabId,
											"hover:bg-foreground/5 cursor-pointer":
												tab.id !== activeTabId,
										},
									)}
									type="button"
									disabled={activeTabId === tab.id}
									aria-label={`Switch to ${tab.name} tab`}
								>
									<p className="whitespace-nowrap">{tab.name}</p>
									<AlertDialog open={alertOpen[tab.id] || false}>
										<AlertDialogTrigger
											nativeButton={false}
											render={
												<X
													className={cn(
														clsx("size-4 transition-all hidden", {
															"hover:text-destructive inline cursor-pointer":
																tab.id !== activeTabId,
														}),
													)}
													onClick={(e) => {
														e.stopPropagation();
														if (e.shiftKey) {
															removeTab(tab.id);
														} else {
															setTabDeleteModal(tab.id, true);
														}
													}}
												/>
											}
										/>

										<AlertDialogContent size="sm">
											<AlertDialogHeader>
												<AlertDialogTitle>Are you sure?</AlertDialogTitle>
												<AlertDialogDescription>
													You are about to delete <b>{tab.name}</b> with{" "}
													<b>
														{tab.courses.length} course
														{tab.courses.length === 1 && "s"}
													</b>
													.
												</AlertDialogDescription>

												<p className="text-muted-foreground text-[.6rem] text-left">
													Tip: hold <Kbd className="text-[.6rem]">Shift</Kbd> while clicking the X to
													bypass confirmation.
												</p>
											</AlertDialogHeader>

											<AlertDialogFooter>
												<AlertDialogCancel
													onClick={(e) => {
														e.stopPropagation();
														setTabDeleteModal(tab.id, false);
													}}
												>
													Cancel
												</AlertDialogCancel>
												<AlertDialogAction
													onClick={(e) => {
														e.stopPropagation();
														removeTab(tab.id);
														setTabDeleteModal(tab.id, false);
													}}
													variant="destructive"
												>
													Delete
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</button>
							))}
						</div>
						<ScrollBar orientation="horizontal" />
					</ScrollArea>

					<Button size={"icon"} onClick={addTab} className="shrink-0">
						<Plus />
					</Button>
				</div>
			</main>
		</div>
	);
}
