"use client";

import clsx from "clsx";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn, mergeMeetings, singleLetterDay } from "@/lib/utils";
import useUserStore from "@/stores/user-store";
import type { CourseResponse } from "@/types/courses";
import type { MergedMeeting } from "@/types/meetings";

export default function EventListClient({
	courses,
}: {
	courses: CourseResponse;
}) {
	const credits = useUserStore((state) => state.getActiveTabCredits());
	const term = useUserStore((state) => state.activeTerm);
	const events = useUserStore((state) => state.getEvents(state.activeTab));

	if (typeof courses === "number") return <p>Error loading courses</p>;

	return (
		<div className="flex h-full min-h-0 flex-col overflow-hidden">
			<div className="shrink-0">
				<p className="text-xl text-center">My Classes</p>

				<div className="flex flex-row gap-2 justify-center py-2 items-center">
					<p className="text-sm text-muted-foreground">
						Credits:{" "}
						<span
							className={cn(
								clsx("font-bold text-foreground", {
									"text-destructive": credits > 18,
								}),
							)}
						>
							{credits}
						</span>
					</p>
					<Separator orientation="vertical" className="h-6" />
					<p className="text-sm text-muted-foreground">
						Classes:{" "}
						<span className="font-bold text-foreground">{events.length}</span>
					</p>
				</div>
			</div>

			<ScrollArea className="flex-1 min-h-0 w-full">
				<div className="py-1 space-y-2">
					{events.map((event) => {
						const cardObject = {
							color: event.color,
							eventId: event.eventId,
						} as ClassCardData;

						switch (event.kind) {
							case "linked-course": {
								if (event.termCode !== term) return null;
								const courseData = courses[term].find(
									(course) => course.course_id === event.courseId,
								);
								if (!courseData) return <p>Course not found !!</p>;

								const sectionData = courseData.sections.find(
									(section) => section.section_id === event.sectionId,
								);
								if (!sectionData) return <p>Section not found !!</p>;

								cardObject.title = `${courseData.course_code}-${sectionData.section_code}`;
								cardObject.description = `${courseData.course_title}`;

								const tempMeetings = [] as {
									day: string;
									startTime: string;
									endTime: string;
								}[];
								for (const meeting of sectionData.meetings) {
									const startTime = new Date(
										`2026-08-13T${meeting.start_time}`,
									).toString();
									const endTime = new Date(
										`2026-08-13T${meeting.end_time}`,
									).toString();
									tempMeetings.push({
										day: meeting.day,
										startTime,
										endTime,
									});
								}
								cardObject.meetings = mergeMeetings(tempMeetings);

								break;
							}
							case "unlinked-course":
								cardObject.title = `${event.courseCode}-${event.sectionCode}`;
								cardObject.description = event.courseTitle;
								cardObject.meetings = mergeMeetings(event.meetings);
								break;
							case "personal":
								cardObject.title = event.title;
								cardObject.description = event.description || "";
								cardObject.meetings = mergeMeetings(event.meetings);
								break;
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

type ClassCardData = {
	eventId: string;
	title: string;
	description: string;
	color: string;
	meetings: Array<MergedMeeting>;
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
						className="flex flex-row items-center gap-1 text-sm"
					>
						<p>{meeting.days.map((day) => singleLetterDay(day)).join("")}:</p>
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
