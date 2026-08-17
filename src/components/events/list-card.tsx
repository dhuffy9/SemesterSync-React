import { singleLetterDay } from "@/lib/utils";
import type { MergedMeeting } from "@/types/meetings";
import { Separator } from "../ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export type EventListCardData = {
	eventId: string;
	title: string;
	description: string;
	color: string;
	meetings: Array<MergedMeeting>;
};

export function EventListCardUI({ data }: { data: EventListCardData }) {
	return (
		<div
			className="flex flex-col gap-1 rounded-md p-2 border-2 border-border bg-accent/10 mr-2"
			style={{
				borderLeftColor: data.color,
				background: `color-mix(in oklab, ${data.color} 20%, transparent)`,
			}}
		>
			<p>{data.title}</p>
			<p className="text-sm">{data.description}</p>

			<Separator className="bg-black/20" />

			<div>
				{data.meetings.map((meeting) => (
					<div
						key={`event-sidebar-${data.eventId}-meeting-${meeting.days}-${meeting.startTime.getTime()}-${meeting.endTime.getTime()}`}
						className="flex flex-row items-center gap-1 text-sm"
					>
						<Tooltip>
							<TooltipTrigger>
								<p>
									{meeting.days.map((day) => singleLetterDay(day)).join("")}:
								</p>
							</TooltipTrigger>
							<TooltipContent>{meeting.days.join(", ")}</TooltipContent>
						</Tooltip>
						<p>
							{meeting.startTime.toLocaleTimeString("en-US", {
								hour12: true,
								hour: "2-digit",
								minute: "2-digit",
							})}
						</p>
						<span className="text-muted-foreground">to</span>
						<p>
							{meeting.endTime.toLocaleTimeString("en-US", {
								hour12: true,
								hour: "2-digit",
								minute: "2-digit",
							})}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}
