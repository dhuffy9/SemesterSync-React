import { Separator } from "@base-ui/react";
import clsx from "clsx";
import type { CalendarCardUIProps } from "@/types/events";

export function CalendarCardUI({ event }: CalendarCardUIProps) {
	return (
		<div
			className="border-l-2 rounded-sm p-2 wrap-break-word overflow-y-scroll h-full"
			style={{
				backgroundColor: `color-mix(in oklab, ${event.color} 20%, var(--background))`,
				borderColor: event.color,
			}}
		>
			<div className="flex flex-col gap-2">
				<p>{event.title}</p>
				<p
					className={clsx("text-sm", {
						"italic text-muted-foreground": !event.description,
					})}
				>
					{event.description ? event.description : "No Description"}
				</p>

				<Separator className="bg-black/20" />

				<div className="text-sm text-muted-foreground flex flex-col items-center gap-1">
					<span className="text-foreground">
						{event.startTime.toLocaleTimeString("en-US", {
							hour12: true,
							hour: "2-digit",
							minute: "2-digit",
						})}
					</span>
					to
					<span className="text-foreground">
						{event.endTime.toLocaleTimeString("en-US", {
							hour12: true,
							hour: "2-digit",
							minute: "2-digit",
						})}
					</span>
				</div>
			</div>
		</div>
	);
}
