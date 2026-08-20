import z from "zod";

export const personalEventMeetingSchema = z.object({
	id: z.uuidv4(),
	day: z.string(),
	startTime: z.string(),
	endTime: z.string(),
	location: z.string().optional(),
});

export type PersonalEventMeeting = z.infer<typeof personalEventMeetingSchema>;

export const personalEventMeetingAddSchema = z.object({
	days: z.array(z.string()),
	startTime: z.string().min(1, "Start time is required"),
	endTime: z.string().min(1, "End time is required"),
	location: z.string().optional(),
});

export type PersonalEventMeetingAddType = z.infer<
	typeof personalEventMeetingAddSchema
>;

export const personalEventSchema = z.object({
	eventId: z.uuidv4(),
	color: z.string().regex(/^#[0-9a-f]{6}$/i),
	title: z.string(),
	description: z.string().optional(),
	credits: z.string().optional(),
	term_code: z.string(),
	term_name: z.string(),
	startDate: z.coerce.date(),
	endDate: z.coerce.date(),
	meetings: z.array(personalEventMeetingSchema),
});

export const personalEventAddSchema = z.object({
	color: z.string().regex(/^#[0-9a-f]{6}$/i),
	credits: z.string().optional(),
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	termCode: z.string().min(1, "Term code is required"),
	startDate: z.date(),
	endDate: z.date(),
	meetings: z
		.array(personalEventMeetingAddSchema)
		.min(1, "At least one meeting is required"),
});

export type PersonalEventAddType = z.infer<typeof personalEventAddSchema>;
