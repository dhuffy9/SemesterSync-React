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

export type OrganizedCourses = Record<
	number,
	{
		course_id: number;
		course_code: string;
		course_title: string;
		credits: string;
		term_code: string;
		term_name: string;
		sections: Array<{
			section_id: number;
			section_code: string;
			start_date: Date;
			end_date: Date;
			delivery_method: string;
			class_type: string | null;
			course_attribute: string;
			class_comments: string | null;
			seats_available: number;
			seats_total: number;
			meetings: Array<{
				id: number;
				day: string;
				start_time: string;
				end_time: string;
				campus: string;
				building: {
					id: number;
					long: string;
					short: string | null;
				};
				room: {
					id?: number;
					name?: string;
				};
				instructors: Array<{
					id: number;
					first_name: string;
					last_name: string;
				}>;
			}>;
		}>;
	}
>;

export async function getAllCoursesWithMeetings() {
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

	const organizedCourses: OrganizedCourses = {};

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

		const instructorsSplit = meetingSlot.instructors.instructor_name.split(";");
		const instructorNames = instructorsSplit?.map((namePair) =>
			namePair.split(",").map((name) => name.trim()),
		);

		if (!organizedCourses[meetingSlot.courses.course_id]) {
			organizedCourses[meetingSlot.courses.course_id] = {
				course_id: meetingSlot.courses.course_id,
				course_code: meetingSlot.courses.course_code,
				course_title: meetingSlot.courses.course_title,
				credits: meetingSlot.courses.credits,
				term_code: meetingSlot.terms.term_code,
				term_name: meetingSlot.terms.term_name,
				sections: [
					{
						section_id: meetingSlot.sections.section_id,
						section_code: meetingSlot.sections.section_code,
						start_date: meetingSlot.sections.start_date,
						end_date: meetingSlot.sections.end_date,
						delivery_method: meetingSlot.sections.delivery_method,
						class_type: meetingSlot.sections.class_type,
						course_attribute: meetingSlot.sections.course_attribute,
						class_comments: meetingSlot.sections.class_comments,
						seats_available: seatsAvailable,
						seats_total: seatsTotal,
						meetings: [
							{
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
							},
						],
					},
				],
			};
		} else {
			const courseItem = organizedCourses[meetingSlot.courses.course_id];

			const possibleSection = courseItem.sections.findIndex(
				// biome-ignore lint/style/noNonNullAssertion: meeting sections is checked at top of loop
				(section) => section.section_id === meetingSlot.sections!.section_id,
			);
			if (possibleSection > -1) {
				organizedCourses[meetingSlot.courses.course_id].sections[
					possibleSection
				].meetings.push({
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
			} else {
				organizedCourses[meetingSlot.courses.course_id].sections.push({
					section_id: meetingSlot.sections.section_id,
					section_code: meetingSlot.sections.section_code,
					start_date: meetingSlot.sections.start_date,
					end_date: meetingSlot.sections.end_date,
					delivery_method: meetingSlot.sections.delivery_method,
					class_type: meetingSlot.sections.class_type,
					course_attribute: meetingSlot.sections.course_attribute,
					class_comments: meetingSlot.sections.class_comments,
					seats_available: seatsAvailable,
					seats_total: seatsTotal,
					meetings: [
						{
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
						},
					],
				});
			}
		}
	}

	return organizedCourses;
}

// export async function getAllSections() {
// 	const data = await db
// 		.select()
// 		.from(sectionTable)
// 		.leftJoin(termTable, eq(sectionTable.term_id, termTable.term_id))
// 		.leftJoin(courseTable, eq(sectionTable.course_id, courseTable.course_id))
// 		.leftJoin(
// 			instructorsTable,
// 			eq(sectionTable.instructor_id, instructorsTable.instructor_id),
// 		);

// 	// console.log(data);

// 	const organizedCourses: OrganizedCourses = {};

// 	for (const sections of data) {
// 		if (!sections.courses) {
// 			continue;
// 		}

// 		const splitSeats = sections.sections.avail_seats.split(" of ");
// 		const seatsAvailable = parseInt(splitSeats[0], 10);
// 		const seatsTotal = parseInt(splitSeats[1], 10);

// 		if (!organizedCourses[sections.courses.course_id]) {
// 			organizedCourses[sections.courses.course_id] = {
// 				course_id: sections.courses.course_id,
// 				course_code: sections.courses.course_code,
// 				course_title: sections.courses.course_title,
// 				credits: sections.courses.credits,
// 				sections: [
// 					{
// 						section_id: sections.sections.section_id,
// 						section_code: sections.sections.section_code,
// 						start_date: sections.sections.start_date,
// 						end_date: sections.sections.end_date,
// 						delivery_method: sections.sections.delivery_method,
// 						class_type: sections.sections.class_type,
// 						course_attribute: sections.sections.course_attribute,
// 						class_comments: sections.sections.class_comments,
// 						seats_available: seatsAvailable,
// 						seats_total: seatsTotal,
// 					},
// 				],
// 			};
// 		} else {
// 			organizedCourses[sections.courses.course_id].sections.push({
// 				section_id: sections.sections.section_id,
// 				section_code: sections.sections.section_code,
// 				start_date: sections.sections.start_date,
// 				end_date: sections.sections.end_date,
// 				delivery_method: sections.sections.delivery_method,
// 				class_type: sections.sections.class_type,
// 				course_attribute: sections.sections.course_attribute,
// 				class_comments: sections.sections.class_comments,
// 				seats_available: seatsAvailable,
// 				seats_total: seatsTotal,
// 			});
// 		}
// 	}

// 	console.log(organizedCourses);

// 	console.log(organizedCourses[1].sections);

// 	return organizedCourses;
// }
