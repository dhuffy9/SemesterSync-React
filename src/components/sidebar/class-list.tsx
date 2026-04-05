"use client";

import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

export default function ClassList() {
	return (
		<div className="flex h-full min-h-0 flex-col overflow-hidden">
			<div className="shrink-0">
				<p className="text-xl text-center">My Classes</p>

				<div className="flex flex-row gap-2 justify-center py-2 items-center">
					<p className="text-sm text-muted-foreground">
						Credits: <span className="font-bold text-foreground">12</span>
					</p>
					<Separator orientation="vertical" className="h-6" />
					<p className="text-sm text-muted-foreground">
						Classes: <span className="font-bold text-foreground">12</span>
					</p>
				</div>
			</div>

			<ScrollArea className="flex-1 min-h-0 w-full">
				<div className="pr-3 pb-6">
					<div className="mt-2 p-3 border-l-[6px] rounded-l-lg border-sidebar-primary">
						<p className="text-base font-semibold">CIT344-21</p>
						<p className="text-sm text-muted-foreground">
							Operating Systems Concepts 1
						</p>
						<p className="text-xs text-muted-foreground">TR 2:00 PM - 3:15 PM</p>
						<p className="text-xs text-muted-foreground">ATHS: E245</p>
					</div>

					<div className="mt-2 p-3 border-l-[6px] rounded-l-lg border-sidebar-primary">
						<p className="text-base font-semibold">CIT344-21</p>
						<p className="text-sm text-muted-foreground">
							Operating Systems Concepts 1
						</p>
						<p className="text-xs text-muted-foreground">TR 2:00 PM - 3:15 PM</p>
						<p className="text-xs text-muted-foreground">ATHS: E245</p>
					</div>

					<div className="mt-2 p-3 border-l-[6px] rounded-l-lg border-sidebar-primary">
						<p className="text-base font-semibold">CIT344-21</p>
						<p className="text-sm text-muted-foreground">
							Operating Systems Concepts 1
						</p>
						<p className="text-xs text-muted-foreground">TR 2:00 PM - 3:15 PM</p>
						<p className="text-xs text-muted-foreground">ATHS: E245</p>
					</div>

					<div className="mt-2 p-3 border-l-[6px] rounded-l-lg border-sidebar-primary">
						<p className="text-base font-semibold">CIT344-21</p>
						<p className="text-sm text-muted-foreground">
							Operating Systems Concepts 1
						</p>
						<p className="text-xs text-muted-foreground">TR 2:00 PM - 3:15 PM</p>
						<p className="text-xs text-muted-foreground">ATHS: E245</p>
					</div>

					<div className="mt-2 p-3 border-l-[6px] rounded-l-lg border-sidebar-primary">
						<p className="text-base font-semibold">CIT344-21</p>
						<p className="text-sm text-muted-foreground">
							Operating Systems Concepts 1
						</p>
						<p className="text-xs text-muted-foreground">TR 2:00 PM - 3:15 PM</p>
						<p className="text-xs text-muted-foreground">ATHS: E245</p>
					</div>

					<div className="mt-2 p-3 border-l-[6px] rounded-l-lg border-sidebar-primary">
						<p className="text-base font-semibold">CIT344-21</p>
						<p className="text-sm text-muted-foreground">
							Operating Systems Concepts 1
						</p>
						<p className="text-xs text-muted-foreground">TR 2:00 PM - 3:15 PM</p>
						<p className="text-xs text-muted-foreground">ATHS: E245</p>
					</div>
				</div>

				<ScrollBar orientation="vertical" />
			</ScrollArea>
		</div>
	);
}
