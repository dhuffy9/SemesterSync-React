import z from "zod";

export const instructorSchema = z.object({
	id: z.number(),
	first_name: z.string(),
	last_name: z.string(),
});

export const roomSchema = z.object({
	id: z.number().optional(),
	name: z.string().optional(),
});

export const buildingSchema = z.object({
	id: z.number(),
	long: z.string(),
	short: z.string().nullable(),
});

export const meetingSchema = z.object({
	id: z.number(),
	day: z.string(),
	start_time: z.string(),
	end_time: z.string(),
	campus: z.string(),
	building: buildingSchema,
	room: roomSchema,
	instructors: z.array(instructorSchema),
});

export const sectionSchema = z.object({
	section_id: z.number(),
	section_code: z.string(),
	start_date: z.date(),
	end_date: z.date(),
	delivery_method: z.string(),
	course_attribute: z.string(),
	class_comments: z.string().nullable(),
	seats_available: z.number(),
	seats_total: z.number(),
	meetings: z.array(meetingSchema),
});

export const assembledCourseSchema = z.object({
	eventId: z.uuidv4(),
	color: z.string().regex(/^#[0-9a-f]{6}$/i),
	course_id: z.number(),
	course_code: z.string(),
	course_title: z.string(),
	credits: z.string(),
	term_code: z.string(),
	term_name: z.string(),
	sections: z.array(sectionSchema),
});

export const assembledCourseSingleSectionSchema = assembledCourseSchema
	.omit({
		sections: true,
	})
	.extend({
		section: sectionSchema,
	});
