import z from "zod";
import { daysOfWeekSchema } from "./util";

// Generic
export const eventGenericsSchema = z.object({
	eventId: z.uuidv4(),

	color: z.string().regex(/^#[0-9a-f]{6}$/i),
});

// Linked Event
export const linkedEventSchema = z.object({
	kind: z.literal("linked-course"),

	courseId: z.number(),
	sectionId: z.number(),
	termCode: z.string(),

	staticCourseCredits: z.number(),
});

//Unlinked Event
export const unlinkedEventMeetingSchema = z.object({
	day: daysOfWeekSchema,
	startTime: z.coerce.date(),
	endTime: z.coerce.date(),

	campus: z.string(),
	building: z.string(),
	room: z.string(),

	instructors: z.array(
		z.object({
			firstName: z.string(),
			lastName: z.string(),
		}),
	),
});

export const unlinkedEventSchema = z.object({
	kind: z.literal("unlinked-course"),

	startDate: z.coerce.date(),
	endDate: z.coerce.date(),

	courseTitle: z.string(),
	courseCode: z.string(),
	sectionCode: z.string(),
	credits: z.number(),
	deliveryMethod: z.string(),

	meetings: z.array(unlinkedEventMeetingSchema),
});

//Personal Event
export const personalEventMeetingSchema = z.object({
	day: daysOfWeekSchema,
	startTime: z.coerce.date(),
	endTime: z.coerce.date(),

	location: z.string().optional(),
});

export const personalEventSchema = z.object({
	kind: z.literal("personal"),

	startDate: z.coerce.date(),
	endDate: z.coerce.date(),

	title: z.string(),
	description: z.string().optional(),

	meetings: z.array(personalEventMeetingSchema),
});

export const eventVariantsSchema = z.discriminatedUnion("kind", [
	linkedEventSchema,
	unlinkedEventSchema,
	personalEventSchema,
]);

export const eventSchema = eventGenericsSchema.and(eventVariantsSchema);

export type LinkedEventVariant = z.infer<typeof linkedEventSchema>;
export type UnlinkedEventVariant = z.infer<typeof unlinkedEventSchema>;
export type UnlinkedEventVariantMeeting = z.infer<
	typeof unlinkedEventMeetingSchema
>;
export type PersonalEventVariant = z.infer<typeof personalEventSchema>;
export type PersonalEventVariantMeeting = z.infer<
	typeof personalEventMeetingSchema
>;
export type EventGenerics = z.infer<typeof eventGenericsSchema>;
export type EventVariants = z.infer<typeof eventVariantsSchema>;
export type Event = z.infer<typeof eventSchema>;
