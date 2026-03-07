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
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
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
	const setTabName = useUserStore((state) => state.updateTabName)
	const removeTab = useUserStore((state) => state.removeTab);

	const [alertOpen, setAlertOpen] = useState<Record<string, boolean>>({});
	const [renameEnabled, setRenameEnabled] = useState<Record<string, boolean>>(
		{},
	);
	const [tabNames, setTabNames] = useState<Record<string, string>>({});
	const sidebar = useSidebar();

	useEffect(() => {
		const filledDict: Record<string, boolean> = {};
		const filledNames: Record<string, string> = {};
		tabs.forEach((tab) => {
			filledDict[tab.id] = false;
			filledNames[tab.id] = tab.name;
		});
		setAlertOpen(filledDict);
		setRenameEnabled(filledDict);
		setTabNames(filledNames);
	}, [tabs]);

	const setTabDeleteModal = (tabId: string, bool: boolean) => {
		setAlertOpen((prev) => ({ ...prev, [tabId]: bool }));
	};

	const removeTabHandler = (
		tabId: string,
		e: React.MouseEvent<SVGSVGElement>,
	) => {
		e.stopPropagation();
		if (e.shiftKey) {
			removeTab(tabId);
		} else {
			setTabDeleteModal(tabId, true);
		}
	};

	const setTabRenameState = (tabId: string, bool: boolean) => {
		setRenameEnabled((prev) => ({ ...prev, [tabId]: bool }));
	};

	const setTabNameHandler = (tabId: string, e: React.ChangeEvent<HTMLInputElement>) => {
		setTabNames((prev) => ({ ...prev, [tabId]: e.target.value }));
	}

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
						<div className="flex flex-row items-center">
							{tabs.map((tab) => (
									<ContextMenu key={tab.id}>
										<ContextMenuTrigger
											render={
												<button
													onClick={() => selectTab(tab.id)}
													className={clsx(
														"flex flex-row shrink-0 items-center gap-2 p-2 rounded-t-lg transition-all cursor-pointer",
														{
															"bg-background": tab.id === activeTabId,
															"hover:bg-foreground/5": tab.id !== activeTabId,
														},
													)}
													type="button"
													aria-label={`Switch to ${tab.name} tab`}
												>
													<input
														className={clsx("whitespace-nowrap field-sizing-content min-w-[5ch] font-mono", {
															"cursor-pointer outline-none caret-transparent": !renameEnabled[tab.id],
															'rounded outline-none ring-2 ring-primary ring-offset-1': renameEnabled[tab.id],
														})}
														style={{width: `${(tabNames[tab.id] || tab.name).length}ch`}}
														value={tabNames[tab.id] || ""}
														readOnly={!renameEnabled[tab.id]}
														onClick={() => {
															if(!renameEnabled[tab.id]) {
																selectTab(tab.id)
															};
														}}
														onChange={(e) => setTabNameHandler(tab.id, e)}
														onBlur={() => setTabName(tab.id, tabNames[tab.id])}
														onKeyDown={(e) => { if (e.key === "Enter") {
															if (!renameEnabled[tab.id]) {
																setTabRenameState(tab.id, true)
															} else {
																e.currentTarget.blur()
															}
														}}}
														placeholder="Tab name"
														aria-label="Name of the tab"
													/>
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
																	onClick={(e) => removeTabHandler(tab.id, e)}
																/>
															}
														/>

														<AlertDialogContent size="sm">
															<AlertDialogHeader>
																<AlertDialogTitle>
																	Are you sure?
																</AlertDialogTitle>
																<AlertDialogDescription>
																	You are about to delete <b>{tab.name}</b> with{" "}
																	<b>
																		{tab.courses.length} course
																		{tab.courses.length === 1 && "s"}
																	</b>
																	.
																</AlertDialogDescription>

																<p className="text-muted-foreground text-[.6rem] text-left">
																	Tip: hold{" "}
																	<Kbd className="text-[.6rem]">Shift</Kbd>{" "}
																	while clicking the X to bypass confirmation.
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
											}
										/>
										<ContextMenuContent>
											<ContextMenuGroup>
												<ContextMenuLabel>Courses</ContextMenuLabel>
												<ContextMenuItem disabled>
													{tab.courses.length} course
													{tab.courses.length === 1 ? "" : "s"}
												</ContextMenuItem>
												<ContextMenuItem disabled>
													{tab.totalCredits} credit
													{tab.totalCredits === 1 ? "" : "s"}
												</ContextMenuItem>
											</ContextMenuGroup>

											<ContextMenuSeparator />

											<ContextMenuGroup>
												<ContextMenuItem
													onClick={() => setTabRenameState(tab.id, true)}
												>
													Rename
												</ContextMenuItem>
											</ContextMenuGroup>

											{tab.id !== activeTabId && (
												<ContextMenuGroup>
													<ContextMenuSeparator />
													<ContextMenuItem
														variant="destructive"
														onClick={(e) =>
															removeTabHandler(
																tab.id,
																e as unknown as React.MouseEvent<SVGSVGElement>,
															)
														}
													>
														Delete
													</ContextMenuItem>
												</ContextMenuGroup>
											)}
										</ContextMenuContent>
									</ContextMenu>
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
