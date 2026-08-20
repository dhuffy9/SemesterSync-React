"use client";

import { useEffect, useState } from "react";
import CourseAddList from "@/components/sidebar/courseAdd/course-add-list";
import {
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/toast";
import useUserStore from "@/stores/user-store";
import type {
	AssembledCourseSingleSection,
	CourseResponse,
} from "@/types/courses";

type EditLinkedEventProps = {
	eventId: string;
	courses: CourseResponse;

	cancelOnClick?: () => void;
	actionSecondaryOnClick?: () => void;
};

export default function EditLinkedEvent({
	eventId,
	courses,
	cancelOnClick,
	actionSecondaryOnClick,
}: EditLinkedEventProps) {
	const termCode = useUserStore((state) => state.activeTerm);
	const tabId = useUserStore((state) => state.activeTab);
	const eventData = useUserStore((state) => state.getEvent(tabId, eventId));
	const updateEvent = useUserStore((state) => state.updateEvent);

	const [selectedCourse, setSelectedCourse] = useState<
		Array<AssembledCourseSingleSection>
	>([]);

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

			setSelectedCourse([
				{
					...allCourse,
					section,
				},
			]);
		}
	}, [courses, eventData, termCode]);

	if (!eventData || typeof courses === "number") return null;

	return (
		<>
			<div>
				{eventData.kind === "linked-course" && (
					<CourseAddList
						courses={courses}
						selectedCourse={selectedCourse}
						setSelectedCourse={setSelectedCourse}
						selectedAtTop
					/>
				)}
			</div>

			<AlertDialogFooter>
				<AlertDialogCancel onClick={cancelOnClick ? cancelOnClick : () => {}}>
					Cancel
				</AlertDialogCancel>
				<AlertDialogAction
					onClick={() => {
						if (eventData.kind === "linked-course") {
							updateEvent(tabId, {
								eventId,
								termCode,
								color: eventData.color,
								kind: "linked-course",
								courseId: selectedCourse[0].course_id,
								sectionId: selectedCourse[0].section.section_id,
								staticCourseCredits: parseFloat(selectedCourse[0].credits),
							});
							toast.add({
								description: "Event updated successfully",
								type: "success",
							});
						}

						actionSecondaryOnClick ? actionSecondaryOnClick() : () => {};
					}}
				>
					Save Changes
				</AlertDialogAction>
			</AlertDialogFooter>
		</>
	);
}
