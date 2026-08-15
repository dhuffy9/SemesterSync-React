"use client";

import clsx from "clsx";
import { Edit, Palette, Trash } from "lucide-react";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ColorPickerInners } from "@/components/ui/color-picker";
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
import { cn, mergeMeetings, singleLetterDay } from "@/lib/utils";
import useUserStore from "@/stores/user-store";
import type { CourseResponse } from "@/types/courses";
import type { MergedMeeting } from "@/types/meetings";

const defaultColors = [
	"#c22727",
	"#873d16",
	"#278716",
	"#168776",
	"#4285F4",
	"#181687",
	"#561687",
	"#871663",
];

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
	const activeTab = useUserStore((state) => state.getActiveTab());
	const getEvent = useUserStore((state) => state.getEvent);
	const updateEvent = useUserStore((state) => state.updateEvent);
	const removeEvent = useUserStore((state) => state.removeEvent);

	const [hoverCardOpen, setHoverCardOpen] = useState(false);
	const [selectedColor, setSelectedColor] = useState("#4285F4");

	return (
		<HoverCard open={hoverCardOpen} onOpenChange={setHoverCardOpen}>
			<HoverCardTrigger delay={0} closeDelay={0}>
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
											{meeting.days.map((day) => singleLetterDay(day)).join("")}
											:
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

				<AlertDialog onOpenChangeComplete={() => setSelectedColor(data.color)}>
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
					<AlertDialogContent>
						<div className="flex flex-row items-start gap-4">
							<div className="flex flex-col gap-2 flex-1">
								<ColorPickerInners
									value={selectedColor}
									onChange={(v) => setSelectedColor(v)}
								/>

								<div className="flex flex-row items-center gap-2">
									{defaultColors.map((color) => (
										<button
											key={color}
											type="button"
											onClick={() => setSelectedColor(color)}
											className="size-4 rounded-sm cursor-pointer border border-border"
											style={{ backgroundColor: color }}
										></button>
									))}
								</div>

								<AlertDialogFooter>
									<AlertDialogCancel
										onClick={() => {
											setHoverCardOpen(false);
										}}
									>
										Cancel
									</AlertDialogCancel>
									<AlertDialogAction
										onClick={() => {
											const ev = getEvent(activeTab.id, data.eventId);

											if (ev) {
												ev.color = selectedColor;
												updateEvent(activeTab.id, ev);

												setHoverCardOpen(false);
												toast.add({
													title: "Event Color Changed",
													type: "success",
												});
											} else {
												toast.add({
													title: "Event not found",
													type: "error",
												});
												setHoverCardOpen(false);
											}
										}}
									>
										Save Color
									</AlertDialogAction>
								</AlertDialogFooter>
							</div>
							<Separator orientation="vertical" />
							<div className="flex-1 flex flex-col gap-2">
								<h2 className="font-bold">Event Preview:</h2>
								<div
									className="border-l-2 rounded-sm p-2 wrap-break-word overflow-y-scroll"
									style={{
										backgroundColor: `color-mix(in oklab, ${selectedColor} 20%, transparent)`,
										borderColor: selectedColor,
									}}
								>
									<div className="flex flex-col gap-2">
										<p>{data.title}</p>
										<p
											className={clsx("text-sm", {
												"italic text-muted-foreground": !data.description,
											})}
										>
											{data.description ? data.description : "No Description"}
										</p>

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
																{meeting.days
																	.map((day) => singleLetterDay(day))
																	.join("")}
																:
															</p>
														</TooltipTrigger>
														<TooltipContent>
															{meeting.days.join(", ")}
														</TooltipContent>
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
								</div>
							</div>
						</div>
					</AlertDialogContent>
				</AlertDialog>

				<AlertDialog>
					<Tooltip>
						<AlertDialogTrigger
							render={
								<TooltipTrigger
									render={<Button variant="destructive" size="icon" />}
								>
									<Trash />
								</TooltipTrigger>
							}
						/>
						<TooltipContent side="right">Delete</TooltipContent>
					</Tooltip>
					<AlertDialogContent size="sm">
						<AlertDialogHeader>
							<AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
								<Trash />
							</AlertDialogMedia>
							<AlertDialogTitle>Delete {data.title}</AlertDialogTitle>
							<AlertDialogDescription>
								You are about to delete this event with{" "}
								<b>{data.meetings.length} meetings</b>
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel onClick={() => setHoverCardOpen(false)}>
								Don't Delete
							</AlertDialogCancel>
							<AlertDialogAction
								variant={"destructive"}
								onClick={() => {
									removeEvent(activeTab.id, data.eventId);
									toast.add({
										title: "Event Deleted Successfully",
										type: "success",
									});
									setHoverCardOpen(false);
								}}
							>
								Delete Event
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</HoverCardContent>
		</HoverCard>
	);
}
