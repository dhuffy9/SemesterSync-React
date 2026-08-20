import z from "zod";

export const instructorSchema = z.object({
	id: z.number(),
	first_name: z.string(),
	last_name: z.string(),
});

export const instructorAddSchema = z.object({
	id: z.uuidv4(),
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
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

export const meetingAddSchema = z.object({
	days: z.array(z.string()),
	startTime: z.string().min(1, "Start time is required"),
	endTime: z.string().min(1, "End time is required"),
	campus: z.string(),
	building: z.string(),
	room: z.string("Room is required"),
	instructors: z.array(instructorAddSchema),
});

export type MeetingAddType = z.infer<typeof meetingAddSchema>;

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

export const sectionAddSchema = z.object({
	sectionCode: z.string().min(1, "Section code is required"),
	startDate: z.date(),
	endDate: z.date(),
	deliveryMethod: z.string().min(1, "Delivery method is required"),
	meetings: z
		.array(meetingAddSchema)
		.min(1, "At least one meeting is required"),
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

export const unlinkedEventAddSchema = z.object({
	color: z.string().regex(/^#[0-9a-f]{6}$/i),
	courseCode: z.string().min(1, "Course code is required"),
	courseTitle: z.string().min(1, "Course title is required"),
	credits: z.string().min(1, "Credits is required"),
	termCode: z.string().min(1, "Term code is required"),
	section: sectionAddSchema,
});

export const assembledCourseSingleSectionSchema = assembledCourseSchema
	.omit({
		sections: true,
	})
	.extend({
		section: sectionSchema,
	});

export type UnlinkedEventAddType = z.infer<typeof unlinkedEventAddSchema>;
