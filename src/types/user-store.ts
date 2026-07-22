import z from "zod";
import { assembledCourseSingleSectionSchema } from "@/schemas/course-event";

export const termSchema = z.object({
	code: z.string(),
});

export const userTabSchema = z.object({
	id: z.uuidv4(),
	name: z.string(),
	courseEvents: z.array(assembledCourseSingleSectionSchema),
	nonCourseEvents: z.array(z.string()),
	totalCredits: z.number(),
	selectedDate: z.coerce.date(),
});

export const userStateSchema = z.object({
	activeTab: z.uuidv4(),
	activeTerm: z.string(),
	tabs: z.array(userTabSchema),
});

export const userStorePersistSchema = z.object({
	user: z.object({
		state: userStateSchema,
		schemaVersion: z.number(),
	}),
	version: z.number(),
});

export type Term = z.infer<typeof termSchema>;
export type CourseEvent = z.infer<typeof assembledCourseSingleSectionSchema>;
export type Tab = z.infer<typeof userTabSchema>;
export type UserState = z.infer<typeof userStateSchema>;
export type UserStorePersist = z.infer<typeof userStorePersistSchema>;

export interface UserActions {
	addTab: () => void;
	setActiveTab: (id: string) => void;
	getActiveTab: () => Tab;
	updateTabName: (id: string, name: string) => void;
	updateTabDate: (id: string, date: Date) => void;
	recalculateTabCredits: (id: string) => void;
	removeTab: (id: string) => void;

	setActiveTerm: (term: string) => void;

	addCourseEvent: (tabId: string, course: CourseEvent) => void;
	updateCourseEvent: (tabId: string, course: CourseEvent) => void;
	removeCourseEvent: (tabId: string, eventId: string) => void;
}

export type UserStore = UserState & UserActions;
