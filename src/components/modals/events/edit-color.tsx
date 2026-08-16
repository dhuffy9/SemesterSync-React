"use client";

import { Palette } from "lucide-react";
import { useEffect, useState } from "react";
import { EventListCardUI } from "@/components/events/list-card";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ColorPickerInners } from "@/components/ui/color-picker";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/toast";
import { defaultColors, mergeMeetings } from "@/lib/utils";
import useUserStore from "@/stores/user-store";
import type {
	AssembledCourseSingleSection,
	CourseResponse,
} from "@/types/courses";

type EditColorModalProps = {
	courses: CourseResponse;
	eventId: string;

	open?: boolean;
	onOpenChange?: React.Dispatch<React.SetStateAction<boolean>>;

	trigger?: React.ReactNode;

	cancelOnClick?: () => void;
	actionSecondaryOnClick?: () => void;
};

export default function EditColorModal({
	courses,
	eventId,

	open,
	onOpenChange,

	trigger,

	cancelOnClick,
	actionSecondaryOnClick,
}: EditColorModalProps) {
	const tabId = useUserStore((state) => state.activeTab);
	const termCode = useUserStore((state) => state.activeTerm);
	const eventData = useUserStore((state) => state.getEvent(tabId, eventId));
	const updateEvent = useUserStore((state) => state.updateEvent);

	const [selectedColor, setSelectedColor] = useState(
		eventData ? eventData.color : "#4285F4",
	);
	const [courseData, setCourseData] = useState<
		AssembledCourseSingleSection | undefined
	>(undefined);

	useEffect(() => {
		if (
			eventData &&
			eventData.kind === "linked-course" &&
			typeof courses !== "number"
		) {
			const allCourse = courses[termCode].find(
				(course) => course.course_id === eventData.courseId,
			);
			if (!allCourse) return;
			const section = allCourse.sections.find(
				(section) => section.section_id === eventData.sectionId,
			);
			if (!section) return;

			setCourseData({
				...allCourse,
				section,
			});
		}
	}, [eventData, courses, termCode]);

	if (!eventData || typeof courses === "number") return null;

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			{trigger ? (
				trigger
			) : (
				<AlertDialogTrigger render={<Button variant="secondary" size="icon" />}>
					<Palette />
				</AlertDialogTrigger>
			)}

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Edit Event Color</AlertDialogTitle>
				</AlertDialogHeader>

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
								onClick={cancelOnClick ? cancelOnClick : () => {}}
							>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={() => {
									eventData.color = selectedColor;
									updateEvent(tabId, eventData);

									toast.add({
										title: "Event Color Changed",
										type: "success",
									});

									actionSecondaryOnClick ? actionSecondaryOnClick() : () => {};
								}}
							>
								Save Color
							</AlertDialogAction>
						</AlertDialogFooter>
					</div>

					<Separator orientation="vertical" />

					<div className="flex-1">
						<h2 className="font-semibold">Event Calendar Preview:</h2>

						<h2 className="font-semibold">Event List Preview:</h2>
						<EventListCardUI
							data={
								eventData.kind === "linked-course"
									? {
											eventId,
											title: `${courseData?.course_code}-${courseData?.section.section_code}`,
											description: `${courseData?.course_title}`,
											color: selectedColor,
											meetings: mergeMeetings(
												courseData?.section.meetings.map((meeting) => {
													const startTime = new Date(
														`2026-08-16T${meeting.start_time}`,
													).toString();
													const endTime = new Date(
														`2026-08-16T${meeting.end_time}`,
													).toString();

													return {
														day: meeting.day,
														startTime,
														endTime,
													};
												}) || [],
											),
										}
									: eventData.kind === "unlinked-course"
										? {
												eventId,
												title: `${eventData.courseCode}-${eventData.sectionCode}`,
												description: eventData.courseTitle,
												color: selectedColor,
												meetings: mergeMeetings(eventData.meetings),
											}
										: {
												eventId,
												title: eventData.title,
												description: eventData.description || "",
												color: selectedColor,
												meetings: mergeMeetings(eventData.meetings),
											}
							}
						/>
					</div>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	);
}
