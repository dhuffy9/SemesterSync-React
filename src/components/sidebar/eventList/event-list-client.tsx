"use client";

import clsx from "clsx";
import { Edit, Palette } from "lucide-react";
import { useState } from "react";
import {
	type EventListCardData,
	EventListCardUI,
} from "@/components/events/list-card";
import DangerModal from "@/components/modals/danger";
import EditColorModal from "@/components/modals/events/edit-color";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/toast";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, mergeMeetings } from "@/lib/utils";
import useUserStore from "@/stores/user-store";
import type { CourseResponse } from "@/types/courses";

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
				<div className="py-1 flex flex-col gap-2">
					{events.map((event) => {
						const cardObject = {
							color: event.color,
							eventId: event.eventId,
						} as EventListCardData;

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
								key={`sidebar-event-${event.eventId}`}
								courses={courses}
								data={cardObject}
							/>
						);
					})}
				</div>
			</ScrollArea>
		</div>
	);
}

function ClassCard({
	courses,
	data,
}: {
	courses: CourseResponse;
	data: EventListCardData;
}) {
	const activeTab = useUserStore((state) => state.getActiveTab());
	const removeEvent = useUserStore((state) => state.removeEvent);

	const [hoverCardOpen, setHoverCardOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	return (
		<HoverCard open={hoverCardOpen} onOpenChange={setHoverCardOpen}>
			<HoverCardTrigger delay={0} closeDelay={0}>
				<EventListCardUI data={data} />
			</HoverCardTrigger>
			<HoverCardContent
				side="right"
				align="center"
				className={"w-max flex flex-col gap-1"}
			>
				<Tooltip>
					<TooltipTrigger
						render={<Button variant="secondary" size="icon" disabled />}
					>
						<Edit />
					</TooltipTrigger>
					<TooltipContent side="right">Edit</TooltipContent>
				</Tooltip>

				<EditColorModal
					courses={courses}
					eventId={data.eventId}
					trigger={
						<Tooltip>
							<AlertDialogTrigger
								render={
									<TooltipTrigger
										render={<Button variant="secondary" size="icon" />}
									>
										<Palette />
									</TooltipTrigger>
								}
							/>
							<TooltipContent side="right">Change Color</TooltipContent>
						</Tooltip>
					}
					cancelOnClick={() => setHoverCardOpen(false)}
					actionSecondaryOnClick={() => setHoverCardOpen(false)}
				/>

				<DangerModal
					type="delete"
					isModalOpen={isDeleteModalOpen}
					onOpenChange={setIsDeleteModalOpen}
					triggerTooltip="Delete"
					triggerOnClick={(e) => {
						if (e.shiftKey) {
							removeEvent(activeTab.id, data.eventId);
							toast.add({
								title: "Event Deleted Successfully",
								type: "success",
							});
							e.stopPropagation();
						}
					}}
					titleChildren={`Delete ${data.title}`}
					descriptionChildren={
						<>
							Are you sure you would like to delete this event with{" "}
							<b>
								{data.meetings.length} meeting
								{data.meetings.length > 1 ? "s" : ""}
							</b>
							?
						</>
					}
					cancelOnClick={() => setHoverCardOpen(false)}
					actionChildren="Delete Event"
					actionOnClick={() => {
						removeEvent(activeTab.id, data.eventId);
						setHoverCardOpen(false);
						toast.add({
							title: "Event Deleted Successfully",
							type: "success",
						});
					}}
				/>
			</HoverCardContent>
		</HoverCard>
	);
}
