import { eq } from "drizzle-orm";
import { db } from "@/db/connection";
import { meetingTable } from "@/db/schemas/meetings";
import { sectionTable } from "@/db/schemas/sections";
import "server-only";
import { buildingTable } from "@/db/schemas/buildings";
import { courseTable } from "@/db/schemas/courses";
import {
	primaryInstructorsTable,
	secondaryInstructorsTable,
} from "@/db/schemas/instructors";
import { roomTable } from "@/db/schemas/rooms";
import { termTable } from "@/db/schemas/terms";
import type { AssembledCourse, CourseResponse } from "@/types/courses";

export async function getAllCoursesWithMeetings(): Promise<CourseResponse> {
	try {
		const data = await db
			.select()
			.from(meetingTable)
			.leftJoin(
				sectionTable,
				eq(meetingTable.section_id, sectionTable.section_id),
			)
			.leftJoin(
				buildingTable,
				eq(meetingTable.building_id, buildingTable.building_id),
			)
			.leftJoin(roomTable, eq(meetingTable.room_id, roomTable.room_id))
			.leftJoin(
				primaryInstructorsTable,
				eq(
					meetingTable.primary_instructor_id,
					primaryInstructorsTable.instructor_id,
				),
			)
			.leftJoin(
				secondaryInstructorsTable,
				eq(
					meetingTable.secondary_instructor_id,
					secondaryInstructorsTable.instructor_id,
				),
			)
			.leftJoin(termTable, eq(sectionTable.term_id, termTable.term_id))
			.leftJoin(courseTable, eq(sectionTable.course_id, courseTable.course_id));

		const courseByTerm: Record<string, Array<AssembledCourse>> = {};

		for (const meetingSlot of data) {
			if (
				!meetingSlot.courses ||
				!meetingSlot.sections ||
				!meetingSlot.buildings ||
				!meetingSlot.instructors ||
				!meetingSlot.terms
			) {
				continue;
			}

			const splitSeats = meetingSlot.sections.avail_seats.split(" of ");
			const seatsAvailable = parseInt(splitSeats[0], 10);
			const seatsTotal = parseInt(splitSeats[1], 10);

			const instructorsSplit =
				meetingSlot.instructors.instructor_name.split(";");
			const instructorNames = instructorsSplit?.map((namePair) =>
				namePair.split(",").map((name) => name.trim()),
			);

			const termCode = meetingSlot.terms.term_code;

			if (!Object.keys(courseByTerm).includes(termCode)) {
				courseByTerm[termCode] = [];
			}

			const currentTermCourses = courseByTerm[termCode];
			let courseItem = currentTermCourses.find(
				(course) => course.course_id === meetingSlot.courses?.course_id,
			);

			if (!courseItem) {
				currentTermCourses.push({
					course_id: meetingSlot.courses.course_id,
					course_code: meetingSlot.courses.course_code,
					course_title: meetingSlot.courses.course_title,
					credits: meetingSlot.courses.credits,
					term_code: meetingSlot.terms.term_code,
					term_name: meetingSlot.terms.term_name,
					sections: [],
				});

				courseItem = currentTermCourses.find(
					(course) => course.course_id === meetingSlot.courses?.course_id,
				);
			}

			let sectionItem = courseItem?.sections.find(
				(section) => section.section_id === meetingSlot.sections?.section_id,
			);

			if (!sectionItem) {
				courseItem?.sections.push({
					section_id: meetingSlot.sections.section_id,
					section_code: meetingSlot.sections.section_code,
					start_date: meetingSlot.sections.start_date,
					end_date: meetingSlot.sections.end_date,
					delivery_method: meetingSlot.sections.delivery_method,
					course_attribute: meetingSlot.sections.course_attribute,
					class_comments: meetingSlot.sections.class_comments,
					seats_available: seatsAvailable,
					seats_total: seatsTotal,
					meetings: [],
				});

				sectionItem = courseItem?.sections.find(
					(section) => section.section_id === meetingSlot.sections?.section_id,
				);
			}

			let meetingItem = sectionItem?.meetings.find(
				(meeting) => meeting.id === meetingSlot.meetings?.meeting_id,
			);

			if (!meetingItem) {
				sectionItem?.meetings.push({
					id: meetingSlot.meetings.meeting_id,
					day: meetingSlot.meetings.day,
					start_time: meetingSlot.meetings.start_time,
					end_time: meetingSlot.meetings.end_time,
					campus: meetingSlot.meetings.location,
					building: {
						id: meetingSlot.buildings?.building_id,
						long: meetingSlot.buildings?.building_name,
						short: meetingSlot.buildings?.building_abbrev,
					},
					room: {
						id: meetingSlot.rooms?.room_id,
						name: meetingSlot.rooms?.room,
					},
					instructors:
						instructorNames?.map((instructor) => ({
							// biome-ignore lint/style/noNonNullAssertion: We check instructors exists at the top of the loop
							id: meetingSlot.instructors!.instructor_id,
							first_name: instructor[1],
							last_name: instructor[0],
						})) || [],
				});

				meetingItem = sectionItem?.meetings.find(
					(meeting) => meeting.id === meetingSlot.meetings?.meeting_id,
				);
			}
		}

		return courseByTerm;
	} catch (error) {
		console.error(error);
		return -1;
	}
}
