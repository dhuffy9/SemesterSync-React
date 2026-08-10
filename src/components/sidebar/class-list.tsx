"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import useUserStore from "@/stores/user-store";

export default function ClassList() {
	const tab = useUserStore((state) =>
		state.tabs.find((tab) => tab.id === state.activeTab),
	);
	const tabEvents = [
		...(tab?.courseEvents || []),
		...(tab?.nonCourseEvents || []),
	];
	const credits = useUserStore((state) => state.getActiveTabCredits());

	return (
		<div className="flex h-full min-h-0 flex-col overflow-hidden">
			<div className="shrink-0">
				<p className="text-xl text-center">My Classes</p>

				<div className="flex flex-row gap-2 justify-center py-2 items-center">
					<p className="text-sm text-muted-foreground">
						Credits:{" "}
						<span className="font-bold text-foreground">{credits}</span>
					</p>
					<Separator orientation="vertical" className="h-6" />
					<p className="text-sm text-muted-foreground">
						Classes:{" "}
						<span className="font-bold text-foreground">
							{tabEvents.length}
						</span>
					</p>
				</div>
			</div>

			<ScrollArea className="flex-1 min-h-0 w-full">
				<div className="py-1 space-y-2">
					{tabEvents.map((event) => {
						const cardObject = {
							color: event.color,
							eventId: event.eventId,
						} as ClassCardData;

						if ("section" in event) {
							cardObject.title = `${event.course_code}-${event.section.section_code}`;
							cardObject.description = `${event.course_title}`;
							cardObject.meetings = mergeMeetings(event.section.meetings);
						} else {
							cardObject.title = event.title;
							cardObject.description = event.description || "";
							cardObject.meetings = mergeMeetings(event.meetings);
						}

						return (
							<ClassCard
								data={cardObject}
								key={`sidebar-event-${event.eventId}`}
							/>
						);
					})}
				</div>
			</ScrollArea>
		</div>
	);
}

type ClassCardDataMeeting = {
	days: string;
	startTime: Date;
	endTime: Date;
};

type ClassCardData = {
	eventId: string;
	title: string;
	description: string;
	color: string;
	meetings: Array<ClassCardDataMeeting>;
};

function ClassCard({ data }: { data: ClassCardData }) {
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
						className="flex flex-row items-center gap-1"
					>
						<p>{meeting.days}:</p>
						<p>
							{meeting.startTime.toLocaleTimeString("en-US", {
								hour12: false,
								hour: "2-digit",
								minute: "2-digit",
							})}
						</p>
						<span className="text-muted-foreground">to</span>
						<p>
							{meeting.endTime.toLocaleTimeString("en-US", {
								hour12: false,
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

function mergeMeetings(meetings: Array<object>) {
	const newMeetings = [] as Array<ClassCardDataMeeting>;

	for (const meeting of meetings) {
		if (
			"day" in meeting &&
			typeof meeting.day === "string" &&
			"start_time" in meeting &&
			"end_time" in meeting
		) {
			if (newMeetings.length === 0) {
				newMeetings.push({
					days:
						meeting.day === "thu" || meeting.day === "Thursday"
							? "R"
							: meeting.day.slice(0, 1).toUpperCase(),
					startTime: new Date(`2026-08-10T${meeting.start_time}`),
					endTime: new Date(`2026-08-10T${meeting.end_time}`),
				});
			} else {
				let found = false;

				for (const meetingItem of newMeetings) {
					const newStartTime = new Date(`2026-08-10T${meeting.start_time}`);
					const newEndTime = new Date(`2026-08-10T${meeting.end_time}`);

					if (
						meetingItem.startTime.getTime() === newStartTime.getTime() &&
						meetingItem.endTime.getTime() === newEndTime.getTime()
					) {
						meetingItem.days +=
							meeting.day === "thu" || meeting.day === "Thursday"
								? "R"
								: meeting.day.slice(0, 1).toUpperCase();

						found = true;
						break;
					}
				}

				if (!found) {
					newMeetings.push({
						days: meeting.day.slice(0, 1).toUpperCase(),
						startTime: new Date(`2026-08-10T${meeting.start_time}`),
						endTime: new Date(`2026-08-10T${meeting.end_time}`),
					});
				}
			}
		}
	}

	return newMeetings;
}
