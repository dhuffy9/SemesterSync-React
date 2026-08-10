import z from "zod";

export const nonCourseMeetingSchema = z.object({
	id: z.uuidv4(),
	day: z.string(),
	start_time: z.string(),
	end_time: z.string(),
	location: z.string().optional(),
});

export type NonCourseMeeting = z.infer<typeof nonCourseMeetingSchema>;

export const nonCourseMeetingAddSchema = z.object({
	days: z.array(z.string()),
	startTime: z.string().min(1, "Start time is required"),
	endTime: z.string().min(1, "End time is required"),
	location: z.string().optional(),
});

export type NonCourseMeetingAddType = z.infer<typeof nonCourseMeetingAddSchema>;

export const nonCourseEventSchema = z.object({
	eventId: z.uuidv4(),
	color: z.string().regex(/^#[0-9a-f]{6}$/i),
	title: z.string(),
	description: z.string().optional(),
	credits: z.string().optional(),
	term_code: z.string(),
	term_name: z.string(),
	startDate: z.date(),
	endDate: z.date(),
	meetings: z.array(nonCourseMeetingSchema),
});

export const nonCourseAddSchema = z.object({
	color: z.string().regex(/^#[0-9a-f]{6}$/i),
	credits: z.string().optional(),
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	termCode: z.string().min(1, "Term code is required"),
	startDate: z.date(),
	endDate: z.date(),
	meetings: z
		.array(nonCourseMeetingAddSchema)
		.min(1, "At least one meeting is required"),
});

export type NonCourseAddType = z.infer<typeof nonCourseAddSchema>;
